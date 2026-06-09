/**
 * AppGallery.tsx — 팀 프로젝트 앱 갤러리 (구현 예시)
 *
 * [역할]
 *  실제 결성된 팀(rest_teams)을 번호 순으로 카드로 보여준다.
 *  - 번호: buildTeamNumbers(주제 제목 → 고정 보드 번호) — 팀구성·패들렛 등과 동일.
 *  - 아이콘/색: 주제로 TEAM_PROJECTS 메타를 찾아 사용(없으면 기본값).
 *  - 앱 실행 링크: 각 팀이 산출물 제출에 입력한 demo_url(실제 배포 주소). 없으면 '준비 중'.
 *    → 깃허브 레포 번호가 보드 번호와 달라도 링크가 깨지지 않는다(번호와 무관).
 */
import { useState, useEffect, type ReactElement, type CSSProperties } from 'react';
import SEOHead from '../../components/SEOHead';
import { listTeams } from '../../utils/projectTeams';
import { listCustomTopics, type CustomTopic } from '../../utils/projectVote';
import { listSubmissions, type SubmissionData } from '../../utils/projectSubmission';
import { buildTeamNumbers } from '../../utils/teamNumber';
import { getTeamNoByTitle, getTeamProject } from '../../data/teamProjects';
import type { Team } from '../../types';

// 번호별 구현 예시(레퍼런스) 배포 URL — aebonlee.github.io/projectNN. 팀 번호와 1:1 매칭.
const liveUrl = (n: number) => `https://aebonlee.github.io/project${String(n).padStart(2, '0')}/`;

const AppGallery = (): ReactElement => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [topics, setTopics] = useState<CustomTopic[]>([]); // 번호 산출용(생성순)
  const [subs, setSubs] = useState<Record<string, SubmissionData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listTeams(), listCustomTopics(), listSubmissions()]).then(([t, tp, s]) => {
      setTeams(t); setTopics(tp); setSubs(s); setLoading(false);
    });
  }, []);

  const teamNos = buildTeamNumbers(teams, topics);
  const members = (t: Team) => (Array.isArray(t.members) ? t.members : []);
  // 번호 오름차순 정렬
  const sorted = [...teams].sort((a, b) => (teamNos[a.id] ?? 999) - (teamNos[b.id] ?? 999));
  const liveCount = sorted.filter((t) => (subs[t.id]?.demo_url || '').trim()).length; // 배포된(앱 실행 가능) 팀 수

  const badge = (bg: string, color: string): CSSProperties => ({ fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: bg, color });

  return (
    <>
      <SEOHead title="팀 프로젝트 앱" path="/projects/apps" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀 프로젝트 앱</h2>
          <p>실제 결성된 팀의 결과물입니다. 카드의 ‘앱 실행’은 각 팀이 제출한 배포 주소로 연결됩니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : sorted.length === 0 ? (
            <p className="empty-message">아직 결성된 팀이 없습니다.</p>
          ) : (
            <>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                총 <strong style={{ color: 'var(--primary-blue)' }}>{sorted.length}</strong>팀 · 팀 배포 제출 <strong style={{ color: '#065f46' }}>{liveCount}</strong> (나머지는 번호별 구현 예시로 연결)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {sorted.map((t) => {
                const no = teamNos[t.id];
                const projNo = getTeamNoByTitle(t.project_topic);
                const proj = projNo ? getTeamProject(projNo) : undefined; // 아이콘/색 메타
                const icon = proj?.icon ?? '🚀';
                const color = proj?.color ?? 'var(--primary-blue)';
                const demo = (subs[t.id]?.demo_url || '').trim();
                const url = demo || liveUrl(no); // 팀이 제출한 배포 주소 우선, 없으면 번호별 구현 예시(github.io/projectNN)
                const leader = members(t).find((m) => m.role === '팀장');
                return (
                  <div key={t.id} style={{
                    display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px 18px 16px',
                    borderRadius: '14px', color: 'var(--text-primary)',
                    border: '1px solid var(--border-light, #e5e7eb)', borderTop: `4px solid ${color}`,
                    background: 'var(--bg-white, #fff)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '26px' }}>{icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color }}>{no}팀 · PROJECT {String(no).padStart(2, '0')}</span>
                    </div>
                    <strong title={t.project_topic} style={{ fontSize: '15.5px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '42px' }}>{t.project_topic}</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.5, flex: 1 }}>
                      👥 {members(t).map((m) => m.name).join(' · ') || '모집 중'}{leader ? ` · 팀장 ${leader.name}` : ''}
                    </span>
                    {subs[t.id]?.summary && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📝 {subs[t.id].summary}</span>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <a href={url} target="_blank" rel="noopener noreferrer" title={url} style={{ ...badge('#d1fae5', '#065f46'), textDecoration: 'none' }}>
                        🚀 {demo ? '팀 배포 앱' : '구현 예시'} ↗
                      </a>
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}
          <p style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
            ‘구현 예시’는 팀 번호별 레퍼런스(aebonlee.github.io/project01~)로 연결됩니다. 팀이 <strong>산출물 제출</strong>에 배포 주소를 입력하면 ‘팀 배포 앱’으로 바뀝니다.
          </p>
        </div>
      </section>
    </>
  );
};

export default AppGallery;
