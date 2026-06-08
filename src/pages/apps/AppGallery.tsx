/**
 * AppGallery.tsx — 팀 프로젝트 배포 앱 갤러리
 *
 * [이 파일이 무엇인가요?]
 *  React로 만든 "한 페이지(컴포넌트)"입니다. 각 팀이 만든 실전 앱을 카드 형태로
 *  화면에 죽 늘어놓고, 카드를 클릭하면 새 탭에서 실제 배포된 앱이 열리도록 합니다.
 *
 * [왜 필요한가요?]
 *  여러 팀의 결과물(앱)을 한곳에 모아 보여주는 "전시장(갤러리)" 역할을 합니다.
 *  방문자가 어떤 팀이 무엇을 만들었는지 한눈에 보고 바로 실행해 볼 수 있게 합니다.
 *
 * [초보자가 알아둘 배경 용어]
 *  - 컴포넌트(Component): 화면의 한 조각을 만들어 주는 "함수". 이 함수는 JSX(아래 설명)를 돌려주고,
 *    React가 그것을 실제 HTML로 그려 줍니다.
 *  - JSX: 자바스크립트 안에서 HTML처럼 보이는 문법(<div>...</div> 같은 것). 실제 HTML은 아니고
 *    React가 해석하는 특별한 문법입니다.
 *  - props: 컴포넌트나 태그에 넘기는 "속성값"들(예: <a href=...>의 href). HTML 속성과 비슷합니다.
 *  - 배열.map(): 목록(배열)의 각 항목을 하나씩 변환해 새 목록을 만드는 메서드. 여기서는
 *    "팀 데이터 1개 → 카드 1개(JSX)"로 바꿔 여러 카드를 한꺼번에 그립니다.
 *
 * 핵심 책임:
 *  - TEAM_PROJECTS 데이터를 카드 그리드로 렌더.
 *  - 팀 id로 개별 GitHub Pages 배포 URL을 생성(liveUrl).
 *  - 호버 시 카드 살짝 띄우는 인터랙션.
 *
 * 주요 export:
 *  - default: AppGallery (React 페이지 컴포넌트)
 */

// [import = 다른 파일이 만들어 둔 기능을 가져오기]
// type ReactElement: 이 컴포넌트가 "React가 그릴 수 있는 화면 조각"을 돌려준다는 것을 TypeScript에게 알려 주는 타입.
//   'type' 키워드는 "이건 실제 값이 아니라 타입(설명표)만 가져온다"는 뜻이라 빌드 결과에는 포함되지 않습니다.
import { type ReactElement } from 'react';
// SEOHead: 페이지의 <title>이나 검색엔진 색인 설정 같은 <head> 정보를 넣어 주는 우리 프로젝트의 컴포넌트.
import SEOHead from '../../components/SEOHead';
// TEAM_PROJECTS: 팀 앱들의 정보(제목, 아이콘, 색, 팀원 등)가 담긴 데이터 배열. 다른 파일에 미리 정의돼 있습니다.
import { TEAM_PROJECTS } from '../../data/teamProjects';

/** 각 팀의 실제 배포 앱 URL (개별 레포 GitHub Pages) — id를 2자리(0패딩)로 맞춰 project01~ 형태로 생성 */
// liveUrl: 팀 번호(id)를 받아서 그 팀의 배포 주소(문자열)를 만들어 돌려주는 "작은 도우미 함수".
//   - 매개변수 id: 팀 번호(숫자). 예) 1, 7, 12
//   - 반환값: 완성된 URL 문자열. 예) "https://aebonlee.github.io/project07/"
//   - 부수효과 없음(화면을 바꾸거나 서버에 요청하지 않고, 그냥 문자열만 계산해 돌려줍니다).
//
// String(id): 숫자 id를 글자(문자열)로 바꿔 줍니다. 숫자에는 padStart 같은 글자 메서드를 쓸 수 없기 때문입니다.
// .padStart(2, '0'): 글자 길이가 2가 될 때까지 앞쪽을 '0'으로 채웁니다.
//   예) "1" → "01",  "7" → "07",  "12" → "12"(이미 2자리라 그대로).
//   주의: 이렇게 자리수를 맞추는 이유는 폴더 이름이 project01, project02처럼 항상 두 자리로 만들어졌기 때문입니다.
// 백틱(`...`) 문자열: 안에 ${ } 를 써서 변수 값을 끼워 넣을 수 있는 문자열(템플릿 리터럴)입니다.
//   주의: 백틱 문자열 내부에는 주석을 넣으면 안 됩니다. 넣으면 그 글자가 그대로 URL에 섞여 버립니다.
const liveUrl = (id: number) => `https://aebonlee.github.io/project${String(id).padStart(2, '0')}/`;

// AppGallery — 팀 앱 카드 목록을 렌더하는 표시용 컴포넌트.
// (): ReactElement  →  "받는 props 없음, 화면 조각(ReactElement)을 돌려줌"이라는 뜻.
//   이 컴포넌트는 데이터를 받아 보여주기만 하는 "표시용"이라 useState 같은 상태나 부수효과가 없습니다.
const AppGallery = (): ReactElement => {
  // return 안의 내용이 곧 화면에 그려질 JSX입니다.
  return (
    // <> ... </>  : "Fragment(프래그먼트)". 의미 없는 <div>를 추가로 만들지 않으면서
    //   여러 요소를 하나로 묶어 돌려주고 싶을 때 쓰는 빈 껍데기 태그입니다.
    //   (컴포넌트는 반드시 "하나의 최상위 요소"만 돌려줄 수 있어서 이렇게 묶습니다.)
    <>
      {/* noindex: 검색엔진 색인 제외(내부용 갤러리) */}
      {/* SEOHead에 props로 제목/경로/색인여부를 넘깁니다. noindex는 값 없이 쓰면 true로 전달됩니다. */}
      <SEOHead title="팀 프로젝트 앱" path="/projects/apps" noindex />
      <section className="page-header">
        {/* className: JSX에서는 HTML의 class 대신 className을 씁니다(class는 자바스크립트 예약어라서). */}
        <div className="container">
          <h2>팀 프로젝트 앱</h2>
          <p>AI 리부트 팀이 정한 주제로 만든 실전 배포 앱입니다. 카드를 누르면 새 창에서 실행됩니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 반응형 카드 그리드 — 최소 280px 폭으로 자동 채움 */}
          {/* style={{ ... }}: JSX에서 인라인 스타일은 "객체"로 줍니다. 바깥 { }는 JS 표현식, 안쪽 { }는 객체. */}
          {/* CSS 속성 이름은 가운데줄(grid-template-columns) 대신 카멜표기(gridTemplateColumns)로 씁니다. */}
          {/* repeat(auto-fill, minmax(280px, 1fr)): 칸을 최소 280px로 두되, 가로 공간이 남으면 칸을 자동으로 더 채웁니다(화면 크기에 따라 열 개수가 늘었다 줄었다 함). */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {/* TEAM_PROJECTS.map((p) => ...): 팀 데이터 배열을 한 항목(p)씩 돌면서 카드(<a>) 하나로 변환합니다. */}
            {/* p 는 팀 하나의 정보 객체(id, title, icon, color, tagline, members 등을 가짐). */}
            {TEAM_PROJECTS.map((p) => (
              // 카드 전체를 <a>(링크)로 만들어서, 카드 어디를 눌러도 그 팀 앱으로 이동하게 합니다.
              <a
                // key: 목록을 map으로 그릴 때 React가 각 항목을 구분하려고 요구하는 "고유 식별표".
                //   주의: 빠뜨리면 경고가 뜨고, 항목이 바뀔 때 화면 갱신이 비효율/오작동할 수 있습니다. 보통 고유한 id를 씁니다.
                key={p.id}
                // href: 클릭 시 이동할 주소. 위에서 만든 liveUrl 함수로 이 팀의 배포 URL을 계산해 넣습니다.
                href={liveUrl(p.id)}
                // target="_blank": 링크를 "새 탭"에서 엽니다(현재 갤러리 페이지를 떠나지 않게).
                target="_blank"
                rel="noopener noreferrer"   // 새 창 보안(opener 탈취 방지)
                // ↑ noopener: 새 탭이 이 페이지(window.opener)를 건드리지 못하게 막아 피싱 등 보안 위험을 차단.
                //   noreferrer: 어디서 왔는지(referrer) 정보를 새 탭에 넘기지 않음. 둘 다 외부 링크 기본 보안 습관입니다.
                style={{
                  display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px 18px 16px',
                  borderRadius: '14px', textDecoration: 'none', color: 'var(--text-primary)',
                  // var(--border-light, #e5e7eb): CSS 변수 값을 쓰되, 그 변수가 정의돼 있지 않으면 두 번째 값(#e5e7eb)을 기본으로 사용.
                  border: '1px solid var(--border-light, #e5e7eb)', borderTop: `4px solid ${p.color}`,
                  // ↑ borderTop은 백틱 문자열로, 팀 고유색(p.color)을 끼워 카드 위쪽 4px 띠 색을 팀마다 다르게 합니다.
                  //   주의: 이 백틱 안에도 주석을 넣으면 안 됩니다(스타일 문자열이 깨짐).
                  background: 'var(--bg-white, #fff)', transition: 'transform 0.1s, box-shadow 0.15s',
                  // ↑ transition: 아래 호버 효과(이동/그림자)가 뚝 끊기지 않고 부드럽게 변하도록 시간(초)을 지정.
                }}
                // 호버 시 카드를 살짝 띄우고 그림자 추가, 벗어나면 원복(인라인 스타일 직접 제어)
                // onMouseEnter: 마우스가 카드 위로 "들어올 때" 한 번 실행되는 함수(이벤트 핸들러).
                //   e.currentTarget: 지금 이벤트가 붙은 그 <a> 요소 자체. 그 요소의 style을 직접 바꿔 효과를 줍니다.
                //   translateY(-3px): 위로 3px 이동(살짝 떠 보이게). boxShadow: 아래쪽에 옅은 그림자 추가.
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.08)'; }}
                // onMouseLeave: 마우스가 카드에서 "빠져나갈 때" 실행. 위에서 준 효과를 원래대로 되돌립니다('none').
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* 상단: 아이콘 + PROJECT 번호(팀 색) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* p.icon: 팀을 나타내는 이모지/아이콘 문자. { }로 감싸 JS 값을 화면에 출력합니다. */}
                  <span style={{ fontSize: '26px' }}>{p.icon}</span>
                  {/* 여기서도 padStart(2,'0')로 번호를 두 자리로 맞춰 "PROJECT 01"처럼 일관되게 표시. color는 팀 색. */}
                  <span style={{ fontSize: '11px', fontWeight: 800, color: p.color }}>PROJECT {String(p.id).padStart(2, '0')}</span>
                </div>
                {/* 제목(강조). lineHeight는 줄 간격(글자 크기의 1.35배). */}
                <strong style={{ fontSize: '15.5px', lineHeight: 1.35 }}>{p.title}</strong>
                {/* tagline: 한 줄 소개 문구. flex:1 은 카드 안 남는 세로 공간을 이 요소가 차지하게 해서 카드 높이를 맞춰 줍니다. */}
                <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.55, flex: 1 }}>{p.tagline}</span>
                {/* 하단: 팀원 목록(말줄임) + 실행 배지 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  {/* overflow:hidden + textOverflow:'ellipsis' + whiteSpace:'nowrap': 팀원 이름이 길어 칸을 넘치면 한 줄로 두고 끝을 ...으로 줄여 표시. maxWidth로 차지할 최대 폭 제한. */}
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #9ca3af)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '64%' }}>
                    {/* p.members 는 이름 배열. .join(' · ') 로 배열을 " · " 구분자로 이어 붙여 한 문자열로 만듭니다. 예) ["김","이"] → "김 · 이" */}
                    {p.members.join(' · ')}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px',
                    // ↑ borderRadius: '999px': 아주 큰 값을 줘서 모서리를 완전히 둥글게(알약 모양 배지) 만듭니다.
                    background: '#d1fae5', color: '#065f46',
                  }}>실행 ↗</span>
                </div>
              </a>
            ))}
          </div>

          <p style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
            각 앱은 팀별 GitHub 저장소(project01~21)에서 자동 배포됩니다.
          </p>
        </div>
      </section>
    </>
  );
};

// default export: 이 파일을 가져올 때 이름 없이 받을 수 있게 "대표 내보내기"로 지정.
//   예) 다른 파일에서  import AppGallery from '.../AppGallery'  처럼 사용합니다.
export default AppGallery;
