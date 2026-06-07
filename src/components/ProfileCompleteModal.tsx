/**
 * ProfileCompleteModal.tsx — 프로필(이름·전화) 필수 입력 모달
 *
 * [이 파일이 무엇인가요?]
 *  "모달(modal)"이란 화면을 덮으면서 떠오르는 작은 창입니다. 모달이 떠 있는 동안에는
 *  사용자가 그 안의 내용을 처리하기 전까지 다른 작업으로 넘어가기 어렵게 만들 수 있어,
 *  "반드시 입력해야 하는 정보"를 받을 때 자주 씁니다.
 *  이 컴포넌트는 로그인은 했지만 아직 실명/전화번호를 등록하지 않은 사용자에게
 *  그 정보를 강제로 입력받기 위한 모달입니다.
 *
 * [왜 필요한가요?]
 *  구글/카카오 같은 소셜 로그인(OAuth)으로 가입하면 이름이 없거나 전화번호가 비어 있을 수 있습니다.
 *  수업 운영(출석 확인, 연락 등)을 위해 이 두 항목이 꼭 필요하므로, 비어 있으면 이 모달을 띄워서
 *  채우도록 만듭니다.
 *
 * [초보자가 알아두면 좋은 용어]
 *  - 컴포넌트(component): 화면의 한 조각을 그리는 함수. 여기서는 모달 전체가 하나의 컴포넌트.
 *  - props: 부모 컴포넌트가 자식에게 내려주는 "입력값". 함수의 매개변수와 비슷합니다.
 *  - state(상태): 컴포넌트가 기억하는 값. 값이 바뀌면 화면이 자동으로 다시 그려집니다.
 *  - 훅(hook): use로 시작하는 React 함수(useState 등). 상태나 기능을 컴포넌트에 붙여줍니다.
 *  - JSX: 자바스크립트 안에서 HTML처럼 화면을 적는 문법.
 *  - OAuth: 외부 서비스(구글/카카오) 계정으로 로그인하게 해주는 방식.
 *  - Supabase: 인증/데이터베이스를 제공하는 백엔드 서비스. user 정보가 여기서 옵니다.
 *
 * 역할:
 *  - 로그인했으나 실명/전화번호가 비어 있는 사용자에게 강제로 입력받는 모달.
 *
 * 핵심 책임:
 *  - 이름·전화 유효성 검사(전화는 한국 휴대폰 정규식) 후 updateProfile로 저장.
 *  - 전화번호 입력 시 자동 하이픈 포맷(formatPhone).
 *  - 저장 성공 시 onComplete 콜백으로 상위에 알림.
 *
 * 주요 export:
 *  - default: ProfileCompleteModal (모달 컴포넌트)
 */

// useState: 컴포넌트가 값을 "기억"하게 해주는 React 훅(상태 관리용).
import { useState } from 'react';
// type 키워드로 가져오는 것은 "타입만" 가져온다는 뜻(실제 코드가 아니라 TypeScript 검사용).
// User는 Supabase가 정의한 "로그인 사용자 정보"의 타입입니다.
import type { User } from '@supabase/supabase-js';
// updateProfile: 서버(DB)에 프로필을 저장하는 함수. 자세한 구현은 utils/auth에 있음.
import { updateProfile } from '../utils/auth';

// Props: 이 컴포넌트가 부모로부터 받아야 하는 값들의 "모양(타입)"을 정의합니다.
// interface는 객체의 구조(어떤 키가 있고 각 값이 무슨 타입인지)를 설명하는 TypeScript 문법입니다.
interface Props {
  user: User;                       // 현재 로그인 사용자(Supabase)
  // onComplete: 저장이 끝난 뒤 호출할 함수. () => Promise<void>는
  // "인자 없이 호출하고, 비동기로 끝나며(await 가능), 돌려주는 값은 없다"는 뜻입니다.
  onComplete: () => Promise<void>;  // 저장 완료 후 상위에서 프로필 재조회 등 처리
}

/** 전화번호 자동 포맷: 01012345678 → 010-1234-5678 (숫자만 추출 후 최대 11자리에서 하이픈 삽입) */
// [무엇을 하나] 사용자가 친 문자열에서 숫자만 남기고, 한국 휴대폰 형태로 하이픈을 넣어 돌려줍니다.
// [왜 이렇게 하나] 사용자가 하이픈을 직접 넣든 안 넣든 항상 동일한 모양으로 보여주기 위해서입니다.
// [매개변수] value: 입력창에 적힌 원본 문자열(예: "010abc1234").
// [반환] 하이픈이 들어간 문자열(예: "010-1234"). 부수효과 없음(순수 함수).
function formatPhone(value: string): string {
  // replace(/\D/g, '')의 의미:
  //   - 정규식(regular expression): 문자열에서 특정 패턴을 찾는 미니 언어.
  //   - \D = "숫자가 아닌 문자" 한 개. g(global) 플래그 = 일치하는 것 "전부".
  //   - 즉, 숫자가 아닌 모든 문자를 빈 문자열로 바꿔 = 숫자만 남깁니다.
  // slice(0, 11): 앞에서 최대 11자리까지만 자름(한국 휴대폰은 최대 11자리라서).
  const digits = value.replace(/\D/g, '').slice(0, 11);
  // 3자리 이하(예: "01")면 아직 하이픈을 넣을 단계가 아니라 그대로 반환.
  if (digits.length <= 3) return digits;
  // 4~7자리면 앞 3자리 뒤에 하이픈 하나만 넣음(예: "010-1234").
  // 백틱(`...`)은 템플릿 리터럴: 문자열 안에 ${...}로 값을 끼워 넣는 문법입니다.
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  // 8자리 이상이면 3-4-나머지 형태로 하이픈 두 개를 넣음(예: "010-1234-5678").
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ProfileCompleteModal — 이름/전화 입력 폼 모달.
// ({ user, onComplete }: Props)는 "구조 분해 할당": props 객체에서 user와 onComplete만 꺼내 씁니다.
const ProfileCompleteModal = ({ user, onComplete }: Props) => {
  // OAuth 메타데이터에 이름이 있으면 초기값으로 활용.
  // user_metadata는 소셜 로그인 시 받아오는 부가 정보(이름 등). 없을 수도 있으므로
  // `|| {}`로 "없으면 빈 객체"를 대신 써서 아래에서 meta.full_name 접근 시 에러를 방지합니다.
  const meta = user.user_metadata || {};
  // useState(초기값)은 [현재값, 값을바꾸는함수] 배열을 돌려줍니다. 아래는 그 배열을 구조 분해한 것.
  // setName을 호출하면 name이 바뀌고 화면이 자동으로 다시 그려집니다.
  // 초기 이름: full_name → name → '' 순으로 처음 존재하는 값을 사용(둘 다 없으면 빈 문자열).
  const [name, setName] = useState(meta.full_name || meta.name || '');
  // 전화번호는 사용자가 직접 입력해야 하므로 초기값을 빈 문자열로 둠.
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);   // 저장 중 버튼 비활성화
  const [error, setError] = useState('');        // 검증/저장 실패 메시지(비어 있으면 메시지 숨김)

  // handleSubmit — 입력 검증 후 프로필 저장. 성공 시 onComplete 호출.
  // async 함수: 내부에서 await로 비동기 작업(서버 저장)을 "끝날 때까지 기다리며" 순서대로 처리할 수 있습니다.
  // 매개변수 e: 폼 제출 이벤트 객체. 부수효과: 상태 변경(setError/setSaving) 및 서버 저장.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();   // 폼 기본 제출(새로고침) 방지
    // 주의: e.preventDefault()를 빼면 폼이 페이지를 새로고침해서 입력값과 상태가 사라집니다.
    setError('');         // 이전에 떠 있던 에러 메시지를 먼저 지움(새 검증을 깨끗하게 시작).

    // trim(): 문자열 앞뒤 공백 제거. "   " 같은 공백만 입력한 경우를 걸러내기 위함.
    const trimmedName = name.trim();
    if (!trimmedName) {   // 빈 문자열은 falsy → 이름이 없으면 여기서 멈춤(return).
      setError('이름을 입력해주세요.');
      return;             // 주의: return으로 함수를 끝내야 잘못된 값이 아래 저장 로직까지 가지 않습니다.
    }

    const rawDigits = phone.replace(/\D/g, '');   // 검증·저장은 숫자만으로
    // (위 줄) 화면에는 하이픈이 보이지만, 검증과 저장은 순수 숫자만으로 처리합니다.
    if (!rawDigits) {     // 숫자가 하나도 없으면(빈 문자열) 전화번호 미입력으로 간주.
      setError('전화번호를 입력해주세요. (필수)');
      return;
    }
    // 한국 휴대폰 형식: 01X + 7~8자리.
    // 정규식 풀이: ^01[0-9]  = "01" + 한 자리 숫자(010/011/016 등)로 시작,
    //             \d{7,8}   = 그 뒤에 숫자 7~8개,  $ = 문자열 끝.
    //             => 즉 010/011 등으로 시작하는 총 10~11자리 숫자만 통과.
    // test()는 패턴에 맞으면 true, 아니면 false. 앞의 !는 "맞지 않으면"이라는 뜻.
    if (!/^01[0-9]\d{7,8}$/.test(rawDigits)) {
      setError('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    setSaving(true);   // 저장 시작 → 버튼 비활성화/문구 변경(중복 클릭으로 두 번 저장되는 걸 막음).
    try {
      // 이름은 name/display_name 둘 다, 전화는 하이픈 포맷으로 저장.
      // await: updateProfile이 끝날 때까지 기다림. 끝나야 다음 줄(onComplete)로 넘어갑니다.
      // 주의: await를 빼면 저장이 끝나기 전에 다음 코드가 실행되는 "비동기 경쟁" 문제가 생길 수 있습니다.
      await updateProfile(user.id, {
        name: trimmedName,
        display_name: trimmedName,
        phone: formatPhone(rawDigits),   // 저장값도 보기 좋은 하이픈 형태로 통일.
      });
      await onComplete();   // 저장이 성공한 뒤에야 부모에게 "완료"를 알림(예: 프로필 다시 불러오기).
    } catch (err) {
      // try 블록 안에서 에러가 나면(네트워크 실패, 권한 문제 등) 여기로 옵니다.
      setError('저장에 실패했습니다. 다시 시도해주세요.');
      console.error('ProfileCompleteModal save error:', err);   // 개발자 콘솔에 원인 기록(디버깅용).
    } finally {
      // finally: 성공하든 실패하든 항상 실행되는 블록.
      setSaving(false);   // 성공/실패 무관 버튼 복구
      // 주의: 버튼 복구를 finally에 두는 이유 — 실패해도 버튼이 영영 잠기지 않게 하려는 것입니다.
    }
  };

  // 아래는 화면에 그릴 내용(JSX). return 안의 태그들이 실제 모달 UI가 됩니다.
  return (
    // 화면 전체를 덮는 반투명 오버레이(모달 배경)
    // position:'fixed' + inset:0 → 화면 전체를 덮음. zIndex:99999 → 다른 요소들보다 맨 위에 표시.
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',   // 자식을 가운데 정렬.
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',       // 어둡게 + 뒤 배경 흐림 효과.
      }}
    >
      {/* form 요소: 안의 입력을 묶어 "제출(submit)"할 수 있게 함. onSubmit에 위에서 만든 handleSubmit 연결. */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-white, #fff)', color: 'var(--text-primary, #111827)', borderRadius: '16px', padding: '36px 32px 28px',
          width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          margin: '16px', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}   // 폼 내부 클릭이 오버레이로 전파되지 않게 차단
        // (위) stopPropagation: 클릭 "이벤트가 부모(오버레이)로 번지는 것"을 막음.
        //  배경 클릭 시 닫는 기능을 나중에 붙여도, 폼 안을 클릭했을 땐 닫히지 않게 하기 위한 안전장치입니다.
      >
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
          프로필 정보 입력
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
          원활한 수업 운영을 위해 <strong>이름(실명)과 전화번호</strong>를 입력해주세요.<br />
          <span style={{ color: '#dc2626', fontSize: '14px' }}>두 항목 모두 필수입니다.</span>
        </p>

        {/* 이름 입력 — autoFocus로 진입 시 바로 입력 가능. 포커스 시 테두리 강조 */}
        <label style={{ display: 'block', marginBottom: '16px' }}>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
            이름 <span style={{ color: '#dc2626' }}>*</span>
          </span>
          {/* "제어 컴포넌트(controlled input)": value를 state(name)에 묶고, onChange로 그 state를 갱신합니다.
              즉 화면의 입력값과 React의 state가 항상 같은 값으로 동기화됩니다. */}
          <input
            type="text"
            value={name}                                  // 화면에 보이는 값 = state의 name.
            onChange={(e) => setName(e.target.value)}     // 글자가 바뀔 때마다 name state를 갱신.
            placeholder="실명을 입력해주세요"
            autoFocus                                      // 모달이 뜨면 이 칸에 자동으로 커서가 놓임.
            style={{
              width: '100%', padding: '10px 12px', fontSize: '16px',
              border: '1.5px solid #d1d5db', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}   // 클릭(포커스)되면 파란 테두리.
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}    // 포커스가 빠지면 원래 회색으로.
          />
        </label>

        {/* 전화 입력 — onChange에서 formatPhone으로 즉시 하이픈 포맷 적용 */}
        <label style={{ display: 'block', marginBottom: '20px' }}>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
            전화번호 <span style={{ color: '#dc2626' }}>*</span>
          </span>
          <input
            type="tel"                                    // 모바일에서 숫자 키패드가 뜨도록 도와줌.
            value={phone}
            // 입력할 때마다 formatPhone을 거쳐 하이픈이 자동으로 붙은 값이 state에 저장됩니다.
            // 그래서 사용자가 보는 값과 저장되는 값이 항상 같은 포맷으로 유지됩니다.
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            style={{
              width: '100%', padding: '10px 12px', fontSize: '16px',
              border: '1.5px solid #d1d5db', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </label>

        {/* 검증 실패 메시지 */}
        {/* {error && (...)} 패턴: error가 빈 문자열이면 false라서 아무것도 안 그리고,
            내용이 있으면 뒤의 <p>를 그립니다. React에서 "조건부 렌더링"의 흔한 방식입니다. */}
        {error && (
          <p style={{ margin: '0 0 14px', fontSize: '15px', color: '#dc2626', fontWeight: 500 }}>
            {error}
          </p>
        )}

        {/* 제출 버튼 — saving 중에는 비활성화 + 라벨 변경 */}
        <button
          type="submit"            // type="submit"이라 클릭하면 form의 onSubmit(handleSubmit)이 실행됨.
          disabled={saving}        // 저장 중에는 비활성화 → 중복 제출 방지.
          style={{
            width: '100%', padding: '12px', fontSize: '16px', fontWeight: 600,
            color: '#fff', background: saving ? '#93c5fd' : '#2563eb',   // 저장 중이면 연한 파랑(비활성 느낌).
            border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', marginBottom: '10px',
          }}
        >
          {/* 저장 중 여부에 따라 버튼 글자를 바꿔 사용자에게 진행 상태를 알려줍니다. */}
          {saving ? '저장 중...' : '저장하고 시작하기'}
        </button>
      </form>
    </div>
  );
};

// 이 파일의 기본(default) 내보내기. 다른 파일에서 원하는 이름으로 import 할 수 있습니다.
export default ProfileCompleteModal;
