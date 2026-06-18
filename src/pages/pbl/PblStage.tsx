import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEOHead from '../../components/SEOHead';
import { PBL_STAGES, stageByKey, autoStagePoints, type PblField } from '../../config/pblActivity';
import { getMySubmission, saveStageContent, type PblSubmission } from '../../utils/pblStore';
import { evaluateWriting, PBL_STAGE_KEYWORDS, type EvalResult } from '../../utils/promptEval';
import PblSidebar from './PblSidebar';

const textarea: React.CSSProperties = {
  width: '100%', minHeight: '110px', padding: '12px 14px', fontSize: '15px', lineHeight: 1.7,
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
  const filled = stage.fields.filter((f) => (values[f.id] || '').trim().length > 0).length;

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

  // 이 단계의 작성 내용을 모두 지우고 저장(삭제) — CRUD의 Delete
  const handleClear = async () => {
    if (!window.confirm('이 단계에 작성한 내용을 모두 지울까요? 저장된 내용이 삭제됩니다.')) return;
    setSaving(true);
    try {
      setValues({});
      await saveStageContent(user, stage.key, {}, null);
      setSavedAuto(null);
      setSub((p) => p ? { ...p, content: { ...p.content, [stage.key]: {} } } : p);
      showToast('이 단계의 작성 내용을 지웠습니다.', 'success');
    } catch (e: any) {
      showToast('삭제 실패: ' + (e?.message || ''), 'error');
    } finally { setSaving(false); }
  };

  // koreatech식 단계 카드 — 풍부한 안내(desc/guide/example)가 있으면 카드형, 없으면 단순 라벨형
  const renderField = (f: PblField): ReactElement => {
    const c = f.color || stage.color;
    const rich = !!(f.desc || (f.guide && f.guide.length) || f.example);
    if (!rich) {
      return (
        <div key={f.id}>
          <label style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>{f.label}</label>
          <textarea style={textarea} value={values[f.id] || ''} placeholder={f.placeholder}
            onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
        </div>
      );
    }
    return (
      <div key={f.id} style={{ border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px', background: 'var(--bg-white)' }}>
        {/* 헤더: STEP no + 아이콘 + 제목 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ width: '40px', height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c, color: '#fff', borderRadius: '10px', fontSize: '20px', fontWeight: 700 }}>{f.icon || '📝'}</span>
          <div>
            {typeof f.no === 'number' && <span style={{ fontSize: '12.5px', fontWeight: 700, color: c, letterSpacing: '0.04em' }}>STEP {f.no}</span>}
            <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{f.label}</h3>
          </div>
        </div>

        {f.desc && <p style={{ margin: '0 0 14px', fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{f.desc}</p>}

        {/* 작성 가이드 */}
        {f.guide && f.guide.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>✍️ 이렇게 작성하세요</p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {f.guide.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </div>
        )}

        {/* 예시 */}
        {f.example && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12.5px', fontWeight: 700, color: '#1d4ed8' }}>💡 예시{stage.exampleProject ? ` — ${stage.exampleProject}` : ''}</p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#1e3a5f', whiteSpace: 'pre-wrap' }}>{f.example}</p>
          </div>
        )}

        {/* 작성란 */}
        <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>내 프로젝트 작성</label>
        <textarea style={textarea} value={values[f.id] || ''} placeholder={f.placeholder}
          onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
      </div>
    );
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

        <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '860px' }}>
          {/* 단계 개요(가이드) */}
          {stage.intro && (
            <div style={{ background: 'var(--bg-light-gray)', borderLeft: `4px solid ${stage.color}`, borderRadius: '0 12px 12px 0', padding: '18px 22px', lineHeight: 1.75 }}>
              <p style={{ margin: '0 0 10px', fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{stage.intro.lead}</p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14.5px' }}>
                {stage.intro.points.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)}
              </ul>
            </div>
          )}

          {/* 루브릭 */}
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: `${stage.color}12`, fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: stage.color }}>평가 기준 ({stage.max}점)</strong> · {stage.rubric}
          </div>

          {!loaded ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <>
              {/* 작성 진행 상태 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '10px 16px', background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                작성 진행: <strong style={{ color: stage.color }}>{filled}</strong> / {stage.fields.length} 단계
                {savedAuto !== null && <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓ 저장된 자동 점수 {savedAuto}/100 (환산 {autoStagePoints(savedAuto, stage.max)}/{stage.max})</span>}
              </div>

              {/* 단계별 워크시트 카드 */}
              {stage.fields.map((f) => renderField(f))}

              {/* 자동 평가 결과 (단계 합산) */}
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
                  {saving ? '처리 중…' : (savedAuto !== null ? '수정 저장 (내용 + 점수)' : '저장 (내용 + 점수)')}
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '11px 18px', color: '#dc2626' }} disabled={saving} onClick={handleClear}>작성 지우기</button>
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
