import { useState, type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import { SITE_GROUPS } from '../data/resourceSites';

const Resources = (): ReactElement => {
  const [active, setActive] = useState(SITE_GROUPS[0].id);
  const group = SITE_GROUPS.find((g) => g.id === active) || SITE_GROUPS[0];
  const mine = SITE_GROUPS.filter((g) => g.owner === 'mine');
  const external = SITE_GROUPS.filter((g) => g.owner === 'external');

  const navBtn = (g: typeof SITE_GROUPS[number]): ReactElement => {
    const on = g.id === active;
    return (
      <button
        key={g.id}
        type="button"
        onClick={() => setActive(g.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
          padding: '10px 12px', borderRadius: '9px', cursor: 'pointer',
          fontSize: '15px', fontWeight: on ? 700 : 500, textAlign: 'left',
          border: '1px solid', borderColor: on ? 'var(--primary-blue)' : 'transparent',
          background: on ? 'var(--primary-blue)' : 'transparent',
          color: on ? '#fff' : 'var(--text-primary)',
        }}
      >
        <span style={{ fontSize: '18px' }}>{g.icon}</span>
        <span style={{ flex: 1 }}>{g.label}</span>
        <span style={{ fontSize: '12px', opacity: 0.8 }}>{g.sites.length}</span>
      </button>
    );
  };

  const sectionLabel = (text: string): ReactElement => (
    <p style={{ margin: '4px 8px 6px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>{text}</p>
  );

  return (
    <>
      <SEOHead title="학습자료" description="드림아이티비즈 학습 사이트와 외부 AI·개발 자료를 분야별로 모았습니다." path="/resources" />

      <section className="page-header">
        <div className="container">
          <h2>학습자료</h2>
          <p>DreamIT 사에서 만든 학습 사이트와 외부 자료·도구를 분야별로 모았습니다.</p>
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

      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="resources-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
            {/* 본문 */}
            <div style={{ minWidth: 0, order: 2 }} className="resources-main">
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', color: 'var(--text-primary)' }}>
                {group.icon} {group.label}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}> · {group.sites.length}개</span>
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {group.owner === 'mine' ? '드림아이티비즈가 운영하는 학습 사이트입니다.' : '제3자가 제공하는 외부 사이트·도구입니다.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {[...group.sites].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).map((s) => {
                  const accent = s.accent || 'var(--primary-blue)';
                  return (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '5px',
                      padding: '16px 18px', borderRadius: '12px', textDecoration: 'none',
                      border: s.featured ? `2px solid ${accent}` : '1px solid var(--border-light)',
                      background: s.featured ? 'var(--bg-light-gray)' : 'var(--bg-white)',
                      boxShadow: s.featured ? `0 4px 16px ${s.accent ? 'rgba(220,38,38,0.16)' : 'rgba(0,70,200,0.12)'}` : 'none',
                      color: 'var(--text-primary)', transition: 'border-color 0.15s, transform 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = s.featured ? accent : 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: s.featured ? '16px' : '15px' }}>
                        {s.featured && <span style={{ marginRight: '6px' }}>⭐</span>}{s.name}
                      </strong>
                      {s.featured
                        ? <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 800, color: '#fff', background: accent, padding: '2px 9px', borderRadius: '999px' }}>{s.badge || '추천'}</span>
                        : <span style={{ color: 'var(--primary-blue)', fontWeight: 700, flexShrink: 0 }}>→</span>}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', opacity: 0.7 }}>{s.url.replace('https://', '')}</span>
                  </a>
                  );
                })}
              </div>
            </div>

            {/* 왼쪽 사이드바 */}
            <aside style={{ order: 1 }} className="resources-sidebar">
              <div style={{
                position: 'sticky', top: '90px',
                background: 'var(--bg-white)', border: '1px solid var(--border-light)',
                borderRadius: '12px', padding: '14px 10px',
              }}>
                {sectionLabel('DreamIT 사에서 만든 사이트')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px' }}>
                  {mine.map(navBtn)}
                </div>
                {sectionLabel('외부 사이트')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {external.map(navBtn)}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

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
