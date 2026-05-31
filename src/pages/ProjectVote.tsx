import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SEOHead from '../components/SEOHead';
import { PRESET_TOPICS } from '../data/projectTopics';
import {
  listCustomTopics, listVotes, addTopic, deleteTopic, castVote, retractVote,
  type CustomTopic, type TopicVote,
} from '../utils/projectVote';

interface Row {
  key: string;
  title: string;
  description: string;
  isPreset: boolean;
  ownerId?: string;
}

const ProjectVote = (): ReactElement => {
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [custom, setCustom] = useState<CustomTopic[]>([]);
  const [votes, setVotes] = useState<TopicVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const userName = profile?.name || profile?.display_name || user?.email || '수강생';

  const reload = useCallback(async () => {
    setLoading(true);
    const [c, v] = await Promise.all([listCustomTopics(), listVotes()]);
    setCustom(c);
    setVotes(v);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const myVoteKey = useMemo(() => votes.find((v) => v.user_id === user?.id)?.topic_key, [votes, user]);
  const countByKey = useMemo(() => {
    const m: Record<string, number> = {};
    votes.forEach((v) => { m[v.topic_key] = (m[v.topic_key] || 0) + 1; });
    return m;
  }, [votes]);

  const rows: Row[] = useMemo(() => {
    const presetRows: Row[] = PRESET_TOPICS.map((t) => ({ key: t.key, title: t.title, description: t.description, isPreset: true }));
    const customRows: Row[] = custom.map((c) => ({ key: c.id, title: c.title, description: c.description, isPreset: false, ownerId: c.created_by }));
    return [...presetRows, ...customRows].sort((a, b) => (countByKey[b.key] || 0) - (countByKey[a.key] || 0));
  }, [custom, countByKey]);

  const totalVotes = votes.length;

  const handleVote = async (key: string) => {
    if (!user) return;
    setBusy(true);
    const res = myVoteKey === key ? await retractVote(user.id) : await castVote(key, user.id, userName);
    setBusy(false);
    if (res.ok) { showToast(myVoteKey === key ? '투표를 취소했습니다.' : '투표 완료!', 'success'); reload(); }
    else showToast('투표 실패: ' + (res.error || ''), 'error');
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) { showToast('주제 제목을 입력하세요.', 'warning'); return; }
    setBusy(true);
    const res = await addTopic(newTitle.trim(), newDesc.trim(), user!.id, userName);
    setBusy(false);
    if (res.ok) { setNewTitle(''); setNewDesc(''); showToast('새 주제가 추가되었습니다.', 'success'); reload(); }
    else showToast('추가 실패: ' + (res.error || ''), 'error');
  };

  const handleDeleteTopic = async (key: string) => {
    if (!confirm('이 주제를 삭제할까요? (투표도 함께 사라집니다)')) return;
    const res = await deleteTopic(key);
    if (res.ok) { showToast('주제를 삭제했습니다.', 'info'); reload(); }
    else showToast('삭제 실패: ' + (res.error || ''), 'error');
  };

  const card: React.CSSProperties = {
    background: 'var(--bg-white)', border: '1px solid var(--border-light)',
    borderRadius: '14px', padding: '18px 20px', color: 'var(--text-primary)',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 13px', fontSize: '16px', boxSizing: 'border-box',
    border: '1px solid var(--border-light)', borderRadius: '8px',
    background: 'var(--bg-white)', color: 'var(--text-primary)',
  };
  const maxCount = Math.max(1, ...rows.map((r) => countByKey[r.key] || 0));

  return (
    <>
      <SEOHead title="팀구성 — 주제 투표" path="/project-vote" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀구성 · 주제 투표</h2>
          <p>함께 만들 프로젝트 주제에 투표하세요. 새 주제를 제안할 수도 있습니다. (1인 1표, 변경 가능)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '860px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                총 <strong style={{ color: 'var(--primary-blue)' }}>{totalVotes}</strong>표 · 주제 {rows.length}개
                {myVoteKey && <span> · 내 선택: <strong>{rows.find((r) => r.key === myVoteKey)?.title || '—'}</strong></span>}
              </div>

              {/* 주제 목록 (득표순) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rows.map((r, idx) => {
                  const count = countByKey[r.key] || 0;
                  const mine = myVoteKey === r.key;
                  const canDelete = !r.isPreset && (r.ownerId === user?.id || isAdmin);
                  return (
                    <div key={r.key} style={{ ...card, borderLeft: mine ? '4px solid var(--primary-blue)' : '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-blue)' }}>{idx + 1}위</span>
                            <h3 style={{ margin: 0, fontSize: '17px' }}>{r.title}</h3>
                            {!r.isPreset && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'var(--bg-light-gray)', color: 'var(--text-secondary)' }}>학생 제안</span>}
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{r.description}</p>
                        </div>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '24px', fontWeight: 800, color: mine ? 'var(--primary-blue)' : 'var(--text-primary)' }}>{count}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>표</div>
                        </div>
                      </div>

                      {/* 득표 막대 */}
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-light-gray)', overflow: 'hidden', margin: '12px 0' }}>
                        <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: 'var(--primary-blue)', transition: 'width 0.3s' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className={mine ? 'btn btn-primary' : 'btn btn-secondary'}
                          style={{ padding: '8px 18px', fontSize: '14px' }}
                          disabled={busy}
                          onClick={() => handleVote(r.key)}
                        >
                          {mine ? '✓ 내 투표 (취소)' : '이 주제에 투표'}
                        </button>
                        <Link
                          to={`/project-teams?topic=${encodeURIComponent(r.title)}`}
                          className="btn btn-secondary"
                          style={{ padding: '8px 18px', fontSize: '14px' }}
                        >
                          이 주제로 팀 만들기 →
                        </Link>
                        {canDelete && (
                          <button onClick={() => handleDeleteTopic(r.key)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>삭제</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 새 주제 추가 */}
              <div style={card}>
                <h3 style={{ margin: '0 0 12px', fontSize: '17px' }}>새 주제 제안</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input style={input} placeholder="주제 제목 (예: 우리 동네 안전 지도 앱)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  <input style={input} placeholder="한 줄 설명 (선택)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 24px' }} disabled={busy} onClick={handleAdd}>주제 추가</button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProjectVote;
