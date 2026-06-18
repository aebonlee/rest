import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useToast } from '../../contexts/ToastContext';
import SEOHead from '../../components/SEOHead';
import { PBL_STAGES, PBL_TOTAL, totalScore, autoTotal, autoStagePoints } from '../../config/pblActivity';
import { getAllSubmissions, saveGrade, type PblSubmission } from '../../utils/pblStore';

const PblEval = (): ReactElement => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<PblSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { score: string; feedback: string }>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllSubmissions();
    setRows(data);
    setLoading(false);
    if (!selId && data[0]) setSelId(data[0].user_id);
  }, [selId]);

  useEffect(() => { load(); }, [load]);

  const sel = rows.find((r) => r.user_id === selId) || null;

  useEffect(() => {
    if (!sel) { setDraft({}); return; }
    const d: Record<string, { score: string; feedback: string }> = {};
    PBL_STAGES.forEach((s) => {
      d[s.key] = {
        score: typeof sel.scores?.[s.key] === 'number' ? String(sel.scores[s.key]) : '',
        feedback: sel.feedback?.[s.key] || '',
      };
    });
    setDraft(d);
  }, [selId, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (stageKey: string, max: number) => {
    if (!sel) return;
    const raw = draft[stageKey]?.score ?? '';
    const score = raw === '' ? null : Number(raw);
    if (score !== null && (Number.isNaN(score) || score < 0 || score > max)) {
      showToast(`점수는 0~${max} 사이여야 합니다.`, 'warning'); return;
    }
    setSavingKey(stageKey);
    try {
      await saveGrade(sel, stageKey, score, draft[stageKey]?.feedback || '');
      showToast('평가를 저장했습니다.', 'success');
      await load();
    } catch (e: any) {
      showToast('저장 실패: ' + (e?.message || ''), 'error');
    } finally { setSavingKey(null); }
  };

  return (
    <>
      <SEOHead title="PBL 활동 · 평가" path="/pbl/eval" noindex />
      <section className="page-header">
        <div className="container">
          <h2>PBL 활동 · 평가</h2>
          <p>학생별 단계 활동 내용을 확인하고 단계 점수·피드백을 입력합니다. (합계 {PBL_TOTAL}점)</p>
        </div>
      </section>

      {loading ? (
        <section className="section"><div className="container" style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div></section>
      ) : rows.length === 0 ? (
        <section className="section"><div className="container"><p style={{ color: 'var(--text-secondary)' }}>아직 제출한 학생이 없습니다. (학생이 PBL 활동 기본정보를 저장하면 표시됩니다)</p></div></section>
      ) : (
        <div className="sidebar-layout">
          <aside className="sidebar">
            <nav className="sidebar-menu">
              {rows.map((r) => (
                <button key={r.user_id} className={`sidebar-item ${r.user_id === selId ? 'active' : ''}`} onClick={() => setSelId(r.user_id)}>
                  <span className="sidebar-item-text">
                    {r.student_name || '(이름없음)'} · {totalScore(r.scores)}/{PBL_TOTAL}
                    <br /><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.project_topic || '주제 미입력'}</span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="sidebar-content">
            {sel && (
              <>
                <div className="pgd-hero-card" style={{ borderLeftColor: '#0046C8' }}>
                  <span className="pgd-hero-icon" style={{ background: '#0046C818', color: '#0046C8' }}>🎓</span>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="pgd-hero-title" style={{ marginBottom: '6px' }}>{sel.student_name || '(이름없음)'}</h3>
                    {/* 1줄: 프로젝트 주제 · 연락처 · 이메일 */}
                    <p className="pgd-hero-subtitle" style={{ margin: '0 0 8px' }}>
                      📌 {sel.project_topic || '주제 미입력'} · {sel.phone || '-'} · {sel.email || '-'}
                    </p>
                    {/* 2줄: 점수 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '13px' }}>
                      <span style={{ fontWeight: 700, padding: '3px 12px', borderRadius: '999px', background: '#eff6ff', color: '#1e40af' }}>
                        🤖 자동 {autoTotal(sel.auto)} / {PBL_TOTAL}
                      </span>
                      <span style={{ fontWeight: 700, padding: '3px 12px', borderRadius: '999px', background: '#fef3c7', color: '#92400e' }}>
                        👩‍🏫 강사 {totalScore(sel.scores)} / {PBL_TOTAL}
                      </span>
                    </div>
                  </div>
                </div>

                {PBL_STAGES.map((s, i) => {
                  const content = sel.content?.[s.key] || {};
                  return (
                    <section key={s.key} className="pgd-section">
                      <h2><span className="pgd-section-icon">{s.icon}</span> {i + 1}. {s.label} <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400 }}>({s.max}점)</span>
                        {typeof sel.auto?.[s.key] === 'number' && <span style={{ fontSize: '12.5px', fontWeight: 700, color: s.color, marginLeft: '8px' }}>🤖 자동 {autoStagePoints(sel.auto[s.key], s.max)}/{s.max} ({sel.auto[s.key]}/100)</span>}
                      </h2>
                      <div className="pgd-card">
                        {/* 학생 작성 내용 */}
                        {s.fields.map((f) => (
                          <div key={f.id} style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: s.color }}>{f.label}</div>
                            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', color: content[f.id] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {content[f.id] || '— 미작성 —'}
                            </div>
                          </div>
                        ))}
                        {/* 평가 입력 */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>점수 (0~{s.max})</label>
                            <input type="number" min={0} max={s.max} value={draft[s.key]?.score ?? ''}
                              onChange={(e) => setDraft({ ...draft, [s.key]: { ...draft[s.key], score: e.target.value } })}
                              style={{ width: '90px', padding: '8px 10px', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>피드백</label>
                            <input value={draft[s.key]?.feedback ?? ''}
                              onChange={(e) => setDraft({ ...draft, [s.key]: { ...draft[s.key], feedback: e.target.value } })}
                              placeholder="피드백 (학생에게 표시됩니다)"
                              style={{ width: '100%', padding: '8px 10px', boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
                          </div>
                          <button className="btn btn-primary" style={{ padding: '9px 18px' }} disabled={savingKey === s.key} onClick={() => handleSave(s.key, s.max)}>
                            {savingKey === s.key ? '저장 중…' : '평가 저장'}
                          </button>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PblEval;
