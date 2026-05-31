import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Attendance, UserProfile } from '../../types';

const TABLES = { attendance: `${site.dbPrefix}attendance` };
const REST_HOSTNAME = new URL(site.url).hostname;
const STAFF_ROLES = ['admin', 'superadmin'];

/** 정규 수업일 (6/1~6/22 평일, 6/3 휴강) */
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

    // 출석 대상: 본 사이트 가입 학생 + 총괄 관리자(superadmin)만
    const [attRes, monthRes, signupRes, staffRes] = await Promise.all([
      client.from(TABLES.attendance).select('*').eq('date', selectedDate),
      client.from(TABLES.attendance).select('student_id, date, status').gte('date', '2026-06-01').lte('date', '2026-06-30'),
      client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
      client.from('user_profiles').select('*').eq('role', 'superadmin'),
    ]);

    if (attRes.data) setRecords(attRes.data as Attendance[]);
    setMonthly((monthRes.data || []) as Attendance[]);

    // 가입 학생 중 관리자/총괄관리자는 제외(학생만) + 총괄 관리자 합치기
    const students = (signupRes.data || []).filter((u) => !STAFF_ROLES.includes((u as UserProfile).role));
    const merged = new Map<string, UserProfile>();
    [...students, ...(staffRes.data || [])].forEach((u) => {
      merged.set((u as UserProfile).id, u as UserProfile);
    });
    const list = Array.from(merged.values()).sort((a, b) => {
      // 관리자 먼저, 그 다음 학생 — 같은 그룹 내에서는 이름순
      const aStaff = STAFF_ROLES.includes(a.role) ? 0 : 1;
      const bStaff = STAFF_ROLES.includes(b.role) ? 0 : 1;
      if (aStaff !== bStaff) return aStaff - bStaff;
      return (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || '');
    });
    setStudents(list);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedDate]);

  const markAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    const client = getSupabase();
    if (!client) return;
    const existing = records.find(r => r.student_id === studentId);
    if (existing) {
      // 관리자 수정·보완: 상태만 변경, 학생의 원래 체크인 시각은 보존
      await client.from(TABLES.attendance).update({ status }).eq('id', existing.id);
    } else {
      await client.from(TABLES.attendance).insert({ student_id: studentId, date: selectedDate, status, check_in_time: new Date().toISOString() });
    }
    showToast('출결이 수정되었습니다.', 'success');
    await loadData();
  };

  const getStatus = (studentId: string) => records.find(r => r.student_id === studentId)?.status || 'none';
  const getCheckIn = (studentId: string) => {
    const t = records.find(r => r.student_id === studentId)?.check_in_time;
    return t ? new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
  };

  // 월별 매트릭스 조회 { studentId|date → status }
  const monthLookup: Record<string, string> = {};
  monthly.forEach(r => { monthLookup[`${r.student_id}|${r.date}`] = r.status; });
  const tally = (sid: string, st: string) => CLASS_DAYS.filter(d => monthLookup[`${sid}|${dateOfJune(d)}`] === st).length;

  return (
    <>
      <SEOHead title="출석 관리" path="/admin/attendance" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>출결일지</h2>
              <p style={{ margin: '6px 0 0', fontSize: '15.5px', color: 'var(--text-secondary, #6b7280)' }}>
                학생 자가 체크인 시각을 확인하고 출결을 <strong>수정·보완</strong>하세요. <strong>rest.dreamitbiz.com 가입 학생</strong> + 총괄 관리자만 표시됩니다.
              </p>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              총 {students.length}명
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="date-input" />
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : students.length === 0 ? (
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
                  {students.map(s => {
                    const status = getStatus(s.id);
                    const isStaff = STAFF_ROLES.includes(s.role);
                    return (
                      <tr key={s.id}>
                        <td>
                          <span className={`role-badge ${s.role}`} style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            background: isStaff ? '#fef3c7' : '#dbeafe',
                            color: isStaff ? '#92400e' : '#1e3a8a',
                          }}>
                            {s.role === 'superadmin' ? '총괄 관리자' : s.role === 'admin' ? '관리자' : '학생'}
                          </span>
                        </td>
                        <td>{s.display_name || s.name || '-'}</td>
                        <td>{s.email}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary, #6b7280)' }}>{getCheckIn(s.id)}</td>
                        <td><span className={`attendance-status ${status}`}>{status === 'present' ? '출석' : status === 'absent' ? '결석' : status === 'late' ? '지각' : status === 'excused' ? '사유' : '-'}</span></td>
                        <td>
                          <div className="attendance-actions">
                            <button className={`att-btn ${status === 'present' ? 'active' : ''}`} onClick={() => markAttendance(s.id, 'present')}>출석</button>
                            <button className={`att-btn ${status === 'late' ? 'active' : ''}`} onClick={() => markAttendance(s.id, 'late')}>지각</button>
                            <button className={`att-btn ${status === 'absent' ? 'active' : ''}`} onClick={() => markAttendance(s.id, 'absent')}>결석</button>
                            <button className={`att-btn ${status === 'excused' ? 'active' : ''}`} onClick={() => markAttendance(s.id, 'excused')}>사유</button>
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
          {!loading && students.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ margin: '0 0 4px' }}>6월 전체 출석 현황</h3>
              <p style={{ margin: '0 0 14px', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                정규 수업일 {CLASS_DAYS.length}일 기준 (6/1~6/22 평일, 6/3 휴강) · <span style={{ color: '#10b981', fontWeight: 700 }}>출</span> 출석 · <span style={{ color: '#d97706', fontWeight: 700 }}>지</span> 지각 · <span style={{ color: '#ef4444', fontWeight: 700 }}>결</span> 결석 · <span style={{ color: '#6b7280', fontWeight: 700 }}>사</span> 사유
              </p>
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ fontSize: '13px' }}>
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
                    {students.map(s => (
                      <tr key={s.id}>
                        <td style={{ position: 'sticky', left: 0, background: 'var(--bg-white, #fff)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.display_name || s.name || s.email}</td>
                        {CLASS_DAYS.map(d => {
                          const st = monthLookup[`${s.id}|${dateOfJune(d)}`];
                          return (
                            <td key={d} style={{ textAlign: 'center', padding: '6px 2px' }}>
                              {st ? <span style={{ fontWeight: 800, color: ABBR_COLOR[st] }}>{ABBR[st]}</span> : <span style={{ color: 'var(--border-light, #d1d5db)' }}>·</span>}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{tally(s.id, 'present')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#d97706' }}>{tally(s.id, 'late')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#ef4444' }}>{tally(s.id, 'absent')}</td>
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
