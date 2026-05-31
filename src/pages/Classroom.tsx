import { type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';

const ZOOM_URL = 'https://us06web.zoom.us/j/83837937780?pwd=DzAGHF7alv5aGxRUjL7WTEKUkxa7HC.1';
const ZOOM_ID = '838 3793 7780';
const ZOOM_PW = '333260';
const OFFLINE_MAP = 'https://naver.me/FG7x0tVl';
const OFFLINE_ADDR = '서울 용산구 후암로57길 302 4층 (공간 햅삐 서울역점)';

const card: React.CSSProperties = {
  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
  borderRadius: '16px', padding: '24px 26px', color: 'var(--text-primary)',
};

const Classroom = (): ReactElement => {
  return (
    <>
      <SEOHead title="온라인강의실" description="쉬었음 청년 디지털 맞춤 교육 — 온·오프라인 강의실 안내(Zoom·오프라인 장소·일정)" path="/classroom" />

      <section className="page-header">
        <div className="container">
          <h2>온라인강의실</h2>
          <p>쉬었음 청년 디지털 맞춤 교육 · 온·오프라인 수업 안내</p>
        </div>
      </section>

      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>

          {/* 과정 개요 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: '19px' }}>교육 상세 안내</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {[
                ['과정명', '쉬었음 청년 디지털 맞춤 교육'],
                ['교육 기간', '6/1 ~ 6/22'],
                ['수업 시간', '평일(월~금) 14:00 ~ 18:00 (1일 4시간)'],
                ['교육 방식', '온·오프라인 병행'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>{k}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', fontSize: '14px', fontWeight: 600 }}>
              ⚠ 6/3(화)은 휴강입니다.
            </div>
          </div>

          {/* 온라인 (Zoom) */}
          <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>💻 온라인 수업 (Zoom)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>오프라인(월요일)을 제외한 평일은 Zoom으로 진행합니다.</p>
            <a href={ZOOM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '16px' }}>
              Zoom 강의실 입장 →
            </a>
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

          {/* 오프라인 */}
          <div style={{ ...card, borderLeft: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>📍 오프라인 수업 (월요일)</h3>
            <p style={{ margin: '0 0 6px', fontSize: '14px', color: 'var(--text-secondary)' }}>매주 월요일은 아래 장소에서 대면으로 진행합니다.</p>
            <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>{OFFLINE_ADDR}</p>
            <a href={OFFLINE_MAP} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '11px 22px' }}>
              네이버 지도로 보기 →
            </a>
          </div>

        </div>
      </section>
    </>
  );
};

export default Classroom;
