import { useState, useEffect, useCallback, type ReactElement, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import {
  listTeams, findMyTeam, listTeamPosts, createTeamPost, deleteTeamPost,
  listTeamComments, createTeamComment, deleteTeamComment,
  POST_CATEGORIES, type TeamPost, type TeamComment, type PostCategory,
} from '../utils/projectTeams';
import type { Team, TeamMember } from '../types';

const catMeta = (k: string) => POST_CATEGORIES.find((c) => c.key === k) || POST_CATEGORIES[3];

const ProjectBoard = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [posts, setPosts] = useState<TeamPost[]>([]);
  const [comments, setComments] = useState<TeamComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<'all' | PostCategory>('all');

  const [category, setCategory] = useState<PostCategory>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const authorName = profile?.name || profile?.display_name || user?.email || '수강생';

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const mine = findMyTeam(await listTeams(), user.id);
    setTeam(mine);
    if (mine) { setPosts(await listTeamPosts(mine.id)); setComments(await listTeamComments(mine.id)); }
    else { setPosts([]); setComments([]); }
    setLoading(false);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const refresh = async () => { if (team) { setPosts(await listTeamPosts(team.id)); setComments(await listTeamComments(team.id)); } };

  const handlePost = async () => {
    if (!team) return;
    if (!title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const res = await createTeamPost(team.id, user!.id, authorName, title.trim(), content.trim(), category, showCode ? code : '');
    setBusy(false);
    if (res.ok) { setTitle(''); setContent(''); setCode(''); setShowCode(false); setCategory('note'); showToast('글이 등록되었습니다.', 'success'); refresh(); }
    else showToast('등록 실패: ' + (res.error || ''), 'error');
  };

  const handleDelete = async (p: TeamPost) => {
    if (!confirm('이 글을 삭제할까요?')) return;
    const res = await deleteTeamPost(p.id);
    if (res.ok) { showToast('삭제되었습니다.', 'info'); refresh(); } else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const handleComment = async (postId: string) => {
    const text = (commentText[postId] || '').trim();
    if (!text || !team) return;
    const res = await createTeamComment(postId, team.id, user!.id, authorName, text);
    if (res.ok) { setCommentText((p) => ({ ...p, [postId]: '' })); refresh(); } else showToast('댓글 실패: ' + (res.error || ''), 'error');
  };
  const handleDeleteComment = async (c: TeamComment) => {
    const res = await deleteTeamComment(c.id);
    if (res.ok) refresh(); else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);
  const shown = filter === 'all' ? posts : posts.filter((p) => (p.category || 'note') === filter);

  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)' };
  const input: CSSProperties = { width: '100%', padding: '11px 13px', fontSize: '15px', boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' };
  const chip = (active: boolean): CSSProperties => ({ padding: '7px 13px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px', border: '1px solid', borderColor: active ? 'var(--primary-blue)' : 'var(--border-light)', background: active ? 'var(--primary-blue)' : 'var(--bg-white)', color: active ? '#fff' : 'var(--text-secondary)' });

  return (
    <>
      <SEOHead title="프로젝트 관리" path="/project-board" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 관리</h2>
          <p>우리 팀 전용 게시판입니다. 회의록·아이디어·소스코드를 남기고 댓글로 의견을 나누세요. (팀원과 관리자만 볼 수 있습니다)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : !team ? (
            <div style={{ ...card, textAlign: 'center', padding: '48px 22px' }}>
              <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)' }}>아직 소속된 팀이 없습니다. 먼저 팀을 만들거나 합류하세요.</p>
              <Link to="/project-vote" className="btn btn-primary">프로젝트 팀구성으로 이동</Link>
            </div>
          ) : (
            <>
              <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>{team.name}</h3>
                <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '15px' }}>주제: {team.project_topic || '미정'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {members(team).map((m, i) => (
                    <span key={i} style={{ fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: m.role === '팀장' ? '#fef3c7' : 'var(--bg-light-gray)', color: m.role === '팀장' ? '#92400e' : 'var(--text-secondary)' }}>{m.role === '팀장' ? '👑 ' : ''}{m.name}</span>
                  ))}
                </div>
              </div>

              <div style={card}>
                <h4 style={{ margin: '0 0 10px', fontSize: '16px' }}>새 글 작성</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(category === c.key)} onClick={() => setCategory(c.key)}>{c.emoji} {c.label}</button>)}
                  </div>
                  <input style={input} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용 (회의록, 역할 분담, 아이디어 정리, 진행 상황 등)" value={content} onChange={(e) => setContent(e.target.value)} />
                  {!showCode ? (
                    <button type="button" onClick={() => setShowCode(true)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{'</> 소스코드 첨부'}</button>
                  ) : (
                    <textarea style={{ ...input, minHeight: '120px', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-light-gray)' }} placeholder="소스코드를 붙여넣으세요" value={code} onChange={(e) => setCode(e.target.value)} />
                  )}
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handlePost}>등록</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button type="button" style={chip(filter === 'all')} onClick={() => setFilter('all')}>전체 {posts.length}</button>
                {POST_CATEGORIES.map((c) => { const n = posts.filter((p) => (p.category || 'note') === c.key).length; return <button key={c.key} type="button" style={chip(filter === c.key)} onClick={() => setFilter(c.key)}>{c.emoji} {c.label} {n}</button>; })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shown.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>아직 글이 없습니다. 첫 글을 남겨보세요.</p>
                ) : shown.map((p) => {
                  const cm = catMeta(p.category || 'note');
                  const postComments = comments.filter((c) => c.post_id === p.id);
                  return (
                    <div key={p.id} style={card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '17px' }}><span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)', marginRight: '8px' }}>{cm.emoji} {cm.label}</span>{p.title}</h4>
                        {(p.author_id === user?.id || isAdmin) && <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>삭제</button>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{p.author_name} · {new Date(p.created_at).toLocaleString('ko-KR')}</div>
                      {p.content && <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{p.content}</p>}
                      {p.code && <pre style={{ margin: '0 0 10px', padding: '14px 16px', background: '#0f172a', color: '#e2e8f0', borderRadius: '10px', overflow: 'auto', fontSize: '13px', lineHeight: 1.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{p.code}</pre>}

                      <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '6px', paddingTop: '10px' }}>
                        {postComments.map((c) => (
                          <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline', padding: '5px 0', fontSize: '14px' }}>
                            <strong style={{ fontSize: '13px', flexShrink: 0 }}>{c.author_name}</strong>
                            <span style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{c.content}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                            {(c.author_id === user?.id || isAdmin) && <button onClick={() => handleDeleteComment(c)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>}
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <input style={{ ...input, fontSize: '14px', padding: '8px 12px' }} placeholder="댓글 달기…" value={commentText[p.id] || ''} onChange={(e) => setCommentText((s) => ({ ...s, [p.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleComment(p.id)} />
                          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px', flexShrink: 0 }} onClick={() => handleComment(p.id)}>댓글</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectBoard;
