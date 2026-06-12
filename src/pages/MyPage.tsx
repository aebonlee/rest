/**
 * MyPage.tsx — 수강생 마이페이지
 *
 * ┌─ 이 파일이 무엇인가요? ─────────────────────────────────────────
 * │ 로그인한 수강생이 자기 정보와 학습 현황을 한 화면에서 보는 "마이페이지"입니다.
 * │ 회원정보 확인/수정, 출석 체크, 출석 달력, 수강 다짐 작성, 학습 메뉴 바로가기를 담당합니다.
 * └─────────────────────────────────────────────────────────────────
 *
 * 역할/책임:
 *  - 로그인한 사용자의 회원정보(이름·전화번호) 조회 및 인라인 수정
 *    (인라인 수정 = 별도 페이지로 이동하지 않고 같은 화면에서 입력칸을 켜서 바로 고치는 방식)
 *  - 가입내역(가입일·경로·도메인) 표시
 *  - 오늘 출결 체크(출석/지각 자동 판정) + 6월 출석 달력(날짜별 도장) 렌더링
 *  - 수강 다짐(pledge) 작성·수정 및 저장
 *  - 학습관리(대시보드/강의자료/과제 등) 바로가기 및 로그아웃
 *
 * 데이터 소스:
 *  - Supabase 테이블 attendance(출결), pledges(수강 다짐) — site.dbPrefix 접두사 사용
 *    (Supabase = 클라우드 데이터베이스 서비스. 이 앱은 Supabase에 데이터를 저장/조회합니다.)
 *  - 출결/다짐 행은 student_id / user_id 로 RLS 격리됨(본인 데이터만 접근)
 *    (RLS = Row Level Security. DB 차원에서 "내 user_id 행만" 보이게 막아주는 보안 규칙입니다.
 *     즉 프론트엔드 코드가 실수해도 남의 데이터는 애초에 내려오지 않습니다.)
 *
 * 알아두면 좋은 용어(초보자용):
 *  - 컴포넌트(Component): 화면을 그리는 함수. 이 파일의 MyPage가 하나의 컴포넌트입니다.
 *  - 상태(state): 컴포넌트가 기억하는 값. 값이 바뀌면 화면이 자동으로 다시 그려집니다.
 *  - 훅(Hook): use로 시작하는 특수 함수(useState, useEffect 등). 컴포넌트에 기능을 붙입니다.
 *  - JSX: return 안에서 보이는 HTML처럼 생긴 문법. 실제로는 자바스크립트입니다.
 *  - async/await: 시간이 걸리는 작업(DB 조회 등)을 기다렸다가 다음 줄로 넘어가게 하는 문법.
 *
 * 주요 export:
 *  - default MyPage: 마이페이지 라우트 컴포넌트
 */

// React 핵심 훅들을 가져옵니다.
//  - useState: 컴포넌트가 기억할 값(상태)을 만듭니다.
//  - useEffect: 화면이 그려진 뒤(또는 특정 값이 바뀐 뒤) 실행할 코드를 등록합니다.
//  - useCallback: 함수를 매 렌더마다 새로 만들지 않고 "기억(메모)"해 둡니다(불필요한 재실행 방지).
//  - type ReactElement: 컴포넌트가 반환하는 "화면 조각"의 타입(TypeScript 타입 표기용).
import { useState, useEffect, useCallback, type ReactElement } from 'react';
// 페이지 이동 관련 도구.
//  - Link: 클릭하면 다른 페이지로 이동하는 링크(새로고침 없이 화면만 바뀜).
//  - useNavigate: 코드에서 직접 페이지를 이동시킬 때 쓰는 함수(예: 로그아웃 후 홈으로).
import { Link, useNavigate } from 'react-router-dom';
// 로그인 정보를 앱 전체에서 공유하는 "인증 컨텍스트". 누가 로그인했는지 알려줍니다.
import { useAuth } from '../contexts/AuthContext';
// 화면 위에 잠깐 떴다 사라지는 알림 메시지(토스트)를 띄우는 도구.
import { useToast } from '../contexts/ToastContext';
// 프로필(이름·전화 등)을 DB에 저장하는 함수.
import { updateProfile } from '../utils/auth';
// Supabase 클라이언트를 가져오는 함수. 이걸로 DB에 쿼리를 보냅니다.
import getSupabase from '../utils/supabase';
// 사이트별 설정(도메인, DB 접두사 등)을 모아둔 객체.
import site from '../config/site';
// 정규 수업일 날짜 목록(예: ['2026-06-01', ...]). 출석 가능 여부 판단에 사용.
import { REGULAR_DATES } from '../config/regularSchedule';
// <head> 안의 제목·메타태그(SEO)를 설정하는 컴포넌트.
import SEOHead from '../components/SEOHead';
import { EmojiIcon } from '../utils/emojiIcon';

// 사이트별 DB 접두사(site.dbPrefix)를 붙인 실제 Supabase 테이블명 매핑.
// 예: dbPrefix가 'rest_'이면 실제 테이블명은 'rest_attendance'가 됩니다.
//     이렇게 하면 여러 사이트가 같은 DB를 써도 테이블이 섞이지 않습니다.
// 참고: `${...}`는 "템플릿 문자열" 문법으로, 변수 값을 문자열 안에 끼워 넣습니다.
const TABLES = {
  attendance: `${site.dbPrefix}attendance`,
  pledges: `${site.dbPrefix}pledges`,
};

// 외부 공유 게시판(Padlet) URL — 학습관리 바로가기에서 새 탭으로 연결.
const PADLET_URL = 'https://padlet.com/aebon/rest01';

// 출결 한 건(한 날짜)의 행 형태를 정의하는 TypeScript 인터페이스.
// (interface = "이 객체는 이런 모양이어야 한다"는 약속. 오타·타입 실수를 미리 잡아줍니다.)
//  date: 날짜(YYYY-MM-DD), status: 상태 코드, check_in_time: 체크인 시각(ISO 문자열)
interface AttRow { date: string; status: string; check_in_time: string }
// 출결 상태 코드(영문) → 한글 라벨 매핑(달력 도장/뱃지에 한글로 보여주려고).
// Record<string, string>는 "문자열 키에 문자열 값"을 가지는 객체 타입을 뜻합니다.
const STATUS_LABEL: Record<string, string> = { present: '출석', late: '지각', absent: '결석', excused: '사유' };
// 출결 상태 코드 → 색상 매핑(달력 도장 테두리/배경색에 사용).
const STATUS_COLOR: Record<string, string> = { present: '#10b981', late: '#d97706', absent: '#ef4444', excused: '#6b7280' };

// 페이지 내 모든 카드 박스에 공통으로 적용하는 인라인 스타일 객체.
// 한 곳에 모아두면 카드 모양을 한 번에 바꿀 수 있어 유지보수가 쉽습니다.
// (var(--bg-white) 등은 CSS 변수로, 라이트/다크 테마에 따라 자동으로 값이 바뀝니다.)
const card: React.CSSProperties = {
  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
  borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)',
};

// 마이페이지 컴포넌트: 회원정보·출결·다짐·학습관리 바로가기를 한 화면에 구성.
// (): ReactElement => 는 "매개변수 없이 호출되며, 화면 조각(ReactElement)을 반환한다"는 뜻.
const MyPage = (): ReactElement => {
  // 인증 컨텍스트에서 필요한 값/함수를 꺼냅니다(구조 분해 할당).
  //  - user: 로그인한 계정(없으면 null), profile: 프로필 정보(이름·전화 등)
  //  - isAdmin: 관리자인지 여부, signOut: 로그아웃 함수, refreshProfile: 프로필 다시 불러오기
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  // 토스트 알림 함수.
  const { showToast } = useToast();
  // 페이지 이동 함수.
  const navigate = useNavigate();

  // ── 회원정보 수정 관련 상태 ──
  // useState(초깃값)은 [현재값, 값을바꾸는함수] 쌍을 돌려줍니다. 값을 바꾸면 화면이 다시 그려집니다.
  const [editing, setEditing] = useState(false);            // 수정 모드 on/off
  const [form, setForm] = useState({ displayName: '', phone: '' }); // 입력 폼 값(이름·전화번호)
  const [saving, setSaving] = useState(false);              // 저장 진행 중인지(중복 클릭 방지용)

  // ── 수강 다짐 관련 상태 ──
  const [pledge, setPledge] = useState('');            // 저장되어 화면에 보여줄 다짐
  const [pledgeDraft, setPledgeDraft] = useState('');  // 편집 중 임시로 타이핑하는 값
  const [pledgeEditing, setPledgeEditing] = useState(false); // 다짐 편집 모드 on/off
  // 참고: 화면에 보이는 값(pledge)과 편집용 임시값(pledgeDraft)을 분리하면,
  //       편집하다 "취소"해도 원래 저장된 값이 그대로 남아 있습니다.

  // ── 출결 관련 상태 ──
  const [today, setToday] = useState<AttRow | null>(null); // 오늘 출결 행(아직 없으면 null)
  const [recent, setRecent] = useState<AttRow[]>([]);      // 최근 출결 목록(달력 그리는 데 사용)
  const [checking, setChecking] = useState(false);         // 출석체크 진행 중인지

  // 오늘 날짜를 'YYYY-MM-DD' 문자열로 만듭니다.
  // new Date().toISOString()은 '2026-06-07T05:30:00.000Z' 같은 문자열을 주고,
  // split('T')[0]로 'T' 앞부분(날짜)만 잘라냅니다.
  // 주의: toISOString()은 UTC(세계 표준시) 기준이라, 자정 근처에는 한국 날짜와 하루 어긋날 수 있습니다.
  const todayStr = new Date().toISOString().split('T')[0];
  // 오늘이 정규 수업일인지 확인(공휴일·주말은 목록에 없어 false가 됨).
  const isClassDay = REGULAR_DATES.includes(todayStr); // 정규 수업일에만 출석체크 (공휴일·주말 제외)
  // 화면 표기용 이름 결정: name → display_name → 이메일 → 기본값 순서로 "있는 값"을 씁니다.
  // ?. (옵셔널 체이닝)은 profile이 null/undefined여도 에러 없이 undefined를 돌려줍니다.
  // || (논리 OR)는 앞 값이 비어 있으면(빈문자열·null 등) 뒷 값을 사용합니다.
  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  // [useEffect] 프로필이 로드되거나 바뀌면 수정 폼의 초깃값을 프로필 값으로 맞춥니다.
  // 두 번째 인자 [profile]은 "의존성 배열"로, profile이 바뀔 때만 이 코드를 다시 실행합니다.
  // 이렇게 동기화해두면, 수정 버튼을 눌렀을 때 폼에 현재 값이 미리 채워져 있습니다.
  useEffect(() => {
    if (profile) setForm({ displayName: profile.display_name || profile.name || '', phone: profile.phone || '' });
  }, [profile]);

  // 출결(최근 40건)과 수강 다짐을 Supabase에서 한꺼번에 조회하는 로더 함수.
  // useCallback으로 감싸 [user, todayStr]가 바뀔 때만 함수를 새로 만듭니다.
  // (아래 useEffect의 의존성에 load가 들어가므로, 함수가 매번 새로 만들어지면 무한 루프가 날 수 있어 방지)
  const load = useCallback(async () => {
    const client = getSupabase();
    if (!client || !user) return; // 클라이언트 미초기화 또는 비로그인 시 중단(쿼리 보내봐야 의미 없음)
    // Promise.all: 두 쿼리를 "동시에" 실행하고 둘 다 끝날 때까지 기다립니다.
    // 하나씩 순서대로 기다리는 것보다 전체 대기시간이 짧아집니다.
    // .eq('student_id', user.id) 처럼 본인 id로만 필터해 RLS 규칙과 일치시킵니다.
    const [attRes, pledgeRes] = await Promise.all([
      // 출결: 내 student_id의 행을 날짜 내림차순(최신 먼저)으로 최대 40건.
      client.from(TABLES.attendance).select('date, status, check_in_time').eq('student_id', user.id).order('date', { ascending: false }).limit(40),
      // 다짐: 내 user_id의 단 한 행. maybeSingle()은 "0개 또는 1개"를 허용(없으면 data가 null).
      client.from(TABLES.pledges).select('content').eq('user_id', user.id).maybeSingle(),
    ]);
    // attRes.data가 null일 수 있으니 || []로 빈 배열을 대비합니다. as AttRow[]는 타입 단언.
    const rows = (attRes.data || []) as AttRow[];
    setRecent(rows);
    // 최근 목록에서 오늘 날짜와 일치하는 행을 찾아 today에 저장(없으면 null → "미체크" 상태).
    // find는 조건에 맞는 "첫 번째" 요소를 돌려주고, 없으면 undefined를 줍니다(여기선 || null로 변환).
    setToday(rows.find((r) => r.date === todayStr) || null);
    // 다짐 행이 있으면 표시값(pledge)과 편집 임시값(pledgeDraft)을 모두 같은 값으로 맞춥니다.
    if (pledgeRes.data) { setPledge(pledgeRes.data.content || ''); setPledgeDraft(pledgeRes.data.content || ''); }
  }, [user, todayStr]);

  // [useEffect] 최초 화면 표시 시, 그리고 load 함수가 바뀔 때 데이터를 불러옵니다.
  useEffect(() => { load(); }, [load]);

  // 회원정보(이름·전화번호) 저장 핸들러.
  // async 함수이므로 내부에서 await로 DB 저장이 끝날 때까지 기다릴 수 있습니다.
  const handleSaveProfile = async () => {
    setSaving(true); // 저장 시작 → 버튼 비활성화(중복 제출 방지)
    try {
      // display_name과 name을 같은 값으로 저장(두 필드를 폴백으로 함께 쓰는 구조를 유지).
      // user! 의 ! 는 "user가 null이 아님을 내가 보장한다"는 TypeScript 단언(non-null assertion).
      await updateProfile(user!.id, { display_name: form.displayName, name: form.displayName, phone: form.phone });
      await refreshProfile(); // 저장 후 전역 프로필을 다시 읽어 화면 전체에 즉시 반영
      setEditing(false);      // 수정 모드 종료 → 읽기 화면으로 복귀
      showToast('회원정보가 저장되었습니다.', 'success');
    } catch (err) {
      // 저장 중 예외가 나면 사용자에게 에러 메시지를 보여줍니다.
      // (err as Error)는 잡힌 값을 Error 타입으로 보고 .message에 접근하기 위함.
      showToast('저장 실패: ' + (err as Error).message, 'error');
    } finally { setSaving(false); } // 성공/실패와 상관없이 저장 플래그를 반드시 끔
  };

  // 오늘 출석체크 핸들러: 현재 시각에 따라 출석/지각을 자동 판정한 뒤 DB에 저장.
  const handleCheckIn = async () => {
    const client = getSupabase();
    if (!client || !user) return;
    // 수업일이 아니면(주말·공휴일 등) 체크를 막고 안내만 합니다.
    if (!isClassDay) { showToast('오늘은 수업일이 아닙니다 (공휴일·주말 등).', 'warning'); return; }
    setChecking(true); // 체크 진행 중 표시(버튼 비활성화)
    // 수업 시작은 14:00. 14:10 이후 체크인이면 지각으로 처리합니다.
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes(); // 현재 시각을 "자정부터 흐른 분"으로 환산
    const status = mins > 14 * 60 + 10 ? 'late' : 'present'; // 14:10(=850분) 초과면 'late', 아니면 'present'
    // upsert = update + insert. (student_id, date) 조합이 이미 있으면 갱신, 없으면 새로 추가.
    // onConflict로 "이 두 컬럼이 같으면 같은 행"이라고 알려줘, 같은 날 두 번 눌러도 중복 행이 안 생깁니다.
    const { error } = await client.from(TABLES.attendance).upsert(
      { student_id: user.id, date: todayStr, status, check_in_time: now.toISOString() },
      { onConflict: 'student_id,date' }
    );
    setChecking(false);
    if (error) showToast('출석체크 실패: ' + error.message, 'error');
    // 성공하면 상태에 맞는 토스트를 띄우고, load()로 데이터를 다시 읽어 달력·뱃지를 갱신합니다.
    else { showToast(status === 'late' ? '지각으로 체크되었습니다 (14:10 이후).' : '출석 완료!', status === 'late' ? 'warning' : 'success'); load(); }
  };

  // 수강 다짐 저장 핸들러: 사용자당 1행(user_id 유니크)으로 저장합니다.
  const handleSavePledge = async () => {
    const client = getSupabase();
    if (!client || !user) return;
    // user_id가 겹치면 갱신(사용자별 단일 다짐 유지). .trim()으로 앞뒤 공백을 제거해 저장.
    const { error } = await client.from(TABLES.pledges).upsert(
      { user_id: user.id, user_name: userName, content: pledgeDraft.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) { showToast('저장 실패: ' + error.message, 'error'); return; }
    // 저장 성공 → 화면 표시값을 임시값으로 동기화하고 편집 모드를 닫습니다.
    setPledge(pledgeDraft.trim()); setPledgeEditing(false); showToast('수강 다짐이 저장되었습니다.', 'success');
  };

  // 로그아웃 핸들러: 로그아웃이 끝난 뒤 홈('/')으로 이동합니다.
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // 학습관리 바로가기 항목 정의(이동 경로 to, 아이콘, 라벨).
  // 아래 JSX에서 이 배열을 .map으로 돌려 버튼들을 자동 생성합니다(반복 코드 줄이기).
  const lmsLinks = [
    { to: '/dashboard', icon: '📊', label: '대시보드' },
    { to: '/materials', icon: '📁', label: '강의자료' },
    { to: '/assignments', icon: '📝', label: '과제' },
    { to: '/project-vote', icon: '🧩', label: '팀구성' },
    { to: '/project-board', icon: '🗂️', label: '프로젝트 관리' },
    { to: '/qna', icon: '❓', label: 'Q&A' },
  ];
  // 가입일: 계정 생성 시각(created_at)을 한국식 날짜 문자열로 변환(값이 없으면 '-').
  // 삼항 연산자 조건 ? A : B 는 "조건이 참이면 A, 아니면 B".
  const joinedAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-';

  // 화면(JSX) 반환. <> ... </>는 "프래그먼트"로, 여러 요소를 div 없이 묶을 때 씁니다.
  return (
    <>
      {/* 마이페이지는 개인정보 페이지이므로 검색엔진 색인 제외(noindex) */}
      <SEOHead title="마이페이지" path="/mypage" noindex />
      <section className="page-header">
        <div className="container">
          <h2>마이페이지</h2>
          {/* {userName}처럼 중괄호 안에 변수를 넣으면 그 값이 화면에 표시됩니다 */}
          <p>{userName}님의 회원정보·출결·학습관리</p>
        </div>
      </section>

      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' }}>

          {/* 회원정보 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px' }}>회원정보</h3>
            {/* editing 값에 따라 화면을 토글: 참이면 입력 폼, 거짓이면 읽기 전용 카드 */}
            {/* { 조건 ? (A) : (B) } 는 JSX 안에서 둘 중 하나를 골라 보여주는 패턴입니다 */}
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>이름
                  {/* value/onChange를 함께 쓰면 "제어 컴포넌트"가 됩니다: React 상태가 입력칸의 진짜 값. */}
                  {/* onChange에서 setForm으로 form을 통째로 새로 만들어(불변성) displayName만 교체합니다. */}
                  {/* {...form}은 기존 값들을 복사하고, 뒤의 displayName이 그 항목만 덮어씁니다. */}
                  <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', fontSize: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </label>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>전화번호
                  {/* 전화번호도 같은 방식. placeholder는 비어 있을 때 보이는 안내 예시입니다. */}
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000"
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', fontSize: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* 저장 중(saving=true)에는 disabled로 버튼을 잠가 같은 요청이 두 번 가는 것을 막습니다. */}
                  <button className="btn btn-primary" style={{ padding: '9px 18px' }} disabled={saving} onClick={handleSaveProfile}>{saving ? '저장 중…' : '저장'}</button>
                  <button className="btn btn-secondary" style={{ padding: '9px 18px' }} onClick={() => setEditing(false)}>취소</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {/* [라벨, 값] 쌍들의 배열을 .map으로 순회해 정보 항목을 그리드로 그립니다. */}
                {[
                  ['이름', userName],
                  ['이메일', user?.email || '-'],
                  ['전화번호', profile?.phone || '미등록'],
                  ['로그인 방식', profile?.provider || 'email'],
                  ['권한', isAdmin ? '관리자' : '수강생'],
                ].map(([k, v]) => (
                  // 주의: 목록을 .map으로 그릴 때는 각 항목에 고유한 key가 필요합니다(React가 변경 추적용).
                  <div key={k}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{k}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
                {/* gridColumn: '1 / -1' 은 이 칸을 그리드 한 줄 전체로 펼칩니다(버튼을 아래 한 줄에). */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setEditing(true)}>회원정보 수정</button>
                </div>
              </div>
            )}
          </div>

          {/* 가입내역 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px' }}>가입내역</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {/* 가입 메타 정보. signup_domain이 없으면 사이트 URL에서 'https://'만 떼어 기본값으로 표시. */}
              {/* .replace('https://', '')는 'https://rest.dreamitbiz.com' → 'rest.dreamitbiz.com'으로 만듭니다. */}
              {[
                ['가입일', joinedAt],
                ['가입 경로', profile?.provider || 'email'],
                ['가입 도메인', profile?.signup_domain || site.url.replace('https://', '')],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{k}</div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 출결 체크 — 관리자는 출석 대상이 아니므로 카드 자체를 숨김 */}
          {/* {조건 && (JSX)} 는 "조건이 참일 때만 JSX를 그린다"는 패턴(거짓이면 아무것도 안 그림). */}
          {!isAdmin && (
          <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>오늘 출결</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {/* 수업일이면 출석 규칙을, 아니면 비수업일 안내를 보여줍니다 */}
                  {todayStr} · {isClassDay ? '수업시작 14:00 (14:10 이후 체크인은 지각)' : '오늘은 수업일이 아닙니다 (공휴일·주말 등)'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* 3단계 분기 (삼항을 중첩):
                    1) today가 있으면 → 이미 체크함 → 완료 뱃지
                    2) 아니고 수업일이면 → 출석체크 버튼
                    3) 그 외(비수업일) → "수업 없음" 표시 */}
                {today ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>
                    {/* 체크인 시각(ISO 문자열)을 Date로 바꿔 '오후 2:05' 같은 시:분 형식으로 표시 */}
                    ✓ {STATUS_LABEL[today.status] || today.status} 완료 ({new Date(today.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                ) : isClassDay ? (
                  // checking(체크 진행 중)이면 버튼을 잠가 중복 클릭을 막습니다.
                  <button className="btn btn-primary" style={{ padding: '10px 22px' }} disabled={checking} onClick={handleCheckIn}>
                    {checking ? '체크 중…' : '오늘 출석체크'}
                  </button>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, background: 'var(--bg-light-gray)', color: 'var(--text-secondary)' }}>
                    수업 없음
                  </span>
                )}
              </div>
            </div>

            {/* 6월 출석 달력 (날짜별 도장) */}
            {/* 아래 (() => { ... })() 는 IIFE(즉시 실행 함수): 달력 셀을 만드는 계산 로직을
                한 묶음으로 감싸 "지금 바로 한 번" 실행하고, 그 결과(JSX)를 화면에 끼워 넣습니다.
                JSX 중괄호 안에서는 if/for 같은 문장을 직접 못 쓰기 때문에 함수로 감싸는 것입니다. */}
            {(() => {
              // 날짜 → 출결 상태를 빠르게 찾기 위한 "조회용 맵"을 만듭니다.
              // (배열을 매번 검색하는 대신 attMap['2026-06-07'] 처럼 즉시 꺼낼 수 있어 빠릅니다.)
              const attMap: Record<string, string> = {};
              recent.forEach((r) => { attMap[r.date] = r.status; });
              // 2026-06-01이 무슨 요일인지 구합니다. getDay()는 0=일 ~ 6=토.
              // 주의: new Date(2026, 5, 1)에서 월은 0부터 시작하므로 5가 "6월"입니다(헷갈리기 쉬움!).
              const firstDow = new Date(2026, 5, 1).getDay(); // 2026-06-01의 요일(앞쪽 빈칸 수 결정)
              const HOLIDAY = '2026-06-03'; // 6월 중 공휴일(셀에 '공휴일'로 표기)
              // 6월의 '출석(present)' 일수를 셉니다. startsWith로 6월 날짜만 골라 filter한 뒤 개수(length).
              const presentDays = recent.filter((r) => r.status === 'present' && r.date.startsWith('2026-06')).length;
              const cells: ReactElement[] = []; // 달력에 들어갈 칸(빈칸+날짜칸)을 담을 배열
              // 1일이 시작되는 요일 앞에 빈 칸을 채워, 1일이 올바른 요일 위치에서 시작하게 합니다.
              for (let i = 0; i < firstDow; i++) cells.push(<div key={`b${i}`} />);
              // 6월 1일~30일까지 각 날짜 칸을 만듭니다.
              for (let d = 1; d <= 30; d++) {
                // 'YYYY-MM-DD' 날짜키 생성. padStart(2,'0')은 한 자리 일(예 5)을 '05'로 만듭니다.
                const ds = `2026-06-${String(d).padStart(2, '0')}`;
                const dow = new Date(2026, 5, d).getDay(); // 해당 일의 요일(0=일 ~ 6=토)
                const isWeekend = dow === 0 || dow === 6;   // 일요일 또는 토요일이면 주말
                const isHoliday = ds === HOLIDAY;           // 공휴일인지
                // 수업일 조건: 주말 아님 AND 22일 이하(정규 종료일) AND 공휴일 아님.
                const isClass = !isWeekend && d <= 22 && !isHoliday;
                const status = attMap[ds]; // 그 날의 출결 상태(없으면 undefined)
                const col = status ? STATUS_COLOR[status] : ''; // 도장 색상(상태 있을 때만)
                cells.push(
                  <div key={ds} style={{
                    position: 'relative', aspectRatio: '1 / 1', borderRadius: '8px',
                    // 수업일이면 테두리를 보이게, 아니면 투명하게.
                    border: `1px solid ${isClass ? 'var(--border-light)' : 'transparent'}`,
                    // 배경색: 공휴일(노랑) > 수업일(흰색) > 그 외(회색) 순으로 결정.
                    background: isHoliday ? '#fef3c7' : isClass ? 'var(--bg-white)' : 'var(--bg-light-gray)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    // 주말이면서 출결 기록도 없는 칸은 흐리게(0.45) 표시.
                    opacity: isWeekend && !status ? 0.45 : 1,
                  }}>
                    {/* 칸 좌상단의 날짜 숫자 — 일요일은 빨강, 토요일은 파랑, 평일은 회색 */}
                    <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '11px', fontWeight: 600, color: dow === 0 ? '#ef4444' : dow === 6 ? '#2563eb' : 'var(--text-secondary)' }}>{d}</span>
                    {/* 분기: 출결 있으면 회전된 원형 도장 / 없고 공휴일이면 '공휴일' / 그 외엔 빈칸(null) */}
                    {status ? (
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        // `${col}1f`는 색상 뒤에 '1f'(불투명도 약 12%)를 붙인 반투명 배경입니다.
                        border: `2px solid ${col}`, color: col, background: `${col}1f`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800, transform: 'rotate(-12deg)', // 도장처럼 살짝 기울임
                      }}>{STATUS_LABEL[status] || status}</div>
                    ) : isHoliday ? (
                      <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>공휴일</span>
                    ) : null}
                  </div>
                );
              }
              // IIFE가 최종적으로 반환하는 달력 전체 JSX(헤더 + 요일줄 + 날짜 그리드 + 범례).
              return (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}><EmojiIcon char="📅" /> 6월 출석 달력</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>출석 <strong style={{ color: '#10b981' }}>{presentDays}</strong>일</div>
                  </div>
                  {/* 요일 헤더(일~토). i===0(일) 빨강, i===6(토) 파랑 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                      <div key={w} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: i === 0 ? '#ef4444' : i === 6 ? '#2563eb' : 'var(--text-secondary)' }}>{w}</div>
                    ))}
                  </div>
                  {/* 7열 그리드에 위 for문에서 만든 (빈칸 + 날짜칸) 배열을 그대로 배치 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>{cells}</div>
                  {/* 상태별 범례(작은 색 동그라미 + 한글 라벨). Object.entries로 STATUS_LABEL을 [코드,라벨] 쌍 배열로 변환해 그립니다. */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: `2px solid ${STATUS_COLOR[k]}` }} />{v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          )}

          {/* 수강 다짐 */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}><EmojiIcon char="✊" /> 수강 다짐</h3>
              {/* 편집 중이 아닐 때만 작성/수정 버튼 노출. 클릭하면 현재 다짐을 임시값으로 복사한 뒤 편집 모드 진입. */}
              {/* (임시값에 먼저 복사해야, 편집을 시작했을 때 기존 내용이 textarea에 채워집니다.) */}
              {!pledgeEditing && (
                <button className="btn btn-secondary" style={{ padding: '7px 15px', fontSize: '13px' }} onClick={() => { setPledgeDraft(pledge); setPledgeEditing(true); }}>
                  {/* 저장된 다짐이 있으면 '수정', 없으면 '작성'으로 버튼 글자를 바꿉니다. */}
                  {pledge ? '수정' : '작성'}
                </button>
              )}
            </div>
            {/* 편집 모드면 textarea(여러 줄 입력칸), 아니면 저장된 다짐(또는 안내 문구)을 표시 */}
            {pledgeEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* textarea도 제어 컴포넌트: 타이핑할 때마다 onChange가 pledgeDraft를 갱신합니다. */}
                <textarea value={pledgeDraft} onChange={(e) => setPledgeDraft(e.target.value)} placeholder="이번 과정에서 이루고 싶은 목표와 다짐을 적어보세요."
                  style={{ width: '100%', minHeight: '90px', padding: '11px 13px', fontSize: '16px', lineHeight: 1.6, border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" style={{ padding: '9px 18px' }} onClick={handleSavePledge}>저장</button>
                  {/* 취소: 임시값은 그대로 두고 편집 모드만 끕니다(화면엔 다시 저장된 pledge가 보임). */}
                  <button className="btn btn-secondary" style={{ padding: '9px 18px' }} onClick={() => setPledgeEditing(false)}>취소</button>
                </div>
              </div>
            ) : (
              // 다짐이 비어 있으면 안내 문구를 보조색으로, 있으면 본문색으로 표시.
              // whiteSpace: 'pre-wrap'은 입력에 넣은 줄바꿈/공백을 화면에 그대로 보존합니다.
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: pledge ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {/* pledge가 있으면 그 내용, 없으면 || 뒤의 안내 문구를 보여줍니다. */}
                {pledge || '아직 다짐을 작성하지 않았습니다. 나만의 학습 목표를 남겨보세요.'}
              </p>
            )}
          </div>

          {/* 학습관리 바로가기 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px' }}>학습관리 바로가기</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {/* 내부 페이지 바로가기 카드들. lmsLinks 배열을 .map으로 돌려 Link를 자동 생성. */}
              {/* Link는 a 태그처럼 보이지만, 새로고침 없이 앱 내부에서 화면만 전환합니다(SPA 라우팅). */}
              {lmsLinks.map((l) => (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px',
                  textDecoration: 'none', border: '1px solid var(--border-light)', background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px',
                }}>
                  <span style={{ fontSize: '20px' }}><EmojiIcon char={l.icon} /></span>{l.label}
                </Link>
              ))}
              {/* 외부 사이트(Padlet)는 일반 a 태그로 연결.
                  target="_blank"는 새 탭에서 열고, rel="noopener noreferrer"는
                  새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정입니다(외부 링크엔 꼭 권장). */}
              <a href={PADLET_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px', textDecoration: 'none', border: '1px solid var(--border-light)', background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
                <span style={{ fontSize: '20px' }}><EmojiIcon char="📌" /></span>공유 게시판
              </a>
              {/* 관리자(isAdmin)일 때만 관리자 페이지 진입 버튼을 추가로 노출. */}
              {isAdmin && (
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px', textDecoration: 'none', border: '1px solid var(--primary-blue)', background: 'var(--primary-blue)', color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                  <span style={{ fontSize: '20px' }}><EmojiIcon char="🛠️" /></span>관리자
                </Link>
              )}
            </div>
          </div>

          <div>
            {/* 로그아웃 버튼: 클릭하면 handleSignOut이 실행되어 로그아웃 후 홈으로 이동 */}
            <button className="btn btn-secondary" style={{ padding: '10px 22px' }} onClick={handleSignOut}>로그아웃</button>
          </div>
        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 기본(default)으로 내보냅니다. 라우터에서 import MyPage from ... 로 가져다 씁니다.
export default MyPage;
