import { useState, useEffect, useCallback, type ReactElement, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import {
  listTeams, findMyTeam, listTeamPosts, createTeamPost, updateTeamPost, deleteTeamPost,
  listTeamComments, createTeamComment, deleteTeamComment,
  POST_CATEGORIES, type TeamPost, type TeamComment, type PostCategory, type TeamPostEdit,
} from '../utils/projectTeams';
import type { Team, TeamMember } from '../types';

const catMeta = (k: string) => POST_CATEGORIES.find((c) => c.key === k) || POST_CATEGORIES[3];

const ProjectBoard = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
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
  const [linkUrl, setLinkUrl] = useState('');
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [edit, setEdit] = useState<(TeamPostEdit & { id: string }) | null>(null);

  const authorName = profile?.name || profile?.display_name || user?.email || '수강생';

  const loadBoard = async (t: Team | null) => {
    if (t) { setPosts(await listTeamPosts(t.id)); setComments(await listTeamComments(t.id)); }
    else { setPosts([]); setComments([]); }
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const teams = await listTeams();
    if (isAdmin) {
      // 관리자: 모든 팀 열람 (기본 첫 팀)
      setAllTeams(teams);
      const cur = teams.find((t) => t.id === team?.id) || teams[0] || null;
      setTeam(cur);
      await loadBoard(cur);
    } else {
      const mine = findMyTeam(teams, user.id);
      setTeam(mine);
      await loadBoard(mine);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);
  useEffect(() => { load(); }, [load]);

  const selectTeam = async (id: string) => {
    const t = allTeams.find((x) => x.id === id) || null;
    setTeam(t);
    await loadBoard(t);
  };

  const refresh = async () => { if (team) { setPosts(await listTeamPosts(team.id)); setComments(await listTeamComments(team.id)); } };

  const handlePost = async () => {
    if (!team) return;
    if (!title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const res = await createTeamPost(team.id, user!.id, authorName, title.trim(), content.trim(), category, showCode ? code : '', linkUrl.trim());
    setBusy(false);
    if (res.ok) { setTitle(''); setContent(''); setCode(''); setShowCode(false); setLinkUrl(''); setCategory('note'); showToast('글이 등록되었습니다.', 'success'); refresh(); }
    else showToast('등록 실패: ' + (res.error || ''), 'error');
  };

  const startEdit = (p: TeamPost) => setEdit({
    id: p.id, title: p.title, content: p.content || '',
    category: (p.category || 'note') as PostCategory, code: p.code || '', link_url: p.link_url || '',
  });

  const handleUpdate = async () => {
    if (!edit) return;
    if (!edit.title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const { id, ...patch } = edit;
    const res = await updateTeamPost(id, { ...patch, title: patch.title.trim(), content: patch.content.trim(), link_url: patch.link_url.trim() });
    setBusy(false);
    if (res.ok) { setEdit(null); showToast('수정되었습니다.', 'success'); refresh(); }
    else showToast('수정 실패: ' + (res.error || ''), 'error');
  };

  const handleDelete = async (p: TeamPost) => {
    if (!confirm('이 글을 삭제할까요?')) return;
    const res = await deleteTeamPost(p.id);
    if (res.ok) { showToast('삭제되었습니다.', 'info'); refresh(); } else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const handleComment = async (postId: string) => {
    const text = (commentText[postId] || '').trim();
    if (!text || !team) return;
    const res = await createTeamComment(postId, team.id, user!.id, authorName, text, isAdmin);
    if (res.ok) { setCommentText((p) => ({ ...p, [postId]: '' })); refresh(); } else showToast('댓글 실패: ' + (res.error || ''), 'error');
  };
  const handleDeleteComment = async (c: TeamComment) => {
    const res = await deleteTeamComment(c.id);
    if (res.ok) refresh(); else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);
  const shown = filter === 'all' ? posts : posts.filter((p) => (p.category || 'note') === filter);
  const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
  const linkPosts = posts.filter((p) => (p.link_url || '').trim());

  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)' };
  const input: CSSProperties = { width: '100%', padding: '11px 13px', fontSize: '15px', boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' };
  const chip = (active: boolean): CSSProperties => ({ padding: '7px 13px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px', border: '1px solid', borderColor: active ? 'var(--primary-blue)' : 'var(--border-light)', background: active ? 'var(--primary-blue)' : 'var(--bg-white)', color: active ? '#fff' : 'var(--text-secondary)' });

  return (
    <>
      <SEOHead title="프로젝트 관리" path="/project-board" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 관리</h2>
          <p>우리 팀 전용 게시판입니다. 회의록·아이디어·자료 링크·소스코드를 남기고 댓글로 의견을 나누세요. 강사 피드백도 댓글로 확인할 수 있어요. (팀원과 관리자만 볼 수 있습니다)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : !team ? (
            <div style={{ ...card, textAlign: 'center', padding: '48px 22px' }}>
              {isAdmin ? (
                <><p style={{ margin: '0 0 16px', color: 'var(--text-secondary)' }}>편성된 팀이 없습니다. 먼저 팀을 편성하세요.</p><Link to="/admin/teams" className="btn btn-primary">팀 편성 관리로 이동</Link></>
              ) : (
                <><p style={{ margin: '0 0 16px', color: 'var(--text-secondary)' }}>아직 소속된 팀이 없습니다. 먼저 팀을 만들거나 합류하세요.</p><Link to="/project-vote" className="btn btn-primary">프로젝트 팀구성으로 이동</Link></>
              )}
            </div>
          ) : (
            <>
              {/* 관리자: 팀 선택 드롭다운 (모든 팀 열람) */}
              {isAdmin && (
                <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>👑 관리자 — 팀 선택</span>
                  <select value={team.id} onChange={(e) => selectTeam(e.target.value)} style={{ ...input, width: 'auto', flex: 1, minWidth: '200px' }}>
                    {allTeams.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.project_topic || '주제 미정'}</option>)}
                  </select>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>전체 {allTeams.length}팀 · 열람·삭제 가능</span>
                </div>
              )}
              <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>{team.name}</h3>
                <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '15px' }}>주제: {team.project_topic || '미정'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {members(team).map((m, i) => (
                    <span key={i} style={{ fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: m.role === '팀장' ? '#fef3c7' : 'var(--bg-light-gray)', color: m.role === '팀장' ? '#92400e' : 'var(--text-secondary)' }}>{m.role === '팀장' ? '👑 ' : ''}{m.name}</span>
                  ))}
                </div>
              </div>

              {/* 자료 정리 안내 (접이식) */}
              <div style={{ ...card, padding: '14px 18px', background: 'var(--bg-light-gray)', borderStyle: 'dashed' }}>
                <button type="button" onClick={() => setShowGuide((v) => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, padding: 0 }}>
                  <span>📚 프로젝트 자료, 이렇게 정리하세요</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{showGuide ? '▲' : '▼'}</span>
                </button>
                {showGuide && (
                  <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    <p style={{ margin: '0 0 8px' }}>글마다 <strong>카테고리</strong>를 꼭 골라 주세요. 나중에 칩(태그)으로 한눈에 모아볼 수 있어요.</p>
                    <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
                      <li><strong>📝 회의록</strong> — 회의 날짜·참석자·결정사항·다음 할 일. 제목은 <code>[6/10] 1차 회의</code> 처럼 날짜로 시작하면 정렬돼요.</li>
                      <li><strong>💡 아이디어</strong> — 기획·기능 제안. 한 글에 하나의 아이디어로.</li>
                      <li><strong>📎 자료</strong> — 참고 링크(구글드라이브·노션·깃허브·피그마 등)는 <strong>자료 링크</strong> 칸에 URL을 넣으면 클릭 카드로 정리됩니다.</li>
                      <li><strong>{'</> 소스코드'}</strong> — 코드 조각은 본문 대신 <strong>소스코드 첨부</strong>로 붙여야 줄바꿈·들여쓰기가 보존돼요.</li>
                    </ul>
                    <p style={{ margin: 0 }}>👩‍🏫 강사가 글에 <strong>피드백 댓글</strong>을 남기면 <span style={{ color: '#92400e', fontWeight: 700 }}>강사</span> 배지가 붙습니다. 댓글로 진행 상황을 함께 점검하세요.</p>
                  </div>
                )}
              </div>

              {/* 자료 모아보기 (링크가 있는 글만) */}
              {linkPosts.length > 0 && (
                <div style={card}>
                  <button type="button" onClick={() => setShowResources((v) => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700, padding: 0 }}>
                    <span>📎 우리 팀 자료 모음 ({linkPosts.length})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{showResources ? '▲' : '▼'}</span>
                  </button>
                  {showResources && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {linkPosts.map((p) => (
                        <a key={p.id} href={safeUrl(p.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>🔗</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'block', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.link_url}</span>
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--primary-blue)', flexShrink: 0 }}>열기 ↗</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={card}>
                <h4 style={{ margin: '0 0 10px', fontSize: '16px' }}>{isAdmin ? '새 글 작성 (관리자)' : '새 글 작성'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(category === c.key)} onClick={() => setCategory(c.key)}>{c.emoji} {c.label}</button>)}
                  </div>
                  <input style={input} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용 (회의록, 역할 분담, 아이디어 정리, 진행 상황 등)" value={content} onChange={(e) => setContent(e.target.value)} />
                  <input style={{ ...input, fontSize: '14px' }} placeholder="🔗 자료 링크 (선택) — 구글드라이브·노션·깃허브·피그마 URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
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
                      {edit?.id === p.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(edit.category === c.key)} onClick={() => setEdit((s) => s && { ...s, category: c.key })}>{c.emoji} {c.label}</button>)}
                          </div>
                          <input style={input} placeholder="제목" value={edit.title} onChange={(e) => setEdit((s) => s && { ...s, title: e.target.value })} />
                          <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용" value={edit.content} onChange={(e) => setEdit((s) => s && { ...s, content: e.target.value })} />
                          <input style={{ ...input, fontSize: '14px' }} placeholder="🔗 자료 링크 (선택)" value={edit.link_url} onChange={(e) => setEdit((s) => s && { ...s, link_url: e.target.value })} />
                          <textarea style={{ ...input, minHeight: '110px', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-light-gray)' }} placeholder="소스코드 (선택)" value={edit.code} onChange={(e) => setEdit((s) => s && { ...s, code: e.target.value })} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ padding: '9px 20px' }} disabled={busy} onClick={handleUpdate}>저장</button>
                            <button type="button" style={{ padding: '9px 20px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setEdit(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                      <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '17px' }}><span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)', marginRight: '8px' }}>{cm.emoji} {cm.label}</span>{p.title}</h4>
                        {(p.author_id === user?.id || isAdmin) && (
                          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button onClick={() => startEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '13px' }}>수정</button>
                            <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>삭제</button>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{p.author_name} · {new Date(p.created_at).toLocaleString('ko-KR')}</div>
                      {p.content && <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{p.content}</p>}
                      {p.code && <pre style={{ margin: '0 0 10px', padding: '14px 16px', background: '#0f172a', color: '#e2e8f0', borderRadius: '10px', overflow: 'auto', fontSize: '13px', lineHeight: 1.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{p.code}</pre>}
                      {(p.link_url || '').trim() && (
                        <a href={safeUrl(p.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 0 10px', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-light-gray)', textDecoration: 'none', color: 'var(--primary-blue)', fontSize: '14px', fontWeight: 600, maxWidth: '100%' }}>
                          <span style={{ flexShrink: 0 }}>🔗</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.link_url}</span>
                          <span style={{ flexShrink: 0 }}>↗</span>
                        </a>
                      )}
                      </>
                      )}

                      <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '6px', paddingTop: '10px' }}>
                        {postComments.map((c) => (
                          <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline', padding: '5px 0', fontSize: '14px', ...(c.is_staff ? { background: '#fffbeb', borderRadius: '8px', padding: '7px 10px', margin: '3px 0' } : {}) }}>
                            <strong style={{ fontSize: '13px', flexShrink: 0 }}>
                              {c.is_staff && <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: '#fde68a', color: '#92400e', marginRight: '6px' }}>👩‍🏫 강사</span>}
                              {c.author_name}
                            </strong>
                            <span style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{c.content}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                            {(c.author_id === user?.id || isAdmin) && <button onClick={() => handleDeleteComment(c)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>}
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <input style={{ ...input, fontSize: '14px', padding: '8px 12px' }} placeholder={isAdmin ? '강사 피드백 댓글 달기…' : '댓글 달기…'} value={commentText[p.id] || ''} onChange={(e) => setCommentText((s) => ({ ...s, [p.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handleComment(p.id)} />
                          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px', flexShrink: 0 }} onClick={() => handleComment(p.id)}>{isAdmin ? '피드백' : '댓글'}</button>
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
