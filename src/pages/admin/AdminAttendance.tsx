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

const AdminAttendance = (): ReactElement => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }

    // 출석 대상: 본 사이트 가입 학생 + 유관기관 관리자(admin/superadmin)
    const [attRes, signupRes, staffRes] = await Promise.all([
      client.from(TABLES.attendance).select('*').eq('date', selectedDate),
      client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
      client.from('user_profiles').select('*').in('role', STAFF_ROLES),
    ]);

    if (attRes.data) setRecords(attRes.data as Attendance[]);

    // 중복 제거 (관리자가 본 사이트에서 가입한 경우)
    const merged = new Map<string, UserProfile>();
    [...(signupRes.data || []), ...(staffRes.data || [])].forEach((u) => {
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
      await client.from(TABLES.attendance).update({ status, check_in_time: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await client.from(TABLES.attendance).insert({ student_id: studentId, date: selectedDate, status, check_in_time: new Date().toISOString() });
    }
    showToast('출석이 기록되었습니다.', 'success');
    await loadData();
  };

  const getStatus = (studentId: string) => records.find(r => r.student_id === studentId)?.status || 'none';

  return (
    <>
      <SEOHead title="출석 관리" path="/admin/attendance" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>출석 관리</h2>
              <p style={{ margin: '6px 0 0', fontSize: '15.5px', color: 'var(--text-secondary, #6b7280)' }}>
                <strong>rest.dreamitbiz.com 가입 학생</strong>과 <strong>유관기관 관리자(admin/superadmin)</strong>만 표시됩니다.
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
                <thead><tr><th>구분</th><th>이름</th><th>이메일</th><th>상태</th><th>출석 관리</th></tr></thead>
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
        </div>
      </div>
    </>
  );
};

export default AdminAttendance;
