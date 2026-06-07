/**
 * Classroom.tsx
 *
 * 역할:
 *   - "쉬었음 청년 디지털 맞춤 교육" 과정의 온·오프라인 강의실 안내 페이지(/classroom).
 *   - 과정 개요, 온라인(Zoom) 접속 정보, 오프라인 수업 장소를 정적으로 렌더링한다.
 *
 * 핵심 책임:
 *   - SEOHead로 페이지 메타데이터(제목/설명/경로) 설정.
 *   - 교육 상세 정보(기간/시간/방식)와 휴강 공지 표시.
 *   - Zoom 강의실 입장 링크 및 회의 ID/암호 안내.
 *   - 오프라인 수업 장소 주소와 네이버 지도 링크 제공.
 *
 * 주요 export:
 *   - default: Classroom (강의실 안내 페이지 컴포넌트)
 *
 * 부수효과: 없음(순수 표시용 정적 페이지, 데이터 패칭/상태/인증 없음).
 */
import { type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';

// Zoom 강의실 접속 정보 — 온라인 수업(평일, 월요일 제외)에 사용하는 고정 상수.
const ZOOM_URL = 'https://us06web.zoom.us/j/83837937780?pwd=DzAGHF7alv5aGxRUjL7WTEKUkxa7HC.1';
const ZOOM_ID = '838 3793 7780'; // 화면 표시용 회의 ID(공백 포함 포맷)
const ZOOM_PW = '333260'; // 회의 암호
// 오프라인 수업 관련 상수 — 지도 링크와 표시용 주소.
const OFFLINE_MAP = 'https://naver.me/FG7x0tVl';
const OFFLINE_ADDR = '서울 용산구 후암로57길 302 4층 (공간 햅삐 서울역점)';

// 카드 UI 공통 스타일 — 세 개의 안내 박스(개요/온라인/오프라인)에서 재사용.
// CSS 변수(var(--...))로 테마 색상을 따른다.
const card: React.CSSProperties = {
  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
  borderRadius: '16px', padding: '24px 26px', color: 'var(--text-primary)',
};

/**
 * Classroom
 *   온·오프라인 강의실 안내 페이지 컴포넌트.
 *   매개변수: 없음.
 *   반환값: 강의실 안내 화면 JSX(ReactElement).
 *   부수효과: 없음(정적 렌더링).
 */
const Classroom = (): ReactElement => {
  return (
    <>
      {/* 페이지 SEO 메타데이터(제목/설명/canonical 경로) 주입 */}
      <SEOHead title="온라인강의실" description="쉬었음 청년 디지털 맞춤 교육 — 온·오프라인 강의실 안내(Zoom·오프라인 장소·일정)" path="/classroom" />

      {/* 페이지 상단 헤더 영역 */}
      <section className="page-header">
        <div className="container">
          <h2>온라인강의실</h2>
          <p>쉬었음 청년 디지털 맞춤 교육 · 온·오프라인 수업 안내</p>
        </div>
      </section>

      {/* 본문: 세로 스택으로 세 개의 안내 카드 배치 */}
      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>

          {/* 과정 개요 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: '19px' }}>교육 상세 안내</h3>
            {/* 반응형 그리드: 폭에 따라 항목이 자동 줄바꿈(auto-fit, 최소 220px) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* [라벨, 값] 튜플 배열을 순회하며 항목 카드를 생성 — key는 라벨(k) 사용 */}
              {[
                ['과정명', '쉬었음 청년 디지털 맞춤 교육'],
                ['교육 기간', '6/1 ~ 6/22'],
                ['수업 시간', '평일(월~금) 14:00 ~ 18:00 (1일 4시간)'],
                ['교육 방식', '온·오프라인 병행'],
              ].map(([k, v]) => (
                <div key={k}>
                  {/* k: 항목 라벨, v: 항목 값 */}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>{k}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>
            {/* 휴강 공지 배너(노란 경고색) */}
            <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: '#fef3c7', color: '#92400e', fontSize: '14px', fontWeight: 600 }}>
              ⚠ 6/3(화)은 휴강입니다.
            </div>
          </div>

          {/* 온라인 (Zoom) — 좌측 파란 테두리로 강조 */}
          <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>💻 온라인 수업 (Zoom)</h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>오프라인(월요일)을 제외한 평일은 Zoom으로 진행합니다.</p>
            {/* Zoom 강의실 입장 링크 — 새 탭(noopener/noreferrer로 보안 처리) */}
            <a href={ZOOM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '16px' }}>
              Zoom 강의실 입장 →
            </a>
            {/* 회의 ID/암호 표시 영역 */}
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

          {/* 오프라인 — 좌측 초록 테두리로 강조 */}
          <div style={{ ...card, borderLeft: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>📍 오프라인 수업 (월요일)</h3>
            <p style={{ margin: '0 0 6px', fontSize: '14px', color: 'var(--text-secondary)' }}>매주 월요일은 아래 장소에서 대면으로 진행합니다.</p>
            <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>{OFFLINE_ADDR}</p>
            {/* 네이버 지도 링크 — 새 탭으로 열기 */}
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
