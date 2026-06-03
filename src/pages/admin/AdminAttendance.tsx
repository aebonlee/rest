import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson, type PersonGroup } from '../../utils/people';
import { exportTableWord, exportTablePdf, type Cell } from '../../utils/exportTable';
import { ADMIN_EMAILS } from '../../config/admin';
import type { Attendance, UserProfile } from '../../types';

const TABLES = { attendance: `${site.dbPrefix}attendance` };
const REST_HOSTNAME = new URL(site.url).hostname;
const STAFF_ROLES = ['admin', 'superadmin'];

/** 정규 수업일 (6/1~6/22 평일, 6/3 공휴일) */
const CLASS_DAYS: number[] = (() => {
  const arr: number[] = [];
  for (let d = 1; d <= 22; d++) {
    const dow = new Date(2026, 5, d).getDay();
    if (dow !== 0 && dow !== 6 && d !== 3) arr.push(d);
  }
  return arr;
})();
const ABBR: Record<string, string> = { present: '출', late: '지', absent: '결', excused: '사' };
const ABBR_COLOR: Record<string, string> = { present: '#10b981', late: '#d97706', absent: '#ef4444', excused: '#6b7280' };
const dateOfJune = (d: number) => `2026-06-${String(d).padStart(2, '0')}`;

const AdminAttendance = (): ReactElement => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [monthly, setMonthly] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }

    // 출석 대상: 본 사이트 가입 학생만 (총괄관리자/관리자 역할 + 백진주 등 관리자 이메일 제외)
    const [attRes, monthRes, signupRes] = await Promise.all([
      client.from(TABLES.attendance).select('*').eq('date', selectedDate),
      client.from(TABLES.attendance).select('student_id, date, status').gte('date', '2026-06-01').lte('date', '2026-06-30'),
      client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
    ]);

    if (attRes.data) setRecords(attRes.data as Attendance[]);
    setMonthly((monthRes.data || []) as Attendance[]);

    const list = ((signupRes.data || []) as UserProfile[])
      .filter((u) => !STAFF_ROLES.includes(u.role) && !ADMIN_EMAILS.includes((u.email || '').toLowerCase()))
      .sort((a, b) => (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || ''));
    setStudents(list);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedDate]);

  // 동일인(전화/이름) 통합 — 이메일 2개여도 한 명. 출결은 모든 계정 id 기준으로 조회
  const people = useMemo(() => groupByPerson(students), [students]);

  /** 동일인의 여러 계정 중 선택일 출결 레코드 */
  const findRecord = (ids: string[]) => records.find(r => ids.includes(r.student_id));

  const markAttendance = async (person: PersonGroup, status: 'present' | 'absent' | 'late' | 'excused') => {
    const client = getSupabase();
    if (!client) return;
    const existing = findRecord(person.ids);
    if (existing) {
      // 관리자 수정·보완: 상태만 변경, 학생의 원래 체크인 시각은 보존
      await client.from(TABLES.attendance).update({ status }).eq('id', existing.id);
    } else {
      // 신규 기록은 대표 계정 id로 저장
      await client.from(TABLES.attendance).insert({ student_id: person.primary.id, date: selectedDate, status, check_in_time: new Date().toISOString() });
    }
    showToast('출결이 수정되었습니다.', 'success');
    await loadData();
  };

  // 상태 해제 — 선택일의 출결 기록 삭제(미체크 상태로 되돌림)
  const clearAttendance = async (person: PersonGroup) => {
    const client = getSupabase();
    if (!client) return;
    const existing = findRecord(person.ids);
    if (!existing) return;
    await client.from(TABLES.attendance).delete().eq('id', existing.id);
    showToast('출결 상태를 해제했습니다.', 'success');
    await loadData();
  };

  const getStatus = (ids: string[]) => findRecord(ids)?.status || 'none';
  const getCheckIn = (ids: string[]) => {
    const t = findRecord(ids)?.check_in_time;
    return t ? new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
  };

  // 월별 매트릭스 조회 { personKey|date → status } — 동일인 합산(우선순위: 출석>지각>사유>결석)
  const STATUS_RANK: Record<string, number> = { present: 3, late: 2, excused: 1, absent: 0 };
  const idToKey = new Map<string, string>();
  people.forEach(p => p.ids.forEach(id => idToKey.set(id, p.key)));
  const monthLookup: Record<string, string> = {};
  monthly.forEach(r => {
    const pkey = idToKey.get(r.student_id);
    if (!pkey) return;
    const k = `${pkey}|${r.date}`;
    const prev = monthLookup[k];
    if (!prev || (STATUS_RANK[r.status] ?? -1) > (STATUS_RANK[prev] ?? -1)) monthLookup[k] = r.status;
  });
  const tally = (pkey: string, st: string) => CLASS_DAYS.filter(d => monthLookup[`${pkey}|${dateOfJune(d)}`] === st).length;

  // ── 일자별 출결일지 다운로드 (Word / PDF) ──
  const STATUS_KO: Record<string, string> = { present: '출석', late: '지각', absent: '결석', excused: '사유', none: '-' };
  const ATT_COLUMNS = ['이름', '이메일', '체크인', '출결상태'];
  const buildAttendanceRows = (): Cell[][] =>
    people.map((g) => [g.name, g.emails.join(' / '), getCheckIn(g.ids), STATUS_KO[getStatus(g.ids)] || '-']);
  const attTitle = `출결일지 ${selectedDate}`;
  const attSubtitle = `AI Reboot Academy · ${selectedDate} · 대상 ${people.length}명 · 발행 ${new Date().toLocaleDateString('ko-KR')}`;
  const downloadAttWord = () => exportTableWord(`출결일지_${selectedDate}`, attTitle, ATT_COLUMNS, buildAttendanceRows(), attSubtitle);
  const downloadAttPdf = () => exportTablePdf(attTitle, ATT_COLUMNS, buildAttendanceRows(), attSubtitle);

  return (
    <>
      <SEOHead title="출석 관리" path="/admin/attendance" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>출결일지</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                학생 자가 체크인 시각을 확인하고 출결을 <strong>수정·보완</strong>하세요. <strong>rest.dreamitbiz.com 가입 학생</strong>만 표시됩니다(관리자 제외).
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              총 {people.length}명
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="date-input" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>이 날짜 출결일지:</span>
            <button type="button" onClick={downloadAttWord} disabled={loading || people.length === 0} style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px', background: '#2b579a', color: '#fff',
            }}>⬇ Word</button>
            <button type="button" onClick={downloadAttPdf} disabled={loading || people.length === 0} style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px', background: '#b91c1c', color: '#fff',
            }}>⬇ PDF</button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : people.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary, #f8f9fa)',
              borderRadius: '12px',
              color: 'var(--text-secondary, #6b7280)',
            }}>
              본 사이트에 가입한 학생이나 등록된 관리자가 없습니다.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>구분</th><th>이름</th><th>이메일</th><th>체크인</th><th>상태</th><th>수정·보완</th></tr></thead>
                <tbody>
                  {people.map(g => {
                    const s = g.primary;
                    const status = getStatus(g.ids);
                    const isStaff = STAFF_ROLES.includes(s.role);
                    return (
                      <tr key={g.key}>
                        <td>
                          <span className={`role-badge ${s.role}`} style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            background: isStaff ? '#fef3c7' : '#dbeafe',
                            color: isStaff ? '#92400e' : '#1e3a8a',
                          }}>
                            {s.role === 'superadmin' ? '총괄 관리자' : s.role === 'admin' ? '관리자' : '학생'}
                          </span>
                        </td>
                        <td>
                          {g.name}
                          {g.isMerged && (
                            <span title={`동일인 ${g.accounts.length}계정`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}</span>
                          )}
                        </td>
                        <td>
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary, #6b7280)' }}>{getCheckIn(g.ids)}</td>
                        <td><span className={`attendance-status ${status}`}>{status === 'present' ? '출석' : status === 'absent' ? '결석' : status === 'late' ? '지각' : status === 'excused' ? '사유' : '-'}</span></td>
                        <td>
                          <div className="attendance-actions">
                            <button className={`att-btn ${status === 'present' ? 'active' : ''}`} onClick={() => markAttendance(g, 'present')}>출석</button>
                            <button className={`att-btn ${status === 'late' ? 'active' : ''}`} onClick={() => markAttendance(g, 'late')}>지각</button>
                            <button className={`att-btn ${status === 'absent' ? 'active' : ''}`} onClick={() => markAttendance(g, 'absent')}>결석</button>
                            <button className={`att-btn ${status === 'excused' ? 'active' : ''}`} onClick={() => markAttendance(g, 'excused')}>사유</button>
                            <button className="att-btn att-btn-clear" onClick={() => clearAttendance(g)} disabled={status === 'none'} title="출결 상태 해제(미체크로 되돌림)">상태해제</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 월별 전체 출석 현황 */}
          {!loading && people.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ margin: '0 0 4px' }}>6월 전체 출석 현황</h3>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                정규 수업일 {CLASS_DAYS.length}일 기준 (6/1~6/22 평일, 6/3 공휴일) · <span style={{ color: '#10b981', fontWeight: 700 }}>출</span> 출석 · <span style={{ color: '#d97706', fontWeight: 700 }}>지</span> 지각 · <span style={{ color: '#ef4444', fontWeight: 700 }}>결</span> 결석 · <span style={{ color: '#6b7280', fontWeight: 700 }}>사</span> 사유
              </p>
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', left: 0, background: 'var(--bg-light-gray, #f5f7fa)' }}>이름</th>
                      {CLASS_DAYS.map(d => <th key={d} style={{ textAlign: 'center', minWidth: '30px' }}>{d}</th>)}
                      <th style={{ textAlign: 'center' }}>출석</th>
                      <th style={{ textAlign: 'center' }}>지각</th>
                      <th style={{ textAlign: 'center' }}>결석</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map(g => (
                      <tr key={g.key}>
                        <td style={{ position: 'sticky', left: 0, background: 'var(--bg-white, #fff)', fontWeight: 600, whiteSpace: 'nowrap' }}>{g.name}</td>
                        {CLASS_DAYS.map(d => {
                          const st = monthLookup[`${g.key}|${dateOfJune(d)}`];
                          return (
                            <td key={d} style={{ textAlign: 'center', padding: '6px 2px' }}>
                              {st ? <span style={{ fontWeight: 800, color: ABBR_COLOR[st] }}>{ABBR[st]}</span> : <span style={{ color: 'var(--border-light, #d1d5db)' }}>·</span>}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{tally(g.key, 'present')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#d97706' }}>{tally(g.key, 'late')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#ef4444' }}>{tally(g.key, 'absent')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAttendance;
