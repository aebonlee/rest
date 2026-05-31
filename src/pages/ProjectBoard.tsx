import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import {
  listTeams, findMyTeam, listTeamPosts, createTeamPost, deleteTeamPost, type TeamPost,
} from '../utils/projectTeams';
import type { Team, TeamMember } from '../types';

const ProjectBoard = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [posts, setPosts] = useState<TeamPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const teams = await listTeams();
    const mine = findMyTeam(teams, user.id);
    setTeam(mine);
    setPosts(mine ? await listTeamPosts(mine.id) : []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handlePost = async () => {
    if (!team) return;
    if (!title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const authorName = profile?.name || profile?.display_name || user!.email || '수강생';
    const res = await createTeamPost(team.id, user!.id, authorName, title.trim(), content.trim());
    setBusy(false);
    if (res.ok) { setTitle(''); setContent(''); showToast('글이 등록되었습니다.', 'success'); setPosts(await listTeamPosts(team.id)); }
    else showToast('등록 실패: ' + (res.error || ''), 'error');
  };

  const handleDelete = async (p: TeamPost) => {
    if (!confirm('이 글을 삭제할까요?')) return;
    const res = await deleteTeamPost(p.id);
    if (res.ok && team) { showToast('삭제되었습니다.', 'info'); setPosts(await listTeamPosts(team.id)); }
    else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);

  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 13px', fontSize: '16px', boxSizing: 'border-box',
    border: '1px solid var(--border-light)', borderRadius: '8px',
    background: 'var(--bg-white)', color: 'var(--text-primary)',
  };

  return (
    <>
      <SEOHead title="프로젝트 관리" path="/project-board" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 관리</h2>
          <p>우리 팀 전용 게시판입니다. 팀원과 관리자만 볼 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : !team ? (
            <div style={{ ...card, textAlign: 'center', padding: '48px 22px' }}>
              <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)' }}>아직 소속된 팀이 없습니다. 먼저 팀을 만들거나 합류하세요.</p>
              <Link to="/project-teams" className="btn btn-primary">프로젝트 구성으로 이동</Link>
            </div>
          ) : (
            <>
              {/* 팀 헤더 */}
              <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>{team.name}</h3>
                <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '15px' }}>주제: {team.project_topic || '미정'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {members(team).map((m, i) => (
                    <span key={i} style={{ fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)' }}>{m.name}</span>
                  ))}
                </div>
              </div>

              {/* 글쓰기 */}
              <div style={card}>
                <h4 style={{ margin: '0 0 10px', fontSize: '16px' }}>새 글 작성</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input style={input} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용 (회의록, 역할 분담, 진행 상황 등)" value={content} onChange={(e) => setContent(e.target.value)} />
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handlePost}>등록</button>
                </div>
              </div>

              {/* 글 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>아직 글이 없습니다. 첫 글을 남겨보세요.</p>
                ) : posts.map((p) => (
                  <div key={p.id} style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '17px' }}>{p.title}</h4>
                      {(p.author_id === user?.id || isAdmin) && (
                        <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>삭제</button>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                      {p.author_name} · {new Date(p.created_at).toLocaleString('ko-KR')}
                    </div>
                    {p.content && <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)' }}>{p.content}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectBoard;
