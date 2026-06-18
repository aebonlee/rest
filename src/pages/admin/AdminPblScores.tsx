/**
 * AdminPblScores.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * 역할:
 *   관리자용 "PBL 활동 항목별 점수표" 페이지.
 *   학생(행) × PBL 단계/항목(열) 매트릭스로 단계별 점수를 한눈에 보여준다.
 *   - 기존 PblEval(/pbl/eval)은 학생 1명을 골라 단계별로 채점하는 "상세" 화면이고,
 *     이 페이지는 전체 학생을 가로질러 항목별 점수를 비교하는 "집계표" 화면이다.
 *
 * 핵심 책임:
 *   1) getAllSubmissions()로 전체 제출 로드(관리자 RLS).
 *   2) 단계(항목)별 강사 점수를 매트릭스로 표시(자동 점수는 보조로 작게).
 *   3) 단계별 평균 요약 + Excel/PDF 다운로드.
 *
 * 주요 export: default AdminPblScores
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { EmojiIcon } from '../../utils/emojiIcon';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { PBL_STAGES, PBL_TOTAL, totalScore, autoTotal, autoStagePoints } from '../../config/pblActivity';
import { getAllSubmissions, type PblSubmission } from '../../utils/pblStore';
import { exportTableExcel, exportTablePdf, type Cell } from '../../utils/exportTable';

// 강사 점수 표시 색상(점수대별) — 보기 쉽게 구간으로 색을 나눈다.
const scoreColor = (got: number, max: number): string => {
  if (max === 0) return 'var(--text-secondary, #9ca3af)';
  const r = got / max;
  if (r >= 0.8) return '#10b981';
  if (r >= 0.5) return '#f59e0b';
  return '#ef4444';
};

const AdminPblScores = (): ReactElement => {
  const [rows, setRows] = useState<PblSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  // 정렬 기준: 'name' | 'total'(강사 합계 내림차순)
  const [sortBy, setSortBy] = useState<'name' | 'total'>('total');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAllSubmissions();
      setRows(data);
      setLoading(false);
    };
    load();
  }, []);

  // 정렬된 학생 목록
  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sortBy === 'total') {
      copy.sort((a, b) => totalScore(b.scores) - totalScore(a.scores)
        || (a.student_name || '').localeCompare(b.student_name || ''));
    } else {
      copy.sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''));
    }
    return copy;
  }, [rows, sortBy]);

  // 단계(항목)별 평균(강사 점수, 입력된 건만 평균) — 요약용
  const stageAvg = useMemo(() => {
    return PBL_STAGES.map((st) => {
      const vals = rows
        .map((r) => r.scores?.[st.key])
        .filter((v): v is number => typeof v === 'number');
      const avg = vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : null;
      return { key: st.key, label: st.label, max: st.max, graded: vals.length, avg };
    });
  }, [rows]);

  // ── 다운로드(Excel/PDF) ──
  const COLUMNS = ['No.', '이름', '주제', ...PBL_STAGES.map((s) => `${s.label}(${s.max})`), `강사합계(${PBL_TOTAL})`, `자동합계(${PBL_TOTAL})`];
  const buildRows = (): Cell[][] =>
    sorted.map((r, idx) => [
      idx + 1,
      r.student_name || '(이름없음)',
      r.project_topic || '',
      ...PBL_STAGES.map((s) => (typeof r.scores?.[s.key] === 'number' ? r.scores[s.key] : '')),
      totalScore(r.scores),
      autoTotal(r.auto),
    ]);
  const downloadExcel = () => exportTableExcel('PBL_항목별_점수표.xlsx', 'PBL 항목별 점수', COLUMNS, buildRows());
  const downloadPdf = () => exportTablePdf(
    'PBL 활동 항목별 점수표', COLUMNS, buildRows(),
    `AI Reboot Academy · 제출 ${rows.length}명 · 만점 ${PBL_TOTAL}점 · 발행 ${new Date().toLocaleDateString('ko-KR')}`,
  );

  return (
    <>
      <SEOHead title="PBL 항목별 점수표" path="/admin/pbl-scores" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 헤더 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>PBL 활동 항목별 점수표</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                학생 × 단계(항목) 매트릭스로 단계별 <strong>강사 점수</strong>를 한눈에 봅니다. (작은 글씨는 🤖 자동환산 점수)
                개별 채점은 <a href="/pbl/eval" style={{ color: 'var(--primary-blue, #0046C8)' }}>PBL 평가</a>에서 합니다.
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              제출 {rows.length}명
            </div>
          </div>

          {/* 단계별 평균 요약 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {stageAvg.map((s) => (
              <div key={s.key} style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', padding: '12px 14px', background: 'var(--bg-white, #fff)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{s.label} <span style={{ fontWeight: 400, color: 'var(--text-secondary, #9ca3af)' }}>/{s.max}</span></div>
                <div style={{ fontSize: '13.5px' }}>
                  평균 <strong style={{ color: s.avg !== null ? scoreColor(s.avg, s.max) : 'var(--text-secondary, #9ca3af)' }}>{s.avg !== null ? s.avg : '-'}</strong>
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-secondary, #9ca3af)' }}>채점 {s.graded}명</span>
                </div>
              </div>
            ))}
          </div>

          {/* 도구: 정렬 + 다운로드 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px', padding: '12px 14px', background: 'var(--bg-light-gray, #f8f9fa)', border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 600 }}>정렬</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'total')}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-light, #e5e7eb)', background: 'var(--bg-white, #fff)', color: 'var(--text-primary)' }}>
              <option value="total">강사 합계 높은순</option>
              <option value="name">이름순</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button type="button" onClick={downloadExcel} disabled={loading || rows.length === 0}
                style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: '7px', background: '#107c41', color: '#fff' }}><EmojiIcon char="⬇" /> Excel</button>
              <button type="button" onClick={downloadPdf} disabled={loading || rows.length === 0}
                style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: '7px', background: '#b91c1c', color: '#fff' }}><EmojiIcon char="⬇" /> PDF</button>
            </div>
          </div>

          {/* 본문 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-light-gray, #f8f9fa)', borderRadius: '12px', color: 'var(--text-secondary, #6b7280)' }}>
              아직 제출한 학생이 없습니다. (학생이 PBL 활동 기본정보를 저장하면 표시됩니다)
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '44px', textAlign: 'center' }}>No.</th>
                    <th style={{ minWidth: '110px' }}>이름</th>
                    {PBL_STAGES.map((s) => (
                      <th key={s.key} style={{ textAlign: 'center', minWidth: '78px' }} title={s.label}>
                        <span style={{ display: 'block' }}>{s.icon}</span>
                        <span style={{ fontSize: '12px' }}>{s.label}</span>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, color: 'var(--text-secondary, #9ca3af)' }}>/{s.max}</span>
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', minWidth: '78px' }}>강사<br />합계</th>
                    <th style={{ textAlign: 'center', minWidth: '78px' }}>자동<br />합계</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => (
                    <tr key={r.user_id}>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary, #6b7280)' }}>{idx + 1}</td>
                      <td>
                        {r.student_name || '(이름없음)'}
                        {r.project_topic && <div style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)' }}>{r.project_topic}</div>}
                      </td>
                      {PBL_STAGES.map((s) => {
                        const sc = r.scores?.[s.key];
                        const au = r.auto?.[s.key];
                        return (
                          <td key={s.key} style={{ textAlign: 'center' }}>
                            {typeof sc === 'number'
                              ? <span style={{ fontWeight: 700, color: scoreColor(sc, s.max) }}>{sc}</span>
                              : <span style={{ color: 'var(--text-secondary, #d1d5db)' }}>–</span>}
                            {typeof au === 'number' && (
                              <div style={{ fontSize: '11px', color: '#3b82f6' }} title="자동환산">🤖 {autoStagePoints(au, s.max)}</div>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 800, color: scoreColor(totalScore(r.scores), PBL_TOTAL) }}>
                        {totalScore(r.scores)}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#3b82f6' }}>{autoTotal(r.auto)}</td>
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

export default AdminPblScores;
