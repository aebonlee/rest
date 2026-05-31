import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { getAllAssessments, type AssessmentRecord } from '../../utils/assessments';
import type { UserProfile } from '../../types';

const REST_HOSTNAME = new URL(site.url).hostname;
const STAFF_ROLES = ['admin', 'superadmin'];
const GRADED_TYPES = ['prerequisite', 'summative'] as const;
const TYPE_LABEL: Record<string, string> = { prerequisite: '선수평가', summative: '사후평가' };

const AdminGrades = (): ReactElement => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [grades, setGrades] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      const [signupRes, gradeList] = await Promise.all([
        client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
        getAllAssessments(),
      ]);
      const list = ((signupRes.data || []) as UserProfile[])
        .filter((u) => !STAFF_ROLES.includes(u.role))
        .sort((a, b) => (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || ''));
      setStudents(list);
      setGrades(gradeList);
      setLoading(false);
    };
    load();
  }, []);

  /** 학생 id → { type → 성적 } 매핑 */
  const gradeMap = useMemo(() => {
    const m = new Map<string, Record<string, AssessmentRecord>>();
    grades.forEach((g) => {
      const byType = m.get(g.student_id) || {};
      byType[g.type] = g;
      m.set(g.student_id, byType);
    });
    return m;
  }, [grades]);

  /** 평가별 통계 (응시자 수 / 합격자 수 / 평균) */
  const stats = useMemo(() => {
    return GRADED_TYPES.map((t) => {
      const rows = grades.filter((g) => g.type === t);
      const passed = rows.filter((g) => g.passed).length;
      const avg = rows.length ? Math.round(rows.reduce((s, g) => s + g.score, 0) / rows.length) : 0;
      return { type: t, taken: rows.length, passed, avg };
    });
  }, [grades]);

  const scoreCell = (g: AssessmentRecord | undefined): ReactElement => {
    if (!g) return <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>미응시</span>;
    return (
      <span style={{ fontWeight: 700, color: g.passed ? '#10b981' : '#ef4444' }}>
        {g.score}점
        <span style={{
          marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px',
          background: g.passed ? '#d1fae5' : '#fee2e2', color: g.passed ? '#065f46' : '#991b1b',
        }}>{g.passed ? '합격' : '불합격'}</span>
      </span>
    );
  };

  return (
    <>
      <SEOHead title="학습평가 성적" path="/admin/grades" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>학습평가 성적</h2>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)' }}>
                <strong>선수평가</strong>(합격 40점) · <strong>사후평가</strong>(합격 60점) 채점 결과입니다. 진단평가는 자습용이라 집계되지 않습니다.
              </p>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              수강생 {students.length}명
            </div>
          </div>

          {/* 평가별 요약 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {stats.map((s) => (
              <div key={s.type} style={{
                border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px',
                padding: '16px 18px', background: 'var(--bg-white, #fff)',
              }}>
                <strong style={{ fontSize: '14px' }}>{TYPE_LABEL[s.type]}</strong>
                <div style={{ display: 'flex', gap: '18px', marginTop: '8px', fontSize: '13px' }}>
                  <span>응시 <strong>{s.taken}</strong></span>
                  <span>합격 <strong style={{ color: '#10b981' }}>{s.passed}</strong></span>
                  <span>평균 <strong>{s.avg}점</strong></span>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : students.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--bg-light-gray, #f8f9fa)',
              borderRadius: '12px', color: 'var(--text-secondary, #6b7280)',
            }}>
              본 사이트에 가입한 학생이 없습니다.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>이름</th><th>이메일</th><th>선수평가</th><th>사후평가</th><th>최근 응시</th></tr></thead>
                <tbody>
                  {students.map((s) => {
                    const byType = gradeMap.get(s.id) || {};
                    const dates = GRADED_TYPES.map((t) => byType[t]?.submitted_at).filter(Boolean) as string[];
                    const latest = dates.sort().slice(-1)[0];
                    return (
                      <tr key={s.id}>
                        <td>{s.display_name || s.name || '-'}</td>
                        <td>{s.email}</td>
                        <td>{scoreCell(byType.prerequisite)}</td>
                        <td>{scoreCell(byType.summative)}</td>
                        <td>{latest ? new Date(latest).toLocaleDateString('ko-KR') : '-'}</td>
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

export default AdminGrades;
