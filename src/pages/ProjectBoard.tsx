/**
 * ProjectBoard.tsx — 프로젝트 팀 전용 게시판 페이지 컴포넌트
 *
 * [이 파일의 역할]
 * - 수강생/관리자가 자신의 프로젝트 팀 게시판을 보고, 글(회의록·아이디어·자료·소스코드)을
 *   작성/수정/삭제하고, 글에 댓글(강사 피드백 포함)을 다는 LMS의 한 화면을 구성한다.
 *
 * [핵심 책임]
 * - 로그인 사용자의 소속 팀(또는 관리자는 모든 팀)을 조회하고, 선택된 팀의 글/댓글을 로드.
 * - 카테고리 필터링, 자료 링크 모아보기, 작성/수정 폼, 댓글 작성/삭제 UI 제공.
 * - 권한 처리: 본인 글/댓글 또는 관리자만 수정·삭제 가능. 관리자는 모든 팀 열람 및 강사 배지 댓글.
 * - 데이터 접근은 utils/projectTeams의 함수(내부적으로 Supabase + RLS)를 통해 수행.
 *
 * [주요 export]
 * - default: ProjectBoard (React 함수형 컴포넌트)
 */
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

// 카테고리 키(k)에 해당하는 메타데이터(emoji/label 등)를 반환.
// 매칭되는 항목이 없으면 기본값으로 POST_CATEGORIES[3](기타 카테고리)을 사용한다.
const catMeta = (k: string) => POST_CATEGORIES.find((c) => c.key === k) || POST_CATEGORIES[3];

/**
 * ProjectBoard — 팀 게시판 메인 컴포넌트.
 * 매개변수: 없음.
 * 반환값: 게시판 전체 UI를 담은 ReactElement.
 * 부수효과: 마운트/사용자 변경 시 팀·글·댓글을 비동기 로드하고, 작성/수정/삭제 시 서버 갱신.
 */
const ProjectBoard = (): ReactElement => {
  // 인증 컨텍스트: 현재 사용자, 프로필, 관리자 여부
  const { user, profile, isAdmin } = useAuth();
  // 토스트 알림 표시 함수
  const { showToast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);        // 현재 선택/소속된 팀
  const [allTeams, setAllTeams] = useState<Team[]>([]);       // 관리자용: 전체 팀 목록
  const [posts, setPosts] = useState<TeamPost[]>([]);         // 현재 팀의 글 목록
  const [comments, setComments] = useState<TeamComment[]>([]); // 현재 팀의 댓글 목록(전 글 합산)
  const [loading, setLoading] = useState(true);               // 초기 로딩 스피너 표시 여부
  const [busy, setBusy] = useState(false);                    // 등록/수정 처리 중(버튼 비활성화)
  const [filter, setFilter] = useState<'all' | PostCategory>('all'); // 카테고리 필터 상태

  // --- 새 글 작성 폼 상태 ---
  const [category, setCategory] = useState<PostCategory>('note'); // 작성 글의 카테고리
  const [title, setTitle] = useState('');           // 제목 입력값
  const [content, setContent] = useState('');       // 본문 입력값
  const [showCode, setShowCode] = useState(false);  // 소스코드 첨부 입력칸 표시 여부
  const [code, setCode] = useState('');             // 소스코드 입력값
  const [linkUrl, setLinkUrl] = useState('');       // 자료 링크 URL 입력값
  const [commentText, setCommentText] = useState<Record<string, string>>({}); // 글 ID별 댓글 입력값
  const [showGuide, setShowGuide] = useState(false);     // 자료 정리 안내(접이식) 펼침 여부
  const [showResources, setShowResources] = useState(false); // 자료 모아보기(접이식) 펼침 여부
  const [edit, setEdit] = useState<(TeamPostEdit & { id: string }) | null>(null); // 수정 중인 글(없으면 null)

  // 글/댓글 작성 시 표시할 작성자명: 이름 → 표시명 → 이메일 → 기본 '수강생' 순 폴백
  const authorName = profile?.name || profile?.display_name || user?.email || '수강생';

  /**
   * loadBoard — 주어진 팀의 글과 댓글을 한꺼번에 로드해 상태에 반영.
   * 매개변수: t — 대상 팀(없으면 목록을 비움).
   * 반환값: Promise<void>. 부수효과: posts/comments 상태 갱신.
   */
  const loadBoard = async (t: Team | null) => {
    if (t) { setPosts(await listTeamPosts(t.id)); setComments(await listTeamComments(t.id)); }
    else { setPosts([]); setComments([]); }
  };

  /**
   * load — 팀 목록을 조회하고 현재 사용자에 맞는 팀을 선택해 게시판을 로드.
   * - 관리자: 모든 팀을 받아 allTeams에 저장, 기존 선택 팀 유지 또는 첫 팀을 기본 선택.
   * - 일반 사용자: findMyTeam으로 본인 소속 팀만 찾아 로드.
   * 의존성: user, isAdmin (team 변경은 의도적으로 제외 — exhaustive-deps 비활성화 처리).
   * 반환값: Promise<void>. 부수효과: loading/team/allTeams/posts/comments 갱신.
   */
  const load = useCallback(async () => {
    if (!user) return; // 비로그인 시 아무 것도 하지 않음
    setLoading(true);
    const teams = await listTeams();
    if (isAdmin) {
      // 관리자: 모든 팀 열람 (기본 첫 팀)
      setAllTeams(teams);
      // 이전에 보던 팀이 있으면 유지, 없으면 첫 팀, 그것도 없으면 null
      const cur = teams.find((t) => t.id === team?.id) || teams[0] || null;
      setTeam(cur);
      await loadBoard(cur);
    } else {
      // 일반 사용자: 본인이 멤버로 속한 팀만 조회
      const mine = findMyTeam(teams, user.id);
      setTeam(mine);
      await loadBoard(mine);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);
  // 마운트 및 load 콜백 변경(=user/isAdmin 변경) 시 게시판 로드 실행
  useEffect(() => { load(); }, [load]);

  /**
   * selectTeam — (관리자 전용) 드롭다운에서 팀을 바꿀 때 해당 팀으로 전환하고 게시판 재로드.
   * 매개변수: id — 선택한 팀 ID. 반환값: Promise<void>. 부수효과: team/posts/comments 갱신.
   */
  const selectTeam = async (id: string) => {
    const t = allTeams.find((x) => x.id === id) || null;
    setTeam(t);
    await loadBoard(t);
  };

  /**
   * refresh — 현재 팀의 글/댓글만 다시 조회(로딩 스피너 없이 새로고침).
   * 매개변수: 없음. 반환값: Promise<void>. 부수효과: posts/comments 갱신.
   */
  const refresh = async () => { if (team) { setPosts(await listTeamPosts(team.id)); setComments(await listTeamComments(team.id)); } };

  /**
   * handlePost — 새 글을 서버에 등록.
   * 매개변수: 없음(컴포넌트 상태 사용). 반환값: Promise<void>.
   * 부수효과: 성공 시 폼 초기화 + 토스트 + 목록 새로고침, 실패 시 에러 토스트.
   * 엣지케이스: 팀 미선택이면 무시, 제목 공백이면 경고 후 중단.
   */
  const handlePost = async () => {
    if (!team) return;
    if (!title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    // user!는 load 단계에서 로그인 보장 후 호출되므로 non-null 단언 사용.
    // showCode가 false면 코드 본문은 빈 문자열로 보냄(첨부 안 함).
    const res = await createTeamPost(team.id, user!.id, authorName, title.trim(), content.trim(), category, showCode ? code : '', linkUrl.trim());
    setBusy(false);
    if (res.ok) { setTitle(''); setContent(''); setCode(''); setShowCode(false); setLinkUrl(''); setCategory('note'); showToast('글이 등록되었습니다.', 'success'); refresh(); }
    else showToast('등록 실패: ' + (res.error || ''), 'error');
  };

  /**
   * startEdit — 특정 글을 수정 모드로 진입(폼에 기존 값 채움).
   * 매개변수: p — 수정할 글. 반환값: 없음. 부수효과: edit 상태 설정.
   * null 가능 필드(content/category/code/link_url)는 안전한 기본값으로 보정.
   */
  const startEdit = (p: TeamPost) => setEdit({
    id: p.id, title: p.title, content: p.content || '',
    category: (p.category || 'note') as PostCategory, code: p.code || '', link_url: p.link_url || '',
  });

  /**
   * handleUpdate — 수정 중인 글을 서버에 반영.
   * 매개변수: 없음(edit 상태 사용). 반환값: Promise<void>.
   * 부수효과: 성공 시 수정 모드 종료 + 토스트 + 새로고침, 실패 시 에러 토스트.
   * 엣지케이스: edit이 없으면 무시, 제목 공백이면 경고 후 중단.
   */
  const handleUpdate = async () => {
    if (!edit) return;
    if (!edit.title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    // id는 식별자로 분리하고 나머지(patch)만 수정 값으로 전달. 문자열 필드는 trim 처리.
    const { id, ...patch } = edit;
    const res = await updateTeamPost(id, { ...patch, title: patch.title.trim(), content: patch.content.trim(), link_url: patch.link_url.trim() });
    setBusy(false);
    if (res.ok) { setEdit(null); showToast('수정되었습니다.', 'success'); refresh(); }
    else showToast('수정 실패: ' + (res.error || ''), 'error');
  };

  /**
   * handleDelete — 글을 삭제(브라우저 confirm으로 확인).
   * 매개변수: p — 삭제할 글. 반환값: Promise<void>.
   * 부수효과: 확인 시 서버 삭제 + 토스트 + 새로고침. 취소하면 아무 동작 없음.
   */
  const handleDelete = async (p: TeamPost) => {
    if (!confirm('이 글을 삭제할까요?')) return;
    const res = await deleteTeamPost(p.id);
    if (res.ok) { showToast('삭제되었습니다.', 'info'); refresh(); } else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  /**
   * handleComment — 특정 글에 댓글 등록.
   * 매개변수: postId — 댓글을 달 글 ID. 반환값: Promise<void>.
   * 부수효과: 성공 시 해당 글의 입력칸만 비우고 새로고침. 실패 시 에러 토스트.
   * 엣지케이스: 빈 댓글이거나 팀 미선택이면 무시. isAdmin 값이 강사 배지(is_staff) 여부로 전달됨.
   */
  const handleComment = async (postId: string) => {
    const text = (commentText[postId] || '').trim();
    if (!text || !team) return;
    const res = await createTeamComment(postId, team.id, user!.id, authorName, text, isAdmin);
    // 성공 시 다른 글의 입력값은 보존하고 현재 글 입력칸만 초기화
    if (res.ok) { setCommentText((p) => ({ ...p, [postId]: '' })); refresh(); } else showToast('댓글 실패: ' + (res.error || ''), 'error');
  };
  /**
   * handleDeleteComment — 댓글 삭제.
   * 매개변수: c — 삭제할 댓글. 반환값: Promise<void>.
   * 부수효과: 성공 시 새로고침, 실패 시 에러 토스트.
   */
  const handleDeleteComment = async (c: TeamComment) => {
    const res = await deleteTeamComment(c.id);
    if (res.ok) refresh(); else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  // 팀의 멤버 배열을 안전하게 반환(members가 배열이 아니면 빈 배열).
  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);
  // 현재 필터에 따라 보여줄 글 목록. 'all'이면 전체, 아니면 카테고리 일치 글만.
  const shown = filter === 'all' ? posts : posts.filter((p) => (p.category || 'note') === filter);
  // 입력된 URL이 http(s)로 시작하지 않으면 https:// 를 붙여 안전한 링크로 보정(정규식: 대소문자 무시).
  const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
  // 자료 링크가 채워진 글만 추려 '자료 모아보기' 섹션에 사용.
  const linkPosts = posts.filter((p) => (p.link_url || '').trim());

  // --- 공통 인라인 스타일 정의(CSS 변수 기반 테마 사용) ---
  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)' };
  const input: CSSProperties = { width: '100%', padding: '11px 13px', fontSize: '15px', boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' };
  // chip — 카테고리/필터용 칩 버튼 스타일. active 여부에 따라 색상이 달라짐.
  const chip = (active: boolean): CSSProperties => ({ padding: '7px 13px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px', border: '1px solid', borderColor: active ? 'var(--primary-blue)' : 'var(--border-light)', background: active ? 'var(--primary-blue)' : 'var(--bg-white)', color: active ? '#fff' : 'var(--text-secondary)' });

  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 페이지 메타 정보 */}
      <SEOHead title="프로젝트 관리" path="/project-board" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 관리</h2>
          <p>우리 팀 전용 게시판입니다. 회의록·아이디어·자료 링크·소스코드를 남기고 댓글로 의견을 나누세요. 강사 피드백도 댓글로 확인할 수 있어요. (팀원과 관리자만 볼 수 있습니다)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
          {/* 로딩 중 → 스피너 / 팀 없음 → 안내 / 팀 있음 → 게시판 본문 의 3분기 렌더링 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : !team ? (
            <div style={{ ...card, textAlign: 'center', padding: '48px 22px' }}>
              {/* 팀이 없는 경우: 관리자/일반 사용자에 따라 다른 안내·이동 링크 노출 */}
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
                  {/* 선택 변경 시 selectTeam으로 해당 팀 게시판 전환 */}
                  <select value={team.id} onChange={(e) => selectTeam(e.target.value)} style={{ ...input, width: 'auto', flex: 1, minWidth: '200px' }}>
                    {allTeams.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.project_topic || '주제 미정'}</option>)}
                  </select>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>전체 {allTeams.length}팀 · 열람·삭제 가능</span>
                </div>
              )}
              {/* 팀 정보 헤더: 팀명·주제·멤버 목록(팀장은 강조 배지) */}
              <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px' }}>{team.name}</h3>
                <p style={{ margin: '0 0 10px', color: 'var(--text-secondary)', fontSize: '15px' }}>주제: {team.project_topic || '미정'}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {members(team).map((m, i) => (
                    // 역할이 '팀장'이면 노란 배지 + 왕관 이모지로 강조
                    <span key={i} style={{ fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: m.role === '팀장' ? '#fef3c7' : 'var(--bg-light-gray)', color: m.role === '팀장' ? '#92400e' : 'var(--text-secondary)' }}>{m.role === '팀장' ? '👑 ' : ''}{m.name}</span>
                  ))}
                </div>
              </div>

              {/* 자료 정리 안내 (접이식) */}
              <div style={{ ...card, padding: '14px 18px', background: 'var(--bg-light-gray)', borderStyle: 'dashed' }}>
                {/* 클릭하면 showGuide 토글 → 안내 펼침/접힘 */}
                <button type="button" onClick={() => setShowGuide((v) => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, padding: 0 }}>
                  <span>📚 프로젝트 자료, 이렇게 정리하세요</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{showGuide ? '▲' : '▼'}</span>
                </button>
                {/* 펼쳐졌을 때만 안내 본문 렌더링 */}
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
                  {/* showResources 토글로 자료 링크 목록 펼침/접힘 */}
                  <button type="button" onClick={() => setShowResources((v) => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700, padding: 0 }}>
                    <span>📎 우리 팀 자료 모음 ({linkPosts.length})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{showResources ? '▲' : '▼'}</span>
                  </button>
                  {showResources && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {linkPosts.map((p) => (
                        // 새 탭으로 안전한 URL 열기(noopener/noreferrer로 보안 처리)
                        <a key={p.id} href={safeUrl(p.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>🔗</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            {/* 제목/URL이 길면 말줄임(ellipsis) 처리 */}
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

              {/* 새 글 작성 폼 */}
              <div style={card}>
                <h4 style={{ margin: '0 0 10px', fontSize: '16px' }}>{isAdmin ? '새 글 작성 (관리자)' : '새 글 작성'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* 카테고리 선택 칩들(선택된 것만 active 스타일) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(category === c.key)} onClick={() => setCategory(c.key)}>{c.emoji} {c.label}</button>)}
                  </div>
                  <input style={input} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용 (회의록, 역할 분담, 아이디어 정리, 진행 상황 등)" value={content} onChange={(e) => setContent(e.target.value)} />
                  <input style={{ ...input, fontSize: '14px' }} placeholder="🔗 자료 링크 (선택) — 구글드라이브·노션·깃허브·피그마 URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                  {/* 소스코드 첨부: 미표시 상태면 추가 버튼, 표시 상태면 모노스페이스 입력칸 */}
                  {!showCode ? (
                    <button type="button" onClick={() => setShowCode(true)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{'</> 소스코드 첨부'}</button>
                  ) : (
                    <textarea style={{ ...input, minHeight: '120px', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-light-gray)' }} placeholder="소스코드를 붙여넣으세요" value={code} onChange={(e) => setCode(e.target.value)} />
                  )}
                  {/* busy(처리 중)일 때 중복 제출 방지 */}
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handlePost}>등록</button>
                </div>
              </div>

              {/* 카테고리 필터 칩 줄: '전체' + 각 카테고리별 글 개수 표시 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button type="button" style={chip(filter === 'all')} onClick={() => setFilter('all')}>전체 {posts.length}</button>
                {POST_CATEGORIES.map((c) => { const n = posts.filter((p) => (p.category || 'note') === c.key).length; return <button key={c.key} type="button" style={chip(filter === c.key)} onClick={() => setFilter(c.key)}>{c.emoji} {c.label} {n}</button>; })}
              </div>

              {/* 글 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 필터 결과가 없으면 빈 안내, 있으면 각 글 카드 렌더링 */}
                {shown.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>아직 글이 없습니다. 첫 글을 남겨보세요.</p>
                ) : shown.map((p) => {
                  const cm = catMeta(p.category || 'note');                    // 카테고리 메타(배지용)
                  const postComments = comments.filter((c) => c.post_id === p.id); // 이 글에 달린 댓글만 추출
                  return (
                    <div key={p.id} style={card}>
                      {/* 이 글이 수정 모드면 편집 폼, 아니면 읽기 뷰 표시 */}
                      {edit?.id === p.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* 수정 폼: setEdit(s => s && {...}) 패턴으로 null 가드하며 부분 업데이트 */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(edit.category === c.key)} onClick={() => setEdit((s) => s && { ...s, category: c.key })}>{c.emoji} {c.label}</button>)}
                          </div>
                          <input style={input} placeholder="제목" value={edit.title} onChange={(e) => setEdit((s) => s && { ...s, title: e.target.value })} />
                          <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용" value={edit.content} onChange={(e) => setEdit((s) => s && { ...s, content: e.target.value })} />
                          <input style={{ ...input, fontSize: '14px' }} placeholder="🔗 자료 링크 (선택)" value={edit.link_url} onChange={(e) => setEdit((s) => s && { ...s, link_url: e.target.value })} />
                          <textarea style={{ ...input, minHeight: '110px', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-light-gray)' }} placeholder="소스코드 (선택)" value={edit.code} onChange={(e) => setEdit((s) => s && { ...s, code: e.target.value })} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ padding: '9px 20px' }} disabled={busy} onClick={handleUpdate}>저장</button>
                            {/* 취소: 수정 상태 해제(setEdit(null)) */}
                            <button type="button" style={{ padding: '9px 20px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setEdit(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                      <>
                      {/* 읽기 뷰: 카테고리 배지 + 제목, 그리고 본인 글/관리자면 수정·삭제 버튼 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '17px' }}><span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)', marginRight: '8px' }}>{cm.emoji} {cm.label}</span>{p.title}</h4>
                        {/* 권한: 글 작성자 본인 또는 관리자에게만 수정/삭제 노출(서버 RLS에서도 동일하게 강제됨) */}
                        {(p.author_id === user?.id || isAdmin) && (
                          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button onClick={() => startEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '13px' }}>수정</button>
                            <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>삭제</button>
                          </div>
                        )}
                      </div>
                      {/* 작성자명 + 작성 일시(한국어 로캘) */}
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{p.author_name} · {new Date(p.created_at).toLocaleString('ko-KR')}</div>
                      {/* 본문: 줄바꿈 보존(pre-wrap). 내용 있을 때만 표시 */}
                      {p.content && <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{p.content}</p>}
                      {/* 소스코드: 다크 테마 코드블록(pre)으로 표시. 코드 있을 때만 */}
                      {p.code && <pre style={{ margin: '0 0 10px', padding: '14px 16px', background: '#0f172a', color: '#e2e8f0', borderRadius: '10px', overflow: 'auto', fontSize: '13px', lineHeight: 1.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{p.code}</pre>}
                      {/* 자료 링크: 공백 제거 후 값이 있을 때만 링크 카드 표시 */}
                      {(p.link_url || '').trim() && (
                        <a href={safeUrl(p.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 0 10px', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', background: 'var(--bg-light-gray)', textDecoration: 'none', color: 'var(--primary-blue)', fontSize: '14px', fontWeight: 600, maxWidth: '100%' }}>
                          <span style={{ flexShrink: 0 }}>🔗</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.link_url}</span>
                          <span style={{ flexShrink: 0 }}>↗</span>
                        </a>
                      )}
                      </>
                      )}

                      {/* 댓글 영역(글 카드 하단) */}
                      <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '6px', paddingTop: '10px' }}>
                        {postComments.map((c) => (
                          // 강사(is_staff) 댓글이면 노란 배경으로 강조
                          <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline', padding: '5px 0', fontSize: '14px', ...(c.is_staff ? { background: '#fffbeb', borderRadius: '8px', padding: '7px 10px', margin: '3px 0' } : {}) }}>
                            <strong style={{ fontSize: '13px', flexShrink: 0 }}>
                              {/* 강사 댓글에는 '강사' 배지 표시 */}
                              {c.is_staff && <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: '#fde68a', color: '#92400e', marginRight: '6px' }}>👩‍🏫 강사</span>}
                              {c.author_name}
                            </strong>
                            <span style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{c.content}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                            {/* 댓글 작성자 본인 또는 관리자만 삭제 버튼(✕) 노출 */}
                            {(c.author_id === user?.id || isAdmin) && <button onClick={() => handleDeleteComment(c)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>}
                          </div>
                        ))}
                        {/* 댓글 입력칸: Enter 키로도 등록 가능. 글 ID별로 입력값 분리 관리 */}
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
