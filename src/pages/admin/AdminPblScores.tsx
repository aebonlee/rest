/**
 * AdminPblScores.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * 역할:
 *   관리자용 "PBL 활동 항목별 점수표" 페이지.
 *   학생(행) × PBL 단계/항목(열) 매트릭스로 단계별 점수를 한눈에 보여준다.
 *   - 기준은 활성 명단(ACTIVE_ROSTER) 29명 전원이며, 제출(저장)한 학생은 점수를,
 *     미제출 학생은 "미제출"로 표시한다. (PblEval 상세 채점과 달리 전체 집계표)
 *   - 명단에 없는 계정으로 제출된 건(명단 외 제출)은 누락 없이 하단에 별도 표기.
 *
 * 핵심 책임:
 *   1) getAllSubmissions()로 전체 제출 로드(관리자 RLS) → 명단과 이메일/이름으로 매칭.
 *   2) 단계(항목)별 강사 점수를 매트릭스로 표시(자동 점수는 보조로 작게).
 *   3) Excel/PDF 다운로드.
 *
 * 주요 export: default AdminPblScores
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { PBL_STAGES, PBL_TOTAL, totalScore, autoTotal, autoStagePoints } from '../../config/pblActivity';
import { getAllSubmissions, type PblSubmission } from '../../utils/pblStore';
import { exportTableExcel, exportTablePdf, type Cell } from '../../utils/exportTable';
import { ACTIVE_ROSTER } from '../../config/roster';

// 강사 점수 표시 색상(점수대별) — 보기 쉽게 구간으로 색을 나눈다.
const scoreColor = (got: number, max: number): string => {
  if (max === 0) return 'var(--text-secondary, #9ca3af)';
  const r = got / max;
  if (r >= 0.8) return '#10b981';
  if (r >= 0.5) return '#f59e0b';
  return '#ef4444';
};

// 명단 한 명 = 한 행. sub가 null이면 미제출.
interface Row { no: number; name: string; sub: PblSubmission | null }

const AdminPblScores = (): ReactElement => {
  const [subs, setSubs] = useState<PblSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  // 정렬 기준: 명단순(번호) | 합계 높은순 | 이름순
  const [sortBy, setSortBy] = useState<'roster' | 'total' | 'name'>('roster');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAllSubmissions();
      setSubs(data);
      setLoading(false);
    };
    load();
  }, []);

  // 제출을 이메일(우선)·이름(보조)로 색인 → 명단과 매칭
  const { people, orphans } = useMemo(() => {
    const byEmail = new Map<string, PblSubmission>();
    const byName = new Map<string, PblSubmission>();
    subs.forEach((s) => {
      const e = (s.email || '').toLowerCase().trim();
      if (e && !byEmail.has(e)) byEmail.set(e, s);
      const n = (s.student_name || '').trim();
      if (n && !byName.has(n)) byName.set(n, s);
    });
    const matched = new Set<string>();
    const list: Row[] = ACTIVE_ROSTER.map((st) => {
      let sub: PblSubmission | null = null;
      for (const e of st.emails) { const f = byEmail.get(e.toLowerCase()); if (f) { sub = f; break; } }
      if (!sub) { const f = byName.get(st.name); if (f) sub = f; }
      if (sub) matched.add(sub.user_id);
      return { no: st.no, name: st.name, sub };
    });
    // 명단 어디에도 매칭되지 않은 제출(명단 외 계정/이름)
    const orph = subs.filter((s) => !matched.has(s.user_id));
    return { people: list, orphans: orph };
  }, [subs]);

  const submittedCount = people.filter((p) => p.sub).length;

  // 정렬
  const sorted = useMemo(() => {
    const copy = [...people];
    if (sortBy === 'total') {
      copy.sort((a, b) => totalScore(b.sub?.scores) - totalScore(a.sub?.scores) || a.name.localeCompare(b.name));
    } else if (sortBy === 'name') {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      copy.sort((a, b) => a.no - b.no);
    }
    return copy;
  }, [people, sortBy]);

  // ── 다운로드(Excel/PDF) ── 명단 29명 + 명단 외 제출 모두 포함
  const COLUMNS = ['No.', '이름', '프로젝트명', '제출', ...PBL_STAGES.map((s) => `${s.label}(${s.max})`), `강사합계(${PBL_TOTAL})`, `자동합계(${PBL_TOTAL})`];
  const rowToCells = (no: number | string, name: string, sub: PblSubmission | null): Cell[] => [
    no,
    name,
    sub?.project_topic || '',
    sub ? '제출' : '미제출',
    ...PBL_STAGES.map((s) => (typeof sub?.scores?.[s.key] === 'number' ? sub!.scores[s.key] : '')),
    sub ? totalScore(sub.scores) : '',
    sub ? autoTotal(sub.auto) : '',
  ];
  const buildRows = (): Cell[][] => [
    ...sorted.map((p) => rowToCells(p.no, p.name, p.sub)),
    ...orphans.map((s, i) => rowToCells(`외${i + 1}`, `${s.student_name || '(이름없음)'} (명단외)`, s)),
  ];
  const downloadExcel = () => exportTableExcel('PBL_항목별_점수표.xlsx', 'PBL 항목별 점수', COLUMNS, buildRows());
  const downloadPdf = () => exportTablePdf(
    'PBL 활동 항목별 점수표', COLUMNS, buildRows(),
    `AI Reboot Academy · 명단 ${people.length}명 · 제출 ${submittedCount}명 · 만점 ${PBL_TOTAL}점 · 발행 ${new Date().toLocaleDateString('ko-KR')}`,
  );

  // 점수 행 셀들(명단/명단외 공용 렌더)
  const renderScoreCells = (sub: PblSubmission | null): ReactElement[] => [
    ...PBL_STAGES.map((s) => {
      const sc = sub?.scores?.[s.key];
      const au = sub?.auto?.[s.key];
      return (
        <td key={s.key} style={{ textAlign: 'center', padding: '5px 2px', whiteSpace: 'nowrap' }}>
          {typeof sc === 'number'
            ? <span style={{ fontWeight: 700, color: scoreColor(sc, s.max) }}>{sc}</span>
            : <span style={{ color: 'var(--text-secondary, #d1d5db)' }}>–</span>}
          {typeof au === 'number' && (
            <span style={{ fontSize: '11px', color: '#94a3b8' }} title="자동환산"> ({autoStagePoints(au, s.max)})</span>
          )}
        </td>
      );
    }),
    <td key="t" style={{ textAlign: 'center', padding: '5px 2px', fontWeight: 800, color: sub ? scoreColor(totalScore(sub.scores), PBL_TOTAL) : 'var(--text-secondary, #d1d5db)' }}>
      {sub ? totalScore(sub.scores) : '–'}
    </td>,
    <td key="a" style={{ textAlign: 'center', padding: '5px 2px', fontWeight: 700, color: '#94a3b8' }}>{sub ? autoTotal(sub.auto) : '–'}</td>,
  ];

  return (
    <>
      <SEOHead title="PBL 항목별 점수표" path="/admin/pbl-scores" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 헤더 — 한 줄로 압축 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>PBL 활동 항목별 점수표</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
              명단 {people.length}명 · 제출 {submittedCount}명 · 미제출 {people.length - submittedCount}명
              {orphans.length > 0 && <> · 명단외 {orphans.length}건</>}
              {' '}· 개별 채점은 <a href="/pbl/eval" style={{ color: 'var(--primary-blue, #0046C8)' }}>PBL 평가</a>
            </span>
          </div>

          {/* 도구: 정렬 + 다운로드 (여백 최소화) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'roster' | 'total' | 'name')}
              style={{ padding: '5px 9px', fontSize: '13px', borderRadius: '7px', border: '1px solid var(--border-light, #e5e7eb)', background: 'var(--bg-white, #fff)', color: 'var(--text-primary)' }}>
              <option value="roster">명단순</option>
              <option value="total">강사 합계 높은순</option>
              <option value="name">이름순</option>
            </select>
            <button type="button" onClick={downloadExcel} disabled={loading}
              style={{ padding: '6px 12px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: '6px', background: '#107c41', color: '#fff' }}>Excel</button>
            <button type="button" onClick={downloadPdf} disabled={loading}
              style={{ padding: '6px 12px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: '6px', background: '#b91c1c', color: '#fff' }}>PDF</button>
          </div>

          {/* 본문 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '34px', textAlign: 'center', padding: '6px 4px' }}>No</th>
                    <th style={{ width: '16%', textAlign: 'left', padding: '6px 6px' }}>이름 / 프로젝트명</th>
                    {PBL_STAGES.map((s) => (
                      <th key={s.key} style={{ textAlign: 'center', padding: '6px 2px', fontSize: '12px', lineHeight: 1.2, wordBreak: 'keep-all' }} title={`${s.label} (${s.max}점)`}>
                        {s.label}<span style={{ fontWeight: 400, color: 'var(--text-secondary, #9ca3af)' }}> /{s.max}</span>
                      </th>
                    ))}
                    <th style={{ textAlign: 'center', padding: '6px 2px', fontSize: '12px', lineHeight: 1.2 }}>강사<br />합계</th>
                    <th style={{ textAlign: 'center', padding: '6px 2px', fontSize: '12px', lineHeight: 1.2 }}>자동<br />합계</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.no} style={p.sub ? undefined : { background: 'var(--bg-light-gray, #f9fafb)' }}>
                      <td style={{ textAlign: 'center', padding: '5px 4px', color: 'var(--text-secondary, #6b7280)' }}>{p.no}</td>
                      <td style={{ padding: '5px 6px' }} title={p.sub?.project_topic ? `${p.name} · ${p.sub.project_topic}` : p.name}>
                        <div style={{ fontWeight: 600 }}>
                          {p.name}
                          {!p.sub && <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 700, color: '#9ca3af' }}>미제출</span>}
                        </div>
                        {p.sub?.project_topic && <div style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)', lineHeight: 1.25, wordBreak: 'keep-all' }}>{p.sub.project_topic}</div>}
                      </td>
                      {renderScoreCells(p.sub)}
                    </tr>
                  ))}

                  {/* 명단 외 제출 — 누락 없이 별도 표기 */}
                  {orphans.length > 0 && (
                    <>
                      <tr><td colSpan={3 + PBL_STAGES.length} style={{ padding: '6px', fontSize: '12px', fontWeight: 700, color: '#9a3412', background: '#fff7ed' }}>명단 외 제출 {orphans.length}건 (가입 이메일이 명단과 다르거나 명단에 없는 계정)</td></tr>
                      {orphans.map((s, i) => (
                        <tr key={s.user_id} style={{ background: '#fffbeb' }}>
                          <td style={{ textAlign: 'center', padding: '5px 4px', color: '#9a3412' }}>외{i + 1}</td>
                          <td style={{ padding: '5px 6px' }} title={s.email || ''}>
                            <div style={{ fontWeight: 600 }}>{s.student_name || '(이름없음)'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)' }}>{s.email || ''}{s.project_topic ? ` · ${s.project_topic}` : ''}</div>
                          </td>
                          {renderScoreCells(s)}
                        </tr>
                      ))}
                    </>
                  )}
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
