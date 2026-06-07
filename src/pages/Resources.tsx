/**
 * Resources.tsx — 학습자료 페이지 컴포넌트
 *
 * [이 파일이 무엇인가요?]
 *   "학습자료" 라는 한 화면(페이지)을 그리는 React 컴포넌트입니다.
 *   드림아이티비즈(DreamIT)가 운영하는 학습 사이트와 외부 AI·개발 자료/도구를
 *   분야별(그룹별)로 모아 보여줍니다. 왼쪽 사이드바에서 그룹을 고르면
 *   본문 영역에 그 그룹에 속한 사이트 카드 목록이 나타납니다.
 *
 * [초보자가 먼저 알아두면 좋은 용어]
 *   - 컴포넌트(component): 화면의 한 조각을 만들어내는 함수. 이 파일의 Resources 가 바로 그것.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 태그(<div> 등)를 쓰는 문법. React가 화면으로 바꿔줌.
 *   - 상태(state): 컴포넌트가 "기억"하는 값. 값이 바뀌면 화면이 자동으로 다시 그려짐(re-render).
 *   - props/매개변수: 함수에 넘기는 입력값.
 *   - 인라인 스타일(style={{ ... }}): 태그에 직접 CSS를 객체 형태로 적는 방식.
 *     주의: CSS는 borderColor 처럼 카멜케이스로 쓰고, 값은 보통 문자열('10px')로 적습니다.
 *
 * [핵심 책임]
 *   - SITE_GROUPS 데이터를 'mine'(자체 운영) / 'external'(외부) 소유 구분으로 분리
 *   - 사이드바 네비게이션 버튼으로 활성 그룹(active) 상태를 전환
 *   - 선택된 그룹의 사이트를 featured(추천) 우선 정렬하여 카드로 렌더
 *   - SEOHead 로 페이지 메타데이터(title/description/path) 설정
 *
 * [주요 export]
 *   - default Resources: 학습자료 페이지 React 컴포넌트
 *
 * [부수효과]
 *   없음(순수 표시 컴포넌트). 외부 링크는 새 탭(target="_blank")으로 열립니다.
 */

// import: 다른 파일에 있는 기능을 이 파일로 가져와 사용하겠다는 선언.
// - useState: React가 제공하는 "훅(Hook)". 컴포넌트에 상태(기억하는 값)를 추가할 때 씀.
// - type ReactElement: 컴포넌트가 반환하는 "화면 조각"의 타입(TypeScript용). 'type' 키워드는
//   "이건 실제 값이 아니라 타입만 가져온다"는 뜻이라 빌드 결과물에 포함되지 않습니다.
import { useState, type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';        // 페이지 제목·설명 등 SEO 메타데이터를 넣어주는 컴포넌트
import { SITE_GROUPS } from '../data/resourceSites'; // 그룹/사이트 목록 데이터 (별도 데이터 파일에서 가져옴)

/**
 * Resources — 학습자료 페이지 컴포넌트
 * 매개변수: 없음
 * 반환값: ReactElement (페이지 전체 마크업)
 * 부수효과: 없음 (active 그룹 선택 상태만 내부에서 관리)
 *
 * 참고: () => 형태는 화살표 함수(arrow function)입니다. ': ReactElement' 부분은
 *       "이 함수는 ReactElement 를 반환한다"는 TypeScript 타입 표기입니다.
 */
const Resources = (): ReactElement => {
  // [상태 선언] useState 는 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려줍니다.
  //   -> 이걸 구조분해(const [a, b] = ...)로 받아서 active, setActive 로 이름 붙임.
  // active: 현재 선택된 그룹의 id. 초기값은 첫 번째 그룹의 id(SITE_GROUPS[0].id).
  // 주의: active 를 바꿀 땐 반드시 setActive(...)를 써야 합니다. active = ... 처럼 직접 대입하면
  //       React가 변화를 감지하지 못해 화면이 다시 그려지지 않습니다.
  const [active, setActive] = useState(SITE_GROUPS[0].id);

  // group: active id 와 일치하는 그룹 객체를 찾음.
  //   - find: 조건(g.id === active)을 처음 만족하는 항목을 반환, 없으면 undefined.
  //   - '|| SITE_GROUPS[0]': 못 찾았을 때(엣지케이스) 첫 그룹으로 폴백(대체). undefined로 인한
  //     화면 깨짐을 막아주는 안전장치입니다.
  const group = SITE_GROUPS.find((g) => g.id === active) || SITE_GROUPS[0];

  // [사이드바를 두 섹션으로 나누기 위한 분류]
  //   filter: 조건을 만족하는 항목들만 모아 새 배열로 반환(원본 SITE_GROUPS는 그대로 둠).
  // mine: 자체 운영(owner === 'mine') 그룹들
  const mine = SITE_GROUPS.filter((g) => g.owner === 'mine');
  // external: 외부 제공(owner === 'external') 그룹들
  const external = SITE_GROUPS.filter((g) => g.owner === 'external');

  /**
   * navBtn — 사이드바 그룹 네비게이션 버튼 하나를 렌더하는 헬퍼(작은 도우미 함수)
   * 매개변수: g — SITE_GROUPS 배열의 단일 그룹 항목
   * 반환값: ReactElement (button)
   * 부수효과: 클릭 시 setActive 로 활성 그룹을 g.id 로 전환
   *
   * 참고: 'typeof SITE_GROUPS[number]' 는 "SITE_GROUPS 배열의 한 원소 타입"을 뜻하는
   *       TypeScript 표현입니다. 즉 g 는 그룹 한 개라는 의미.
   */
  const navBtn = (g: typeof SITE_GROUPS[number]): ReactElement => {
    // on: 이 버튼이 현재 활성 그룹인지 여부(true/false). 아래 스타일을 분기할 때 사용.
    const on = g.id === active;
    return (
      <button
        // key: React가 목록의 각 항목을 구분하기 위한 고유 식별자.
        //   주의: .map()으로 목록을 그릴 땐 key가 꼭 필요합니다(없으면 경고+성능 문제).
        key={g.id}
        type="button"               // 폼 안에 있어도 실수로 제출(submit)되지 않도록 명시
        onClick={() => setActive(g.id)} // 클릭하면 이 그룹을 활성으로 변경 -> 화면 다시 그려짐
        style={{
          display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
          padding: '10px 12px', borderRadius: '9px', cursor: 'pointer',
          // 삼항연산자(조건 ? A : B): on(활성) 이면 A, 아니면 B 를 적용.
          // 활성 버튼은 굵게/파란 배경/흰 글자로 강조
          fontSize: '15px', fontWeight: on ? 700 : 500, textAlign: 'left',
          border: '1px solid', borderColor: on ? 'var(--primary-blue)' : 'transparent',
          background: on ? 'var(--primary-blue)' : 'transparent',
          color: on ? '#fff' : 'var(--text-primary)',
        }}
      >
        {/* 그룹 아이콘(이모지 등) */}
        <span style={{ fontSize: '18px' }}>{g.icon}</span>
        {/* 그룹 이름. flex:1 로 남는 가로공간을 모두 차지해 개수 표시를 오른쪽 끝으로 밀어냄 */}
        <span style={{ flex: 1 }}>{g.label}</span>
        {/* 그룹에 속한 사이트 개수 표시 (g.sites 는 사이트 배열, .length 는 그 개수) */}
        <span style={{ fontSize: '12px', opacity: 0.8 }}>{g.sites.length}</span>
      </button>
    );
  };

  /**
   * sectionLabel — 사이드바 섹션 제목(소제목)을 렌더하는 헬퍼
   * 매개변수: text — 섹션 제목 문자열
   * 반환값: ReactElement (p)
   * 부수효과: 없음
   */
  const sectionLabel = (text: string): ReactElement => (
    <p style={{ margin: '4px 8px 6px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>{text}</p>
  );

  // [화면 그리기] return 안의 JSX 가 실제로 화면에 표시됩니다.
  // <>...</> 는 'Fragment'(빈 껍데기). 여러 요소를 불필요한 <div> 없이 묶을 때 씁니다.
  return (
    <>
      {/* 페이지 SEO 메타데이터 설정(브라우저 탭 제목, 검색엔진 설명 등). 화면에 직접 보이진 않음 */}
      <SEOHead title="학습자료" description="드림아이티비즈 학습 사이트와 외부 AI·개발 자료를 분야별로 모았습니다." path="/resources" />

      {/* 페이지 상단 헤더: 제목 + 설명 + Padlet 참고사이트 버튼 */}
      <section className="page-header">
        <div className="container">
          <h2>학습자료</h2>
          <p>DreamIT 사에서 만든 학습 사이트와 외부 자료·도구를 분야별로 모았습니다.</p>
          {/* 외부 Padlet 링크 — target="_blank" 로 새 탭에서 열림.
               rel="noopener noreferrer": 새 탭이 원래 페이지를 조작하는 보안 위험을 막고,
               이동 시 현재 주소(Referrer) 노출을 줄여주는 안전 설정입니다. 외부 링크엔 거의 필수. */}
          <a
            href="https://padlet.com/aebon/rest01"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px',
              padding: '10px 18px', borderRadius: '999px', textDecoration: 'none',
              // var(--primary-blue, #0046C8): CSS 변수 값을 쓰되, 없으면 #0046C8 을 기본값으로 사용
              fontSize: '14px', fontWeight: 700, color: '#fff', background: 'var(--primary-blue, #0046C8)',
              boxShadow: '0 4px 14px rgba(0,70,200,0.25)',
            }}
          >
            📌 학습기간 참고사이트 — ReBoot 1기 ↗
          </a>
        </div>
      </section>

      {/* 본문 영역: 모바일은 단일 컬럼, 데스크톱(>=1024px)은 사이드바+본문 2컬럼(파일 하단 <style> 참고) */}
      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          {/* display:'grid' + gridTemplateColumns: CSS Grid 로 레이아웃을 잡음.
               minmax(0, 1fr): 한 칸이 최소 0 ~ 최대 남는공간 전부. 0을 최소로 둬야 내용이 넘쳐도 안 깨짐. */}
          <div className="resources-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
            {/* 본문 */}
            {/* order: 2 — 모바일 세로 배치에서 사이드바보다 아래에 위치.
                 (데스크톱에서는 파일 하단 미디어쿼리로 순서를 재정렬함) */}
            <div style={{ minWidth: 0, order: 2 }} className="resources-main">
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', color: 'var(--text-primary)' }}>
                {/* 현재 선택된 그룹의 아이콘과 이름 */}
                {group.icon} {group.label}
                {/* 선택된 그룹의 사이트 개수 */}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}> · {group.sites.length}개</span>
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {/* 소유 구분(owner)에 따라 안내 문구를 분기(삼항연산자) */}
                {group.owner === 'mine' ? '드림아이티비즈가 운영하는 학습 사이트입니다.' : '제3자가 제공하는 외부 사이트·도구입니다.'}
              </p>

              {/* 사이트 카드 그리드 (반응형 auto-fill: 가로폭에 맞게 칸 개수 자동 조절, 한 칸 최소 260px) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {/* [정렬 + 목록 렌더]
                     - [...group.sites]: 스프레드(...)로 배열을 "복사"해 새 배열을 만든다.
                       주의: sort() 는 원본 배열을 직접 바꿉니다(불변성 위반). 데이터 원본 훼손을 막기 위해
                             반드시 복사본을 만든 뒤 정렬합니다. (React에서 원본 변형은 버그의 흔한 원인)
                     - sort 비교식: (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
                       featured(추천)인 항목에 1, 아니면 0을 부여해 추천 항목이 앞쪽으로 오도록 정렬.
                     - .map((s) => ...): 사이트 하나(s)마다 카드 JSX 를 만들어 목록으로 펼침. */}
                {[...group.sites].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((s) => {
                  // accent: 사이트별 강조색. s.accent 가 없으면(falsy) 기본 파란색으로 폴백.
                  const accent = s.accent || 'var(--primary-blue)';
                  return (
                  // 사이트 카드 — 클릭하면 해당 사이트로 이동(외부 링크, 새 탭 + noopener/noreferrer)
                  <a
                    key={s.url}                  // 각 카드의 고유 key 로 사이트 URL 사용(중복 없는 식별자)
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '5px',
                      padding: '16px 18px', borderRadius: '12px', textDecoration: 'none',
                      // featured(추천) 카드는 굵은 테두리/밝은 배경/그림자로 강조
                      border: s.featured ? `2px solid ${accent}` : '1px solid var(--border-light)',
                      background: s.featured ? 'var(--bg-light-gray)' : 'var(--bg-white)',
                      // s.accent 지정 여부에 따라 그림자 색을 분기(빨강 계열 vs 파랑 계열)
                      boxShadow: s.featured ? `0 4px 16px ${s.accent ? 'rgba(220,38,38,0.16)' : 'rgba(0,70,200,0.12)'}` : 'none',
                      color: 'var(--text-primary)', transition: 'border-color 0.15s, transform 0.1s',
                    }}
                    // 마우스 진입(호버): 테두리를 accent 색으로 강조 + 카드를 살짝 위로 띄움.
                    //   e.currentTarget = 이벤트가 걸린 그 <a> 요소. .style 을 직접 만져 실시간 효과를 줌.
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    // 마우스 이탈: featured 여부에 맞는 기본 테두리색으로 복원 + 위치 원래대로(0).
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = s.featured ? accent : 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* 카드 상단 줄: 왼쪽 사이트명 / 오른쪽 배지 또는 화살표 (space-between 으로 양끝 정렬) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: s.featured ? '16px' : '15px' }}>
                        {/* featured 항목은 이름 앞에 별(⭐) 아이콘 표시.
                             {조건 && <JSX>} 패턴: 조건이 true 일 때만 뒤의 요소를 그림(false면 아무것도 안 나옴). */}
                        {s.featured && <span style={{ marginRight: '6px' }}>⭐</span>}{s.name}
                      </strong>
                      {/* featured면 배지(s.badge 가 없으면 기본값 '추천'), 아니면 이동 화살표(→) 표시 */}
                      {s.featured
                        ? <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 800, color: '#fff', background: accent, padding: '2px 9px', borderRadius: '999px' }}>{s.badge || '추천'}</span>
                        : <span style={{ color: 'var(--primary-blue)', fontWeight: 700, flexShrink: 0 }}>→</span>}
                    </div>
                    {/* 사이트 설명 문구 */}
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</span>
                    {/* 표시용 URL — replace('https://', '')로 맨 앞 'https://' 접두어만 제거해 도메인만 깔끔히 노출.
                         참고: 문자열 replace 는 첫 번째로 일치하는 부분만 바꿉니다(여기선 맨 앞 1회만 충분). */}
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', opacity: 0.7 }}>{s.url.replace('https://', '')}</span>
                  </a>
                  );
                })}
              </div>
            </div>

            {/* 왼쪽 사이드바(그룹 선택 메뉴). aside = "본문과 구분되는 보조 영역" 의미의 시맨틱 태그 */}
            {/* order: 1 — 모바일에서 본문보다 위에 배치 (데스크톱은 미디어쿼리로 좌측 고정) */}
            <aside style={{ order: 1 }} className="resources-sidebar">
              {/* position:'sticky' + top:'90px': 스크롤을 내려도 화면 상단에서 90px 지점에 "달라붙어" 따라옴 */}
              <div style={{
                position: 'sticky', top: '90px',
                background: 'var(--bg-white)', border: '1px solid var(--border-light)',
                borderRadius: '12px', padding: '14px 10px',
              }}>
                {/* 자체 운영 사이트 섹션 */}
                {sectionLabel('DreamIT 사에서 만든 사이트')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                  {/* mine.map(navBtn): mine 배열의 각 그룹을 navBtn 함수에 넘겨 버튼 목록으로 변환.
                       (map(navBtn) 은 map((g) => navBtn(g)) 와 같은 의미의 축약형) */}
                  {mine.map(navBtn)}
                </div>
                {/* 외부 사이트 섹션 */}
                {sectionLabel('외부 사이트')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {external.map(navBtn)}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* [데스크톱 전용 반응형 레이아웃]
           <style>{` ... `}</style>: 컴포넌트 안에서 직접 CSS 규칙을 주입(미디어쿼리는 인라인 style로 못 쓰므로 이 방식 사용).
           화면 너비 1024px 이상일 때: 좌측 240px 사이드바 + 나머지 본문(1fr)로 2컬럼 배치하고,
           위에서 모바일용으로 잡아둔 order(본문2/사이드바1)를 사이드바=1, 본문=2 로 재정렬.
           주의: 백틱(`...`) 안은 그대로 출력되는 CSS 문자열이므로 그 안에 주석을 넣으면 안 됩니다.
           !important: 위쪽 인라인 style 의 order 값을 확실히 덮어쓰기 위해 사용. */}
      <style>{`
        @media (min-width: 1024px) {
          .resources-layout { grid-template-columns: 240px 1fr !important; }
          .resources-sidebar { order: 1 !important; }
          .resources-main { order: 2 !important; }
        }
      `}</style>
    </>
  );
};

// default export: 이 파일을 import 할 때 이름 없이 가져올 수 있게 기본 내보내기로 지정.
//   예) import Resources from '../pages/Resources';
export default Resources;
