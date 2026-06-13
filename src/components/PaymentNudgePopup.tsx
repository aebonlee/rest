/**
 * PaymentNudgePopup — 가입 7일 경과 + 미결제 사용자에게 부드러운 결제 유도 팝업
 * [2026-04-23] 콘텐츠 제한 해제 후 대체 수익화 수단
 *
 * 조건: 로그인 && created_at > 7일 && user_licenses에 유효 라이선스 없음
 * 세션당 1회만 표시, Superadmin 자동 바이패스, 조회 실패 시 미표시 (fail-safe)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * [초보자를 위한 배경 설명]
 *  - 이 파일은 "React 컴포넌트"다. React 컴포넌트란 화면의 한 조각(여기서는
 *    화면 위에 뜨는 결제 안내 팝업)을 만들어 주는 함수라고 생각하면 된다.
 *  - "팝업(모달, modal)": 화면 전체를 살짝 어둡게 덮고 그 위에 떠 있는 작은
 *    창. 사용자가 닫기 전까지 주목하게 만드는 UI다.
 *  - "넛지(nudge)": 강제하지 않고 부드럽게 어떤 행동(여기서는 결제)을 유도하는 것.
 *  - "Supabase": 이 프로젝트의 데이터베이스 + 로그인(인증) 서비스. 사용자 정보,
 *    라이선스(이용권) 정보가 여기에 저장되어 있고, 코드에서 질의(query)해 가져온다.
 *  - "라이선스(license)": 사용자가 구매한 이용권을 뜻하는 DB 데이터. 이게 있으면
 *    결제한 사람이므로 팝업을 띄우지 않는다.
 *  - "세션(session)": 사용자가 브라우저 탭을 열어 두고 사이트를 쓰는 한 번의 방문.
 *    탭을 닫으면 세션이 끝난다. 이 팝업은 "한 세션에 한 번만" 보여 준다.
 *  - "fail-safe(페일세이프)": 무언가 잘못되면(조회 실패 등) "안전한 쪽"으로
 *    동작한다는 뜻. 여기서는 확실치 않으면 팝업을 안 띄운다(사용자를 귀찮게
 *    하지 않는 쪽). 결제 안 한 사람을 놓치더라도 결제한 사람을 괴롭히지 않는다.
 *
 * [역할/책임]
 *  - 표시 조건(가입 경과일·라이선스 보유 여부·세션 닫힘 여부)을 클라이언트에서 판정
 *  - 조건 충족 시 결제 유도 모달을 화면 최상단(z-index 99999)에 오버레이로 렌더
 *  - 닫기 시 sessionStorage에 플래그를 저장하여 같은 세션 내 재노출 방지
 *
 * [주요 export]
 *  - default: PaymentNudgePopup (React 컴포넌트)
 */
// React 상태/사이드이펙트 훅
//  - useState: 컴포넌트가 기억해야 하는 "값(상태)"을 만든다. 값이 바뀌면 화면이 다시 그려진다.
//  - useEffect: 화면이 그려진 뒤(또는 특정 값이 바뀔 때) 실행할 "부수 효과"(데이터 조회 등)를 정의한다.
//  ※ "훅(Hook)"은 함수형 컴포넌트에서 React 기능을 빌려 쓰는 특수 함수다. 이름이 use로 시작한다.
import { useState, useEffect } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
// Supabase 사용자 객체 및 클라이언트 타입 (타입 전용 import — 런타임 번들 영향 없음)
//  ※ `import type`은 "타입 정보만" 가져온다는 TypeScript 문법이다. 실제 코드가 아니라
//    "이 변수는 User 모양이다" 같은 설명서만 가져오므로 빌드 결과물(번들) 크기에 영향이 없다.
import type { User, SupabaseClient } from '@supabase/supabase-js';

/** 사이트별 supabase export 패턴 차이를 자동 감지 */
// 사이트마다 supabase 인스턴스를 export 하는 위치/방식이 달라 동적으로 탐색해 클라이언트를 반환.
// 어떤 경로/패턴도 맞지 않으면 null 반환 → 호출부에서 미표시(fail-safe) 처리.
//
//  [왜 이렇게 하나?] 이 컴포넌트는 여러 사이트(rest, ax-study, snu 등)에서 재사용된다.
//  그런데 사이트마다 supabase를 만들어 두는 파일 위치(utils 또는 config)와
//  내보내는(export) 방식이 제각각이다. 그래서 미리 정해 두지 않고, 실행 시점에
//  여러 후보를 차례로 시도해 "맞는 것"을 찾아낸다.
//
//  매개변수: 없음
//  반환값: Promise<SupabaseClient | null>
//    - Promise: 비동기(나중에 끝나는) 작업의 결과를 담는 상자. await로 결과를 꺼낸다.
//    - 성공하면 Supabase 클라이언트 객체, 모두 실패하면 null.
async function resolveSupabase(): Promise<SupabaseClient | null> {
  // @vite-ignore prevents Rollup from statically resolving these dynamic imports
  // 후보 모듈 경로 목록 — 사이트별로 utils 또는 config 아래에 supabase 모듈이 존재할 수 있음
  const paths = ['../utils/supabase', '../config/supabase'];
  // 후보 경로를 하나씩 순서대로 시도한다. 먼저 성공하는 경로에서 즉시 return으로 빠져나간다.
  for (const p of paths) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // @vite-ignore: Vite/Rollup이 이 동적 import를 정적 분석하지 않도록 하여 빌드 에러 방지
      //  ※ `import(경로)`는 "동적 import"로, 실행 중에 모듈을 불러온다(결과는 Promise라 await 필요).
      //    경로가 변수(p)라서 빌드 도구가 미리 분석하지 못하므로 @vite-ignore 주석으로 경고를 끈다.
      //  ※ `mod: any`의 any는 "어떤 타입이든 허용"이라는 TS 타입. 모듈 모양을 미리 알 수 없어 사용한다.
      const mod: any = await import(/* @vite-ignore */ p);
      // export 패턴별 분기: default가 팩토리 함수면 호출, 인스턴스면 그대로, named supabase, getSupabase 함수 순으로 시도
      //  - mod.default가 함수면: 그 함수를 호출(mod.default())해 클라이언트를 만들어 반환 (팩토리 패턴)
      if (typeof mod.default === 'function') return mod.default();
      //  - mod.default가 (함수가 아닌) 값이면: 이미 만들어진 인스턴스로 보고 그대로 반환
      if (mod.default) return mod.default;
      //  - export const supabase = ... 처럼 이름(named)으로 내보낸 경우
      if (mod.supabase) return mod.supabase;
      //  - export function getSupabase() { ... } 형태면 호출해서 반환
      if (typeof mod.getSupabase === 'function') return mod.getSupabase();
    } catch { /* try next path */ } // 해당 경로 모듈이 없거나 로드 실패 시 다음 후보 경로로 진행
    // ※ try/catch: 에러가 나도 프로그램이 멈추지 않게 감싸는 구문. 여기선 에러를 무시하고 다음 경로로 넘어간다.
  }
  return null; // 모든 후보 경로 실패 → 클라이언트 확보 불가
}

// 결제 유도 팝업을 표시하지 않는 슈퍼관리자 이메일 화이트리스트 (운영자 본인 계정)
//  ※ "화이트리스트": 예외로 허용/제외할 대상 목록. 여기 적힌 이메일은 팝업에서 제외(바이패스)된다.
const SUPERADMIN_EMAILS = [
  'aebon@kakao.com',
  'aebon@kyonggi.ac.kr',
  'radical8566@gmail.com',
];

// 7일을 밀리초로 환산한 상수 (가입 경과일 판정 기준)
//  ※ 자바스크립트의 시간 계산은 밀리초(ms) 단위라서 7일을 ms로 바꿔 둔다.
//    7일 × 24시간 × 60분 × 60초 × 1000(ms). 의미가 드러나도록 곱셈 식 그대로 둔다.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// 컴포넌트 props 타입 정의
//  ※ "props"(properties): 부모 컴포넌트가 이 컴포넌트에 넘겨주는 입력값. 함수의 인자라고 보면 된다.
//  ※ interface: TypeScript에서 "객체의 모양(어떤 속성이 어떤 타입인지)"을 정의하는 문법.
interface PaymentNudgePopupProps {
  user: User;          // 현재 로그인 사용자 (필수)
  siteSlug: string;    // 현재 사이트 식별 슬러그 — 라이선스 매칭 및 세션 키 구분에 사용
  shopUrl?: string;    // 이용권 구매 페이지 URL (미지정 시 기본 biz-hub shop)
  //  ※ 속성 이름 뒤의 물음표(?)는 "선택값(optional)"이라는 뜻. 안 넘겨도 된다.
}

/**
 * PaymentNudgePopup 컴포넌트
 * props로 받은 사용자/사이트 정보를 바탕으로 결제 유도 모달 노출 여부를 판정하고 렌더한다.
 *
 *  반환값: JSX(화면 요소) 또는 null(아무것도 안 그림).
 *  부수효과: useEffect 안에서 DB 라이선스 조회, sessionStorage 읽기/쓰기를 한다.
 *
 *  ※ 아래 `{ user, siteSlug, shopUrl = '...' }`는 "구조 분해 할당"이다.
 *    props 객체에서 필요한 값들을 변수로 꺼내 쓰고, shopUrl은 안 들어오면 기본값을 쓴다.
 */
export default function PaymentNudgePopup({
  user,
  siteSlug,
  shopUrl = 'https://biz-hub.dreamitbiz.com/shop', // 기본 구매 페이지 URL
}: PaymentNudgePopupProps) {
  // 모달 표시 여부 상태 (초기값 false → 조건 충족 시에만 true)
  //  - visible: 현재 값(처음엔 false). setVisible: 값을 바꾸는 함수.
  //  - setVisible를 호출하면 React가 컴포넌트를 다시 그려서 팝업이 나타나거나 사라진다.
  const [visible, setVisible] = useState(false);

  // user/siteSlug 변경 시 표시 조건을 재평가하는 사이드이펙트
  //  ※ useEffect(콜백, [의존성])는 [의존성] 배열의 값이 바뀔 때마다 콜백을 실행한다.
  //    (최초 렌더 후에도 한 번 실행됨.) 여기선 user나 siteSlug가 바뀌면 다시 판정한다.
  useEffect(() => {
    // 사이트별로 독립적인 "이번 세션에서 닫음" 플래그 키
    //  ※ 사이트마다 다른 키를 써야 A 사이트에서 닫은 게 B 사이트까지 영향을 주지 않는다.
    const SESSION_KEY = `nudge_dismissed_${siteSlug}`;

    // 이미 이번 세션에서 닫았으면 스킵
    //  ※ sessionStorage: 브라우저가 "현재 탭/세션 동안만" 기억하는 저장소. 탭을 닫으면 지워진다.
    //    값이 있으면(이미 닫음) 더 진행하지 않고 useEffect를 끝낸다(return).
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Superadmin 바이패스
    // 이메일을 소문자로 정규화하여 대소문자 차이로 인한 매칭 누락 방지
    //  ※ (user.email || '')의 || ''는 email이 없을 때(undefined/null) 빈 문자열로 대체해
    //    .toLowerCase() 호출 시 에러가 나지 않게 하는 안전장치다.
    const email = (user.email || '').toLowerCase();
    // 화이트리스트에 포함되면 운영자이므로 팝업을 띄우지 않고 종료한다.
    if (SUPERADMIN_EMAILS.includes(email)) return;

    // 가입일 7일 미만이면 스킵
    // created_at이 없으면 현재 시각으로 간주 → 경과 0이 되어 자동 스킵(신규 취급)
    //  ※ 삼항 연산자 `조건 ? A : B`: 조건이 참이면 A, 거짓이면 B.
    //    new Date(...).getTime()은 날짜를 밀리초 숫자로 바꿔 시간 계산을 쉽게 한다.
    const createdAt = user.created_at ? new Date(user.created_at).getTime() : Date.now();
    // (지금 시각 - 가입 시각)이 7일 미만이면 아직 넛지할 때가 아니므로 종료.
    if (Date.now() - createdAt < SEVEN_DAYS_MS) return;

    // user_licenses 조회
    // 비동기 함수로 분리: useEffect 콜백 자체는 동기여야 하므로 내부 정의 후 호출
    //  ※ useEffect의 콜백은 async로 만들 수 없다(반환값 규칙 때문). 그래서 async 함수를
    //    안에서 따로 정의(checkLicense)한 뒤 호출하는 패턴을 쓴다.
    const checkLicense = async () => {
      try {
        // await: Promise가 끝날 때까지 기다렸다가 결과(클라이언트 또는 null)를 받는다.
        const supabase = await resolveSupabase();
        if (!supabase) return; // Supabase 없으면 미표시

        // 현재 사용자가 보유한 라이선스 행 조회.
        // RLS 정책상 본인(user_id = auth.uid()) 행만 반환되도록 구성되어 있음을 전제로 함.
        //  ※ RLS(Row Level Security): DB가 "어떤 행을 누가 볼 수 있는지" 제어하는 보안 기능.
        //    여기선 로그인한 본인 라이선스만 읽히도록 설정되어 있다고 가정한다.
        //  ※ supabase 쿼리 체이닝: .from(테이블).select(컬럼들).eq(조건) 형태로 SQL을 만든다.
        //    .eq('user_id', user.id) = "user_id 컬럼이 user.id와 같은 행만".
        //  ※ 결과는 { data, error } 형태의 객체로 온다. 이를 구조 분해로 한 번에 꺼낸다.
        const { data, error } = await supabase
          .from('user_licenses')
          .select('id, license_type, site_slug, expires_at')
          .eq('user_id', user.id);

        if (error) return; // 조회 실패 시 미표시 (fail-safe) — 권한/네트워크 오류로 사용자를 오인 차단하지 않음

        // data가 존재하고(널 아님) 라이선스가 한 개 이상 있을 때만 유효성 검사를 한다.
        if (data && data.length > 0) {
          const now = new Date();
          // 보유 라이선스 중 "현재 유효한" 것이 하나라도 있는지 판정
          //  ※ 배열.some(함수): 배열 원소 중 하나라도 함수가 true를 반환하면 전체 결과 true.
          //    "유효한 라이선스가 하나라도 있는가?"를 묻기에 딱 맞는 메서드다.
          const hasValid = data.some((lic: { license_type: string; site_slug: string | null; expires_at: string | null }) => {
            // 만료일이 있고 이미 지났으면 무효 처리 (expires_at이 null이면 무기한으로 간주)
            //  ※ expires_at이 null(만료일 없음)이면 이 if를 건너뛰어 무기한 유효로 본다.
            if (lic.expires_at && new Date(lic.expires_at) < now) return false;
            // 전체 사이트 번들(bundle)이거나 현재 사이트 슬러그와 일치하면 유효
            //  ※ 'bundle'은 모든 사이트를 쓸 수 있는 통합 이용권. 그게 아니면 현재 사이트와 일치해야 유효.
            return lic.license_type === 'bundle' || lic.site_slug === siteSlug;
          });
          if (hasValid) return; // 유효 라이선스 있으면 미표시
        }

        // 위 모든 스킵 조건을 통과 → 미결제 사용자이므로 팝업 노출
        //  ※ 여기까지 왔다는 건: 세션에서 안 닫았고, 운영자 아니고, 가입 7일 지났고, 유효 라이선스 없음.
        setVisible(true);
      } catch {
        // 에러 시 미표시 (fail-safe)
        //  ※ 예상 못 한 오류(네트워크 끊김 등)가 나도 팝업을 띄우지 않아 사용자 경험을 해치지 않는다.
      }
    };

    checkLicense(); // 비동기 조건 검사 실행 (반환 Promise는 의도적으로 대기하지 않음)
    //  ※ 여기서 await를 안 붙이는 이유: useEffect 콜백은 동기여야 하므로 기다리지 않고
    //    "발사 후 잊기(fire-and-forget)"로 실행한다. 결과는 위 setVisible(true)가 처리한다.
    //  주의: user/siteSlug가 빠르게 연달아 바뀌면 여러 checkLicense가 경쟁할 수 있으나,
    //    각 호출이 독립적으로 setVisible(true)만 하므로 실질적 부작용은 없다.
  }, [user, siteSlug]); // 사용자 또는 사이트가 바뀌면 조건 재평가
  //  주의: 의존성 배열에 빠뜨린 값이 있으면 오래된 값(stale)을 참조할 수 있다. 여기선 user, siteSlug면 충분하다.

  // 닫기 처리: 세션 플래그 저장 후 모달 숨김 → 같은 세션 동안 재노출 차단
  //  부수효과: sessionStorage에 '1'을 기록해 "이 세션에서 닫았음"을 영구 표시한다(탭 닫기 전까지).
  const handleDismiss = () => {
    sessionStorage.setItem(`nudge_dismissed_${siteSlug}`, '1');
    setVisible(false); // 상태를 false로 바꿔 즉시 화면에서 사라지게 한다.
  };

  // 비표시 상태면 아무것도 렌더하지 않음 (DOM에 마운트하지 않음)
  //  ※ React 컴포넌트가 null을 반환하면 화면에 어떤 요소도 그리지 않는다.
  //    조건이 충족돼 setVisible(true)가 되기 전까지는 이 줄에서 빠져나간다.
  if (!visible) return null;

  // 아래부터는 visible === true 일 때만 그려지는 JSX(화면 구조)다.
  //  ※ JSX: 자바스크립트 안에서 HTML처럼 화면 요소를 적는 React 문법.
  //    style={{...}}는 인라인 CSS(객체 형태). 바깥 {}는 "JS 표현식", 안쪽 {}는 "객체"다.
  return (
    // 화면 전체를 덮는 반투명 오버레이 — 배경 클릭 시 닫힘(handleDismiss)
    //  ※ onClick에 handleDismiss를 연결하면, 이 어두운 배경을 클릭했을 때 닫힌다.
    //    position:'fixed' + inset:0 = 화면 네 모서리에 딱 붙여 전체를 덮는다.
    //    zIndex 99999 = 다른 요소들보다 위에 떠서 가장 앞에 보이게 한다.
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
      }}
    >
      {/* 모달 본체 — stopPropagation으로 내부 클릭이 오버레이의 닫기로 전파되는 것을 차단 */}
      {/* ※ 이벤트 버블링: 자식에서 일어난 클릭은 부모로 전파된다. 여기서 막지 않으면
            모달 내부를 눌러도 부모(오버레이)의 handleDismiss가 실행돼 창이 닫혀버린다.
            e.stopPropagation()으로 그 전파를 멈춰 "내부 클릭으로는 안 닫히게" 한다. */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-white, #fff)', color: 'var(--text-primary, #111827)', borderRadius: '16px', padding: '36px 32px 28px',
          width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          margin: '16px', position: 'relative', textAlign: 'center',
        }}
      >
        {/* 닫기 버튼 — 오른쪽 위 X. 누르면 handleDismiss로 닫는다. */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'none', border: 'none', color: '#9CA3AF',
            cursor: 'pointer', fontSize: '20px', lineHeight: 1,
            padding: '4px 8px', borderRadius: '6px',
          }}
          title="닫기"
        >
          <EmojiIcon char="✕" />
        </button>

        {/* 아이콘 (시각적 장식용 이모지) */}
        <div style={{ fontSize: '48px', marginBottom: '12px' }}><EmojiIcon char="📚" /></div>

        {/* 제목 */}
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
          더 나은 학습 경험을 위해
        </h2>
        {/* 본문 설명 */}
        {/* ※ <br />는 줄바꿈. JSX에서는 닫는 슬래시(/)를 꼭 붙여야 한다. */}
        <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666', lineHeight: 1.6 }}>
          이용권을 구매하시면 모든 콘텐츠를<br />
          제한 없이 평생 이용하실 수 있습니다.
        </p>

        {/* 가격 정보 박스 */}
        <div style={{
          background: '#F0F7FF', borderRadius: '12px', padding: '16px',
          marginBottom: '20px', textAlign: 'left',
        }}>
          {/* 개별 사이트 이용권 가격 행 (좌:이름 / 우:가격, space-between으로 양끝 배치) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px', color: '#333' }}>개별 사이트 이용권</span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#2563EB' }}>30,000원</span>
          </div>
          {/* 전체 사이트 이용권 가격 행 (할인 배지 포함) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: '#333' }}>
              전체 사이트 이용권
              {/* 할인율 강조 배지 (빨간 라벨로 시선 유도) */}
              <span style={{
                background: '#DC2626', color: '#fff', fontSize: '13px', fontWeight: 600,
                padding: '2px 6px', borderRadius: '4px', marginLeft: '6px',
              }}>~55% 할인</span>
            </span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#DC2626' }}>150,000원</span>
          </div>
        </div>

        {/* 이용권 보기 버튼 */}
        {/* 새 탭으로 구매 페이지 이동 — rel=noopener noreferrer로 탭내빙(tabnabbing) 보안 위험 차단 */}
        {/* ※ target="_blank"는 새 탭에서 열기. 이때 새 탭이 원래 페이지를 조작할 수 있는
              보안 취약점(탭내빙)이 있어, rel="noopener noreferrer"로 그 연결을 끊는다.
              참고: <a> 태그지만 버튼처럼 보이게 style을 입혔다(링크는 기본 이동 동작을 그대로 활용). */}
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', width: '100%', padding: '13px', fontSize: '16px', fontWeight: 600,
            color: '#fff', background: '#2563EB', border: 'none', borderRadius: '8px',
            cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
            marginBottom: '10px', boxSizing: 'border-box',
          }}
        >
          이용권 보기
        </a>

        {/* 다음에 버튼 */}
        {/* 클릭 시 닫기와 동일 처리 (세션 내 재노출 방지) */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%', padding: '11px', fontSize: '16px', fontWeight: 500,
            color: '#6B7280', background: 'none',
            border: '1px solid #E5E7EB', borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          다음에 할게요
        </button>

        {/* 하단 안내 문구 */}
        <p style={{ margin: '14px 0 0', fontSize: '14px', color: '#9CA3AF' }}>
          1회 결제로 평생 무제한 이용
        </p>
      </div>
    </div>
  );
}
