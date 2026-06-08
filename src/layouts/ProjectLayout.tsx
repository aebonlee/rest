/**
 * ProjectLayout.tsx — "팀 활동" 공통 레이아웃(좌측 단계 메뉴 + 본문 + 단계 진행)
 *  - 라우트 레이아웃: 하위 팀 활동 페이지가 <Outlet/> 자리에 렌더된다.
 *  - 상단: 단계 진행바(현재 단계 강조, 완료 단계 ✓), 하단: 이전/다음 단계 이동.
 *  - 단계 순서는 data/projectSteps.ts(PROJECT_STEPS) 단일 소스를 따른다.
 */
import { Outlet, Link, useLocation } from 'react-router-dom';
import type { ReactElement, CSSProperties } from 'react';
import ProjectSidebar from '../components/ProjectSidebar';
import { PROJECT_STEPS, stepIndexOf } from '../data/projectSteps';

const ProjectLayout = (): ReactElement => {
  const { pathname } = useLocation();
  const idx = stepIndexOf(pathname);                                  // 현재 단계(0-based, 밖이면 -1)
  const prev = idx > 0 ? PROJECT_STEPS[idx - 1] : null;
  const next = idx >= 0 && idx < PROJECT_STEPS.length - 1 ? PROJECT_STEPS[idx + 1] : null;

  // 단계 칩(원형 번호) 스타일.
  const circle = (state: 'done' | 'current' | 'todo'): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '20px', height: '20px', borderRadius: '50%', fontSize: '11px', fontWeight: 800, flexShrink: 0,
    background: state === 'current' ? 'rgba(255,255,255,0.25)' : state === 'done' ? '#10b981' : 'var(--bg-white)',
    color: state === 'current' ? '#fff' : state === 'done' ? '#fff' : 'var(--text-secondary)',
    border: state === 'todo' ? '1px solid var(--border-light)' : 'none',
  });

  return (
    <div className="admin-layout project-layout">
      <ProjectSidebar />
      <div className="admin-content project-content">
        {/* 단계 진행바(클릭 시 해당 단계로 이동) */}
        {idx >= 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {PROJECT_STEPS.map((s, i) => {
              const state = i === idx ? 'current' : i < idx ? 'done' : 'todo';
              return (
                <Link
                  key={s.path}
                  to={s.path}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 11px',
                    borderRadius: '999px', textDecoration: 'none', fontSize: '12.5px',
                    fontWeight: state === 'current' ? 800 : 600,
                    background: state === 'current' ? 'var(--primary-blue)' : state === 'done' ? '#dcfce7' : 'var(--bg-light-gray)',
                    color: state === 'current' ? '#fff' : state === 'done' ? '#166534' : 'var(--text-secondary)',
                  }}
                >
                  <span style={circle(state)}>{state === 'done' ? '✓' : i + 1}</span>
                  <span>{s.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <Outlet />

        {/* 이전 / 다음 단계 이동 */}
        {idx >= 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            {prev
              ? <Link to={prev.path} className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '14px' }}>← 이전 · {prev.label}</Link>
              : <span />}
            {next
              ? <Link to={next.path} className="btn btn-primary" style={{ padding: '9px 16px', fontSize: '14px' }}>다음 · {next.label} →</Link>
              : <span />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectLayout;
