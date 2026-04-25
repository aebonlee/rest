import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import type { UserProfile } from '../../types';

const AdminStudents = (): ReactElement => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      const { data } = await client.from('user_profiles').select('*').order('last_sign_in_at', { ascending: false });
      if (data) setStudents(data as UserProfile[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <SEOHead title="수강생 관리" path="/admin/students" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>수강생 관리</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr><th>이름</th><th>이메일</th><th>전화번호</th><th>가입방식</th><th>역할</th><th>최근접속</th></tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>{s.display_name || s.name || '-'}</td>
                      <td>{s.email}</td>
                      <td>{s.phone || '-'}</td>
                      <td>{s.provider}</td>
                      <td><span className={`role-badge ${s.role}`}>{s.role}</span></td>
                      <td>{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminStudents;
