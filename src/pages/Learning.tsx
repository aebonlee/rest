import { useState, type ReactElement } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import {
  prerequisiteTopics,
  regularTopics,
  coachingTopics,
  type Topic,
  type ContentSection,
} from '../data/learningData';
import { REGULAR_DATES, fmtKDate, todayISO } from '../config/regularSchedule';

const phaseMap: Record<string, { topics: Topic[]; titleKey: string; subtitleKey: string }> = {
  prerequisite: {
    topics: prerequisiteTopics,
    titleKey: 'site.learning.prerequisite.title',
    subtitleKey: 'site.learning.prerequisite.subtitle',
  },
  regular: {
    topics: regularTopics,
    titleKey: 'site.learning.regular.title',
    subtitleKey: 'site.learning.regular.subtitle',
  },
  coaching: {
    topics: coachingTopics,
    titleKey: 'site.learning.coaching.title',
    subtitleKey: 'site.learning.coaching.subtitle',
  },
};

const calloutColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  tip:  { bg: '#ecfdf5', border: '#10b981', emoji: '💡', label: 'TIP' },
  warn: { bg: '#fef2f2', border: '#ef4444', emoji: '⚠️', label: '주의' },
  info: { bg: '#eff6ff', border: '#3b82f6', emoji: 'ℹ️', label: '참고' },
};

const CodeBlock = ({ lang, content }: { lang?: string; content: string }): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 권한 부재 등 — execCommand 폴백
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
  };

  return (
    <div style={{ position: 'relative', margin: '8px 0 12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1e293b',
        padding: '8px 14px',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #334155',
      }}>
        <span style={{
          fontSize: '13px',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="코드 복사"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            color: copied ? '#10b981' : '#cbd5e1',
            background: copied ? '#064e3b' : '#334155',
            border: `1px solid ${copied ? '#10b981' : '#475569'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              복사됨
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              복사
            </>
          )}
        </button>
      </div>
      <pre style={{
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '16px 18px',
        borderRadius: '0 0 8px 8px',
        overflowX: 'auto',
        fontSize: '15px',
        lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', 'Consolas', 'Courier New', monospace",
        margin: 0,
      }}>
        <code>{content}</code>
      </pre>
    </div>
  );
};

// ── 🎨 색상환 · 컬러 팔레트 (Day4 참고자료) ──
const BASE_12: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' }, { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' }, { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' }, { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Pink', hex: '#ec4899' },
];

const TONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const TONES: Record<string, string[]> = {
  Blue:  ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  Green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  Red:   ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  Gray:  ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
};

const HARMONY: { title: string; desc: string }[] = [
  { title: '보색 (Complementary)', desc: '색상환에서 정반대 위치의 두 색. 강한 대비 — 강조 포인트에 효과적.' },
  { title: '유사색 (Analogous)', desc: '이웃한 3색. 안정적·부드러움 — 한 색을 살짝 강조해 단조로움을 피하세요.' },
  { title: '삼각 (Triadic)', desc: '색상환 120도 간격 3색. 활기차고 균형 — 한 색은 메인, 나머지는 보조.' },
  { title: '단색 (Monochrome)', desc: '같은 색의 명도만 변화. 차분·통일감 — 비즈니스·미니멀에 적합.' },
];

const SEMANTIC: { name: string; hex: string; use: string }[] = [
  { name: '성공 · Success', hex: '#10b981', use: '완료, 확인, 저장됨' },
  { name: '정보 · Info', hex: '#3b82f6', use: '안내, 링크, 도움말' },
  { name: '주의 · Warning', hex: '#f59e0b', use: '경고, 확인 필요' },
  { name: '오류 · Error', hex: '#ef4444', use: '실패, 삭제, 위험' },
];

const TOOLS: { name: string; desc: string; url: string }[] = [
  { name: 'Coolors', desc: '스페이스바로 무한히 새 팔레트 생성', url: 'https://coolors.co' },
  { name: 'Adobe Color', desc: '색상환 기반 배색(보색·유사색·삼각)', url: 'https://color.adobe.com' },
  { name: 'Tailwind Colors', desc: '22색 × 11단계 (이 팔레트 색 출처)', url: 'https://tailwindcss.com/docs/customizing-colors' },
  { name: 'UI Colors', desc: 'Tailwind 형식 9단계 자동 생성', url: 'https://uicolors.app' },
  { name: 'Realtime Colors', desc: '실제 페이지에 색을 입혀 미리보기', url: 'https://realtimecolors.com' },
  { name: 'WebAIM Contrast', desc: '텍스트 대비비 검증(가독성 필수)', url: 'https://webaim.org/resources/contrastchecker/' },
  { name: 'Coblis', desc: '색맹 시뮬레이터(접근성 점검)', url: 'https://www.color-blindness.com/coblis-color-blindness-simulator/' },
];

// 배경 HEX 대비 가독 텍스트색(상대 휘도 기준)
const readableText = (hex: string): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.45 ? '#1a1a1a' : '#ffffff';
};

const ColorChip = ({ hex, label, sub, height = 56 }: { hex: string; label?: string; sub?: string; height?: number }): ReactElement => {
  const [copied, setCopied] = useState(false);
  const fg = readableText(hex);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = hex; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={`${hex} 복사`}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px',
        background: hex, color: fg, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px',
        padding: '8px 10px', minHeight: `${height}px`, cursor: 'pointer', textAlign: 'left',
        fontSize: '12.5px', lineHeight: 1.3, transition: 'transform 0.1s',
      }}
    >
      {label && <span style={{ fontWeight: 700 }}>{label}</span>}
      <span style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.92 }}>
        {copied ? '✓ 복사됨' : hex}
      </span>
      {sub && <span style={{ fontSize: '11px', opacity: 0.85 }}>{sub}</span>}
    </button>
  );
};

const ColorPalette = (): ReactElement => (
  <div style={{ margin: '4px 0 8px' }}>
    {/* 12색상환 카테고리 */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
      {[
        { t: '난색 (Warm)', d: '빨강·주황·노랑 — 따뜻함·활력·식욕', bg: '#fff7ed', bd: '#f97316' },
        { t: '한색 (Cool)', d: '초록·파랑·보라 — 차분·신뢰·집중', bg: '#eff6ff', bd: '#3b82f6' },
        { t: '중성 (Neutral)', d: '흰·회색·검정 — 균형·여백', bg: '#f9fafb', bd: '#6b7280' },
      ].map((c) => (
        <div key={c.t} style={{ background: c.bg, borderLeft: `4px solid ${c.bd}`, borderRadius: '0 8px 8px 0', padding: '10px 12px' }}>
          <div style={{ fontWeight: 700, marginBottom: '2px', color: '#1a1a1a' }}>{c.t}</div>
          <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>

    {/* 기본 12색 팔레트 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>기본 12색 팔레트</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '20px' }}>
      {BASE_12.map((c) => <ColorChip key={c.hex} hex={c.hex} label={c.name} height={64} />)}
    </div>

    {/* 톤 9단계 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>색의 톤(Tone) — 같은 계열 명도 단계</h5>
    <div style={{ marginBottom: '20px' }}>
      {Object.entries(TONES).map(([name, hexes]) => (
        <div key={name} style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '4px' }}>{name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TONE_STEPS.length}, 1fr)`, gap: '4px' }}>
            {hexes.map((hex, i) => <ColorChip key={hex} hex={hex} label={String(TONE_STEPS[i])} height={46} />)}
          </div>
        </div>
      ))}
    </div>

    {/* 배색 방법 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>배색 방법 — 어울리는 색 고르기</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '20px' }}>
      {HARMONY.map((h) => (
        <div key={h.title} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px', background: '#fff' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', color: '#1a1a1a' }}>{h.title}</div>
          <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{h.desc}</div>
        </div>
      ))}
    </div>

    {/* 시멘틱 컬러 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>시멘틱 컬러 (의미가 정해진 색)</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '20px' }}>
      {SEMANTIC.map((s) => <ColorChip key={s.hex} hex={s.hex} label={s.name} sub={s.use} height={72} />)}
    </div>

    {/* 도구 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>색 고를 때 쓰는 도구</h5>
    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', lineHeight: 1.9, color: '#1a1a1a', fontSize: '15px' }}>
      {TOOLS.map((tl) => (
        <li key={tl.url}>
          <a href={tl.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>{tl.name}</a>
          {` — ${tl.desc}`}
        </li>
      ))}
    </ul>

    {/* 팁 */}
    <div style={{ background: '#ecfdf5', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0', padding: '12px 16px', fontSize: '15px', lineHeight: 1.7, color: '#1a1a1a' }}>
      <strong>💡 팁 — 색은 적게, 의미는 분명히</strong>
      <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
        <li>한 화면에 메인 1 + 보조 1 + 강조 1 = 3색이면 충분합니다.</li>
        <li>중성색(회색)은 색 수에서 빼고 마음껏 쓰세요.</li>
        <li>색만으로 정보를 전달하지 마세요 — 색맹 사용자를 위해 아이콘·텍스트와 함께 씁니다.</li>
      </ul>
    </div>
  </div>
);

const renderSection = (section: ContentSection, idx: number): ReactElement => (
  <div key={idx} style={{ marginBottom: '20px' }}>
    {section.subtitle && (
      <h4 style={{
        fontSize: '16px',
        fontWeight: 700,
        margin: '24px 0 10px',
        color: 'var(--text-primary, #1a1a1a)',
        borderLeft: '3px solid var(--primary-blue, #0046C8)',
        paddingLeft: '10px',
      }}>{section.subtitle}</h4>
    )}
    {section.text && (
      <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: 'var(--text-primary, #1a1a1a)' }}>
        {section.text}
      </p>
    )}
    {section.items && (
      <ul style={{ margin: '0 0 12px', paddingLeft: '20px', lineHeight: 1.85, color: 'var(--text-primary, #1a1a1a)' }}>
        {section.items.map((item, j) => <li key={j}>{item}</li>)}
      </ul>
    )}
    {section.code && (
      <CodeBlock lang={section.code.lang} content={section.code.content} />
    )}
    {section.table && (
      <div className="content-table-wrap" style={{ overflowX: 'auto', margin: '8px 0 16px' }}>
        <table style={{
          width: '100%',
          minWidth: 'max-content',
          borderCollapse: 'collapse',
          fontSize: '15.5px',
          border: '1px solid var(--border-color, #e5e7eb)',
        }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary, #f0f4ff)' }}>
              {section.table.headers.map((h, i) => (
                <th key={i} style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: 'var(--text-primary, #1a1a1a)',
                  borderBottom: '2px solid var(--primary-blue, #0046C8)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 12px',
                    color: 'var(--text-primary, #1a1a1a)',
                    verticalAlign: 'top',
                    lineHeight: 1.6,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {section.svg && (
      <div
        style={{ margin: '10px 0 18px', textAlign: 'center', overflowX: 'auto' }}
        dangerouslySetInnerHTML={{ __html: section.svg }}
      />
    )}
    {section.callout && (
      <div style={{
        background: calloutColors[section.callout.type].bg,
        borderLeft: `4px solid ${calloutColors[section.callout.type].border}`,
        padding: '12px 16px',
        borderRadius: '0 8px 8px 0',
        margin: '8px 0 14px',
        fontSize: '15.5px',
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}>
        <strong style={{ marginRight: '8px' }}>
          {calloutColors[section.callout.type].emoji} {calloutColors[section.callout.type].label}
        </strong>
        {section.callout.text}
      </div>
    )}
    {section.colorPalette && <ColorPalette />}
  </div>
);

// 정규과정: 오늘 날짜에 해당하는 Day를 기본 선택(없으면 지난 마지막 Day)
const computeInitialIndex = (phase?: string): number => {
  if (phase !== 'regular') return 0;
  const today = todayISO();
  let idx = 0;
  REGULAR_DATES.forEach((d, i) => { if (d && d <= today) idx = i; });
  return idx;
};

const Learning = (): ReactElement => {
  const { phase } = useParams<{ phase: string }>();
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number>(() => computeInitialIndex(phase));
  // subIndex: null = 일자 개요(2차 메뉴 콘텐츠), 0~N = 3차 메뉴 상세
  const [selectedSubIndex, setSelectedSubIndex] = useState<number | null>(null);
  // openIndex: 드롭다운(3차 메뉴)이 펼쳐진 일자 — 아코디언(한 번에 하나만 열림)
  const [openIndex, setOpenIndex] = useState<number | null>(() => computeInitialIndex(phase));

  const config = phase ? phaseMap[phase] : undefined;
  if (!config) return <Navigate to="/" replace />;

  const { topics, titleKey, subtitleKey } = config;
  const isRegular = phase === 'regular';
  const today = todayISO();
  const topic = topics[selectedIndex];
  const hasSubSections = !!(topic.subSections && topic.subSections.length > 0);
  const activeSub = (hasSubSections && selectedSubIndex !== null)
    ? topic.subSections![selectedSubIndex]
    : null;

  // 일자 클릭 — 아코디언: 다른 일자면 그 일자를 열고 나머지는 닫힘, 같은 일자 다시 클릭이면 닫힘
  const handleDayClick = (i: number) => {
    const tp = topics[i];
    const hasSubs = !!(tp.subSections && tp.subSections.length > 0);
    if (i !== selectedIndex) {
      setSelectedIndex(i);
      setSelectedSubIndex(null);          // 개요부터 보여줌
      setOpenIndex(hasSubs ? i : null);   // 새 일자 펼침(나머지는 단일 상태라 자동 닫힘)
    } else {
      // 같은 일자 다시 클릭 — 펼침 토글(닫혀 있으면 열고, 열려 있으면 닫음)
      setSelectedSubIndex(null);
      setOpenIndex((prev) => (prev === i ? null : (hasSubs ? i : null)));
    }
  };

  return (
    <>
      <SEOHead title={t(titleKey) as string} path={`/learning/${phase}`} />

      <section className="page-header">
        <div className="container">
          <h2>{t(titleKey)}</h2>
          <p>{t(subtitleKey)}</p>
        </div>
      </section>

      <div className="sidebar-layout">
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {topics.map((tp, i) => {
              const isActive = selectedIndex === i;
              const isToday = isRegular && REGULAR_DATES[i] === today;
              const isCheckpoint = tp.id.startsWith('reg-check');   // 점검일 — 호버 배경 상시 유지
              const expanded = openIndex === i && !!tp.subSections && tp.subSections.length > 0;
              const dateLabel = isRegular && REGULAR_DATES[i] ? fmtKDate(REGULAR_DATES[i]) : '';
              return (
                <div key={tp.id}>
                  {tp.dividerBefore && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '14px 4px 8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary, #9ca3af)',
                    }}>
                      <span style={{ flex: 1, height: '1px', background: 'var(--border-light, #e5e7eb)' }} />
                      부록
                      <span style={{ flex: 1, height: '1px', background: 'var(--border-light, #e5e7eb)' }} />
                    </div>
                  )}
                  <button
                    className={`sidebar-item${isActive ? ' active' : ''}`}
                    onClick={() => handleDayClick(i)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      // 점검일은 호버 배경색을 상시 유지 (선택 시엔 active 그라데이션 우선)
                      ...(isCheckpoint && !isActive
                        ? { background: 'rgba(13, 43, 94, 0.06)', color: 'var(--primary-blue)' }
                        : {}),
                    }}
                  >
                    <span style={{ textAlign: 'left', flex: 1 }}>
                      {tp.title}
                      {dateLabel && (
                        <span style={{ marginLeft: '6px', fontSize: '12.5px', opacity: 0.7, fontWeight: 500 }}>
                          {dateLabel}
                        </span>
                      )}
                      {isToday && (
                        <span style={{
                          marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                          borderRadius: '999px', background: 'var(--primary-blue, #0046C8)', color: '#fff',
                        }}>오늘</span>
                      )}
                    </span>
                    {tp.subSections && tp.subSections.length > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '13px',
                        opacity: 0.7,
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                      }}>▶</span>
                    )}
                  </button>
                  {expanded && (
                    <div style={{
                      paddingLeft: '12px',
                      borderLeft: '2px solid var(--primary-blue, #0046C8)',
                      marginLeft: '12px',
                      marginTop: '4px',
                      marginBottom: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSubIndex(null)}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontSize: '15px',
                          fontWeight: selectedSubIndex === null ? 700 : 500,
                          color: selectedSubIndex === null
                            ? 'var(--primary-blue, #0046C8)'
                            : 'var(--text-secondary, #6b7280)',
                          background: selectedSubIndex === null
                            ? 'var(--bg-secondary, #f0f4ff)'
                            : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        📋 개요
                      </button>
                      {tp.subSections!.map((sub, si) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubIndex(si)}
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '15px',
                            fontWeight: selectedSubIndex === si ? 700 : 500,
                            color: selectedSubIndex === si
                              ? 'var(--primary-blue, #0046C8)'
                              : 'var(--text-secondary, #6b7280)',
                            background: selectedSubIndex === si
                              ? 'var(--bg-secondary, #f0f4ff)'
                              : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          {sub.icon ? `${sub.icon} ` : ''}{sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="sidebar-content">
          <div className="topic-card">
            <div className="topic-card-header">
              <div className="topic-card-icon">{activeSub ? (activeSub.icon || topic.icon) : topic.icon}</div>
              <div className="topic-card-title">
                {activeSub ? (
                  <>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)', display: 'block', marginBottom: '4px' }}>
                      {topic.title}
                    </span>
                    {activeSub.title}
                  </>
                ) : topic.title}
              </div>
            </div>
            <div className="topic-card-body">
              {activeSub ? (
                <>
                  {activeSub.summary && (
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                      {activeSub.summary}
                    </p>
                  )}
                  {activeSub.content.map((section, idx) => renderSection(section, idx))}
                </>
              ) : (
                <>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                    {topic.description}
                  </p>
                  {topic.content.map((section, idx) => renderSection(section, idx))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Learning;
