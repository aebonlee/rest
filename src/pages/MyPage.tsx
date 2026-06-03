import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { updateProfile } from '../utils/auth';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import { REGULAR_DATES } from '../config/regularSchedule';
import SEOHead from '../components/SEOHead';

const TABLES = {
  attendance: `${site.dbPrefix}attendance`,
  pledges: `${site.dbPrefix}pledges`,
};

const PADLET_URL = 'https://padlet.com/aebon/rest01';

interface AttRow { date: string; status: string; check_in_time: string }
const STATUS_LABEL: Record<string, string> = { present: '출석', late: '지각', absent: '결석', excused: '사유' };
const STATUS_COLOR: Record<string, string> = { present: '#10b981', late: '#d97706', absent: '#ef4444', excused: '#6b7280' };

const card: React.CSSProperties = {
  background: 'var(--bg-white)', border: '1px solid var(--border-light)',
  borderRadius: '14px', padding: '20px 22px', color: 'var(--text-primary)',
};

const MyPage = (): ReactElement => {
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const [pledge, setPledge] = useState('');
  const [pledgeDraft, setPledgeDraft] = useState('');
  const [pledgeEditing, setPledgeEditing] = useState(false);

  const [today, setToday] = useState<AttRow | null>(null);
  const [recent, setRecent] = useState<AttRow[]>([]);
  const [checking, setChecking] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isClassDay = REGULAR_DATES.includes(todayStr); // 정규 수업일에만 출석체크 (공휴일·주말 제외)
  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  useEffect(() => {
    if (profile) setForm({ displayName: profile.display_name || profile.name || '', phone: profile.phone || '' });
  }, [profile]);

  const load = useCallback(async () => {
    const client = getSupabase();
    if (!client || !user) return;
    const [attRes, pledgeRes] = await Promise.all([
      client.from(TABLES.attendance).select('date, status, check_in_time').eq('student_id', user.id).order('date', { ascending: false }).limit(40),
      client.from(TABLES.pledges).select('content').eq('user_id', user.id).maybeSingle(),
    ]);
    const rows = (attRes.data || []) as AttRow[];
    setRecent(rows);
    setToday(rows.find((r) => r.date === todayStr) || null);
    if (pledgeRes.data) { setPledge(pledgeRes.data.content || ''); setPledgeDraft(pledgeRes.data.content || ''); }
  }, [user, todayStr]);

  useEffect(() => { load(); }, [load]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(user!.id, { display_name: form.displayName, name: form.displayName, phone: form.phone });
      await refreshProfile();
      setEditing(false);
      showToast('회원정보가 저장되었습니다.', 'success');
    } catch (err) {
      showToast('저장 실패: ' + (err as Error).message, 'error');
    } finally { setSaving(false); }
  };

  const handleCheckIn = async () => {
    const client = getSupabase();
    if (!client || !user) return;
    if (!isClassDay) { showToast('오늘은 수업일이 아닙니다 (공휴일·주말 등).', 'warning'); return; }
    setChecking(true);
    // 수업 시작 14:00 기준 — 14:10 이후 체크인은 지각 처리
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const status = mins > 14 * 60 + 10 ? 'late' : 'present';
    const { error } = await client.from(TABLES.attendance).upsert(
      { student_id: user.id, date: todayStr, status, check_in_time: now.toISOString() },
      { onConflict: 'student_id,date' }
    );
    setChecking(false);
    if (error) showToast('출석체크 실패: ' + error.message, 'error');
    else { showToast(status === 'late' ? '지각으로 체크되었습니다 (14:10 이후).' : '출석 완료!', status === 'late' ? 'warning' : 'success'); load(); }
  };

  const handleSavePledge = async () => {
    const client = getSupabase();
    if (!client || !user) return;
    const { error } = await client.from(TABLES.pledges).upsert(
      { user_id: user.id, user_name: userName, content: pledgeDraft.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) { showToast('저장 실패: ' + error.message, 'error'); return; }
    setPledge(pledgeDraft.trim()); setPledgeEditing(false); showToast('수강 다짐이 저장되었습니다.', 'success');
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const lmsLinks = [
    { to: '/dashboard', icon: '📊', label: '대시보드' },
    { to: '/materials', icon: '📁', label: '강의자료' },
    { to: '/assignments', icon: '📝', label: '과제' },
    { to: '/project-vote', icon: '🧩', label: '팀구성' },
    { to: '/project-board', icon: '🗂️', label: '프로젝트 관리' },
    { to: '/qna', icon: '❓', label: 'Q&A' },
  ];
  const joinedAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-';

  return (
    <>
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
                  <button className="btn btn-primary" style={{ padding: '9px 18px' }} disabled={saving} onClick={handleSaveProfile}>{saving ? '저장 중…' : '저장'}</button>
                  <button className="btn btn-secondary" style={{ padding: '9px 18px' }} onClick={() => setEditing(false)}>취소</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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
                  {todayStr} · {isClassDay ? '수업시작 14:00 (14:10 이후 체크인은 지각)' : '오늘은 수업일이 아닙니다 (공휴일·주말 등)'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {today ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, background: '#d1fae5', color: '#065f46' }}>
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
            {(() => {
              const attMap: Record<string, string> = {};
              recent.forEach((r) => { attMap[r.date] = r.status; });
              const firstDow = new Date(2026, 5, 1).getDay();
              const HOLIDAY = '2026-06-03';
              const presentDays = recent.filter((r) => r.status === 'present' && r.date.startsWith('2026-06')).length;
              const cells: ReactElement[] = [];
              for (let i = 0; i < firstDow; i++) cells.push(<div key={`b${i}`} />);
              for (let d = 1; d <= 30; d++) {
                const ds = `2026-06-${String(d).padStart(2, '0')}`;
                const dow = new Date(2026, 5, d).getDay();
                const isWeekend = dow === 0 || dow === 6;
                const isHoliday = ds === HOLIDAY;
                const isClass = !isWeekend && d <= 22 && !isHoliday;
                const status = attMap[ds];
                const col = status ? STATUS_COLOR[status] : '';
                cells.push(
                  <div key={ds} style={{
                    position: 'relative', aspectRatio: '1 / 1', borderRadius: '8px',
                    border: `1px solid ${isClass ? 'var(--border-light)' : 'transparent'}`,
                    background: isHoliday ? '#fef3c7' : isClass ? 'var(--bg-white)' : 'var(--bg-light-gray)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isWeekend && !status ? 0.45 : 1,
                  }}>
                    <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '11px', fontWeight: 600, color: dow === 0 ? '#ef4444' : dow === 6 ? '#2563eb' : 'var(--text-secondary)' }}>{d}</span>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                      <div key={w} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: i === 0 ? '#ef4444' : i === 6 ? '#2563eb' : 'var(--text-secondary)' }}>{w}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>{cells}</div>
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
              {!pledgeEditing && (
                <button className="btn btn-secondary" style={{ padding: '7px 15px', fontSize: '13px' }} onClick={() => { setPledgeDraft(pledge); setPledgeEditing(true); }}>
                  {pledge ? '수정' : '작성'}
                </button>
              )}
            </div>
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
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: pledge ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {pledge || '아직 다짐을 작성하지 않았습니다. 나만의 학습 목표를 남겨보세요.'}
              </p>
            )}
          </div>

          {/* 학습관리 바로가기 */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: '18px' }}>학습관리 바로가기</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {lmsLinks.map((l) => (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px',
                  textDecoration: 'none', border: '1px solid var(--border-light)', background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px',
                }}>
                  <span style={{ fontSize: '20px' }}>{l.icon}</span>{l.label}
                </Link>
              ))}
              <a href={PADLET_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 15px', borderRadius: '10px', textDecoration: 'none', border: '1px solid var(--border-light)', background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
                <span style={{ fontSize: '20px' }}>📌</span>공유 게시판
              </a>
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
