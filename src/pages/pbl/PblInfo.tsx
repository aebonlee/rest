import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEOHead from '../../components/SEOHead';
import { updateProfile } from '../../utils/auth';
import { PBL_STAGES, PBL_TOTAL, autoTotal, autoStagePoints } from '../../config/pblActivity';
import { getMySubmission, saveInfo, type PblSubmission } from '../../utils/pblStore';
import PblSidebar from './PblSidebar';

const input: React.CSSProperties = {
  width: '100%', padding: '11px 13px', fontSize: '15px', boxSizing: 'border-box',
  border: '1px solid var(--border-light)', borderRadius: '8px',
  background: 'var(--bg-white)', color: 'var(--text-primary)',
};
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '6px', display: 'block' };

const PblInfo = (): ReactElement => {
  const { user, profile, refreshProfile } = useAuth() as any;
  const { showToast } = useToast();
  const [form, setForm] = useState({
    student_name: '', student_no: '', phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sub, setSub] = useState<PblSubmission | null>(null);

  const email = profile?.email || user?.email || '';

  const load = useCallback(async () => {
    const row = await getMySubmission(user);
    setSub(row);
    setForm({
      student_name: row?.student_name || profile?.name || profile?.display_name || '',
      student_no: row?.student_no || profile?.student_no || '',
      phone: row?.phone || profile?.phone || '',
    });
    setLoaded(true);
  }, [user, profile]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.student_name.trim()) { showToast('이름을 입력해 주세요.', 'warning'); return; }
    if (!form.student_no.trim()) { showToast('학번을 입력해 주세요.', 'warning'); return; }
    setSaving(true);
    try {
      await saveInfo(user, { ...form });
      try {
        await updateProfile(user.id, {
          name: form.student_name, display_name: form.student_name,
          phone: form.phone, student_no: form.student_no,
        });
        if (refreshProfile) await refreshProfile();
      } catch { /* 프로필 반영 실패 무시 */ }
      showToast('기본정보를 저장했습니다.', 'success');
      load();
    } catch (e: any) {
      showToast('저장 실패: ' + (e?.message || ''), 'error');
    } finally { setSaving(false); }
  };

  return (
    <>
      <SEOHead title="개인별 PBL활동 · 기본정보" path="/pbl/info" noindex />
      <section className="page-header">
        <div className="container">
          <h2>개인별 PBL활동 · 기본정보</h2>
          <p>
            나의 정보를 입력하고 컴퓨팅 사고 7단계로 개발 프로젝트를 진행합니다.<br />
            각 단계에서 작성한 내용은 자동 평가되어 점수로 저장되고, 아래에서 내 점수를 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <div className="sidebar-layout">
        <PblSidebar active="info" auto={sub?.auto} scores={sub?.scores} />

        <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!loaded ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <>
              {/* 개인정보 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>이름 *</label>
                  <input style={input} value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} placeholder="이름" />
                </div>
                <div>
                  <label style={labelStyle}>학번 *</label>
                  <input style={input} value={form.student_no} onChange={(e) => setForm({ ...form, student_no: e.target.value })} placeholder="예) 2026-12345" />
                </div>
                <div>
                  <label style={labelStyle}>연락처</label>
                  <input style={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" />
                </div>
                <div>
                  <label style={labelStyle}>이메일 (회원 계정)</label>
                  <input style={{ ...input, background: 'var(--bg-light-gray)', color: 'var(--text-secondary)' }} value={email} readOnly />
                </div>
              </div>

              <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 26px' }} disabled={saving} onClick={handleSave}>
                {saving ? '저장 중…' : '기본정보 저장 (회원정보 반영)'}
              </button>

              {/* 내 점수 요약 — 항목별 */}
              <div style={{ marginTop: '8px', padding: '20px 22px', borderRadius: '14px', border: '1px solid var(--border-light)', background: 'var(--bg-white)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>🤖 내 평가 점수</span>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary-blue)' }}>
                    {autoTotal(sub?.auto)}<span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>/{PBL_TOTAL}</span>
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>각 단계에서 저장하면 합산됩니다.</span>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  {/* 좌측 2/3 — 항목별 막대 (막대–점수 좁게, 점수–박스 넓게) */}
                  <div style={{ flex: '2 1 360px', minWidth: 0, paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {PBL_STAGES.map((s, i) => {
                      const a = sub?.auto?.[s.key];
                      const t = sub?.scores?.[s.key];
                      const pts = typeof a === 'number' ? autoStagePoints(a, s.max) : 0;
                      return (
                        <div key={s.key} className="pbl-score-row">
                          <span className="pbl-score-label" style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.icon} {i + 1}. {s.label}</span>
                          <div className="pbl-score-bar" style={{ height: '10px', borderRadius: '5px', background: 'var(--bg-light-gray)', overflow: 'hidden' }}>
                            <div style={{ width: `${(pts / s.max) * 100}%`, height: '100%', background: s.color, transition: 'width .3s' }} />
                          </div>
                          <span style={{ flex: '0 0 auto', fontSize: '12.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {typeof a === 'number'
                              ? <span style={{ display: 'inline-block', minWidth: '52px', textAlign: 'right', color: s.color }}>{pts}/{s.max}</span>
                              : <span style={{ display: 'inline-block', minWidth: '52px', textAlign: 'right', color: 'var(--text-secondary)' }}>미작성</span>}
                            {typeof t === 'number' && <span style={{ color: '#92400e' }}> · 강사 {t}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 우측 1/3 — 격려 메시지 */}
                  {(() => {
                    const total = autoTotal(sub?.auto);
                    const done = PBL_STAGES.filter((s) => typeof sub?.auto?.[s.key] === 'number').length;
                    const pct = Math.round((total / PBL_TOTAL) * 100);
                    let emoji = '🌱', title = '지금 시작해 볼까요?', msg = '첫 단계부터 작성하면 점수가 쌓입니다. 가볍게 한 줄부터 시작해요.';
                    if (total > 0 && total < 40) { emoji = '🚶'; title = '좋은 출발이에요!'; msg = '한 단계씩 채워가면 됩니다. 구체적인 예시를 넣으면 점수가 더 올라요.'; }
                    else if (total < 70) { emoji = '🔥'; title = '잘하고 있어요!'; msg = '절반을 넘겼어요. 숫자·근거·구조를 보강하면 점수가 쑥 오릅니다.'; }
                    else if (total < 90) { emoji = '🚀'; title = '거의 다 왔어요!'; msg = '완성도가 높아요. 마무리 단계만 다듬으면 최상위권입니다.'; }
                    else { emoji = '🏆'; title = '훌륭해요!'; msg = '완벽에 가까운 점수예요. 표현을 조금만 더 다듬어 마무리하세요. 👏'; }
                    return (
                      <div style={{ flex: '1 1 220px', minWidth: 200, borderRadius: '12px', padding: '18px 18px', background: 'var(--primary-gradient, #0d2b5e)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                        <div style={{ fontSize: '30px' }}>{emoji}</div>
                        <div style={{ fontSize: '16px', fontWeight: 800 }}>{title}</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.95 }}>{msg}</div>
                        <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.9 }}>진행 {done}/{PBL_STAGES.length}단계 · 달성 {pct}%</div>
                        <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#fff', transition: 'width .3s' }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PblInfo;
