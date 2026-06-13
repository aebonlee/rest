/**
 * ProjectSubmit.tsx — 산출물 제출
 *  - 학생(팀원): 내 팀의 최종 산출물(요약/데모/발표자료/소스)을 입력·저장한다.
 *  - 강사: 전체 팀 제출 현황을 읽기 전용으로 확인한다.
 *  - 저장: rest_team_submission (utils/projectSubmission).
 */
import { useState, useEffect, useCallback, type ReactElement, type CSSProperties } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import { listTeams } from '../utils/projectTeams';
import { listSubmissions, saveSubmission, EMPTY_SUBMISSION, type SubmissionData } from '../utils/projectSubmission';
import { listCustomTopics, type CustomTopic } from '../utils/projectVote';
import { buildTeamNumbers } from '../utils/teamNumber';
import type { Team } from '../types';

const ProjectSubmit = (): ReactElement => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [topics, setTopics] = useState<CustomTopic[]>([]); // 미등록 주제 번호 산출용
  const [subs, setSubs] = useState<Record<string, SubmissionData>>({});      // 서버 저장본
  const [drafts, setDrafts] = useState<Record<string, SubmissionData>>({});  // 입력 중 초안
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const [t, tp, s] = await Promise.all([listTeams(), listCustomTopics(), listSubmissions()]);
    setTeams(t); setTopics(tp); setSubs(s);
    // 초안을 서버 저장본으로 초기화(없으면 빈 값).
    const d: Record<string, SubmissionData> = {};
    t.forEach((tm) => { d[tm.id] = { ...EMPTY_SUBMISSION, ...(s[tm.id] || {}) }; });
    setDrafts(d);
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const members = (t: Team) => (Array.isArray(t.members) ? t.members : []);
  const myTeams = user ? teams.filter((t) => members(t).some((m) => m.id === user.id)) : [];
  const teamNos = buildTeamNumbers(teams, topics); // 주제 제목 → 고정 번호(모든 화면과 동일 기준)

  // 초안 한 필드 갱신.
  const setField = (teamId: string, key: keyof SubmissionData, value: string) => {
    setDrafts((prev) => ({ ...prev, [teamId]: { ...(prev[teamId] || EMPTY_SUBMISSION), [key]: value } }));
  };

  const save = async (teamId: string) => {
    const data = drafts[teamId] || EMPTY_SUBMISSION;
    setBusy(true);
    const res = await saveSubmission(teamId, data);
    setBusy(false);
    if (res.ok) { setSubs((prev) => ({ ...prev, [teamId]: data })); showToast('산출물을 저장했습니다.', 'success'); }
    else showToast('저장 실패: ' + (res.error || ''), 'error');
  };

  const card: CSSProperties = { background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)' };
  const input: CSSProperties = { width: '100%', padding: '10px 12px', fontSize: '15px', boxSizing: 'border-box', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-white)', color: 'var(--text-primary)' };
  const labelStyle: CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, margin: '12px 0 5px', color: 'var(--text-secondary)' };

  const fields: { key: keyof SubmissionData; label: string; placeholder: string; area?: boolean }[] = [
    { key: 'summary',    label: '한 줄 소개 · 회고', placeholder: '우리 팀이 만든 것과 배운 점을 간단히', area: true },
    { key: 'demo_url',   label: '배포 앱 주소(실행 URL)', placeholder: 'https://aebonlee.github.io/projectXX/ 또는 자체 배포 주소 — 구현 예시 갤러리에 연결됩니다' },
    { key: 'slides_url', label: '발표자료 URL',     placeholder: 'https://... (구글 슬라이드 등)' },
    { key: 'repo_url',   label: '소스 저장소 URL',  placeholder: 'https://github.com/...' },
  ];

  return (
    <>
      <SEOHead title="산출물 제출" path="/project-submit" noindex />
      <section className="page-header">
        <div className="container">
          <h2>산출물 제출</h2>
          <p>팀의 최종 산출물(데모·발표자료·소스)을 제출하세요. 제출 내용은 강사가 확인합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '820px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : isAdmin ? (
            // 강사: 전체 제출 현황(읽기 전용)
            <>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-light-gray)', borderRadius: '8px', padding: '10px 14px' }}>강사 계정입니다. 전체 팀의 제출 현황을 확인합니다.</div>
              {[...teams].sort((a, b) => (teamNos[a.id] ?? 999) - (teamNos[b.id] ?? 999)).map((t) => {
                const s = subs[t.id] || EMPTY_SUBMISSION;
                const has = s.summary || s.demo_url || s.slides_url || s.repo_url;
                return (
                  <div key={t.id} style={card}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>{teamNos[t.id]}팀 · {t.project_topic}</h3>
                    {has ? (
                      <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {s.summary && <span><EmojiIcon char="📝" /> {s.summary}</span>}
                        {s.demo_url && <span><EmojiIcon char="🔗" /> 데모: {s.demo_url}</span>}
                        {s.slides_url && <span><EmojiIcon char="📊" /> 발표자료: {s.slides_url}</span>}
                        {s.repo_url && <span><EmojiIcon char="💻" /> 소스: {s.repo_url}</span>}
                      </div>
                    ) : <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>미제출</span>}
                  </div>
                );
              })}
            </>
          ) : myTeams.length === 0 ? (
            <div style={card}><p style={{ margin: 0, fontSize: '14px' }}>아직 소속된 팀이 없습니다. <Link to="/project-vote" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>프로젝트 팀구성</Link>에서 팀에 합류하세요.</p></div>
          ) : (
            // 학생(팀원): 내 팀 제출 폼
            [...myTeams].sort((a, b) => (teamNos[a.id] ?? 999) - (teamNos[b.id] ?? 999)).map((t) => {
              const d = drafts[t.id] || EMPTY_SUBMISSION;
              return (
                <div key={t.id} style={card}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{teamNos[t.id]}팀 · {t.project_topic}</h3>
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      {f.area ? (
                        <textarea style={{ ...input, minHeight: '64px', resize: 'vertical' }} placeholder={f.placeholder} value={d[f.key]} onChange={(e) => setField(t.id, f.key, e.target.value)} />
                      ) : (
                        <input style={input} placeholder={f.placeholder} value={d[f.key]} onChange={(e) => setField(t.id, f.key, e.target.value)} />
                      )}
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ marginTop: '14px', padding: '10px 22px' }} disabled={busy} onClick={() => save(t.id)}>제출 저장</button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectSubmit;
