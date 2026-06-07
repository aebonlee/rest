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
 *
 * ─────────────────────────────────────────────────────────────────────────
 * [초보자가 먼저 알아두면 좋은 배경 지식 / 용어]
 * - React 컴포넌트: 화면의 한 조각을 만들어 내는 "함수". 이 함수가 JSX(아래 참고)를
 *   반환하면 그 내용이 실제 화면에 그려진다. 여기서는 ProjectBoard 라는 함수가 곧 한 페이지.
 * - JSX: 자바스크립트 안에서 HTML 처럼 보이는 문법. <div>...</div> 같은 태그를 직접 적을 수 있다.
 *   JSX 안에서 중괄호 {}를 쓰면 그 안은 다시 "자바스크립트 코드"로 해석된다. (예: {team.name})
 * - 상태(state): 화면이 기억해야 하는 "변하는 값"(예: 입력한 제목, 로딩 중 여부).
 *   useState 로 만들며, 이 값이 바뀌면 React 가 화면을 자동으로 다시 그린다(이걸 "리렌더"라 한다).
 * - 훅(hook): use 로 시작하는 특별한 함수(useState, useEffect, useCallback 등).
 *   컴포넌트에 "상태"나 "생명주기 동작" 같은 기능을 붙여 준다. 컴포넌트 최상단에서만 호출해야 한다.
 * - 비동기(async/await): 서버에서 데이터를 가져오는 일은 시간이 걸린다. async 함수 안에서
 *   await 를 붙이면 "그 결과가 올 때까지 기다렸다가 다음 줄로 넘어가라"는 뜻이다.
 * - Supabase: 데이터베이스 + 인증을 제공하는 백엔드 서비스. 여기선 직접 부르지 않고
 *   utils/projectTeams 의 함수들을 통해 간접 호출한다.
 * - RLS(Row Level Security): DB가 "이 행을 이 사용자가 볼/고칠 권한이 있나?"를 줄 단위로 검사하는 보안.
 *   즉, 화면에서 버튼을 숨겨도 진짜 보안은 서버(DB)가 책임진다. 화면 권한 체크는 "편의상" 추가일 뿐.
 * - TypeScript(TS): 자바스크립트에 "타입(자료형)"을 더한 언어. Team, TeamPost 처럼
 *   데이터 모양을 미리 정의해 두면 실수를 컴파일 단계에서 잡아준다.
 * ─────────────────────────────────────────────────────────────────────────
 */
// React에서 필요한 도구들을 가져온다.
// - useState/useEffect/useCallback: 위 설명의 "훅"들.
// - type ReactElement: 컴포넌트가 반환하는 "화면 요소"의 타입(타입만 가져옴, 실제 값 아님).
// - type CSSProperties: style={{...}} 에 넣는 인라인 스타일 객체의 타입.
import { useState, useEffect, useCallback, type ReactElement, type CSSProperties } from 'react';
// Link: 페이지 새로고침 없이 다른 경로로 이동하게 해주는 라우터 링크(<a> 태그의 SPA 버전).
import { Link } from 'react-router-dom';
// useAuth: 로그인 사용자/프로필/관리자 여부를 "어디서든" 꺼내 쓰게 해주는 인증 컨텍스트 훅.
//   (컨텍스트 = 여러 컴포넌트가 공유하는 전역 상태 보관함. props로 일일이 넘기지 않아도 됨.)
import { useAuth } from '../contexts/AuthContext';
// useToast: 화면 구석에 잠깐 떴다 사라지는 알림 메시지를 띄우는 함수를 제공.
import { useToast } from '../contexts/ToastContext';
// SEOHead: 페이지의 <title>·메타 태그 등 검색엔진/브라우저 탭 정보를 설정하는 컴포넌트.
import SEOHead from '../components/SEOHead';
// 게시판 데이터 처리 함수들과 타입을 모아둔 유틸. 이 함수들 내부에서 Supabase(+RLS)를 호출한다.
//   함수: 팀 목록/내 팀 찾기/글 목록·생성·수정·삭제/댓글 목록·생성·삭제
//   POST_CATEGORIES: 카테고리 정의 배열(키·이모지·라벨). type 으로 시작하는 것들은 데이터 모양(타입).
import {
  listTeams, findMyTeam, listTeamPosts, createTeamPost, updateTeamPost, deleteTeamPost,
  listTeamComments, createTeamComment, deleteTeamComment,
  POST_CATEGORIES, type TeamPost, type TeamComment, type PostCategory, type TeamPostEdit,
} from '../utils/projectTeams';
// 팀/팀멤버의 데이터 모양(타입)을 가져온다. import type 은 "타입만" 가져온다는 뜻(실행 코드에는 영향 없음).
import type { Team, TeamMember } from '../types';

// catMeta — 카테고리 키(k)에 해당하는 메타데이터(emoji/label 등)를 반환하는 도우미 함수.
//   .find(...): 배열에서 조건(c.key === k)을 만족하는 "첫 항목"을 찾아 반환. 없으면 undefined.
//   || POST_CATEGORIES[3]: 앞이 undefined(못 찾음)면 기본값으로 4번째(=인덱스 3, 기타) 카테고리를 쓴다.
//   주의: 화면에서 배지 등을 그릴 때 undefined가 들어오면 오류가 나므로, 이렇게 "항상 무언가는 반환"하게 만든다.
const catMeta = (k: string) => POST_CATEGORIES.find((c) => c.key === k) || POST_CATEGORIES[3];

/**
 * ProjectBoard — 팀 게시판 메인 컴포넌트.
 * 매개변수: 없음.
 * 반환값: 게시판 전체 UI를 담은 ReactElement.
 * 부수효과: 마운트/사용자 변경 시 팀·글·댓글을 비동기 로드하고, 작성/수정/삭제 시 서버 갱신.
 *   ("마운트" = 이 컴포넌트가 화면에 처음 나타나는 순간. "부수효과" = 화면 그리기 외에 일어나는 일, 예: 서버 호출.)
 */
const ProjectBoard = (): ReactElement => {
  // 인증 컨텍스트에서 필요한 값만 골라 꺼낸다(구조 분해 할당).
  //   user: 로그인 사용자(없으면 null). profile: 추가 프로필 정보. isAdmin: 관리자면 true.
  const { user, profile, isAdmin } = useAuth();
  // 토스트 알림 표시 함수
  const { showToast } = useToast();
  // ── useState 사용법: const [값, 값을바꾸는함수] = useState(초깃값);
  //    값을바꾸는함수(set...)를 호출해야만 React가 화면을 다시 그린다. 직접 값을 바꾸면 안 된다.
  //    <Team | null> 같은 꺾쇠는 TS 타입 지정: "Team 또는 null이 들어갈 수 있다"는 의미.
  const [team, setTeam] = useState<Team | null>(null);        // 현재 선택/소속된 팀
  const [allTeams, setAllTeams] = useState<Team[]>([]);       // 관리자용: 전체 팀 목록 (Team[] = Team 배열)
  const [posts, setPosts] = useState<TeamPost[]>([]);         // 현재 팀의 글 목록
  const [comments, setComments] = useState<TeamComment[]>([]); // 현재 팀의 댓글 목록(전 글 합산)
  const [loading, setLoading] = useState(true);               // 초기 로딩 스피너 표시 여부(처음엔 true)
  const [busy, setBusy] = useState(false);                    // 등록/수정 처리 중(버튼 비활성화로 중복 클릭 방지)
  const [filter, setFilter] = useState<'all' | PostCategory>('all'); // 카테고리 필터 상태('all' 또는 특정 카테고리)

  // --- 새 글 작성 폼 상태 ---
  // 폼의 각 입력칸마다 별도 상태를 둔다. 입력칸이 바뀔 때마다 set...으로 갱신해 화면과 값을 일치시킨다.
  //   (이런 방식을 "제어 컴포넌트"라 한다: 입력값의 진짜 출처가 React 상태이고, input은 그걸 비추기만 함.)
  const [category, setCategory] = useState<PostCategory>('note'); // 작성 글의 카테고리(기본: 회의록 'note')
  const [title, setTitle] = useState('');           // 제목 입력값
  const [content, setContent] = useState('');       // 본문 입력값
  const [showCode, setShowCode] = useState(false);  // 소스코드 첨부 입력칸 표시 여부
  const [code, setCode] = useState('');             // 소스코드 입력값
  const [linkUrl, setLinkUrl] = useState('');       // 자료 링크 URL 입력값
  // 댓글은 글마다 입력칸이 다르므로, "글 ID → 그 글의 댓글 입력값" 형태의 객체(맵)로 한꺼번에 관리한다.
  //   Record<string, string> = "문자열 키와 문자열 값"으로 이루어진 객체 타입.
  const [commentText, setCommentText] = useState<Record<string, string>>({}); // 글 ID별 댓글 입력값
  const [showGuide, setShowGuide] = useState(false);     // 자료 정리 안내(접이식) 펼침 여부
  const [showResources, setShowResources] = useState(false); // 자료 모아보기(접이식) 펼침 여부
  // 수정 중인 글 하나를 담는다. null이면 "지금 수정 중인 글 없음". 값이 있으면 그 글을 편집 폼으로 보여준다.
  //   TeamPostEdit & { id: string } = 수정 가능한 필드들 + id를 합친 타입(& 는 두 타입 합치기).
  const [edit, setEdit] = useState<(TeamPostEdit & { id: string }) | null>(null); // 수정 중인 글(없으면 null)

  // 글/댓글 작성 시 표시할 작성자명.
  //   ?. (옵셔널 체이닝): profile이 null/undefined여도 오류 없이 undefined를 돌려준다(앱이 죽지 않게).
  //   || : 앞 값이 비어(undefined/null/'')있으면 다음 후보로 넘어간다 → 이름 → 표시명 → 이메일 → '수강생' 순 폴백.
  const authorName = profile?.name || profile?.display_name || user?.email || '수강생';

  /**
   * loadBoard — 주어진 팀의 글과 댓글을 한꺼번에 로드해 상태에 반영.
   * 매개변수: t — 대상 팀(없으면 목록을 비움).
   * 반환값: Promise<void>. (async 함수는 항상 Promise를 반환한다. void = 의미 있는 반환값 없음.)
   * 부수효과: posts/comments 상태 갱신.
   */
  const loadBoard = async (t: Team | null) => {
    // t가 있으면 서버에서 글·댓글을 가져와 상태에 넣는다. await로 응답을 기다린 뒤 set...을 호출.
    if (t) { setPosts(await listTeamPosts(t.id)); setComments(await listTeamComments(t.id)); }
    // t가 없으면(팀 미선택) 화면을 빈 목록으로 비운다. (이전 팀의 글이 남아 보이는 것을 방지)
    else { setPosts([]); setComments([]); }
  };

  /**
   * load — 팀 목록을 조회하고 현재 사용자에 맞는 팀을 선택해 게시판을 로드.
   * - 관리자: 모든 팀을 받아 allTeams에 저장, 기존 선택 팀 유지 또는 첫 팀을 기본 선택.
   * - 일반 사용자: findMyTeam으로 본인 소속 팀만 찾아 로드.
   * 의존성: user, isAdmin (team 변경은 의도적으로 제외 — exhaustive-deps 비활성화 처리).
   * 반환값: Promise<void>. 부수효과: loading/team/allTeams/posts/comments 갱신.
   *
   * useCallback 설명: 함수를 "기억(메모이즈)"해 두었다가, 의존성 배열([user, isAdmin])의 값이
   *   바뀔 때만 새로 만든다. 이렇게 하면 아래 useEffect가 매 렌더마다 불필요하게 재실행되는 것을 막는다.
   */
  const load = useCallback(async () => {
    if (!user) return; // 비로그인 시 아무 것도 하지 않음(서버를 호출할 이유가 없음)
    setLoading(true);  // 로딩 시작 → 스피너 표시
    const teams = await listTeams(); // 전체 팀 목록을 서버에서 가져온다(권한에 따라 보이는 범위는 RLS가 결정).
    if (isAdmin) {
      // 관리자: 모든 팀 열람 (기본 첫 팀)
      setAllTeams(teams);
      // 이전에 보던 팀이 있으면 유지, 없으면 첫 팀, 그것도 없으면 null.
      //   team?.id: team이 null이어도 안전하게 접근(옵셔널 체이닝). teams[0]: 배열 첫 요소(없으면 undefined).
      const cur = teams.find((t) => t.id === team?.id) || teams[0] || null;
      setTeam(cur);
      await loadBoard(cur); // 선택된 팀의 글·댓글 로드
    } else {
      // 일반 사용자: 본인이 멤버로 속한 팀만 조회
      const mine = findMyTeam(teams, user.id);
      setTeam(mine);
      await loadBoard(mine);
    }
    setLoading(false); // 로딩 끝 → 스피너 숨김
    // 아래 줄: team을 의존성에 넣으면 팀을 고를 때마다 load 전체가 다시 실행돼 무한 루프 위험이 있어 일부러 제외.
    //   그래서 ESLint의 "의존성 빠짐" 경고를 이 줄에서만 끈다(eslint-disable-next-line).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);
  // useEffect: 화면이 그려진 뒤 실행되는 "부수효과" 실행기. 두 번째 인자 [load]가 바뀔 때마다 다시 실행된다.
  //   load는 user/isAdmin이 바뀔 때만 새로 만들어지므로 → 마운트 시 + 로그인/권한 변경 시 게시판을 로드한다.
  useEffect(() => { load(); }, [load]);

  /**
   * selectTeam — (관리자 전용) 드롭다운에서 팀을 바꿀 때 해당 팀으로 전환하고 게시판 재로드.
   * 매개변수: id — 선택한 팀 ID. 반환값: Promise<void>. 부수효과: team/posts/comments 갱신.
   */
  const selectTeam = async (id: string) => {
    // allTeams에서 선택한 id와 같은 팀을 찾는다. 못 찾으면 null(=비정상 선택 방어).
    const t = allTeams.find((x) => x.id === id) || null;
    setTeam(t);
    await loadBoard(t);
  };

  /**
   * refresh — 현재 팀의 글/댓글만 다시 조회(로딩 스피너 없이 새로고침).
   *   글을 쓰거나 지운 직후, 화면을 최신 상태로 맞추기 위해 호출한다. 스피너를 띄우지 않아 깜빡임이 적다.
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
    if (!team) return; // 팀이 없으면 어디에 글을 쓸지 모르므로 중단.
    // trim(): 앞뒤 공백 제거. 공백만 친 제목을 "빈 제목"으로 취급해 막는다.
    if (!title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true); // 등록 버튼 비활성화(처리 중 표시)
    // user!: TS의 non-null 단언("null 아님을 내가 보장"). load 단계에서 로그인이 보장된 뒤 호출되므로 안전.
    //   주의: !는 컴파일 단계의 약속일 뿐 실제 검사를 하지 않으니, 정말 보장될 때만 써야 한다.
    // showCode가 false면 코드 본문은 빈 문자열로 보냄(코드를 첨부하지 않음).
    const res = await createTeamPost(team.id, user!.id, authorName, title.trim(), content.trim(), category, showCode ? code : '', linkUrl.trim());
    setBusy(false); // 응답이 왔으니 버튼 다시 활성화
    // res.ok가 true면 성공: 폼 입력값들을 초기화하고, 성공 토스트 후 목록을 새로고침.
    if (res.ok) { setTitle(''); setContent(''); setCode(''); setShowCode(false); setLinkUrl(''); setCategory('note'); showToast('글이 등록되었습니다.', 'success'); refresh(); }
    // 실패하면 서버가 준 에러 메시지를 붙여 안내(res.error가 없으면 빈 문자열).
    else showToast('등록 실패: ' + (res.error || ''), 'error');
  };

  /**
   * startEdit — 특정 글을 수정 모드로 진입(폼에 기존 값 채움).
   * 매개변수: p — 수정할 글. 반환값: 없음. 부수효과: edit 상태 설정.
   * null 가능 필드(content/category/code/link_url)는 안전한 기본값으로 보정.
   *   (DB 컬럼은 비어 있으면 null일 수 있는데, input의 value에는 null을 넣으면 경고가 나므로 ''로 바꿔준다.)
   */
  const startEdit = (p: TeamPost) => setEdit({
    id: p.id, title: p.title, content: p.content || '',
    // as PostCategory: "이 문자열을 PostCategory 타입으로 취급하라"는 TS 형변환(값 자체는 안 바뀜).
    category: (p.category || 'note') as PostCategory, code: p.code || '', link_url: p.link_url || '',
  });

  /**
   * handleUpdate — 수정 중인 글을 서버에 반영.
   * 매개변수: 없음(edit 상태 사용). 반환값: Promise<void>.
   * 부수효과: 성공 시 수정 모드 종료 + 토스트 + 새로고침, 실패 시 에러 토스트.
   * 엣지케이스: edit이 없으면 무시, 제목 공백이면 경고 후 중단.
   */
  const handleUpdate = async () => {
    if (!edit) return; // 수정 중인 글이 없으면 할 일 없음.
    if (!edit.title.trim()) { showToast('제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    // 구조 분해 + 나머지(rest): id는 따로 꺼내고, 나머지 모든 필드는 patch 객체로 묶는다.
    //   서버에는 "어떤 글(id)을 / 무엇으로(patch) 바꿀지"를 분리해서 전달한다.
    const { id, ...patch } = edit;
    // ...patch로 기존 값들을 펼친 뒤, 문자열 필드 3개만 trim한 값으로 덮어쓴다(불변성: 원본 patch를 직접 수정하지 않음).
    const res = await updateTeamPost(id, { ...patch, title: patch.title.trim(), content: patch.content.trim(), link_url: patch.link_url.trim() });
    setBusy(false);
    if (res.ok) { setEdit(null); showToast('수정되었습니다.', 'success'); refresh(); } // null로 만들면 편집 폼이 닫힌다.
    else showToast('수정 실패: ' + (res.error || ''), 'error');
  };

  /**
   * handleDelete — 글을 삭제(브라우저 confirm으로 확인).
   * 매개변수: p — 삭제할 글. 반환값: Promise<void>.
   * 부수효과: 확인 시 서버 삭제 + 토스트 + 새로고침. 취소하면 아무 동작 없음.
   */
  const handleDelete = async (p: TeamPost) => {
    // confirm: 브라우저 기본 확인창. "확인"을 누르면 true. 취소면 false → return으로 중단.
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
    // commentText[postId]: 이 글의 입력값. 아직 입력한 적 없으면 undefined이므로 || ''로 빈 문자열 보정 후 trim.
    const text = (commentText[postId] || '').trim();
    if (!text || !team) return; // 내용이 비었거나 팀이 없으면 등록하지 않음.
    // 마지막 인자 isAdmin: 관리자가 단 댓글이면 서버에 is_staff=true로 기록 → 화면에 '강사' 배지가 붙는다.
    const res = await createTeamComment(postId, team.id, user!.id, authorName, text, isAdmin);
    // 성공 시: 다른 글의 입력값은 그대로 두고(...p로 복사), 현재 글(postId)의 입력칸만 ''로 비운다.
    //   주의: setCommentText에 함수를 넘기면(p => ...) "가장 최신 상태"를 기준으로 갱신해 경쟁 상태를 피한다.
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

  // members — 팀의 멤버 배열을 안전하게 반환하는 도우미.
  //   Array.isArray: 진짜 배열인지 검사. 데이터가 깨져 members가 배열이 아니면 .map에서 오류 나므로 빈 배열로 방어.
  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);
  // shown — 현재 필터에 따라 보여줄 글 목록. 'all'이면 전체, 아니면 카테고리 일치 글만 추린다.
  //   (p.category || 'note'): 카테고리가 비어 있는 옛 글은 기본값 'note'로 간주해 필터링한다.
  const shown = filter === 'all' ? posts : posts.filter((p) => (p.category || 'note') === filter);
  // safeUrl — 입력된 URL이 http(s)로 시작하지 않으면 https:// 를 붙여 안전한 링크로 보정.
  //   정규식 /^https?:\/\//i 의미: ^시작에서 → http 뒤에 s가 0~1개(http 또는 https) → :// 가 오는지. i = 대소문자 무시.
  //   주의: 'naver.com'처럼 프로토콜이 없으면 브라우저가 상대경로로 오해하므로 https://를 붙여준다.
  //   백틱(`...`)은 문자열 안에 ${u} 같은 변수를 끼워 넣는 "템플릿 리터럴"이다.
  const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
  // linkPosts — 자료 링크가 채워진 글만 추려 '자료 모아보기' 섹션에 사용.
  const linkPosts = posts.filter((p) => (p.link_url || '').trim());

  // --- 공통 인라인 스타일 정의(CSS 변수 기반 테마 사용) ---
  //   var(--xxx): CSS 변수. 다크모드 등 테마에 따라 실제 색이 바뀌도록 값 대신 변수 이름을 쓴다.
  //   객체로 만들어 두면 아래 JSX에서 style={card}처럼 재사용하거나 {...card}로 펼쳐 합칠 수 있다.
  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)' };
  const input: CSSProperties = { width: '100%', padding: '11px 13px', fontSize: '15px', boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' };
  // chip — 카테고리/필터용 칩(둥근 태그) 버튼 스타일을 만드는 "함수". active 여부(선택됨)에 따라 색을 다르게 반환.
  //   삼항연산자(조건 ? A : B): active면 A(파란 배경/흰 글씨), 아니면 B(연한 테두리)로 분기.
  const chip = (active: boolean): CSSProperties => ({ padding: '7px 13px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px', border: '1px solid', borderColor: active ? 'var(--primary-blue)' : 'var(--border-light)', background: active ? 'var(--primary-blue)' : 'var(--bg-white)', color: active ? '#fff' : 'var(--text-secondary)' });

  // 여기서부터 return 안이 실제 화면(JSX)이다. <> ... </>는 "Fragment": 여러 요소를 감싸되 화면에 div를 추가하지 않는 빈 껍데기.
  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 페이지 메타 정보. 팀 전용 비공개 페이지라 검색에 안 잡히게 한다. */}
      <SEOHead title="프로젝트 관리" path="/project-board" noindex />
      <section className="page-header">
        <div className="container">
          <h2>프로젝트 관리</h2>
          <p>우리 팀 전용 게시판입니다. 회의록·아이디어·자료 링크·소스코드를 남기고 댓글로 의견을 나누세요. 강사 피드백도 댓글로 확인할 수 있어요. (팀원과 관리자만 볼 수 있습니다)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '820px' }}>
          {/* 로딩 중 → 스피너 / 팀 없음 → 안내 / 팀 있음 → 게시판 본문 의 3분기 렌더링.
              JSX에서 {조건 ? A : 조건2 ? B : C} 형태는 "조건에 따라 A/B/C 중 하나만 그린다"는 뜻이다. */}
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
              {/* 관리자: 팀 선택 드롭다운 (모든 팀 열람). {isAdmin && (...)}: isAdmin이 true일 때만 뒤 요소를 그린다. */}
              {isAdmin && (
                <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>👑 관리자 — 팀 선택</span>
                  {/* select의 value를 현재 팀 id로 묶고(=제어 컴포넌트), 바뀌면 selectTeam으로 해당 팀 게시판 전환. */}
                  <select value={team.id} onChange={(e) => selectTeam(e.target.value)} style={{ ...input, width: 'auto', flex: 1, minWidth: '200px' }}>
                    {/* .map: 배열의 각 팀을 <option> 요소로 변환해 목록을 만든다. key는 React가 항목을 구분하는 고유값(필수). */}
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
                  {/* members(team): 위에서 만든 안전 도우미로 멤버 배열을 받아 각 멤버를 배지로 그린다. i는 순번(인덱스). */}
                  {members(team).map((m, i) => (
                    // 역할이 '팀장'이면 노란 배지 + 왕관 이모지로 강조. (배경/글자색을 삼항연산자로 분기)
                    <span key={i} style={{ fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: m.role === '팀장' ? '#fef3c7' : 'var(--bg-light-gray)', color: m.role === '팀장' ? '#92400e' : 'var(--text-secondary)' }}>{m.role === '팀장' ? '👑 ' : ''}{m.name}</span>
                  ))}
                </div>
              </div>

              {/* 자료 정리 안내 (접이식) */}
              <div style={{ ...card, padding: '14px 18px', background: 'var(--bg-light-gray)', borderStyle: 'dashed' }}>
                {/* 클릭하면 showGuide를 반대로 뒤집어(toggle) 안내를 펼치거나 접는다.
                    (v) => !v: "현재 값의 반대"로 갱신. 최신 상태 기준으로 안전하게 토글하는 패턴. */}
                <button type="button" onClick={() => setShowGuide((v) => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, padding: 0 }}>
                  <span>📚 프로젝트 자료, 이렇게 정리하세요</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{showGuide ? '▲' : '▼'}</span>
                </button>
                {/* 펼쳐졌을 때만(showGuide가 true일 때만) 안내 본문 렌더링 */}
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

              {/* 자료 모아보기 (링크가 있는 글만). linkPosts.length > 0: 자료 글이 하나라도 있을 때만 이 섹션을 그린다. */}
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
                        // 새 탭으로 안전한 URL 열기. target="_blank"=새 탭, rel="noopener noreferrer"=새 탭이
                        //   원래 페이지를 조작하지 못하게 막는 보안 설정(외부 링크 열 때 권장).
                        <a key={p.id} href={safeUrl(p.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', textDecoration: 'none', color: 'var(--text-primary)' }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>🔗</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            {/* 제목/URL이 길면 말줄임(...) 처리: overflow:hidden + textOverflow:ellipsis + whiteSpace:nowrap 3종 세트. */}
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
                  {/* 카테고리 선택 칩들. chip(category === c.key)로 "지금 고른 칩"만 active(파란) 스타일을 받는다. */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(category === c.key)} onClick={() => setCategory(c.key)}>{c.emoji} {c.label}</button>)}
                  </div>
                  {/* value와 onChange를 함께 두는 "제어 컴포넌트": 입력할 때마다 상태(title)를 갱신하고, 화면은 그 상태를 비춘다. */}
                  <input style={input} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용 (회의록, 역할 분담, 아이디어 정리, 진행 상황 등)" value={content} onChange={(e) => setContent(e.target.value)} />
                  <input style={{ ...input, fontSize: '14px' }} placeholder="🔗 자료 링크 (선택) — 구글드라이브·노션·깃허브·피그마 URL" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                  {/* 소스코드 첨부: 미표시 상태면 추가 버튼, 표시 상태면 모노스페이스(코드용 고정폭) 입력칸을 보여준다. */}
                  {!showCode ? (
                    <button type="button" onClick={() => setShowCode(true)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{'</> 소스코드 첨부'}</button>
                  ) : (
                    <textarea style={{ ...input, minHeight: '120px', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-light-gray)' }} placeholder="소스코드를 붙여넣으세요" value={code} onChange={(e) => setCode(e.target.value)} />
                  )}
                  {/* disabled={busy}: 처리 중일 땐 버튼을 비활성화해 같은 글이 두 번 등록되는 것을 막는다. */}
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handlePost}>등록</button>
                </div>
              </div>

              {/* 카테고리 필터 칩 줄: '전체' + 각 카테고리별 글 개수 표시 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button type="button" style={chip(filter === 'all')} onClick={() => setFilter('all')}>전체 {posts.length}</button>
                {/* 각 카테고리마다 해당 글 개수(n)를 미리 세서 라벨 옆에 보여준다.
                    .map 콜백 안에서 중괄호 {}와 return을 쓰면 "한 줄 표현식"이 아닌 여러 문장을 쓸 수 있다. */}
                {POST_CATEGORIES.map((c) => { const n = posts.filter((p) => (p.category || 'note') === c.key).length; return <button key={c.key} type="button" style={chip(filter === c.key)} onClick={() => setFilter(c.key)}>{c.emoji} {c.label} {n}</button>; })}
              </div>

              {/* 글 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 필터 결과(shown)가 없으면 빈 안내, 있으면 각 글을 카드로 렌더링 */}
                {shown.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>아직 글이 없습니다. 첫 글을 남겨보세요.</p>
                ) : shown.map((p) => {
                  const cm = catMeta(p.category || 'note');                    // 카테고리 메타(배지용 이모지·라벨)
                  const postComments = comments.filter((c) => c.post_id === p.id); // 전체 댓글 중 이 글(p.id)에 달린 것만 추출
                  return (
                    <div key={p.id} style={card}>
                      {/* 이 글이 수정 모드면(edit?.id === p.id) 편집 폼, 아니면 읽기 뷰 표시.
                          edit?.id: edit이 null이어도 안전하게 .id 접근(옵셔널 체이닝). */}
                      {edit?.id === p.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* 수정 폼: setEdit((s) => s && { ...s, ... }) 패턴.
                              s && {...}: s가 null이면 null 그대로(가드), 아니면 기존 값(...s)을 복사해 일부만 바꾼다.
                              → 불변성 유지: 원본 객체를 직접 수정하지 않고 "새 객체"를 만들어 넣는다. */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {POST_CATEGORIES.map((c) => <button key={c.key} type="button" style={chip(edit.category === c.key)} onClick={() => setEdit((s) => s && { ...s, category: c.key })}>{c.emoji} {c.label}</button>)}
                          </div>
                          <input style={input} placeholder="제목" value={edit.title} onChange={(e) => setEdit((s) => s && { ...s, title: e.target.value })} />
                          <textarea style={{ ...input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="내용" value={edit.content} onChange={(e) => setEdit((s) => s && { ...s, content: e.target.value })} />
                          <input style={{ ...input, fontSize: '14px' }} placeholder="🔗 자료 링크 (선택)" value={edit.link_url} onChange={(e) => setEdit((s) => s && { ...s, link_url: e.target.value })} />
                          <textarea style={{ ...input, minHeight: '110px', resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', lineHeight: 1.5, background: 'var(--bg-light-gray)' }} placeholder="소스코드 (선택)" value={edit.code} onChange={(e) => setEdit((s) => s && { ...s, code: e.target.value })} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ padding: '9px 20px' }} disabled={busy} onClick={handleUpdate}>저장</button>
                            {/* 취소: 수정 상태 해제(setEdit(null)) → 읽기 뷰로 돌아간다. */}
                            <button type="button" style={{ padding: '9px 20px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setEdit(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                      <>
                      {/* 읽기 뷰: 카테고리 배지 + 제목, 그리고 본인 글/관리자면 수정·삭제 버튼 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '17px' }}><span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)', marginRight: '8px' }}>{cm.emoji} {cm.label}</span>{p.title}</h4>
                        {/* 권한 체크: 글 작성자 본인(author_id === user?.id) 또는 관리자에게만 수정/삭제 버튼을 보여준다.
                            주의: 이건 "화면 편의"일 뿐, 진짜 보안은 서버의 RLS가 막는다(버튼을 숨겨도 DB가 한 번 더 검사). */}
                        {(p.author_id === user?.id || isAdmin) && (
                          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button onClick={() => startEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', fontSize: '13px' }}>수정</button>
                            <button onClick={() => handleDelete(p)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>삭제</button>
                          </div>
                        )}
                      </div>
                      {/* 작성자명 + 작성 일시. new Date(...).toLocaleString('ko-KR'): 저장된 시각을 한국식 날짜·시간 문자열로 변환. */}
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{p.author_name} · {new Date(p.created_at).toLocaleString('ko-KR')}</div>
                      {/* 본문: 내용이 있을 때만 표시. whiteSpace:'pre-wrap' = 입력한 줄바꿈/공백을 그대로 보존해 보여준다. */}
                      {p.content && <p style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{p.content}</p>}
                      {/* 소스코드: 코드가 있을 때만 다크 테마 코드블록(<pre>)으로 표시. pre는 들여쓰기·줄바꿈을 그대로 살린다. */}
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
                        {/* 이 글의 댓글들을 하나씩 그린다. */}
                        {postComments.map((c) => (
                          // 강사(is_staff) 댓글이면 노란 배경으로 강조.
                          //   ...(조건 ? {추가스타일} : {}): 조건이 참일 때만 추가 스타일을 펼쳐 합치는 패턴.
                          <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline', padding: '5px 0', fontSize: '14px', ...(c.is_staff ? { background: '#fffbeb', borderRadius: '8px', padding: '7px 10px', margin: '3px 0' } : {}) }}>
                            <strong style={{ fontSize: '13px', flexShrink: 0 }}>
                              {/* 강사 댓글에는 '강사' 배지 표시(c.is_staff가 true일 때만). */}
                              {c.is_staff && <span style={{ fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: '#fde68a', color: '#92400e', marginRight: '6px' }}>👩‍🏫 강사</span>}
                              {c.author_name}
                            </strong>
                            <span style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{c.content}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                            {/* 댓글 작성자 본인 또는 관리자만 삭제 버튼(✕) 노출(글 권한과 동일한 원리). */}
                            {(c.author_id === user?.id || isAdmin) && <button onClick={() => handleDeleteComment(c)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>✕</button>}
                          </div>
                        ))}
                        {/* 댓글 입력칸: 글 ID별로 입력값을 분리 관리(commentText[p.id]). Enter 키로도 등록 가능. */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {/* onKeyDown: 키를 누를 때 호출. e.key === 'Enter' 이면(엔터키) 그 글에 댓글 등록.
                              && 의 단축평가: 앞이 false면 뒤(handleComment)는 실행되지 않는다. */}
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

// 이 파일의 기본 export. 다른 파일에서 import ProjectBoard from '...' 로 가져와 라우터에 연결한다.
export default ProjectBoard;
