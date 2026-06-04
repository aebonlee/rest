import { useState, type ReactElement } from 'react';
import AppScaffold from '../../components/AppScaffold';
import { getTeamProject } from '../../data/teamProjects';

const PROJECT = getTeamProject(1)!;

const SETTINGS = [
  { key: 'forest', label: '깊은 숲속', emoji: '🌲' },
  { key: 'sea', label: '푸른 바닷가', emoji: '🌊' },
  { key: 'village', label: '한옥 마을', emoji: '🏘️' },
  { key: 'mountain', label: '높은 산', emoji: '⛰️' },
  { key: 'sky', label: '별이 빛나는 밤하늘', emoji: '🌌' },
];

const LESSONS = [
  { key: 'friend', label: '우정', emoji: '🤝' },
  { key: 'courage', label: '용기', emoji: '🦁' },
  { key: 'honesty', label: '정직', emoji: '💛' },
  { key: 'family', label: '가족 사랑', emoji: '🏡' },
  { key: 'effort', label: '꾸준한 노력', emoji: '🌱' },
];

interface Scene { emoji: string; text: string; }

const buildStory = (hero: string, setting: typeof SETTINGS[number], lesson: typeof LESSONS[number]): Scene[] => {
  const h = hero.trim() || '아이';
  return [
    {
      emoji: setting.emoji,
      text: `옛날 옛날 ${setting.label}에 ${h}(이)가 살고 있었어요. ${h}(은)는 마음이 따뜻하지만 아직 ${lesson.label}이(가) 무엇인지 잘 몰랐답니다.`,
    },
    {
      emoji: '✨',
      text: `어느 날, ${setting.label}에 작은 소동이 벌어졌어요. 곤경에 빠진 친구를 본 ${h}(은)는 어떻게 해야 할지 고민에 빠졌지요.`,
    },
    {
      emoji: lesson.emoji,
      text: `${h}(은)는 용기를 내어 손을 내밀었어요. "${lesson.label}은(는) 함께할 때 더 빛나는 거야!" 작은 결심이 큰 변화를 만들었답니다.`,
    },
    {
      emoji: '🌟',
      text: `그날 이후 ${setting.label}에는 웃음이 가득해졌어요. ${h}(은)는 ${lesson.label}의 소중함을 마음에 새기며 무럭무럭 자랐답니다. 그리고 모두 오래오래 행복하게 살았어요. 끝.`,
    },
  ];
};

const Project01 = (): ReactElement => {
  const [hero, setHero] = useState('');
  const [setting, setSetting] = useState(SETTINGS[0]);
  const [lesson, setLesson] = useState(LESSONS[0]);
  const [story, setStory] = useState<Scene[] | null>(null);

  const generate = () => setStory(buildStory(hero, setting, lesson));

  const chip = (active: boolean, color = PROJECT.color) => ({
    padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px',
    border: '1px solid', borderColor: active ? color : 'var(--border-light, #e5e7eb)',
    background: active ? color : 'var(--bg-white, #fff)', color: active ? '#fff' : 'var(--text-secondary, #6b7280)',
  });

  return (
    <AppScaffold project={PROJECT}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: 700 }}>주인공 이름</label>
          <input
            type="text" value={hero} onChange={(e) => setHero(e.target.value)} placeholder="예: 토리, 민준, 하늘"
            style={{ width: '100%', marginTop: '6px', padding: '11px 14px', fontSize: '14px', borderRadius: '10px', border: '1px solid var(--border-light, #e5e7eb)', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: 700 }}>이야기 배경</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {SETTINGS.map((s) => (
              <button key={s.key} type="button" onClick={() => setSetting(s)} style={chip(setting.key === s.key)}>{s.emoji} {s.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: 700 }}>전하고 싶은 교훈</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {LESSONS.map((l) => (
              <button key={l.key} type="button" onClick={() => setLesson(l)} style={chip(lesson.key === l.key)}>{l.emoji} {l.label}</button>
            ))}
          </div>
        </div>

        <button type="button" onClick={generate} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 22px', fontSize: '15px' }}>
          ✨ 동화 만들기
        </button>

        {story && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>📖 {(hero.trim() || '아이')}와 {setting.label} 이야기</h3>
            {story.map((sc, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 18px', borderRadius: '12px', background: 'var(--bg-light-gray, #f8f9fa)', border: '1px solid var(--border-light, #eef0f2)' }}>
                <span style={{ fontSize: '38px', lineHeight: 1, flexShrink: 0 }}>{sc.emoji}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: PROJECT.color, marginBottom: '4px' }}>장면 {i + 1}</div>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.85 }}>{sc.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppScaffold>
  );
};

export default Project01;
