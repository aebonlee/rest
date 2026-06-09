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
import { getTeamNoByTitle, getTeamProject, REPO_BY_BOARD, IDLE_REPOS } from '../../data/teamProjects';
import type { Team } from '../../types';

// 구현 예시(레퍼런스) 배포 URL — aebonlee.github.io/projectNN. 보드 번호가 아니라 콘텐츠가 일치하는 레포 번호로 연결.
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
  // 구현 예시가 연결되는 팀 수(팀 제출 demo_url 또는 콘텐츠 매칭 레포가 있는 경우)
  const linkedCount = sorted.filter((t) => (subs[t.id]?.demo_url || '').trim() || REPO_BY_BOARD[teamNos[t.id]]).length;

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
                총 <strong style={{ color: 'var(--primary-blue)' }}>{sorted.length}</strong>팀 · 구현 예시 연결 <strong style={{ color: '#065f46' }}>{linkedCount}</strong> · 준비 중 {sorted.length - linkedCount}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {sorted.map((t) => {
                const no = teamNos[t.id];
                const projNo = getTeamNoByTitle(t.project_topic);
                const proj = projNo ? getTeamProject(projNo) : undefined; // 아이콘/색 메타
                const icon = proj?.icon ?? '🚀';
                const color = proj?.color ?? 'var(--primary-blue)';
                const demo = (subs[t.id]?.demo_url || '').trim();
                const repoNo = REPO_BY_BOARD[no]; // 콘텐츠가 일치하는 레포 번호(없으면 준비 중)
                const url = demo || (repoNo ? liveUrl(repoNo) : ''); // 팀 제출 주소 우선, 없으면 매칭 레포 구현 예시
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
                      <span style={{ fontSize: '11px', fontWeight: 800, color }}>{no}팀{repoNo ? ` · 예시 project${String(repoNo).padStart(2, '0')}` : ''}</span>
                    </div>
                    <strong title={t.project_topic} style={{ fontSize: '15.5px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '42px' }}>{t.project_topic}</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.5, flex: 1 }}>
                      👥 {members(t).map((m) => m.name).join(' · ') || '모집 중'}{leader ? ` · 팀장 ${leader.name}` : ''}
                    </span>
                    {subs[t.id]?.summary && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📝 {subs[t.id].summary}</span>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      {url
                        ? <a href={url} target="_blank" rel="noopener noreferrer" title={url} style={{ ...badge('#d1fae5', '#065f46'), textDecoration: 'none' }}>🚀 {demo ? '팀 배포 앱' : '구현 예시'} ↗</a>
                        : <span style={badge('var(--bg-light-gray)', 'var(--text-secondary)')}>준비 중</span>}
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}
          <p style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-secondary, #9ca3af)', textAlign: 'center' }}>
‘구현 예시’는 각 주제의 콘텐츠가 일치하는 레퍼런스(aebonlee.github.io/projectNN)로 연결됩니다. 팀이 <strong>산출물 제출</strong>에 배포 주소를 입력하면 ‘팀 배포 앱’으로 바뀝니다.
          </p>

          {/* 유휴 레포(현재 보드와 연결되지 않는 과거 구현분) — 참고 보관용 별도 섹션 */}
          {!loading && (
            <div style={{ marginTop: '36px', paddingTop: '22px', borderTop: '1px dashed var(--border-light, #e5e7eb)' }}>
              <h3 style={{ fontSize: '15px', margin: '0 0 4px' }}>🗂️ 유휴 레포 (참고 보관)</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                과거에 구현됐지만 현재 팀구성과 연결되지 않는 프로젝트입니다(주제 삭제·변경·중복). 참고용으로만 열어볼 수 있습니다.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {IDLE_REPOS.map((r) => (
                  <a key={r.no} href={`https://aebonlee.github.io/project${String(r.no).padStart(2, '0')}/`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '14px 16px', borderRadius: '12px', textDecoration: 'none',
                      color: 'var(--text-primary)', border: '1px solid var(--border-light, #e5e7eb)', background: 'var(--bg-light-gray, #f9fafb)', opacity: 0.92 }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>project{String(r.no).padStart(2, '0')} · 보관</span>
                    <strong style={{ fontSize: '14px' }}>{r.title}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.reason} · 열기 ↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AppGallery;
