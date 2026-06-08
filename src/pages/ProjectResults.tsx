/**
 * ProjectResults.tsx — 프로젝트 결과 (팀별 최종 결과 허브)
 *  - 팀마다: 배포 앱 + 패들렛 + 수행 진행률 + 제출물(데모·발표자료·소스·요약)을 한곳에 모은다.
 *  - 배포 앱/패들렛 주소는 팀 번호(TEAM_PROJECTS.id = 보드 번호)로 자동 생성.
 *  - 진행률은 rest_team_checklist, 제출물은 rest_team_submission에서 가져온다.
 */
import { useState, useEffect, useCallback, type ReactElement, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { listTeams } from '../utils/projectTeams';
import { listChecklists } from '../utils/projectChecklist';
import { listSubmissions, EMPTY_SUBMISSION, type SubmissionData } from '../utils/projectSubmission';
import { checklistProgress } from '../data/projectChecklist';
import { getTeamNoByTitle, getTeamProject } from '../data/teamProjects';
import type { Team } from '../types';

const liveUrl = (n: number) => `https://aebonlee.github.io/project${String(n).padStart(2, '0')}/`;
const padletUrl = (n: number) => `https://padlet.com/aebon/project${String(n).padStart(2, '0')}`;

const ProjectResults = (): ReactElement => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});
  const [subs, setSubs] = useState<Record<string, SubmissionData>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [t, c, s] = await Promise.all([listTeams(), listChecklists(), listSubmissions()]);
    setTeams(t); setChecklists(c); setSubs(s);
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const members = (t: Team) => (Array.isArray(t.members) ? t.members : []);

  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)' };
  const linkBtn = (bg: string, color: string): CSSProperties => ({ fontSize: '12.5px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', background: bg, color, textDecoration: 'none' });

  // 팀 번호 순으로 정렬(번호 없으면 뒤로).
  const sorted = [...teams].sort((a, b) => (getTeamNoByTitle(a.project_topic) ?? 999) - (getTeamNoByTitle(b.project_topic) ?? 999));

  return (
    <>
      <SEOHead title="프로젝트 결과" path="/project-results" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 결과</h2>
          <p>팀별 최종 결과를 한곳에 모았습니다 — 배포 앱·패들렛·진행률·발표자료. 산출물은 <Link to="/project-submit" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>산출물 제출</Link>에서 등록합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1080px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : sorted.length === 0 ? (
            <p className="empty-message">편성된 팀이 없습니다.</p>
          ) : (
            sorted.map((t) => {
              const num = getTeamNoByTitle(t.project_topic);
              const proj = num ? getTeamProject(num) : undefined;
              const { done, total, percent } = checklistProgress(checklists[t.id]);
              const s = subs[t.id] || EMPTY_SUBMISSION;
              const leader = members(t).find((m) => m.role === '팀장');
              return (
                <div key={t.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {proj && <span style={{ fontSize: '22px' }}>{proj.icon}</span>}
                    {num && <span style={{ fontSize: '13px', fontWeight: 800, color: proj?.color || 'var(--primary-blue)' }}>{num}팀</span>}
                    <h3 style={{ margin: 0, fontSize: '16.5px' }}>{t.project_topic}</h3>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: percent === 100 ? '#d1fae5' : '#dbeafe', color: percent === 100 ? '#065f46' : '#1e3a8a' }}>진행 {percent}% ({done}/{total})</span>
                  </div>
                  <p style={{ margin: '6px 0 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    팀원 {members(t).map((m) => m.name).join(' · ') || '—'}{leader ? ` · 팀장 ${leader.name}` : ''}
                  </p>
                  {s.summary && <p style={{ margin: '0 0 10px', fontSize: '14px' }}>📝 {s.summary}</p>}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {num && <a href={liveUrl(num)} target="_blank" rel="noopener noreferrer" style={linkBtn('#d1fae5', '#065f46')}>🚀 배포 앱</a>}
                    {num && <a href={padletUrl(num)} target="_blank" rel="noopener noreferrer" style={linkBtn('#fef9c3', '#854d0e')}>📌 패들렛</a>}
                    {s.demo_url && <a href={s.demo_url} target="_blank" rel="noopener noreferrer" style={linkBtn('#e0f2fe', '#075985')}>🔗 데모</a>}
                    {s.slides_url && <a href={s.slides_url} target="_blank" rel="noopener noreferrer" style={linkBtn('#ede9fe', '#5b21b6')}>📊 발표자료</a>}
                    {s.repo_url && <a href={s.repo_url} target="_blank" rel="noopener noreferrer" style={linkBtn('var(--bg-light-gray)', 'var(--text-primary)')}>💻 소스</a>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectResults;
