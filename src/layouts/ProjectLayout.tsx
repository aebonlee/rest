/**
 * ProjectLayout.tsx — "팀 활동" 공통 레이아웃(좌측 단계 메뉴 + 본문 + 단계 진행)
 *  - 라우트 레이아웃: 하위 팀 활동 페이지가 <Outlet/> 자리에 렌더된다.
 *  - 상단: 단계 진행바(번호 원 + 연결선 + 라벨, 현재 강조·완료 ✓), 하단: 이전/다음 단계 이동.
 *  - 단계 순서는 data/projectSteps.ts(PROJECT_STEPS) 단일 소스를 따른다.
 */
import { Fragment, type ReactElement, type CSSProperties } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
import { Outlet, Link, useLocation } from 'react-router-dom';
import ProjectSidebar from '../components/ProjectSidebar';
import { PROJECT_STEPS, stepIndexOf } from '../data/projectSteps';

const ProjectLayout = (): ReactElement => {
  const { pathname } = useLocation();
  const idx = stepIndexOf(pathname);                                  // 현재 단계(0-based, 밖이면 -1)
  const prev = idx > 0 ? PROJECT_STEPS[idx - 1] : null;
  const next = idx >= 0 && idx < PROJECT_STEPS.length - 1 ? PROJECT_STEPS[idx + 1] : null;
  const last = PROJECT_STEPS.length - 1;
  const step = idx >= 0 ? PROJECT_STEPS[idx] : null;   // 현재 단계(가이드 표시용)

  // 단계 번호 원형 스타일(상태별).
  const circle = (state: 'done' | 'current' | 'todo'): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '50%', fontSize: '13px', fontWeight: 800, flexShrink: 0,
    background: state === 'current' ? 'var(--primary-blue)' : state === 'done' ? '#10b981' : 'var(--bg-white)',
    color: state === 'current' || state === 'done' ? '#fff' : 'var(--text-secondary)',
    border: state === 'todo' ? '1.5px solid var(--border-light)' : 'none',
    boxShadow: state === 'current' ? '0 0 0 4px rgba(0, 70, 200, 0.12)' : 'none',
    transition: 'all 0.2s',
  });

  return (
    <div className="admin-layout project-layout">
      <ProjectSidebar />
      <div className="admin-content project-content">
        {/* 단계 진행바 — 번호 원 + 연결선 + 라벨. 클릭 시 해당 단계로 이동 */}
        {idx >= 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
            {PROJECT_STEPS.map((s, i) => {
              const state = i === idx ? 'current' : i < idx ? 'done' : 'todo';
              return (
                <Fragment key={s.path}>
                  {/* 이전 단계와의 연결선(완료 구간은 초록) */}
                  {i > 0 && (
                    <div style={{ flex: '1 1 16px', minWidth: '16px', height: '2px', borderRadius: '1px', marginTop: '14px', background: i <= idx ? '#10b981' : 'var(--border-light)' }} />
                  )}
                  <Link to={s.path} title={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0, width: '84px' }}>
                    <span style={circle(state)}>{state === 'done' ? <EmojiIcon char="✓" /> : i + 1}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: state === 'current' ? 700 : 500, color: state === 'current' ? 'var(--primary-blue)' : state === 'done' ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>
                      {s.label}
                    </span>
                  </Link>
                </Fragment>
              );
            })}
          </div>
        )}

        {/* 이번 단계 가이드 — 현재 단계에서 할 일을 요약해 안내(데이터: projectSteps.ts) */}
        {step && (
          <div style={{ background: 'var(--bg-light-gray)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-blue)' }}><EmojiIcon char="📍" /> {idx + 1}단계 가이드</span>
              <strong style={{ fontSize: '14.5px' }}>{step.label}</strong>
            </div>
            <p style={{ margin: '6px 0 10px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.summary}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {step.todos.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--primary-blue)', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
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
              : <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 700, alignSelf: 'center' }}>마지막 단계 {idx === last ? <EmojiIcon char="✓" /> : ''}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectLayout;
