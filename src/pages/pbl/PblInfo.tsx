import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEOHead from '../../components/SEOHead';
import { updateProfile } from '../../utils/auth';
import { REGIONS, topicsByRegion, type Region } from '../../data/pblTopics';
import {
  COLLEGES, departmentsOf, majorsOf, matchRoster, COURSE_TITLE,
} from '../../data/pblRoster';
import { PBL_STAGES, PBL_TOTAL, TRACKS, autoTotal, autoStagePoints } from '../../config/pblActivity';
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
    student_name: '', student_no: '', college: '', department: '', major: '', phone: '',
    region: '서울' as Region, topic_key: '', track: '기술',
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sub, setSub] = useState<PblSubmission | null>(null);

  const email = profile?.email || user?.email || '';
  const matched = matchRoster(form.college, form.department, form.major);

  const load = useCallback(async () => {
    const row = await getMySubmission(user);
    setSub(row);
    setForm({
      student_name: row?.student_name || profile?.name || profile?.display_name || '',
      student_no: row?.student_no || profile?.student_no || '',
      college: row?.college || profile?.college || '',
      department: row?.department || profile?.department || '',
      major: row?.major || profile?.major || '',
      phone: row?.phone || profile?.phone || '',
      region: (row?.region as Region) || '서울',
      topic_key: row?.topic_key || '',
      track: row?.track || '기술',
    });
    setLoaded(true);
  }, [user, profile]);

  useEffect(() => { load(); }, [load]);

  const topics = topicsByRegion(form.region);
  const departments = form.college ? departmentsOf(form.college) : [];
  const majors = form.college && form.department ? majorsOf(form.college, form.department) : [];

  const handleSave = async () => {
    if (!form.student_name.trim()) { showToast('이름을 입력해 주세요.', 'warning'); return; }
    if (!form.student_no.trim()) { showToast('학번을 입력해 주세요.', 'warning'); return; }
    if (!form.college || !form.department) { showToast('대학(원)·학과(부)를 선택해 주세요.', 'warning'); return; }
    setSaving(true);
    try {
      await saveInfo(user, { ...form, roster_matched: matched });
      try {
        await updateProfile(user.id, {
          name: form.student_name, display_name: form.student_name,
          phone: form.phone, student_no: form.student_no,
          college: form.college, department: form.department, major: form.major,
        });
        if (refreshProfile) await refreshProfile();
      } catch { /* 프로필 반영 실패 무시 */ }
      showToast(matched ? '저장 완료 — 명단 확인됨 ✓' : '저장했습니다. (명단에서 확인되지 않음)', matched ? 'success' : 'warning');
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
            나의 정보를 입력하고 단계별 활동을 진행합니다.<br />
            소속(대학·학과·전공)으로 수강 명단과 대조하며, 작성 내용은 자동 평가되어 점수로 저장됩니다.
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
              {/* 명단 대조 상태 */}
              <div style={{
                fontSize: '13.5px', borderRadius: '10px', padding: '12px 16px', fontWeight: 600,
                background: !form.college ? 'var(--bg-light-gray)' : matched ? '#d1fae5' : '#fee2e2',
                color: !form.college ? 'var(--text-secondary)' : matched ? '#065f46' : '#991b1b',
              }}>
                {!form.college ? `📋 소속을 선택하면 「${COURSE_TITLE}」 수강 명단과 대조합니다.`
                  : matched ? '✓ 수강 명단에서 확인된 소속입니다.'
                  : '⚠ 선택한 소속이 수강 명단과 일치하지 않습니다. 대학·학과를 다시 확인하세요.'}
              </div>

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

              {/* 소속·트랙 4가지 확인 (명단 대조) */}
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>
                소속·트랙 확인 — 대학(원) · 학과(부) · 전공 · 트랙 (수강 명단과 대조)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>대학(원) *</label>
                  <select style={input} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value, department: '', major: '' })}>
                    <option value="">— 선택 —</option>
                    {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>학과(부) *</label>
                  <select style={input} value={form.department} disabled={!form.college} onChange={(e) => setForm({ ...form, department: e.target.value, major: '' })}>
                    <option value="">— 선택 —</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>전공</label>
                  <select style={input} value={form.major} disabled={!form.department} onChange={(e) => setForm({ ...form, major: e.target.value })}>
                    <option value="">— 선택/해당없음 —</option>
                    {majors.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>트랙 *</label>
                  <select style={input} value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
                    {TRACKS.map((t) => <option key={t} value={t}>{t} 트랙</option>)}
                  </select>
                </div>
              </div>

              {/* 관심 주제 */}
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>관심 지역</label>
                  <select style={input} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value as Region, topic_key: '' })}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>관심 주제 (선택)</label>
                  <select style={input} value={form.topic_key} onChange={(e) => setForm({ ...form, topic_key: e.target.value })}>
                    <option value="">— 주제 선택 —</option>
                    {topics.map((t) => <option key={t.key} value={t.key}>{t.title}</option>)}
                  </select>
                </div>
              </div>

              <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 26px' }} disabled={saving} onClick={handleSave}>
                {saving ? '저장 중…' : '기본정보 저장 (명단 대조·회원정보 반영)'}
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
