/**
 * ProjectVote.tsx — 프로젝트 주제 투표 및 팀 구성 페이지
 *
 * [역할]
 *  - 수강생이 프로젝트 주제(프리셋 + 학생 제안)에 투표하고, 관심사가 같은 사람끼리
 *    바로 팀을 만들거나 합류할 수 있게 해주는 화면이다.
 *  - 각 주제 카드에서 투표 현황(득표수/투표자), 팀 결성 현황(팀원/팀장)을 보여주고
 *    투표·팀 생성·합류·탈퇴·팀장 신청/초기화·주제 추가/삭제 액션을 처리한다.
 *
 * [핵심 책임]
 *  - 투표는 1인 1표(같은 주제를 다시 누르면 취소). 팀 신청은 중복 허용(여러 주제 참여 가능).
 *  - 팀장은 선착순: 가장 먼저 '팀장 신청'을 누른 한 명이 팀장이 되고, 이후 변경은 강사만 가능.
 *  - 강사(isAdmin) 계정은 팀에 포함되지 않으며, 팀장 확정/초기화 등 관리 권한만 가진다.
 *  - 데이터 영속화는 utils/projectVote, utils/projectTeams를 통해 Supabase에 위임.
 *
 * [주요 export]
 *  - default ProjectVote: 이 페이지 컴포넌트.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * [초보자를 위한 배경 지식]
 *  - 이 파일은 "리액트 컴포넌트(React Component)" 하나다. 컴포넌트란 화면의 한 조각을
 *    만들어내는 함수라고 생각하면 된다. 이 함수가 끝에서 "이렇게 그려줘"라는 설계도(JSX)를
 *    return 하면, 리액트가 그걸 실제 웹 화면으로 바꿔준다.
 *  - JSX: 자바스크립트 안에 HTML처럼 생긴 코드를 쓸 수 있게 해주는 문법. <div>...</div> 같은 것.
 *    JSX 안에서 자바스크립트 값을 넣고 싶으면 {중괄호}로 감싼다. 예: {votes.length}
 *  - "상태(state)": 화면에 보여줄, 시간이 지나면서 바뀌는 데이터(예: 투표 목록). 상태가 바뀌면
 *    리액트가 화면을 자동으로 다시 그린다. 상태는 useState 라는 도구로 만든다.
 *  - "훅(hook)": use로 시작하는 특수 함수들(useState, useEffect 등). 리액트의 기능을
 *    컴포넌트 안에서 빌려 쓰게 해준다.
 *  - ".tsx": 타입스크립트(TypeScript) + JSX 라는 뜻. 타입스크립트는 자바스크립트에 "타입"
 *    (이 값은 문자열, 저 값은 숫자 등)을 붙여 실수를 미리 잡아주는 언어다.
 *  - Supabase: 우리 데이터(투표·팀 정보 등)를 저장해 두는 클라우드 데이터베이스 서비스.
 *    이 파일은 DB에 직접 말을 걸지 않고, utils 파일의 함수들에게 "대신 처리해줘"라고 시킨다.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── import: 다른 파일에서 만들어 둔 기능들을 이 파일로 가져오는 구문 ──
// 리액트의 기본 훅들과, 타입 표기에 쓰는 ReactElement 타입을 가져온다.
// (type 키워드가 붙은 import는 "값이 아니라 타입만" 가져온다는 뜻 → 빌드 시 실제 코드로 남지 않음)
import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
// Link: 페이지 새로고침 없이 다른 경로로 이동하게 해주는 컴포넌트(라우터의 <a> 태그라고 보면 됨).
import { Link } from 'react-router-dom';
// useAuth: 현재 로그인한 사용자 정보(user, profile)와 강사 여부(isAdmin)를 알려주는 우리 훅.
import { useAuth } from '../contexts/AuthContext';
// useToast: 화면 모서리에 잠깐 뜨는 알림 메시지("투표 완료!" 등)를 띄우는 우리 훅.
import { useToast } from '../contexts/ToastContext';
// SEOHead: 페이지 제목/검색엔진 설정 등을 넣어주는 컴포넌트.
import SEOHead from '../components/SEOHead';
// PRESET_TOPICS: 미리 정해 둔 기본 주제 목록(상수 데이터).
import { PRESET_TOPICS } from '../data/projectTopics';
// 투표/주제 관련 DB 작업 함수들과, 그 데이터 모양을 나타내는 타입들을 가져온다.
import {
  listCustomTopics, listVotes, addTopic, deleteTopic, castVote, retractVote,
  type CustomTopic, type TopicVote,
} from '../utils/projectVote';
// 팀 관련 DB 작업 함수들과 팀 정원 상수(MAX_TEAM_SIZE)를 가져온다.
import {
  listTeams, createTeam, joinTeam, leaveTeam, MAX_TEAM_SIZE,
  claimLeader, resetLeaders,
} from '../utils/projectTeams';
// Team, TeamMember: 팀 한 개와 팀원 한 명의 데이터 모양을 정의한 타입.
import type { Team, TeamMember } from '../types';

// interface: "이런 모양의 객체"라고 약속하는 타입 정의. 여기서는 화면의 주제 카드 한 줄(Row)을 표현한다.
// 프리셋 주제와 학생 제안 주제를 하나의 공통 모양으로 합쳐서 다루기 위해 만든 타입이다.
interface Row {
  key: string;          // 이 주제를 구별하는 고유 키(프리셋은 t.key, 학생 제안은 그 주제의 id)
  title: string;        // 주제 제목
  description: string;  // 주제 한 줄 설명
  isPreset: boolean;    // true면 미리 정해진 주제, false면 학생이 제안한 주제
  ownerId?: string;     // ?는 "없을 수도 있음(선택)"이라는 뜻. 학생 제안 주제를 만든 사람의 id
}

// 컴포넌트 본체. 화살표 함수로 정의했고, 반환 타입이 ReactElement(= 화면 한 조각)임을 명시했다.
const ProjectVote = (): ReactElement => {
  // useAuth() 훅에서 필요한 값만 골라 꺼낸다(구조 분해 할당).
  // user: 로그인 계정(없으면 비로그인), profile: 이름·이메일 등 프로필, isAdmin: 강사 여부.
  const { user, profile, isAdmin } = useAuth();
  // 알림 메시지를 띄우는 함수.
  const { showToast } = useToast();

  // ── 상태(state) 선언들 ──
  // useState(초깃값)은 [현재값, 값을바꾸는함수] 한 쌍을 돌려준다.
  // setXxx를 호출해 값을 바꾸면 화면이 자동으로 다시 그려진다. (직접 custom = ... 처럼 바꾸면 안 됨)
  const [custom, setCustom] = useState<CustomTopic[]>([]); // 학생들이 제안한 주제 목록(처음엔 빈 배열)
  const [votes, setVotes] = useState<TopicVote[]>([]);     // 전체 투표 목록
  const [teams, setTeams] = useState<Team[]>([]);          // 전체 팀 목록
  const [loading, setLoading] = useState(true);            // 데이터를 불러오는 중인가? (true면 로딩 표시)
  const [busy, setBusy] = useState(false);                 // 어떤 작업(투표/합류 등)을 처리 중인가? (중복 클릭 방지용)
  const [newTitle, setNewTitle] = useState('');            // '새 주제 제안' 입력칸의 제목 값
  const [newDesc, setNewDesc] = useState('');              // '새 주제 제안' 입력칸의 설명 값

  // 화면/저장에 쓸 내 표시 이름을 정한다.
  // ?. (옵셔널 체이닝): 앞 값이 없으면(undefined/null) 에러 없이 그냥 undefined가 된다.
  // || (OR): 왼쪽이 "비어 있으면"(빈문자열/undefined 등) 오른쪽 값을 쓴다.
  // 즉 name → display_name → 이메일 순으로 우선 시도하고, 다 없으면 '수강생'으로 보여준다.
  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  // me(): 나 자신을 "팀원 한 명(TeamMember)" 모양의 객체로 만들어 주는 도우미 함수.
  // 팀을 만들거나 합류할 때 "나"를 어떤 역할(role)로 넣을지 정해서 넘기는 데 쓴다.
  // 주의: user!.id 의 느낌표(!)는 "user가 절대 null이 아님을 내가 보장한다"는 타입스크립트 표시다.
  //       이 함수는 로그인한 상태에서만 호출되므로 안전하지만, 비로그인 때 부르면 오류가 난다.
  const me = (role: string): TeamMember => ({
    id: user!.id, name: userName, email: profile?.email || user?.email || '', role,
  });

  // reload(): 서버에서 최신 데이터(학생 주제·투표·팀)를 한꺼번에 다시 불러와 상태에 채우는 함수.
  // useCallback: 이 함수를 매 렌더마다 새로 만들지 않고 기억(메모)해 둔다. 의존성 []가 비어 있어
  //              항상 같은 함수를 재사용한다. (아래 useEffect의 의존성으로 쓰이므로 안정성이 중요)
  const reload = useCallback(async () => {
    setLoading(true); // 로딩 표시 켜기
    // Promise.all: 세 개의 비동기 요청을 "동시에" 보내고, 셋 다 끝날 때까지 기다린다(하나씩 기다리지 않음 → 빠름).
    // await: 비동기 작업이 끝날 때까지 잠시 멈춰 결과를 기다리라는 뜻. (async 함수 안에서만 쓸 수 있음)
    const [c, v, t] = await Promise.all([listCustomTopics(), listVotes(), listTeams()]);
    setCustom(c); setVotes(v); setTeams(t); // 받아온 결과로 각 상태 갱신
    setLoading(false); // 로딩 표시 끄기
  }, []);

  // useEffect: "렌더링 외의 부수효과(데이터 불러오기 등)"를 실행하는 훅.
  // 두 번째 인자 [reload]는 "의존성 배열"로, 그 안의 값이 바뀔 때만 다시 실행된다.
  // reload는 useCallback으로 고정돼 있어 사실상 화면이 처음 뜰 때 딱 한 번만 reload()가 돈다.
  useEffect(() => { reload(); }, [reload]);

  // myVoteKey: 내가 투표한 주제의 key(투표 안 했으면 undefined).
  // useMemo: 계산 결과를 기억해 두고, 의존성([votes, user])이 바뀔 때만 다시 계산한다(불필요한 재계산 방지).
  // .find(...): 배열에서 조건에 맞는 "첫 번째" 항목을 찾는다(없으면 undefined). 그 뒤 ?.topic_key로 안전하게 꺼낸다.
  const myVoteKey = useMemo(() => votes.find((v) => v.user_id === user?.id)?.topic_key, [votes, user]);
  // 중복신청 허용: 내가 속한 팀이 여러 개일 수 있음
  // myTeams: 내가 팀원으로 들어가 있는 팀들만 골라낸 목록.
  // 비로그인(user 없음)이면 빈 배열. .filter는 조건을 만족하는 항목만 남기고, .some은 "하나라도 있나?"를 검사한다.
  // Array.isArray(...) ? ... : [] 는 members가 배열이 아닐 경우(데이터 이상)를 대비한 방어 코드다.
  const myTeams = useMemo(
    () => (user ? teams.filter((t) => (Array.isArray(t.members) ? t.members : []).some((m) => m.id === user.id)) : []),
    [teams, user],
  );

  // votersByKey: "주제 key → 그 주제에 투표한 사람 이름 배열"로 정리한 객체(빠른 조회용).
  // Record<string, string[]> = 키가 문자열이고 값이 "문자열 배열"인 객체 타입.
  const votersByKey = useMemo(() => {
    const m: Record<string, string[]> = {};
    // forEach로 모든 투표를 돌면서 해당 주제의 이름 목록에 투표자 이름을 추가한다.
    // (m[v.topic_key] ||= []) : 그 key의 배열이 아직 없으면 빈 배열을 먼저 만들고, 그 배열에 push한다.
    // user_name이 비어 있으면 '익명'으로 표시.
    votes.forEach((v) => { (m[v.topic_key] ||= []).push(v.user_name || '익명'); });
    return m;
  }, [votes]);

  // rows: 화면에 그릴 주제 카드 목록. 프리셋 주제 + 학생 제안 주제를 하나로 합치고, 득표순으로 정렬한다.
  const rows: Row[] = useMemo(() => {
    // 프리셋 주제들을 Row 모양으로 변환(.map: 각 항목을 새 모양으로 1:1 변환). isPreset: true 표시.
    const presetRows: Row[] = PRESET_TOPICS.map((t) => ({ key: t.key, title: t.title, description: t.description, isPreset: true }));
    // 학생 제안 주제들도 Row 모양으로 변환. id를 key로, 만든 사람을 ownerId로 넣고 isPreset: false 표시.
    const customRows: Row[] = custom.map((c) => ({ key: c.id, title: c.title, description: c.description, isPreset: false, ownerId: c.created_by }));
    // [...A, ...B]: 두 배열을 펼쳐 하나로 합친다(스프레드 문법).
    // .sort((a,b) => 표차이): 득표 많은 순(내림차순)으로 정렬. b의 표수에서 a의 표수를 빼서 양수면 b가 앞으로 간다.
    // 주의: sort는 원본 배열을 바꾸지만, 여기서는 새로 합친 배열에 적용하므로 원본 상태(custom 등)는 안전하다(불변성 유지).
    return [...presetRows, ...customRows].sort((a, b) => (votersByKey[b.key]?.length || 0) - (votersByKey[a.key]?.length || 0));
  }, [custom, votersByKey]);

  // padletNumByKey: 주제 key → 패들렛 번호(고정). 프리셋(p1~p7)은 1~7, 학생 제안은 그 뒤로(생성 순) 이어붙임.
  //   - 득표순 정렬(rows의 순위)과 무관하게 "주제마다 고정 번호"를 부여해 패들렛 링크가 흔들리지 않게 한다.
  const padletNumByKey = useMemo(() => {
    const m: Record<string, number> = {};
    PRESET_TOPICS.forEach((t, i) => { m[t.key] = i + 1; });               // p1→1 … p7→7
    custom.forEach((c, i) => { m[c.id] = PRESET_TOPICS.length + i + 1; }); // 학생 제안은 8,9,…
    return m;
  }, [custom]);
  // padletUrl(n): 번호를 2자리(0패딩)로 맞춰 패들렛 보드 주소 생성. 예) 1 → .../project01
  const padletUrl = (n: number) => `https://padlet.com/aebon/project${String(n).padStart(2, '0')}`;

  // members(t): 팀 t의 팀원 배열을 안전하게 꺼낸다(배열이 아니면 빈 배열로). 곳곳에서 반복되어 함수로 묶음.
  const members = (t: Team): TeamMember[] => (Array.isArray(t.members) ? t.members : []);
  // teamForTitle(title): 주제 제목과 연결된 팀을 찾는다. 양쪽 모두 .trim()으로 앞뒤 공백을 없애고 비교한다
  //                      (공백 차이로 인한 매칭 실패를 막기 위함). 없으면 undefined.
  const teamForTitle = (title: string): Team | undefined =>
    teams.find((t) => (t.project_topic || '').trim() === title.trim());

  // ── 이벤트 핸들러들: 버튼 클릭 등으로 실행되는 함수들 ──

  // handleVote(key): 주제에 투표하거나(처음) 이미 한 투표를 취소(같은 주제 재클릭)한다.
  const handleVote = async (key: string) => {
    if (!user) return; // 비로그인이면 아무것도 안 함(가드 절: 조건 안 맞으면 일찍 빠져나감)
    setBusy(true); // 처리 중 표시(버튼 비활성화로 더블클릭 방지)
    // 삼항 연산자(조건 ? A : B): 내가 이미 이 주제에 투표했다면 취소(retractVote), 아니면 새로 투표(castVote).
    const res = myVoteKey === key ? await retractVote(user.id) : await castVote(key, user.id, userName);
    setBusy(false); // 처리 끝
    // res.ok가 true면 성공. 성공 시 알림을 띄우고 reload()로 최신 데이터를 다시 불러와 화면을 갱신한다.
    if (res.ok) { showToast(myVoteKey === key ? '투표를 취소했습니다.' : '투표 완료!', 'success'); reload(); }
    else showToast('투표 실패: ' + (res.error || ''), 'error'); // 실패하면 에러 메시지(없으면 빈 문자열)
  };

  // handleCreateTeam(title): 해당 주제 제목으로 새 팀을 만들고, 만든 사람을 '팀장후보'로 넣는다.
  const handleCreateTeam = async (title: string) => {
    // 강사는 팀에 들어가지 않으므로 막고 안내만 한다.
    if (isAdmin) { showToast('강사 계정은 팀에 참여하지 않습니다. (수강생 팀 구성 전용)', 'warning'); return; }
    // 중복신청 허용: 한 사람이 여러 주제에 팀을 만들거나 합류할 수 있습니다.
    setBusy(true);
    // createTeam(팀이름, 주제, 첫멤버). 여기서는 팀이름과 주제를 둘 다 title로 쓴다.
    const res = await createTeam(title, title, me('팀장후보'));
    setBusy(false);
    // 백틱(`...`)은 템플릿 문자열로, ${ } 안에 변수 값을 끼워 넣을 수 있다.
    if (res.ok) { showToast(`'${title}' 팀이 만들어졌습니다!`, 'success'); reload(); }
    else showToast('팀 생성 실패: ' + (res.error || ''), 'error');
  };

  // handleJoin(team): 이미 있는 팀에 '팀원'으로 합류한다.
  const handleJoin = async (team: Team) => {
    if (isAdmin) { showToast('강사 계정은 팀에 참여하지 않습니다. (수강생 팀 구성 전용)', 'warning'); return; }
    setBusy(true);
    const res = await joinTeam(team, me('팀원'));
    setBusy(false);
    // 합류 실패 사유가 'full'이면 정원 초과 안내, 그 외는 일반 실패 메시지.
    if (res.ok) { showToast(`'${team.name}' 팀에 합류했습니다.`, 'success'); reload(); }
    else showToast(res.error === 'full' ? '정원이 가득 찼습니다.' : '합류 실패: ' + (res.error || ''), 'error');
  };

  // handleLeave(team): 내가 속한 팀에서 나간다.
  const handleLeave = async (team: Team) => {
    // confirm(): 브라우저 기본 확인창. "확인"을 누르면 true, "취소"면 false. 취소면 여기서 중단.
    if (!confirm(`'${team.name}' 팀에서 나가시겠습니까?`)) return;
    setBusy(true);
    const res = await leaveTeam(team, user!.id); // user!: 로그인 상태에서만 호출되므로 not-null 단언
    setBusy(false);
    if (res.ok) { showToast('팀에서 나왔습니다.', 'info'); reload(); }
    else showToast('탈퇴 실패: ' + (res.error || ''), 'error');
  };

  // handleClaimLeader(team, memberId, memberName): 특정 팀원을 팀장으로 "신청"한다.
  // 팀장은 선착순이라, 동시에 여러 명이 눌러도 서버에서 먼저 들어온 한 명만 팀장이 된다(경쟁 상황 처리).
  const handleClaimLeader = async (team: Team, memberId: string, memberName: string) => {
    // \n은 줄바꿈 문자. 확인창에 두 줄로 안내한다.
    if (!confirm(`${memberName} 님을 '${team.name}' 팀장으로 신청합니다.\n먼저 신청한 한 명이 팀장이 되며, 이후에는 강사만 변경할 수 있습니다.`)) return;
    setBusy(true);
    const res = await claimLeader(team.id, memberId); // 서버에 "이 사람을 팀장으로" 요청
    setBusy(false);
    // 성공: 축하 알림 후 갱신.
    if (res.ok) { showToast(`🎉 ${memberName} 님이 팀장이 되었습니다!`, 'success'); reload(); }
    // 'taken': 내가 누르기 직전에 다른 사람이 이미 팀장이 된 경우(선착순 경쟁에서 짐). 누가 됐는지 알려준다.
    else if (res.error === 'taken') showToast(`이미 ${res.takenBy || '다른 팀원'}님이 팀장이 되었습니다.`, 'info');
    // 그 외 실패: 에러 알림 + 최신 상태로 다시 맞춰주기 위해 reload().
    else { showToast('처리 실패: ' + (res.error || ''), 'error'); reload(); }
  };

  // handleResetLeaders(team): (강사 전용) 팀장 지정을 초기화해서 다시 뽑을 수 있게 한다.
  const handleResetLeaders = async (team: Team) => {
    if (!confirm(`'${team.name}' 팀의 팀장을 초기화할까요?`)) return;
    setBusy(true);
    const res = await resetLeaders(team);
    setBusy(false);
    if (res.ok) { showToast('팀장을 초기화했습니다.', 'info'); reload(); }
    else showToast('초기화 실패: ' + (res.error || ''), 'error');
  };

  // handleAdd(): '새 주제 제안' 입력칸의 내용으로 새 주제를 추가한다.
  const handleAdd = async () => {
    // .trim()으로 공백을 없앤 제목이 비어 있으면 추가하지 않고 경고만 한다(빈 주제 방지).
    if (!newTitle.trim()) { showToast('주제 제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const res = await addTopic(newTitle.trim(), newDesc.trim(), user!.id, userName);
    setBusy(false);
    // 성공 시 입력칸을 비우고('') 알림 후 갱신.
    if (res.ok) { setNewTitle(''); setNewDesc(''); showToast('새 주제가 추가되었습니다.', 'success'); reload(); }
    else showToast('추가 실패: ' + (res.error || ''), 'error');
  };

  // handleDeleteTopic(key): 학생 제안 주제를 삭제한다(투표도 함께 삭제됨).
  // 주의: 다른 핸들러와 달리 setBusy를 쓰지 않는다. 삭제는 확인창으로 한 번 걸러지기 때문.
  const handleDeleteTopic = async (key: string) => {
    if (!confirm('이 주제를 삭제할까요? (투표도 함께 사라집니다)')) return;
    const res = await deleteTopic(key);
    if (res.ok) { showToast('주제를 삭제했습니다.', 'info'); reload(); }
    else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  // ── 인라인 스타일 객체들 ──
  // React.CSSProperties: 자바스크립트로 CSS를 쓸 때의 타입. CSS 속성을 객체로 표현한다(예: border-radius → borderRadius).
  // var(--bg-white) 같은 건 CSS 변수로, 라이트/다크 테마에 따라 실제 색이 자동으로 바뀐다.
  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 13px', fontSize: '16px', boxSizing: 'border-box',
    border: '1px solid var(--border-light)', borderRadius: '8px',
    background: 'var(--bg-white)', color: 'var(--text-primary)',
  };
  // chip(): 작고 둥근 라벨(태그 같은 칩) 스타일을 배경색/글자색만 바꿔 만들어 주는 함수.
  const chip = (bg: string, color: string): React.CSSProperties => ({
    fontSize: '13px', padding: '3px 10px', borderRadius: '999px', background: bg, color,
  });
  // maxCount: 가장 많은 득표수(아래 막대그래프 길이의 기준값). 최소 1을 보장해 0으로 나누는 오류를 막는다.
  // Math.max(1, ...배열): 1과 모든 득표수 중 최댓값. ...는 배열을 인자들로 펼치는 스프레드.
  const maxCount = Math.max(1, ...rows.map((r) => votersByKey[r.key]?.length || 0));

  // ── 화면 그리기(JSX 반환) ──
  // <>...</>는 Fragment로, 의미 없는 div를 추가하지 않고 여러 요소를 묶을 때 쓴다.
  return (
    <>
      {/* 페이지 제목/검색엔진 설정. noindex는 검색에 노출하지 말라는 표시 */}
      <SEOHead title="팀구성 — 주제 투표" path="/project-vote" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀구성 · 주제 투표</h2>
          <p>주제에 투표하면 관심 있는 사람이 모입니다. 바로 팀을 만들거나 합류해 보세요. (투표는 1인 1표 · 팀 신청은 중복 허용 — 여러 주제에 참여할 수 있어요)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1080px' }}>
          {/* 조건부 렌더링: loading이 true면 로딩 스피너를, 아니면( : ) 실제 내용을 보여준다 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 상단 요약: 총 투표 수, 주제 개수, (있으면) 내 팀 목록과 게시판 링크 */}
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                총 <strong style={{ color: 'var(--primary-blue)' }}>{votes.length}</strong>표 · 주제 {rows.length}개
                {/* &&: 왼쪽 조건이 참일 때만 오른쪽 JSX를 그린다(거짓이면 아무것도 안 그림). 내 팀이 1개 이상일 때만 표시 */}
                {myTeams.length > 0 && <span> · 내 팀: <strong style={{ color: 'var(--primary-blue)' }}>{myTeams.map((t) => t.name).join(', ')}</strong> <Link to="/project-board" style={{ color: 'var(--primary-blue)' }}>(게시판)</Link></span>}
              </div>
              {/* 강사에게만 보이는 안내 박스 */}
              {isAdmin && (
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-light-gray)', borderRadius: '8px', padding: '10px 14px' }}>
                  강사 계정입니다. 팀 결성·합류·팀장 지원은 수강생이 직접 하고, 팀장 최종 확정은 강사가 합니다. 각 팀의 '팀장 확정'·'팀장 초기화' 버튼으로 모든 팀을 관리하세요. (강사는 팀에 포함되지 않습니다)
                </div>
              )}

              {/* 주제 카드 목록: rows를 하나씩 돌며 카드를 그린다. idx는 0부터 시작하는 순번 */}
              {/* 2열 그리드 — 화면이 좁으면(모바일) auto-fit으로 자동 1열. alignItems:start로 카드 높이가 달라도 윗줄 정렬 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px', alignItems: 'start' }}>
              {rows.map((r, idx) => {
                // 이 카드 한 장을 그리기 위해 미리 계산하는 값들:
                const voters = votersByKey[r.key] || [];                 // 이 주제 투표자 이름 목록(없으면 빈 배열)
                const mineVote = myVoteKey === r.key;                    // 내가 이 주제에 투표했나?
                const team = teamForTitle(r.title);                      // 이 주제로 만들어진 팀(없으면 undefined)
                const inThisTeam = !!team && !!user && members(team).some((m) => m.id === user.id); // 내가 이 팀 소속인가? (!!는 값을 true/false로 변환)
                const full = !!team && members(team).length >= MAX_TEAM_SIZE; // 이 팀 정원이 찼나?
                const canDelete = !r.isPreset && (r.ownerId === user?.id || isAdmin); // 삭제 가능? (학생 제안이고 + 내가 만든 것이거나 강사)
                return (
                  // key={r.key}: 리스트의 각 항목에 고유 key를 주면 리액트가 효율적으로 갱신한다(필수).
                  // 내가 투표한 카드는 왼쪽에 파란 줄로 강조한다(삼항 연산자로 스타일 분기).
                  <div key={r.key} style={{ ...card, borderLeft: mineVote ? '4px solid var(--primary-blue)' : '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* 순위 표시: idx는 0부터라 +1 해서 1위부터 보이게 한다 */}
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-blue)' }}>{idx + 1}위</span>
                          <h3 style={{ margin: 0, fontSize: '17px' }}>{r.title}</h3>
                          {/* 학생 제안 주제에만 '학생 제안' 칩 */}
                          {!r.isPreset && <span style={chip('var(--bg-light-gray)', 'var(--text-secondary)')}>학생 제안</span>}
                          {/* 팀이 있으면 현재 인원/정원 칩 */}
                          {team && <span style={chip('#dbeafe', '#1e3a8a')}>팀 결성됨 {members(team).length}/{MAX_TEAM_SIZE}</span>}
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.description}</p>
                      </div>
                      {/* 오른쪽 큰 숫자: 득표수 */}
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: mineVote ? 'var(--primary-blue)' : 'var(--text-primary)' }}>{voters.length}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>표</div>
                      </div>
                    </div>

                    {/* 득표 막대그래프: 이 주제 득표수 / 최다 득표수 비율만큼 막대 너비를 채운다 */}
                    <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-light-gray)', overflow: 'hidden', margin: '12px 0' }}>
                      <div style={{ width: `${(voters.length / maxCount) * 100}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 0.3s' }} />
                    </div>

                    {/* 투표한 사람 */}
                    {/* 투표자가 있을 때만 이름 칩들을 나열 */}
                    {voters.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>투표:</span>
                        {/* key={i}: 이름은 중복될 수 있어 여기서는 순번(i)을 key로 쓴다 */}
                        {voters.map((n, i) => <span key={i} style={chip('var(--bg-light-gray)', 'var(--text-primary)')}>{n}</span>)}
                      </div>
                    )}

                    {/* 팀 결성 현황 + 팀장(선착순) */}
                    {/* team이 있을 때만, 즉시 실행 함수((() => { ... })())로 팀장 관련 값을 계산해 JSX를 만든다 */}
                    {team && (() => {
                      const hasLeader = members(team).some((m) => m.role === '팀장'); // 이 팀에 팀장이 정해졌나?
                      const meM = members(team).find((m) => m.id === user?.id);       // 이 팀 안에서의 "나"(없으면 undefined)
                      const iAmLeader = meM?.role === '팀장';                         // 내가 이 팀의 팀장인가?
                      return (
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 700 }}>팀원:</span>
                        {/* 팀장이 아직 없으면 안내 문구 */}
                        {!hasLeader && (
                          <p style={{ margin: '6px 0 2px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            팀장 미정 — 아래에서 팀장 맡을 사람의 <strong>‘팀장 신청’</strong>을 누르세요. (먼저 누른 한 명이 팀장)
                          </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
                          {/* 팀원 한 명씩 나열 */}
                          {members(team).map((m) => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={chip('#eff6ff', '#1e40af')}>{m.name}</span>
                              {/* 팀장인 사람에게는 왕관 칩 */}
                              {m.role === '팀장' && <span style={chip('#fef3c7', '#92400e')}>👑 팀장</span>}
                              {/* 팀장 미정: 팀원·관리자가 각 이름별로 팀장 신청 */}
                              {/* 팀장이 없고 + (내가 이 팀 소속이거나 강사)일 때만 '팀장 신청' 버튼 노출 */}
                              {!hasLeader && (inThisTeam || isAdmin) && (
                                <button onClick={() => handleClaimLeader(team, m.id, m.name)} disabled={busy}
                                  style={{ fontSize: '12px', fontWeight: 700, padding: '3px 11px', borderRadius: '6px', border: 'none', background: 'var(--primary-blue)', color: '#fff', cursor: 'pointer' }}>
                                  팀장 신청
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* 내가 팀장이면(강사 제외) 안내 문구 */}
                        {!isAdmin && iAmLeader && (
                          <p style={{ margin: '8px 0 0', fontSize: '12.5px', fontWeight: 700, color: '#92400e' }}>👑 당신이 이 팀의 팀장입니다.</p>
                        )}
                        {/* 강사이고 팀장이 정해진 경우, 팀장 초기화 버튼 제공 */}
                        {isAdmin && hasLeader && (
                          <button onClick={() => handleResetLeaders(team)} disabled={busy}
                            style={{ marginTop: '8px', fontSize: '12px', padding: '2px 10px', borderRadius: '6px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            이 팀 팀장 초기화
                          </button>
                        )}
                      </div>
                      );
                    })()}

                    {/* 액션 */}
                    {/* 카드 하단의 버튼들(투표/팀 만들기/합류/나가기/삭제) */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* 투표 버튼: 내가 이미 투표했으면 강조 스타일 + "취소" 안내, 아니면 일반 스타일 */}
                      <button
                        className={mineVote ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{ padding: '8px 18px', fontSize: '14px' }}
                        disabled={busy} /* 처리 중이면 비활성화(중복 클릭 방지) */
                        onClick={() => handleVote(r.key)}
                      >
                        {mineVote ? '✓ 내 투표 (취소)' : '이 주제에 투표'}
                      </button>

                      {/* 패들렛 버튼: 이 주제의 고정 번호에 해당하는 패들렛 보드를 새 탭으로 연다. */}
                      {padletNumByKey[r.key] && (
                        <a
                          href={padletUrl(padletNumByKey[r.key])}
                          target="_blank"
                          rel="noopener noreferrer"   /* 새 탭 보안(opener 탈취 방지) */
                          className="btn btn-secondary"
                          style={{ padding: '8px 18px', fontSize: '14px' }}
                          title={`패들렛 project${String(padletNumByKey[r.key]).padStart(2, '0')} 열기`}
                        >
                          📌 패들렛
                        </a>
                      )}

                      {/* 팀이 아직 없고 + 강사가 아니면 '팀 만들기' 버튼 */}
                      {!team && !isAdmin && (
                        <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }} disabled={busy} onClick={() => handleCreateTeam(r.title)}>
                          이 주제로 팀 만들기
                        </button>
                      )}
                      {/* 팀이 있고 + 내가 그 팀 소속이면: 게시판 이동 + 나가기 버튼 */}
                      {team && inThisTeam && (
                        <>
                          <Link to="/project-board" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>팀 게시판 →</Link>
                          <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '14px' }} disabled={busy} onClick={() => handleLeave(team)}>팀 나가기</button>
                        </>
                      )}
                      {/* 팀이 있고 + 내가 소속이 아니고 + 강사가 아니면: 합류 버튼(정원 차면 비활성화 + 흐리게) */}
                      {team && !inThisTeam && !isAdmin && (
                        <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '14px', opacity: full ? 0.5 : 1 }} disabled={busy || full} onClick={() => handleJoin(team)}>
                          {full ? '정원 마감' : '이 팀에 합류'}
                        </button>
                      )}

                      {/* 삭제 권한이 있을 때만 '주제 삭제'. marginLeft: 'auto'로 오른쪽 끝에 붙인다 */}
                      {canDelete && (
                        <button onClick={() => handleDeleteTopic(r.key)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>주제 삭제</button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>

              {/* 새 주제 추가 (그리드 바깥 — 전체 폭으로 크게 표시해 가독성↑) */}
              {/* 입력칸 2개(제목/설명) + 추가 버튼. value와 onChange가 한 쌍으로 묶인 "제어 컴포넌트" 방식 */}
              <div style={card}>
                <h3 style={{ margin: '0 0 12px', fontSize: '17px' }}>새 주제 제안</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* value: 상태값을 화면에 표시, onChange: 사용자가 타이핑할 때마다 상태를 갱신 → 항상 동기화 */}
                  <input style={input} placeholder="주제 제목 (예: 우리 동네 안전 지도 앱)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <input style={input} placeholder="한 줄 설명 (선택)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handleAdd}>주제 추가</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일(주로 라우터 설정)에서 가져다 쓸 수 있게 기본 내보내기 한다.
export default ProjectVote;
