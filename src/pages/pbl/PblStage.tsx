import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEOHead from '../../components/SEOHead';
import { PBL_STAGES, stageByKey, autoStagePoints } from '../../config/pblActivity';
import { getMySubmission, saveStageContent, type PblSubmission } from '../../utils/pblStore';
import { evaluateWriting, PBL_STAGE_KEYWORDS, type EvalResult } from '../../utils/promptEval';
import PblSidebar from './PblSidebar';

const textarea: React.CSSProperties = {
  width: '100%', minHeight: '120px', padding: '12px 14px', fontSize: '15px', lineHeight: 1.7,
  boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '10px',
  background: 'var(--bg-white)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit',
};

const PblStage = (): ReactElement => {
  const { stage: stageKey } = useParams<{ stage: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const stage = stageKey ? stageByKey(stageKey) : undefined;

  const [sub, setSub] = useState<PblSubmission | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedAuto, setSavedAuto] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!stage) return;
    const row = await getMySubmission(user);
    setSub(row);
    setValues(row?.content?.[stage.key] || {});
    setSavedAuto(typeof row?.auto?.[stage.key] === 'number' ? row!.auto[stage.key] : null);
    setScore(typeof row?.scores?.[stage.key] === 'number' ? row!.scores[stage.key] : null);
    setFeedback(row?.feedback?.[stage.key] || '');
    setLoaded(true);
  }, [user, stage]);

  useEffect(() => { setLoaded(false); load(); }, [load]);

  const evalResult: EvalResult | null = useMemo(() => {
    if (!stage) return null;
    const text = stage.fields.map((f) => values[f.id] || '').filter(Boolean).join('\n');
    return evaluateWriting(text, PBL_STAGE_KEYWORDS[stage.key] || []);
  }, [values, stage]);

  if (!stage) {
    return (
      <>
        <SEOHead title="개인별 PBL활동" path="/pbl" noindex />
        <section className="page-header"><div className="container"><h2>개인별 PBL활동</h2><p>존재하지 않는 단계입니다.</p></div></section>
      </>
    );
  }

  const idx = PBL_STAGES.findIndex((s) => s.key === stage.key);
  const prev = PBL_STAGES[idx - 1];
  const next = PBL_STAGES[idx + 1];
  // 사이드바에 실시간 자동 점수도 반영
  const liveAuto = { ...(sub?.auto || {}), ...(evalResult ? { [stage.key]: evalResult.score } : {}) };

  const handleSave = async () => {
    setSaving(true);
    try {
      const auto = evalResult ? evalResult.score : null;
      await saveStageContent(user, stage.key, values, auto);
      setSavedAuto(auto);
      setSub((p) => p ? { ...p, content: { ...p.content, [stage.key]: values }, auto: { ...p.auto, ...(auto !== null ? { [stage.key]: auto } : {}) } } : p);
      showToast('저장했습니다. (작성 내용 + 자동 점수)', 'success');
    } catch (e: any) {
      showToast('저장 실패: ' + (e?.message || ''), 'error');
    } finally { setSaving(false); }
  };

  return (
    <>
      <SEOHead title={`개인별 PBL활동 · ${stage.label}`} path={`/pbl/${stage.key}`} noindex />
      <section className="page-header">
        <div className="container">
          <h2>{stage.icon} {idx + 1}. {stage.label}</h2>
          <p>{stage.desc}</p>
        </div>
      </section>

      <div className="sidebar-layout">
        <PblSidebar active={stage.key} auto={liveAuto} scores={sub?.scores} />

        <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '820px' }}>
          {/* 루브릭 */}
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: `${stage.color}12`, fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: stage.color }}>평가 기준 ({stage.max}점)</strong> · {stage.rubric}
          </div>

          {!loaded ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <>
              {stage.fields.map((f) => (
                <div key={f.id}>
                  <label style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>{f.label}</label>
                  <textarea style={textarea} value={values[f.id] || ''} placeholder={f.placeholder}
                    onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
                </div>
              ))}

              {/* 자동 평가 결과 (항목별) */}
              {evalResult ? (
                <div style={{ padding: '18px 20px', borderRadius: '14px', border: `2px solid ${evalResult.color}`, background: 'var(--bg-white)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800 }}>🤖 자동 평가</span>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: evalResult.color }}>{evalResult.score}<span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>/100</span></span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', background: evalResult.color, padding: '2px 10px', borderRadius: '999px' }}>{evalResult.grade}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      이 단계 환산 <strong style={{ color: stage.color }}>{autoStagePoints(evalResult.score, stage.max)} / {stage.max}점</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {evalResult.breakdown.map((b) => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                        <span style={{ width: '56px', color: 'var(--text-secondary)' }}>{b.label}</span>
                        <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--bg-light-gray)', overflow: 'hidden' }}>
                          <div style={{ width: `${(b.got / b.max) * 100}%`, height: '100%', background: evalResult.color }} />
                        </div>
                        <span style={{ width: '48px', textAlign: 'right', fontWeight: 700 }}>{b.got}/{b.max}</span>
                      </div>
                    ))}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {evalResult.tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-light-gray)', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  내용을 작성하면 자동 평가 점수가 즉시 표시됩니다.
                </div>
              )}

              {savedAuto !== null && (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  💾 저장된 자동 점수: <strong>{savedAuto}/100</strong> (환산 {autoStagePoints(savedAuto, stage.max)}/{stage.max}점)
                </p>
              )}

              {(score !== null || feedback) && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', border: `1px solid ${stage.color}`, background: 'var(--bg-white)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: stage.color, marginBottom: '4px' }}>
                    👩‍🏫 강사 평가 {score !== null && <>· {score} / {stage.max}점</>}
                  </div>
                  {feedback && <p style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' }}>{feedback}</p>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '11px 26px' }} disabled={saving} onClick={handleSave}>
                  {saving ? '저장 중…' : '저장 (내용 + 점수)'}
                </button>
                {prev && <button className="btn btn-secondary" style={{ padding: '11px 18px' }} onClick={() => navigate(`/pbl/${prev.key}`)}>← {prev.label}</button>}
                {next && <button className="btn btn-secondary" style={{ padding: '11px 18px' }} onClick={() => navigate(`/pbl/${next.key}`)}>{next.label} →</button>}
                <Link to="/pbl/info" style={{ marginLeft: 'auto', fontSize: '13.5px', color: 'var(--primary-blue)' }}>기본정보·내 점수</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PblStage;
