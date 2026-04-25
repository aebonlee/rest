import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Attendance, UserProfile } from '../../types';

const TABLES = { attendance: `${site.dbPrefix}attendance` };

const AdminAttendance = (): ReactElement => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    const [attRes, studRes] = await Promise.all([
      client.from(TABLES.attendance).select('*').eq('date', selectedDate),
      client.from('user_profiles').select('*').order('name'),
    ]);
    if (attRes.data) setRecords(attRes.data as Attendance[]);
    if (studRes.data) setStudents(studRes.data as UserProfile[]);
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
          <h2>출석 관리</h2>
          <div style={{ marginBottom: '24px' }}>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="date-input" />
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>이름</th><th>이메일</th><th>상태</th><th>출석 관리</th></tr></thead>
                <tbody>
                  {students.map(s => {
                    const status = getStatus(s.id);
                    return (
                      <tr key={s.id}>
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
