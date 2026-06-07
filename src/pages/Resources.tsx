/**
 * Resources.tsx — 학습자료 페이지 컴포넌트
 *
 * 역할:
 *   드림아이티비즈(DreamIT)가 운영하는 학습 사이트와 외부 AI·개발 자료/도구를
 *   분야별(그룹별)로 모아 보여주는 페이지. 왼쪽 사이드바에서 그룹을 선택하면
 *   본문 영역에 해당 그룹의 사이트 카드 목록이 표시된다.
 *
 * 핵심 책임:
 *   - SITE_GROUPS 데이터를 'mine'(자체 운영) / 'external'(외부) 소유 구분으로 분리
 *   - 사이드바 네비게이션 버튼으로 활성 그룹(active) 상태를 전환
 *   - 선택된 그룹의 사이트를 featured(추천) 우선 정렬하여 카드로 렌더
 *   - SEOHead 로 페이지 메타데이터(title/description/path) 설정
 *
 * 주요 export:
 *   - default Resources: 학습자료 페이지 React 컴포넌트
 *
 * 부수효과: 없음(순수 표시 컴포넌트). 외부 링크는 새 탭(target="_blank")으로 열림.
 */
import { useState, type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import { SITE_GROUPS } from '../data/resourceSites';

/**
 * Resources — 학습자료 페이지 컴포넌트
 * 매개변수: 없음
 * 반환값: ReactElement (페이지 전체 마크업)
 * 부수효과: 없음 (active 그룹 선택 상태만 내부에서 관리)
 */
const Resources = (): ReactElement => {
  // active: 현재 선택된 그룹 id. 초기값은 첫 번째 그룹의 id.
  const [active, setActive] = useState(SITE_GROUPS[0].id);
  // group: active id 와 일치하는 그룹. 못 찾으면(엣지케이스) 첫 그룹으로 폴백.
  const group = SITE_GROUPS.find((g) => g.id === active) || SITE_GROUPS[0];
  // mine: 자체 운영 그룹들 / external: 외부 제공 그룹들 (사이드바 섹션 구분용)
  const mine = SITE_GROUPS.filter((g) => g.owner === 'mine');
  const external = SITE_GROUPS.filter((g) => g.owner === 'external');

  /**
   * navBtn — 사이드바 그룹 네비게이션 버튼 하나를 렌더하는 헬퍼
   * 매개변수: g — SITE_GROUPS 배열의 단일 그룹 항목
   * 반환값: ReactElement (button)
   * 부수효과: 클릭 시 setActive 로 활성 그룹을 g.id 로 전환
   */
  const navBtn = (g: typeof SITE_GROUPS[number]): ReactElement => {
    // on: 이 버튼이 현재 활성 그룹인지 여부 (스타일 강조에 사용)
    const on = g.id === active;
    return (
      <button
        key={g.id}
        type="button"
        onClick={() => setActive(g.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
          padding: '10px 12px', borderRadius: '9px', cursor: 'pointer',
          // 활성 버튼은 굵게/파란 배경/흰 글자로 강조
          fontSize: '15px', fontWeight: on ? 700 : 500, textAlign: 'left',
          border: '1px solid', borderColor: on ? 'var(--primary-blue)' : 'transparent',
          background: on ? 'var(--primary-blue)' : 'transparent',
          color: on ? '#fff' : 'var(--text-primary)',
        }}
      >
        <span style={{ fontSize: '18px' }}>{g.icon}</span>
        <span style={{ flex: 1 }}>{g.label}</span>
        {/* 그룹에 속한 사이트 개수 표시 */}
        <span style={{ fontSize: '12px', opacity: 0.8 }}>{g.sites.length}</span>
      </button>
    );
  };

  /**
   * sectionLabel — 사이드바 섹션 제목(소제목) 렌더 헬퍼
   * 매개변수: text — 섹션 제목 문자열
   * 반환값: ReactElement (p)
   * 부수효과: 없음
   */
  const sectionLabel = (text: string): ReactElement => (
    <p style={{ margin: '4px 8px 6px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>{text}</p>
  );

  return (
    <>
      {/* 페이지 SEO 메타데이터 설정 */}
      <SEOHead title="학습자료" description="드림아이티비즈 학습 사이트와 외부 AI·개발 자료를 분야별로 모았습니다." path="/resources" />

      {/* 페이지 상단 헤더: 제목 + 설명 + Padlet 참고사이트 버튼 */}
      <section className="page-header">
        <div className="container">
          <h2>학습자료</h2>
          <p>DreamIT 사에서 만든 학습 사이트와 외부 자료·도구를 분야별로 모았습니다.</p>
          {/* 외부 Padlet 링크 — 새 탭으로 열며 noopener/noreferrer 로 보안 처리 */}
          <a
            href="https://padlet.com/aebon/rest01"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px',
              padding: '10px 18px', borderRadius: '999px', textDecoration: 'none',
              fontSize: '14px', fontWeight: 700, color: '#fff', background: 'var(--primary-blue, #0046C8)',
              boxShadow: '0 4px 14px rgba(0,70,200,0.25)',
            }}
          >
            📌 학습기간 참고사이트 — ReBoot 1기 ↗
          </a>
        </div>
      </section>

      {/* 본문 영역: 모바일은 단일 컬럼, 데스크톱(>=1024px)은 사이드바+본문 2컬럼(하단 style 참고) */}
      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="resources-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
            {/* 본문 */}
            {/* order: 2 — 모바일 세로 배치에서 사이드바보다 아래에 위치 (데스크톱에서는 미디어쿼리로 재정렬) */}
            <div style={{ minWidth: 0, order: 2 }} className="resources-main">
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', color: 'var(--text-primary)' }}>
                {group.icon} {group.label}
                {/* 선택된 그룹의 사이트 개수 */}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}> · {group.sites.length}개</span>
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {/* 소유 구분에 따라 안내 문구 분기 */}
                {group.owner === 'mine' ? '드림아이티비즈가 운영하는 학습 사이트입니다.' : '제3자가 제공하는 외부 사이트·도구입니다.'}
              </p>

              {/* 사이트 카드 그리드 (반응형 auto-fill, 최소 260px) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {/* 원본 배열을 변형하지 않도록 복사 후 정렬: featured(추천) 항목을 앞으로 */}
                {[...group.sites].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((s) => {
                  // accent: 사이트별 강조색. 미지정 시 기본 파란색으로 폴백.
                  const accent = s.accent || 'var(--primary-blue)';
                  return (
                  // 사이트 카드 — 외부 링크, 새 탭 + noopener/noreferrer
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '5px',
                      padding: '16px 18px', borderRadius: '12px', textDecoration: 'none',
                      // featured 카드는 굵은 테두리/배경/그림자로 강조
                      border: s.featured ? `2px solid ${accent}` : '1px solid var(--border-light)',
                      background: s.featured ? 'var(--bg-light-gray)' : 'var(--bg-white)',
                      // accent 지정 여부에 따라 그림자 색 분기(빨강 계열 vs 파랑 계열)
                      boxShadow: s.featured ? `0 4px 16px ${s.accent ? 'rgba(220,38,38,0.16)' : 'rgba(0,70,200,0.12)'}` : 'none',
                      color: 'var(--text-primary)', transition: 'border-color 0.15s, transform 0.1s',
                    }}
                    // 호버 진입: 테두리 강조 + 살짝 위로 이동
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    // 호버 이탈: featured 여부에 맞는 기본 테두리색으로 복원 + 위치 원복
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = s.featured ? accent : 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: s.featured ? '16px' : '15px' }}>
                        {/* featured 항목은 이름 앞에 별 아이콘 표시 */}
                        {s.featured && <span style={{ marginRight: '6px' }}>⭐</span>}{s.name}
                      </strong>
                      {/* featured면 배지(badge 미지정 시 '추천'), 아니면 화살표 표시 */}
                      {s.featured
                        ? <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 800, color: '#fff', background: accent, padding: '2px 9px', borderRadius: '999px' }}>{s.badge || '추천'}</span>
                        : <span style={{ color: 'var(--primary-blue)', fontWeight: 700, flexShrink: 0 }}>→</span>}
                    </div>
                    {/* 사이트 설명 */}
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</span>
                    {/* 표시용 URL — 'https://' 접두어 제거 후 도메인 노출 */}
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', opacity: 0.7 }}>{s.url.replace('https://', '')}</span>
                  </a>
                  );
                })}
              </div>
            </div>

            {/* 왼쪽 사이드바 */}
            {/* order: 1 — 모바일에서 본문보다 위에 배치 (데스크톱은 미디어쿼리로 좌측 고정) */}
            <aside style={{ order: 1 }} className="resources-sidebar">
              {/* sticky 로 스크롤 시 상단에 고정 */}
              <div style={{
                position: 'sticky', top: '90px',
                background: 'var(--bg-white)', border: '1px solid var(--border-light)',
                borderRadius: '12px', padding: '14px 10px',
              }}>
                {/* 자체 운영 사이트 섹션 */}
                {sectionLabel('DreamIT 사에서 만든 사이트')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
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

      {/* 데스크톱(>=1024px) 전용 반응형 레이아웃: 240px 사이드바 + 본문, order 재정렬 */}
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

export default Resources;
