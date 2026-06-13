/**
 * Classroom.tsx
 *
 * [이 파일이 무엇인가 — 초보자용 설명]
 *   - 이 파일은 웹사이트의 한 "페이지"를 만드는 React 컴포넌트다.
 *   - React에서는 화면(UI)을 "컴포넌트"라는 단위로 쪼개서 만든다.
 *     컴포넌트는 쉽게 말해 "화면 조각을 만들어 돌려주는 함수"라고 생각하면 된다.
 *   - 이 페이지(주소 /classroom)는 "쉬었음 청년 디지털 맞춤 교육" 과정의
 *     온라인(Zoom)·오프라인 강의실 안내를 보여준다.
 *
 * [왜 이런 파일이 필요한가]
 *   - 수강생이 "수업을 어디서/언제/어떻게 듣는지" 한눈에 보도록 안내해야 하기 때문.
 *   - 과정 개요(기간/시간/방식), 휴강 공지, Zoom 접속 정보, 오프라인 장소를 한 화면에 모았다.
 *
 * [핵심 책임]
 *   - SEOHead로 페이지 메타데이터(제목/설명/경로) 설정.
 *     ※ SEO = 검색엔진 최적화. 구글 같은 검색엔진이 페이지를 잘 이해하도록 정보를 넣는 것.
 *   - 교육 상세 정보(기간/시간/방식)와 휴강 공지 표시.
 *   - Zoom 강의실 입장 링크 및 회의 ID/암호 안내.
 *   - 오프라인 수업 장소 주소와 네이버 지도 링크 제공.
 *
 * [주요 export]
 *   - default: Classroom (강의실 안내 페이지 컴포넌트)
 *     ※ export default = 이 파일의 "대표 결과물"을 밖으로 내보낸다는 뜻.
 *       다른 파일(라우터 등)에서 이 컴포넌트를 가져다 쓴다.
 *
 * [부수효과: 없음]
 *   - "부수효과"란 화면 그리기 외에 서버 호출/데이터 저장/타이머 같은 추가 동작을 말한다.
 *   - 이 페이지는 정해진 내용을 그대로 보여주기만 하는 "정적(static) 페이지"라서
 *     데이터 패칭(서버에서 가져오기)·상태(state)·로그인 처리 같은 게 전혀 없다.
 */

// import = 다른 파일에 있는 기능을 이 파일로 "가져오기".
// type ReactElement: 이 컴포넌트가 돌려주는 "화면 한 덩어리"의 타입(자료형 이름).
//   ※ TypeScript에서 'type'을 붙여 import하면 "이건 실제 코드가 아니라 타입(설계도)만 가져온다"는 표시.
//      덕분에 빌드 결과물에 불필요한 코드가 포함되지 않는다.
import { type ReactElement } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
// SEOHead: 페이지 제목/설명 등 검색엔진용 정보를 넣어주는 우리 프로젝트의 컴포넌트.
import SEOHead from '../components/SEOHead';

// ─────────────────────────────────────────────────────────────────────────────
// [상수(constant) 정의]
//   const로 선언한 값은 "변하지 않는 고정값"이다. 한 번 정하면 바뀌지 않는다.
//   이런 정보(주소/링크 등)를 코드 곳곳에 흩어 적지 않고 위쪽에 한 번만 모아두면,
//   나중에 값이 바뀌어도 여기 한 곳만 고치면 되어서 관리가 쉽다.
// ─────────────────────────────────────────────────────────────────────────────

// Zoom 강의실 접속 정보 — 온라인 수업(평일, 월요일 제외)에 사용하는 고정 주소(URL).
const ZOOM_URL = 'https://us06web.zoom.us/j/83837937780?pwd=DzAGHF7alv5aGxRUjL7WTEKUkxa7HC.1';
const ZOOM_ID = '838 3793 7780'; // 화면 표시용 회의 ID(사람이 읽기 쉽게 공백을 넣은 포맷)
const ZOOM_PW = '333260'; // 회의 암호(수강생이 Zoom 입장 시 입력)
// 오프라인 수업 관련 상수 — 지도 링크와 화면에 표시할 주소.
const OFFLINE_MAP = 'https://naver.me/FG7x0tVl'; // 네이버 지도 단축 링크
const OFFLINE_ADDR = '서울 용산구 후암로57길 302 4층 (공간 햅삐 서울역점)';

// 카드 UI 공통 스타일 — 세 개의 안내 박스(개요/온라인/오프라인)에서 똑같이 재사용한다.
//   ※ React.CSSProperties: "이 객체는 CSS 스타일 모음입니다"라고 알려주는 타입.
//     덕분에 오타가 나면 편집기가 미리 잡아준다.
//   ※ var(--bg-white)처럼 var(--...)로 쓴 값은 "CSS 변수"로,
//     프로젝트 공통 테마 색상을 따라간다(다크모드/색 변경 시 한 곳에서 제어).
const card: React.CSSProperties = {
  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
  borderRadius: '16px', padding: '24px 26px', color: 'var(--text-primary)',
};

/**
 * Classroom
 *   온·오프라인 강의실 안내 페이지를 만드는 컴포넌트(함수).
 *
 *   [무엇을 하나]
 *     - 헤더 + 안내 카드 3개(과정 개요 / 온라인 Zoom / 오프라인 장소)를 화면으로 그려서 돌려준다.
 *   [왜 이렇게 하나]
 *     - React 컴포넌트는 "JSX(화면 설계도)"를 return(반환)하면, React가 그걸 실제 화면으로 그려준다.
 *   [매개변수] 없음 (받는 입력값이 없다 — 보여줄 내용이 위 상수로 고정되어 있어서).
 *   [반환값] 강의실 안내 화면 한 덩어리(ReactElement).
 *   [부수효과] 없음(정적 렌더링 — 그냥 화면만 그린다).
 */
const Classroom = (): ReactElement => {
  // return 안에 있는 것이 바로 "화면 설계도(JSX)"다.
  //   ※ JSX: HTML처럼 생겼지만 사실은 JavaScript 안에서 화면을 표현하는 문법.
  return (
    // <> ... </>: "프래그먼트(Fragment)". 화면 조각 여러 개를 감쌀 때 쓰는 빈 껍데기.
    //   ※ React 컴포넌트는 한 덩어리만 돌려줄 수 있어서, 여러 요소를 하나로 묶어줘야 한다.
    //     의미 없는 <div>를 추가하지 않으려고 빈 태그(<></>)를 쓴다.
    <>
      {/* 페이지 SEO 메타데이터(제목/설명/canonical 경로) 주입.
          ※ JSX 안에서 주석은 이렇게 중괄호로 감싸서 쓴다.
          ※ title/description/path는 SEOHead 컴포넌트에 "props(속성)"로 전달하는 값. */}
      <SEOHead title="온라인강의실" description="쉬었음 청년 디지털 맞춤 교육 — 온·오프라인 강의실 안내(Zoom·오프라인 장소·일정)" path="/classroom" />

      {/* 페이지 상단 헤더 영역 — 페이지 제목과 한 줄 소개를 보여준다.
          ※ className: HTML의 class와 같은 것. JSX에서는 'class' 대신 'className'을 쓴다(예약어 충돌 방지). */}
      <section className="page-header">
        <div className="container">
          <h2>온라인강의실</h2>
          <p>쉬었음 청년 디지털 맞춤 교육 · 온·오프라인 수업 안내</p>
        </div>
      </section>

      {/* 본문: 세로 스택(flexDirection: 'column')으로 세 개의 안내 카드를 위에서 아래로 배치.
          ※ style={{ ... }}: JSX에서 인라인 스타일은 "객체"로 준다. 그래서 중괄호가 두 겹이다.
            바깥 { } 은 "JS 표현식 시작", 안쪽 { } 은 "스타일 객체". */}
      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>

          {/* ── 카드 1: 과정 개요 ─────────────────────────────────────── */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: '19px' }}>교육 상세 안내</h3>
            {/* 반응형 그리드: 화면 폭에 따라 항목 칸이 자동으로 줄바꿈된다.
                ※ auto-fit + minmax(220px, 1fr): "칸 최소 너비 220px, 남는 공간은 똑같이 나눠 채움".
                  화면이 좁으면 한 줄에 적게, 넓으면 한 줄에 여러 개가 들어간다. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* [라벨, 값] 모양의 작은 배열들을 모은 "배열의 배열"을 만들고,
                  .map(...)으로 하나씩 돌면서 화면 조각(항목 카드)을 생성한다.
                  ※ .map(): 배열의 각 요소를 다른 모양으로 "변환"해 새 배열을 만드는 함수.
                    여기서는 [라벨,값] → <div>...</div> 로 변환한다.
                  ※ 구조 분해 할당 ([k, v]): 배열의 0번째를 k(라벨), 1번째를 v(값)으로 한 번에 꺼낸다. */}
              {[
                ['과정명', '쉬었음 청년 디지털 맞춤 교육'],
                ['교육 기간', '6/1 ~ 6/22'],
                ['수업 시간', '평일(월~금) 14:00 ~ 18:00 (1일 4시간)'],
                ['교육 방식', '온·오프라인 병행'],
              ].map(([k, v]) => (
                // key: 목록을 .map으로 그릴 때 React가 각 항목을 구별하려고 요구하는 "고유 표시".
                //   ※ 주의: key는 형제 요소끼리 겹치지 않아야 한다. 여기선 라벨(k)이 서로 달라서 key로 안전하게 쓴다.
                //     key를 안 주면 React가 경고를 내고, 목록 변경 시 화면이 꼬일 수 있다.
                <div key={k}>
                  {/* k: 항목 라벨(예: '교육 기간'), v: 항목 값(예: '6/1 ~ 6/22'). 중괄호로 변수 값을 화면에 꽂는다. */}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>{k}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>
            {/* 휴강 공지 배너(노란 경고색) — 수강생이 놓치지 않도록 눈에 띄게 표시. */}
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', fontSize: '14px', fontWeight: 600 }}>
              <EmojiIcon char="⚠" /> 6/3(화)은 휴강입니다.
            </div>
          </div>

          {/* ── 카드 2: 온라인 (Zoom) ─────────────────────────────────────
              ※ style={{ ...card, borderLeft: ... }}: "스프레드(...) 문법".
                먼저 공통 card 스타일을 그대로 펼쳐 넣고, 그 뒤 borderLeft를 추가/덮어쓴다.
                즉 "공통 스타일 + 이 카드만의 추가 스타일" 조합. 원본 card 객체는 그대로 보존된다(불변성). */}
          <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}><EmojiIcon char="💻" /> 온라인 수업 (Zoom)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>오프라인(월요일)을 제외한 평일은 Zoom으로 진행합니다.</p>
            {/* Zoom 강의실 입장 링크.
                ※ target="_blank": 링크를 "새 탭"에서 연다.
                ※ rel="noopener noreferrer": 새 탭 보안/개인정보 보호 설정.
                  noopener는 새로 열린 페이지가 원래 페이지를 조작하지 못하게 막는 안전장치다(보안 권장). */}
            <a href={ZOOM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '16px' }}>
              Zoom 강의실 입장 →
            </a>
            {/* 회의 ID/암호 표시 영역 — flexWrap: 'wrap'으로 좁은 화면에선 자동 줄바꿈된다. */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>회의 ID</div>
                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em' }}>{ZOOM_ID}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>회의 암호</div>
                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em' }}>{ZOOM_PW}</div>
              </div>
            </div>
          </div>

          {/* ── 카드 3: 오프라인 ──────────────────────────────────────────
              좌측 초록 테두리로 온라인 카드와 시각적으로 구분한다(card 스타일 + borderLeft 덮어쓰기). */}
          <div style={{ ...card, borderLeft: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}><EmojiIcon char="📍" /> 오프라인 수업 (월요일)</h3>
            <p style={{ margin: '0 0 6px', fontSize: '14px', color: 'var(--text-secondary)' }}>매주 월요일은 아래 장소에서 대면으로 진행합니다.</p>
            {/* 상수 OFFLINE_ADDR(주소)을 화면에 꽂아 표시. */}
            <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>{OFFLINE_ADDR}</p>
            {/* 네이버 지도 링크 — 위 Zoom 링크와 동일하게 새 탭 + 보안 속성으로 연다. */}
            <a href={OFFLINE_MAP} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '11px 22px' }}>
              네이버 지도로 보기 →
            </a>
          </div>

        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일(주로 라우터)에서 가져다 쓸 수 있도록 내보낸다.
//   ※ default export는 파일당 하나만 가능하며, 가져올 때 이름을 자유롭게 붙일 수 있다.
export default Classroom;
