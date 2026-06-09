/**
 * ProjectPadlets.tsx — 팀별 패들렛
 *  - 실제 결성된 팀(rest_teams)을 번호 순으로 카드로 보여주고, 각 팀 번호의 패들렛 보드로 연결한다.
 *  - 번호: buildTeamNumbers(주제 제목 → 고정 보드 번호) — 팀구성·갤러리 등과 동일.
 *  - 패들렛: padlet.com/aebon/project{번호}. (번호 = 패들렛 보드 번호)
 */
import { useState, useEffect, type ReactElement, type CSSProperties } from 'react';
import SEOHead from '../components/SEOHead';
import { listTeams } from '../utils/projectTeams';
import { listCustomTopics, type CustomTopic } from '../utils/projectVote';
import { buildTeamNumbers } from '../utils/teamNumber';
import { getTeamNoByTitle, getTeamProject } from '../data/teamProjects';
import type { Team } from '../types';

// 팀 번호 → 패들렛 보드 주소(2자리 0패딩).
const padletUrl = (n: number) => `https://padlet.com/aebon/project${String(n).padStart(2, '0')}`;

const ProjectPadlets = (): ReactElement => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [topics, setTopics] = useState<CustomTopic[]>([]); // 번호 산출용(생성순)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listTeams(), listCustomTopics()]).then(([t, tp]) => {
      setTeams(t); setTopics(tp); setLoading(false);
    });
  }, []);

  const teamNos = buildTeamNumbers(teams, topics);
  const members = (t: Team) => (Array.isArray(t.members) ? t.members : []);
  const sorted = [...teams].sort((a, b) => (teamNos[a.id] ?? 999) - (teamNos[b.id] ?? 999));

  const badge = (bg: string, color: string): CSSProperties => ({ fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: bg, color });

  return (
    <>
      <SEOHead title="팀별 패들렛" path="/project-padlets" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀별 패들렛</h2>
          <p>결성된 팀의 패들렛 보드입니다. 진행 과정·자료·회의 내용을 팀 번호에 맞는 보드에 정리하세요. (번호 = 패들렛 project 번호)</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : sorted.length === 0 ? (
            <p className="empty-message">아직 결성된 팀이 없습니다.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {sorted.map((t) => {
                const no = teamNos[t.id];
                const projNo = getTeamNoByTitle(t.project_topic);
                const proj = projNo ? getTeamProject(projNo) : undefined;
                const icon = proj?.icon ?? '📌';
                const color = proj?.color ?? 'var(--primary-blue)';
                const leader = members(t).find((m) => m.role === '팀장');
                return (
                  <a
                    key={t.id}
                    href={padletUrl(no)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px 18px 16px',
                      borderRadius: '14px', textDecoration: 'none', color: 'var(--text-primary)',
                      border: '1px solid var(--border-light, #e5e7eb)', borderTop: `4px solid ${color}`,
                      background: 'var(--bg-white, #fff)', transition: 'transform 0.1s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '26px' }}>{icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color }}>{no}팀 · PROJECT {String(no).padStart(2, '0')}</span>
                    </div>
                    <strong style={{ fontSize: '15.5px', lineHeight: 1.35 }}>{t.project_topic}</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.5, flex: 1 }}>
                      {members(t).map((m) => m.name).join(' · ') || '모집 중'}{leader ? ` · 팀장 ${leader.name}` : ''}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <span style={badge('#fef9c3', '#854d0e')}>📌 패들렛 열기 ↗</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
          <p style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
            패들렛 보드는 padlet.com/aebon/project{'{번호}'} 에 매칭됩니다.
          </p>
        </div>
      </section>
    </>
  );
};

export default ProjectPadlets;
