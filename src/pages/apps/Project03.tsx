import { useState, type ReactElement } from 'react';
import AppScaffold from '../../components/AppScaffold';
import { getTeamProject } from '../../data/teamProjects';

const PROJECT = getTeamProject(3)!;

const MOODS = [
  { key: 'down', label: '가라앉음', emoji: '😔' },
  { key: 'anxious', label: '불안함', emoji: '😟' },
  { key: 'tired', label: '지침', emoji: '😮‍💨' },
  { key: 'okay', label: '그저 그럼', emoji: '😐' },
  { key: 'good', label: '괜찮음', emoji: '🙂' },
];

interface Activity { title: string; minutes: number; emoji: string; for: string[]; tip: string; }

const POOL: Activity[] = [
  { title: '4-7-8 호흡 명상', minutes: 5, emoji: '🌬️', for: ['anxious', 'down', 'tired'], tip: '4초 들이쉬고 7초 멈추고 8초 내쉬기 ×4회' },
  { title: '감사 한 줄 쓰기', minutes: 5, emoji: '📝', for: ['down', 'okay', 'good'], tip: '오늘 고마웠던 일 하나를 적어보세요' },
  { title: '가벼운 스트레칭', minutes: 10, emoji: '🤸', for: ['tired', 'okay', 'anxious'], tip: '목·어깨·허리 위주로 천천히' },
  { title: '햇빛 산책', minutes: 15, emoji: '🚶', for: ['down', 'tired', 'good'], tip: '바깥 공기를 쐬며 가볍게 걷기' },
  { title: '좋아하는 음악 듣기', minutes: 10, emoji: '🎧', for: ['down', 'anxious', 'okay'], tip: '플레이리스트 1개를 온전히 즐기기' },
  { title: '생각 비우기 글쓰기', minutes: 10, emoji: '🧠', for: ['anxious', 'okay'], tip: '머릿속 걱정을 종이에 쏟아내기' },
  { title: '물 한 잔 + 휴식', minutes: 5, emoji: '💧', for: ['tired', 'good', 'okay'], tip: '잠깐 화면에서 눈을 떼고 쉬기' },
  { title: '내일 할 일 3가지 정하기', minutes: 10, emoji: '✅', for: ['anxious', 'good', 'okay'], tip: '딱 3개만, 작게 정하기' },
];

const buildRoutine = (mood: string, stress: number, budget: number): Activity[] => {
  // 스트레스 높으면 진정 활동 우선
  const scored = POOL
    .map((a) => ({ a, score: (a.for.includes(mood) ? 2 : 0) + (stress >= 7 && a.minutes <= 10 ? 1 : 0) }))
    .sort((x, y) => y.score - x.score);
  const out: Activity[] = [];
  let used = 0;
  for (const { a } of scored) {
    if (used + a.minutes <= budget) { out.push(a); used += a.minutes; }
  }
  return out.length ? out : [scored[0].a];
};

const Project03 = (): ReactElement => {
  const [mood, setMood] = useState('okay');
  const [stress, setStress] = useState(5);
  const [budget, setBudget] = useState(30);
  const [routine, setRoutine] = useState<Activity[] | null>(null);

  const total = routine ? routine.reduce((s, a) => s + a.minutes, 0) : 0;

  return (
    <AppScaffold project={PROJECT}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: 700 }}>오늘 기분</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {MOODS.map((m) => {
              const on = mood === m.key;
              return (
                <button key={m.key} type="button" onClick={() => setMood(m.key)} style={{
                  padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px',
                  border: '1px solid', borderColor: on ? PROJECT.color : 'var(--border-light, #e5e7eb)',
                  background: on ? PROJECT.color : 'var(--bg-white, #fff)', color: on ? '#fff' : 'var(--text-secondary, #6b7280)',
                }}>{m.emoji} {m.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700 }}>스트레스 수준 <span style={{ color: PROJECT.color }}>{stress}/10</span></label>
            <input type="range" min={0} max={10} value={stress} onChange={(e) => setStress(Number(e.target.value))} style={{ width: '100%', marginTop: '10px', accentColor: PROJECT.color }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700 }}>가용 시간 <span style={{ color: PROJECT.color }}>{budget}분</span></label>
            <input type="range" min={10} max={60} step={5} value={budget} onChange={(e) => setBudget(Number(e.target.value))} style={{ width: '100%', marginTop: '10px', accentColor: PROJECT.color }} />
          </div>
        </div>

        <button type="button" onClick={() => setRoutine(buildRoutine(mood, stress, budget))} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 22px', fontSize: '15px' }}>
          🌱 오늘의 회복 루틴 받기
        </button>

        {routine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              오늘의 루틴 · 총 <span style={{ color: PROJECT.color }}>{total}분</span> ({routine.length}단계)
            </div>
            {routine.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-light-gray, #f8f9fa)', border: '1px solid var(--border-light, #eef0f2)' }}>
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{a.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px' }}>{i + 1}. {a.title}</strong>
                    <span style={{ fontSize: '12px', color: '#fff', background: PROJECT.color, padding: '1px 8px', borderRadius: '999px' }}>{a.minutes}분</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)' }}>{a.tip}</p>
                </div>
              </div>
            ))}
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #9ca3af)' }}>💬 작은 실천이 회복탄력성을 키웁니다. 한 단계씩 천천히 해보세요.</p>
          </div>
        )}
      </div>
    </AppScaffold>
  );
};

export default Project03;
