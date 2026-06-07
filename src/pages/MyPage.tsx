/**
 * MyPage.tsx — 수강생 마이페이지
 *
 * 역할/책임:
 *  - 로그인한 사용자의 회원정보(이름·전화번호) 조회 및 인라인 수정
 *  - 가입내역(가입일·경로·도메인) 표시
 *  - 오늘 출결 체크(출석/지각 자동 판정) + 6월 출석 달력(날짜별 도장) 렌더링
 *  - 수강 다짐(pledge) 작성·수정 및 저장
 *  - 학습관리(대시보드/강의자료/과제 등) 바로가기 및 로그아웃
 *
 * 데이터 소스:
 *  - Supabase 테이블 attendance(출결), pledges(수강 다짐) — site.dbPrefix 접두사 사용
 *  - 출결/다짐 행은 student_id / user_id 로 RLS 격리됨(본인 데이터만 접근)
 *
 * 주요 export:
 *  - default MyPage: 마이페이지 라우트 컴포넌트
 */
import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { updateProfile } from '../utils/auth';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import { REGULAR_DATES } from '../config/regularSchedule';
import SEOHead from '../components/SEOHead';

// 사이트별 DB 접두사(site.dbPrefix)를 붙인 실제 Supabase 테이블명 매핑
const TABLES = {
  attendance: `${site.dbPrefix}attendance`,
  pledges: `${site.dbPrefix}pledges`,
};

// 외부 공유 게시판(Padlet) URL — 학습관리 바로가기에서 새 탭으로 연결
const PADLET_URL = 'https://padlet.com/aebon/rest01';

// 출결 한 건(한 날짜)의 행 형태: 날짜, 상태, 체크인 시각(ISO)
interface AttRow { date: string; status: string; check_in_time: string }
// 출결 상태 코드 → 한글 라벨 매핑(달력 도장/뱃지 표기에 사용)
const STATUS_LABEL: Record<string, string> = { present: '출석', late: '지각', absent: '결석', excused: '사유' };
// 출결 상태 코드 → 색상 매핑(달력 도장 테두리/배경색에 사용)
const STATUS_COLOR: Record<string, string> = { present: '#10b981', late: '#d97706', absent: '#ef4444', excused: '#6b7280' };

// 페이지 내 모든 카드 박스에 공통으로 적용하는 인라인 스타일
const card: React.CSSProperties = {
  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
  borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)',
};

// 마이페이지 컴포넌트: 회원정보·출결·다짐·학습관리 바로가기를 한 화면에 구성
const MyPage = (): ReactElement => {
  // 인증 컨텍스트: 현재 유저/프로필/관리자 여부 및 로그아웃·프로필갱신 함수
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 회원정보 수정 모드 상태와 입력 폼(이름·전화번호), 저장 진행 플래그
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // 수강 다짐: 저장된 값(pledge), 편집 중 임시 값(pledgeDraft), 편집 모드 여부
  const [pledge, setPledge] = useState('');
  const [pledgeDraft, setPledgeDraft] = useState('');
  const [pledgeEditing, setPledgeEditing] = useState(false);

  // 출결 상태: 오늘 출결 행(today), 최근 출결 목록(recent, 달력용), 체크 진행 플래그
  const [today, setToday] = useState<AttRow | null>(null);
  const [recent, setRecent] = useState<AttRow[]>([]);
  const [checking, setChecking] = useState(false);

  // 오늘 날짜(YYYY-MM-DD) — ISO 문자열에서 날짜 부분만 추출
  const todayStr = new Date().toISOString().split('T')[0];
  const isClassDay = REGULAR_DATES.includes(todayStr); // 정규 수업일에만 출석체크 (공휴일·주말 제외)
  // 화면 표기용 이름: 프로필 name → display_name → 이메일 → 기본값 순으로 폴백
  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  // 프로필 로드/변경 시 수정 폼의 초기값을 프로필 값으로 동기화
  useEffect(() => {
    if (profile) setForm({ displayName: profile.display_name || profile.name || '', phone: profile.phone || '' });
  }, [profile]);

  // 출결(최근 40건)과 수강 다짐을 Supabase에서 병렬 조회하는 로더
  const load = useCallback(async () => {
    const client = getSupabase();
    if (!client || !user) return; // 클라이언트 미초기화 또는 비로그인 시 중단
    // 두 쿼리를 동시에 실행해 대기시간 단축. attendance/pledges 모두 본인 id로만 필터(RLS와 일치)
    const [attRes, pledgeRes] = await Promise.all([
      client.from(TABLES.attendance).select('date, status, check_in_time').eq('student_id', user.id).order('date', { ascending: false }).limit(40),
      client.from(TABLES.pledges).select('content').eq('user_id', user.id).maybeSingle(),
    ]);
    const rows = (attRes.data || []) as AttRow[];
    setRecent(rows);
    // 최근 목록에서 오늘 날짜 행을 찾아 today에 반영(없으면 미체크 상태)
    setToday(rows.find((r) => r.date === todayStr) || null);
    // 다짐 행이 있으면 표시값과 편집 임시값 모두 동기화
    if (pledgeRes.data) { setPledge(pledgeRes.data.content || ''); setPledgeDraft(pledgeRes.data.content || ''); }
  }, [user, todayStr]);

  // 최초 마운트 및 load 의존성 변경 시 데이터 로드
  useEffect(() => { load(); }, [load]);

  // 회원정보(이름·전화번호) 저장 핸들러: 프로필 업데이트 후 컨텍스트 갱신
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // display_name과 name을 동일하게 저장(두 필드를 함께 사용하는 폴백 구조 유지)
      await updateProfile(user!.id, { display_name: form.displayName, name: form.displayName, phone: form.phone });
      await refreshProfile(); // 저장 후 전역 프로필 재조회로 화면 즉시 반영
      setEditing(false);
      showToast('회원정보가 저장되었습니다.', 'success');
    } catch (err) {
      showToast('저장 실패: ' + (err as Error).message, 'error');
    } finally { setSaving(false); }
  };

  // 오늘 출석체크 핸들러: 시각에 따라 출석/지각 판정 후 upsert
  const handleCheckIn = async () => {
    const client = getSupabase();
    if (!client || !user) return;
    // 수업일이 아니면(주말·공휴일 등) 체크 차단
    if (!isClassDay) { showToast('오늘은 수업일이 아닙니다 (공휴일·주말 등).', 'warning'); return; }
    setChecking(true);
    // 수업 시작 14:00 기준 — 14:10 이후 체크인은 지각 처리
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes(); // 현재 시각을 자정 기준 분으로 환산
    const status = mins > 14 * 60 + 10 ? 'late' : 'present'; // 14:10(=850분) 초과면 지각
    // (student_id, date) 복합키로 upsert — 같은 날 재체크 시 중복 행 대신 갱신
    const { error } = await client.from(TABLES.attendance).upsert(
      { student_id: user.id, date: todayStr, status, check_in_time: now.toISOString() },
      { onConflict: 'student_id,date' }
    );
    setChecking(false);
    if (error) showToast('출석체크 실패: ' + error.message, 'error');
    // 성공 시 지각/출석에 맞춘 토스트를 띄우고 목록 재로드로 달력·뱃지 갱신
    else { showToast(status === 'late' ? '지각으로 체크되었습니다 (14:10 이후).' : '출석 완료!', status === 'late' ? 'warning' : 'success'); load(); }
  };

  // 수강 다짐 저장 핸들러: 사용자당 1행(user_id 유니크)으로 upsert
  const handleSavePledge = async () => {
    const client = getSupabase();
    if (!client || !user) return;
    // user_id 충돌 시 갱신(사용자별 단일 다짐). 앞뒤 공백 제거 후 저장
    const { error } = await client.from(TABLES.pledges).upsert(
      { user_id: user.id, user_name: userName, content: pledgeDraft.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) { showToast('저장 실패: ' + error.message, 'error'); return; }
    // 저장 성공 시 표시값 동기화 및 편집 모드 종료
    setPledge(pledgeDraft.trim()); setPledgeEditing(false); showToast('수강 다짐이 저장되었습니다.', 'success');
  };

  // 로그아웃 후 홈으로 이동
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  // 학습관리 바로가기 항목(라우트·아이콘·라벨) 정의
  const lmsLinks = [
    { to: '/dashboard', icon: '📊', label: '대시보드' },
    { to: '/materials', icon: '📁', label: '강의자료' },
    { to: '/assignments', icon: '📝', label: '과제' },
    { to: '/project-vote', icon: '🧩', label: '팀구성' },
    { to: '/project-board', icon: '🗂️', label: '프로젝트 관리' },
    { to: '/qna', icon: '❓', label: 'Q&A' },
  ];
  // 가입일: 인증 계정 생성 시각을 한국 로케일 날짜로 포맷(없으면 '-')
  const joinedAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-';

  return (
    <>
      {/* 마이페이지는 개인정보 페이지이므로 검색엔진 색인 제외(noindex) */}
      <SEOHead title="마이페이지" path="/mypage" noindex />
      <section className="page-header">
        <div className="container">
          <h2>마이페이지</h2>
          <p>{userName}님의 회원정보·출결·학습관리</p>
        </div>
      </section>

      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' }}>

          {/* 회원정보 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px' }}>회원정보</h3>
            {/* editing 상태에 따라 입력 폼 또는 읽기 전용 정보 카드를 토글 */}
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>이름
                  <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', fontSize: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </label>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>전화번호
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000"
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', fontSize: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* 저장 중에는 버튼 비활성화로 중복 제출 방지 */}
                  <button className="btn btn-primary" style={{ padding: '9px 18px' }} disabled={saving} onClick={handleSaveProfile}>{saving ? '저장 중…' : '저장'}</button>
                  <button className="btn btn-secondary" style={{ padding: '9px 18px' }} onClick={() => setEditing(false)}>취소</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {/* [라벨, 값] 쌍 배열을 순회해 정보 항목을 그리드로 렌더 */}
                {[
                  ['이름', userName],
                  ['이메일', user?.email || '-'],
                  ['전화번호', profile?.phone || '미등록'],
                  ['로그인 방식', profile?.provider || 'email'],
                  ['권한', isAdmin ? '관리자' : '수강생'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{k}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
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
              {/* 가입 메타 정보. signup_domain 미기록 시 사이트 도메인을 기본값으로 표시 */}
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

          {/* 출결 체크 — 관리자는 출석 대상이 아니므로 제외 */}
          {!isAdmin && (
          <div style={{ ...card, borderLeft: '4px solid var(--primary-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>오늘 출결</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {/* 수업일이면 출석 규칙 안내, 아니면 비수업일 안내 */}
                  {todayStr} · {isClassDay ? '수업시작 14:00 (14:10 이후 체크인은 지각)' : '오늘은 수업일이 아닙니다 (공휴일·주말 등)'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* 3단계 분기: 이미 체크함 → 완료 뱃지 / 수업일 미체크 → 체크 버튼 / 비수업일 → 수업 없음 */}
                {today ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>
                    {/* 체크인 시각을 시:분으로 포맷해 완료 표시 */}
                    ✓ {STATUS_LABEL[today.status] || today.status} 완료 ({new Date(today.check_in_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                ) : isClassDay ? (
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
            {/* IIFE로 달력 셀 계산을 캡슐화 — 렌더링 직전에 한 번 실행 */}
            {(() => {
              // 날짜 → 출결 상태 빠른 조회용 맵 구성
              const attMap: Record<string, string> = {};
              recent.forEach((r) => { attMap[r.date] = r.status; });
              const firstDow = new Date(2026, 5, 1).getDay(); // 2026-06-01의 요일(앞쪽 빈칸 수 결정, 월=5 인덱스)
              const HOLIDAY = '2026-06-03'; // 6월 중 공휴일(셀에 '공휴일' 표기)
              // 6월 출석(present) 일수 카운트 — 날짜 접두사로 6월만 필터
              const presentDays = recent.filter((r) => r.status === 'present' && r.date.startsWith('2026-06')).length;
              const cells: ReactElement[] = [];
              // 1일 이전 요일 칸을 빈 셀로 채워 달력 시작 위치를 맞춤
              for (let i = 0; i < firstDow; i++) cells.push(<div key={`b${i}`} />);
              for (let d = 1; d <= 30; d++) {
                const ds = `2026-06-${String(d).padStart(2, '0')}`; // 두 자리 일자로 날짜키 생성
                const dow = new Date(2026, 5, d).getDay(); // 해당 일의 요일(0=일, 6=토)
                const isWeekend = dow === 0 || dow === 6;
                const isHoliday = ds === HOLIDAY;
                // 수업일 조건: 주말 아님 + 22일 이하(정규 종료일) + 공휴일 아님
                const isClass = !isWeekend && d <= 22 && !isHoliday;
                const status = attMap[ds]; // 해당 일의 출결 상태(없으면 undefined)
                const col = status ? STATUS_COLOR[status] : ''; // 도장 색상
                cells.push(
                  <div key={ds} style={{
                    position: 'relative', aspectRatio: '1 / 1', borderRadius: '8px',
                    border: `1px solid ${isClass ? 'var(--border-light)' : 'transparent'}`,
                    background: isHoliday ? '#fef3c7' : isClass ? 'var(--bg-white)' : 'var(--bg-light-gray)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isWeekend && !status ? 0.45 : 1,
                  }}>
                    {/* 셀 좌상단 날짜 숫자 — 일요일 빨강·토요일 파랑 */}
                    <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '11px', fontWeight: 600, color: dow === 0 ? '#ef4444' : dow === 6 ? '#2563eb' : 'var(--text-secondary)' }}>{d}</span>
                    {/* 출결 있으면 회전된 원형 도장, 없고 공휴일이면 '공휴일' 표기, 그 외엔 빈 셀 */}
                    {status ? (
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        border: `2px solid ${col}`, color: col, background: `${col}1f`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800, transform: 'rotate(-12deg)',
                      }}>{STATUS_LABEL[status] || status}</div>
                    ) : isHoliday ? (
                      <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>공휴일</span>
                    ) : null}
                  </div>
                );
              }
              return (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>📅 6월 출석 달력</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>출석 <strong style={{ color: '#10b981' }}>{presentDays}</strong>일</div>
                  </div>
                  {/* 요일 헤더(일~토). 일요일 빨강·토요일 파랑 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                      <div key={w} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: i === 0 ? '#ef4444' : i === 6 ? '#2563eb' : 'var(--text-secondary)' }}>{w}</div>
                    ))}
                  </div>
                  {/* 7열 그리드에 위에서 만든 빈칸+날짜 셀 배치 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>{cells}</div>
                  {/* 상태별 범례(색 점 + 라벨) */}
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
              <h3 style={{ margin: 0, fontSize: '18px' }}>✊ 수강 다짐</h3>
              {/* 편집 중이 아닐 때만 작성/수정 진입 버튼 노출. 클릭 시 현재 다짐을 임시값에 복사 */}
              {!pledgeEditing && (
                <button className="btn btn-secondary" style={{ padding: '7px 15px', fontSize: '13px' }} onClick={() => { setPledgeDraft(pledge); setPledgeEditing(true); }}>
                  {pledge ? '수정' : '작성'}
                </button>
              )}
            </div>
            {/* 편집 모드면 textarea, 아니면 저장된 다짐(또는 안내 문구) 표시 */}
            {pledgeEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea value={pledgeDraft} onChange={(e) => setPledgeDraft(e.target.value)} placeholder="이번 과정에서 이루고 싶은 목표와 다짐을 적어보세요."
                  style={{ width: '100%', minHeight: '90px', padding: '11px 13px', fontSize: '16px', lineHeight: 1.6, border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" style={{ padding: '9px 18px' }} onClick={handleSavePledge}>저장</button>
                  <button className="btn btn-secondary" style={{ padding: '9px 18px' }} onClick={() => setPledgeEditing(false)}>취소</button>
                </div>
              </div>
            ) : (
              // 다짐이 비어 있으면 안내 문구를 보조 색상으로 표시. whiteSpace pre-wrap으로 줄바꿈 보존
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: pledge ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {pledge || '아직 다짐을 작성하지 않았습니다. 나만의 학습 목표를 남겨보세요.'}
              </p>
            )}
          </div>

          {/* 학습관리 바로가기 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px' }}>학습관리 바로가기</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {/* 내부 라우트 바로가기 카드들(React Router Link) */}
              {lmsLinks.map((l) => (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px',
                  textDecoration: 'none', border: '1px solid var(--border-light)', background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px',
                }}>
                  <span style={{ fontSize: '20px' }}>{l.icon}</span>{l.label}
                </Link>
              ))}
              {/* 외부 공유 게시판(Padlet) — 새 탭 + noopener로 보안 처리 */}
              <a href={PADLET_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px', textDecoration: 'none', border: '1px solid var(--border-light)', background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
                <span style={{ fontSize: '20px' }}>📌</span>공유 게시판
              </a>
              {/* 관리자에게만 관리자 페이지 진입 버튼 노출 */}
              {isAdmin && (
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px', textDecoration: 'none', border: '1px solid var(--primary-blue)', background: 'var(--primary-blue)', color: '#fff', fontWeight: 600, fontSize: '15px' }}>
                  <span style={{ fontSize: '20px' }}>🛠️</span>관리자
                </Link>
              )}
            </div>
          </div>

          <div>
            <button className="btn btn-secondary" style={{ padding: '10px 22px' }} onClick={handleSignOut}>로그아웃</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyPage;
