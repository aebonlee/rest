/**
 * Learning.tsx — 학습(커리큘럼) 페이지
 *
 * 역할:
 *  - URL 파라미터(:phase)에 따라 사전과정/정규과정/코칭 중 하나의 커리큘럼을 사이드바 메뉴와
 *    본문(콘텐츠 카드) 형태로 렌더링하는 페이지 컴포넌트.
 *
 * 핵심 책임:
 *  - phase 값을 phaseMap에서 조회해 해당 토픽 목록·제목·부제 키를 결정(없으면 홈으로 리다이렉트).
 *  - 사이드바: 일자(2차 메뉴) 아코디언 + 일자별 하위 섹션(3차 메뉴) 드롭다운 네비게이션.
 *  - 본문: 선택된 일자(또는 하위 섹션)의 ContentSection 배열을 renderSection으로 다양한 블록
 *    (텍스트/리스트/코드/표/SVG/콜아웃/컬러 팔레트)으로 렌더링.
 *  - 정규과정은 오늘 날짜에 해당하는 Day를 초기 선택(computeInitialIndex)하고 '오늘' 뱃지 표시.
 *  - 코드 복사(CodeBlock), 색상칩 복사(ColorChip), 색상 학습 자료(ColorPalette) 보조 UI 제공.
 *
 * 주요 export:
 *  - default: Learning (React 페이지 컴포넌트)
 */
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

// phase(URL 파라미터) → 해당 과정의 토픽 목록과 i18n 제목/부제 키 매핑 테이블.
// Learning 컴포넌트에서 phaseMap[phase]로 조회해 어떤 커리큘럼을 보여줄지 결정한다.
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

// 콜아웃(강조 박스) 타입별 스타일 매핑 — 배경/테두리색, 이모지, 라벨.
// renderSection의 section.callout.type(tip/warn/info) 값으로 색을 선택한다.
const calloutColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  tip:  { bg: '#ecfdf5', border: '#10b981', emoji: '💡', label: 'TIP' },
  warn: { bg: '#fef2f2', border: '#ef4444', emoji: '⚠️', label: '주의' },
  info: { bg: '#eff6ff', border: '#3b82f6', emoji: 'ℹ️', label: '참고' },
};

/**
 * CodeBlock — 복사 버튼이 달린 코드 블록 UI.
 * @param lang  코드 언어 라벨(헤더에 표시, 없으면 'code')
 * @param content  표시 및 클립보드 복사 대상 코드 문자열
 * @returns 언어 헤더 + 복사 버튼 + <pre><code> 코드 영역
 * 부수효과: 복사 버튼 클릭 시 클립보드 쓰기 및 1.5초간 '복사됨' 상태 표시.
 */
const CodeBlock = ({ lang, content }: { lang?: string; content: string }): ReactElement => {
  // copied: 복사 성공 후 잠깐 true가 되어 버튼 라벨/색을 '복사됨'으로 바꾼다.
  const [copied, setCopied] = useState(false);

  // 코드 복사 핸들러 — 우선 Clipboard API 시도, 실패 시 textarea+execCommand 폴백.
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500); // 1.5초 뒤 원래 상태로 복귀
    } catch {
      // 권한 부재 등 — execCommand 폴백
      // 화면 밖(보이지 않는) textarea에 값을 넣고 선택 후 복사 명령 실행
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
      document.body.removeChild(ta); // 임시 요소 정리
    }
  };

  return (
    <div style={{ position: 'relative', margin: '8px 0 12px' }}>
      {/* 코드 헤더: 좌측 언어 라벨 + 우측 복사 버튼 */}
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
            // copied 상태에 따라 텍스트/배경/테두리색을 초록 계열로 전환
            color: copied ? '#10b981' : '#cbd5e1',
            background: copied ? '#064e3b' : '#334155',
            border: `1px solid ${copied ? '#10b981' : '#475569'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {/* copied면 체크 아이콘+'복사됨', 아니면 복사 아이콘+'복사' */}
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
      {/* 실제 코드 본문 — 가로 스크롤 가능, 모노스페이스 폰트 */}
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
// 아래 BASE_12/TONES/HARMONY/SEMANTIC/TOOLS는 ColorPalette에서 사용하는 정적 데이터.

// 색상환 기본 12색 — 이름과 HEX 쌍 배열.
const BASE_12: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' }, { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' }, { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' }, { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Pink', hex: '#ec4899' },
];

// 톤(명도) 단계 라벨 — TONES 각 배열의 인덱스와 1:1로 매핑된다(50이 가장 밝음).
const TONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
// 계열별 10단계 명도 HEX 배열 — TONE_STEPS 순서와 동일.
const TONES: Record<string, string[]> = {
  Blue:  ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  Green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  Red:   ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  Gray:  ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
};

// 배색(조화) 이론 설명 카드 데이터.
const HARMONY: { title: string; desc: string }[] = [
  { title: '보색 (Complementary)', desc: '색상환에서 정반대 위치의 두 색. 강한 대비 — 강조 포인트에 효과적.' },
  { title: '유사색 (Analogous)', desc: '이웃한 3색. 안정적·부드러움 — 한 색을 살짝 강조해 단조로움을 피하세요.' },
  { title: '삼각 (Triadic)', desc: '색상환 120도 간격 3색. 활기차고 균형 — 한 색은 메인, 나머지는 보조.' },
  { title: '단색 (Monochrome)', desc: '같은 색의 명도만 변화. 차분·통일감 — 비즈니스·미니멀에 적합.' },
];

// 시멘틱 컬러(의미가 고정된 색) 데이터 — 이름/HEX/용도.
const SEMANTIC: { name: string; hex: string; use: string }[] = [
  { name: '성공 · Success', hex: '#10b981', use: '완료, 확인, 저장됨' },
  { name: '정보 · Info', hex: '#3b82f6', use: '안내, 링크, 도움말' },
  { name: '주의 · Warning', hex: '#f59e0b', use: '경고, 확인 필요' },
  { name: '오류 · Error', hex: '#ef4444', use: '실패, 삭제, 위험' },
];

// 색 선택 도구 링크 목록 — 이름/설명/URL.
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
/**
 * readableText — 배경색 위에서 읽기 쉬운 텍스트색을 계산.
 * @param hex  배경색 HEX(#포함/미포함 모두 허용)
 * @returns 밝은 배경이면 어두운 글자('#1a1a1a'), 어두우면 흰 글자('#ffffff')
 * 동작: WCAG 상대 휘도 공식(sRGB→선형 변환 후 가중 합)으로 밝기를 계산하고 0.45를 임계값으로 분기.
 */
const readableText = (hex: string): string => {
  const h = hex.replace('#', '');
  // HEX의 R/G/B 각 2자리를 0~1 범위로 정규화
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  // sRGB 감마 보정 해제(선형화) — WCAG 휘도 계산 전처리
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  // 상대 휘도(밝기) = 가중 합
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.45 ? '#1a1a1a' : '#ffffff';
};

/**
 * ColorChip — 클릭하면 HEX를 복사하는 단일 색상 칩.
 * @param hex  칩 배경색이자 복사 대상 HEX
 * @param label  칩 상단 굵은 라벨(선택)
 * @param sub  칩 하단 보조 텍스트(선택)
 * @param height  칩 최소 높이(px, 기본 56)
 * @returns 색 배경의 버튼 형태 칩(글자색은 readableText로 자동 대비 보장)
 * 부수효과: 클릭 시 HEX 클립보드 복사 및 1.2초간 '✓ 복사됨' 표시.
 */
const ColorChip = ({ hex, label, sub, height = 56 }: { hex: string; label?: string; sub?: string; height?: number }): ReactElement => {
  const [copied, setCopied] = useState(false);
  const fg = readableText(hex); // 배경 대비 가독 글자색 자동 결정
  // HEX 복사 핸들러 — Clipboard API 우선, 실패 시 textarea+execCommand 폴백.
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
    // 성공/폴백 어느 경로든 복사 시도 후 상태 표시
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
      {/* 라벨(선택) */}
      {label && <span style={{ fontWeight: 700 }}>{label}</span>}
      {/* HEX 값 — 복사 직후엔 '✓ 복사됨'으로 잠시 바뀜 */}
      <span style={{ fontFamily: "'JetBrains Mono', monospace", opacity: 0.92 }}>
        {copied ? '✓ 복사됨' : hex}
      </span>
      {/* 보조 텍스트(선택) */}
      {sub && <span style={{ fontSize: '11px', opacity: 0.85 }}>{sub}</span>}
    </button>
  );
};

/**
 * ColorPalette — 색채 학습용 종합 자료 블록(Day4 참고자료).
 * @returns 난/한/중성 분류, 기본 12색, 톤 9단계, 배색 방법, 시멘틱 컬러, 도구, 팁 섹션 묶음
 * 부수효과: 없음(내부 ColorChip 클릭 시 개별 복사 발생). renderSection에서 section.colorPalette일 때 렌더.
 */
const ColorPalette = (): ReactElement => (
  <div style={{ margin: '4px 0 8px' }}>
    {/* 12색상환 카테고리 */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
      {/* 난색/한색/중성 3분류 카드 — 인라인 배열을 map으로 렌더 */}
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
      {/* BASE_12 → 색상칩 그리드 */}
      {BASE_12.map((c) => <ColorChip key={c.hex} hex={c.hex} label={c.name} height={64} />)}
    </div>

    {/* 톤 9단계 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>색의 톤(Tone) — 같은 계열 명도 단계</h5>
    <div style={{ marginBottom: '20px' }}>
      {/* 계열(Blue/Green/Red/Gray)별로 한 행씩, 각 행은 명도 단계 칩들 */}
      {Object.entries(TONES).map(([name, hexes]) => (
        <div key={name} style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '4px' }}>{name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TONE_STEPS.length}, 1fr)`, gap: '4px' }}>
            {/* 인덱스 i로 TONE_STEPS의 단계 숫자(50~900)를 라벨로 매칭 */}
            {hexes.map((hex, i) => <ColorChip key={hex} hex={hex} label={String(TONE_STEPS[i])} height={46} />)}
          </div>
        </div>
      ))}
    </div>

    {/* 배색 방법 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>배색 방법 — 어울리는 색 고르기</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '20px' }}>
      {/* HARMONY 배색 이론 카드 */}
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
      {/* SEMANTIC → 용도(sub) 포함 색상칩 */}
      {SEMANTIC.map((s) => <ColorChip key={s.hex} hex={s.hex} label={s.name} sub={s.use} height={72} />)}
    </div>

    {/* 도구 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>색 고를 때 쓰는 도구</h5>
    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', lineHeight: 1.9, color: '#1a1a1a', fontSize: '15px' }}>
      {/* TOOLS → 새 탭 외부 링크 + 설명 */}
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

/**
 * renderSection — 단일 ContentSection을 타입에 맞는 블록으로 렌더링.
 * @param section  렌더할 콘텐츠 섹션(subtitle/text/items/code/table/svg/callout/colorPalette 중 존재하는 필드만 출력)
 * @param idx  React key 및 컨테이너 식별용 인덱스
 * @returns 섹션 컨테이너 div(존재하는 하위 필드들을 순서대로 조건부 렌더)
 * 주의: section.svg는 dangerouslySetInnerHTML로 주입되므로 신뢰 가능한 데이터여야 함.
 */
const renderSection = (section: ContentSection, idx: number): ReactElement => (
  <div key={idx} style={{ marginBottom: '20px' }}>
    {/* 소제목(있을 때만) */}
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
    {/* 본문 단락 */}
    {section.text && (
      <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: 'var(--text-primary, #1a1a1a)' }}>
        {section.text}
      </p>
    )}
    {/* 불릿 리스트 */}
    {section.items && (
      <ul style={{ margin: '0 0 12px', paddingLeft: '20px', lineHeight: 1.85, color: 'var(--text-primary, #1a1a1a)' }}>
        {section.items.map((item, j) => <li key={j}>{item}</li>)}
      </ul>
    )}
    {/* 코드 블록(복사 가능) */}
    {section.code && (
      <CodeBlock lang={section.code.lang} content={section.code.content} />
    )}
    {/* 표 — 가로 스크롤 래퍼로 감싸 모바일 대응 */}
    {section.table && (
      <div className="content-table-wrap" style={{ overflowX: 'auto', margin: '8px 0 16px' }}>
        <table style={{
          width: '100%',
          // minWidth:max-content를 빼서 표가 컨테이너 폭에 맞춰 줄어들고 셀이 줄바꿈되도록 함
          // (이전엔 내용 너비만큼 강제로 늘어나 가로스크롤이 생겼음)
          tableLayout: 'auto',
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
            {/* rows[ri][ci] 2차원 배열을 행→셀 순으로 렌더 */}
            {section.table.rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 12px',
                    color: 'var(--text-primary, #1a1a1a)',
                    verticalAlign: 'top',
                    lineHeight: 1.6,
                    // 긴 셀(예: 단계별 수행 지시)이 가로스크롤 대신 줄바꿈되도록.
                    // keep-all: 한글 단어는 쪼개지 않고 공백/화살표(→) 위치에서만 줄바꿈.
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {/* SVG 원본 HTML 주입 — 데이터 신뢰 전제(XSS 주의) */}
    {section.svg && (
      <div
        style={{ margin: '10px 0 18px', textAlign: 'center', overflowX: 'auto' }}
        dangerouslySetInnerHTML={{ __html: section.svg }}
      />
    )}
    {/* 콜아웃(강조 박스) — type별 calloutColors로 스타일 결정 */}
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
    {/* 색채 학습 자료 블록(플래그가 true일 때만) */}
    {section.colorPalette && <ColorPalette />}
  </div>
);

// 정규과정: 오늘 날짜에 해당하는 Day를 기본 선택(없으면 지난 마지막 Day)
/**
 * computeInitialIndex — 초기 선택할 일자 인덱스 계산.
 * @param phase  현재 과정(정규가 아니면 항상 0 반환)
 * @returns 정규과정일 때 오늘 이전(포함)인 마지막 일자 인덱스, 그 외 0
 * 동작: REGULAR_DATES를 순회하며 today 이하인 가장 큰 인덱스를 idx로 갱신(엣지: 모두 미래면 0 유지).
 */
const computeInitialIndex = (phase?: string): number => {
  if (phase !== 'regular') return 0;
  const today = todayISO();
  let idx = 0;
  // 날짜가 비어있지 않고(today 이하)인 항목을 만날 때마다 idx 갱신 → 마지막 매칭이 남음
  REGULAR_DATES.forEach((d, i) => { if (d && d <= today) idx = i; });
  return idx;
};

/**
 * Learning — 학습 페이지 메인 컴포넌트(default export).
 * @returns SEO 헤드 + 페이지 헤더 + (사이드바 네비 | 콘텐츠 카드) 레이아웃
 * 부수효과: 잘못된 phase면 "/"로 리다이렉트. 사이드바 클릭으로 선택 일자/하위 섹션/펼침 상태를 변경.
 */
const Learning = (): ReactElement => {
  const { phase } = useParams<{ phase: string }>(); // URL의 :phase 파라미터
  const { t } = useLanguage();                       // i18n 번역 함수
  // selectedIndex: 현재 선택된 일자(2차 메뉴) 인덱스. 정규과정이면 오늘 기준 초기화.
  const [selectedIndex, setSelectedIndex] = useState<number>(() => computeInitialIndex(phase));
  // subIndex: null = 일자 개요(2차 메뉴 콘텐츠), 0~N = 3차 메뉴 상세
  const [selectedSubIndex, setSelectedSubIndex] = useState<number | null>(null);
  // openIndex: 드롭다운(3차 메뉴)이 펼쳐진 일자 — 아코디언(한 번에 하나만 열림)
  const [openIndex, setOpenIndex] = useState<number | null>(() => computeInitialIndex(phase));

  // phase에 해당하는 설정 조회 — 없으면(잘못된 URL) 홈으로 즉시 리다이렉트.
  const config = phase ? phaseMap[phase] : undefined;
  if (!config) return <Navigate to="/" replace />;

  const { topics, titleKey, subtitleKey } = config;
  const isRegular = phase === 'regular';
  const today = todayISO();
  const topic = topics[selectedIndex];                 // 현재 선택된 일자 토픽
  // 하위 섹션 존재 여부 / 현재 활성화된 하위 섹션(없거나 개요면 null)
  const hasSubSections = !!(topic.subSections && topic.subSections.length > 0);
  const activeSub = (hasSubSections && selectedSubIndex !== null)
    ? topic.subSections![selectedSubIndex]
    : null;

  // 일자 클릭 — 아코디언: 다른 일자면 그 일자를 열고 나머지는 닫힘, 같은 일자 다시 클릭이면 닫힘
  /**
   * handleDayClick — 사이드바 일자 버튼 클릭 핸들러.
   * @param i  클릭된 일자 인덱스
   * 부수효과: selectedIndex/selectedSubIndex/openIndex 상태 갱신(아코디언 토글).
   */
  const handleDayClick = (i: number) => {
    const tp = topics[i];
    const hasSubs = !!(tp.subSections && tp.subSections.length > 0);
    if (i !== selectedIndex) {
      // 다른 일자 선택: 그 일자로 전환 + 개요부터 보여주고 + 하위 있으면 펼침
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
      {/* 과정 제목 기반 SEO 메타 + canonical 경로 */}
      <SEOHead title={t(titleKey) as string} path={`/learning/${phase}`} />

      {/* 페이지 헤더: 과정 제목/부제 */}
      <section className="page-header">
        <div className="container">
          <h2>{t(titleKey)}</h2>
          <p>{t(subtitleKey)}</p>
        </div>
      </section>

      <div className="sidebar-layout">
        {/* 좌측 사이드바 네비게이션 */}
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {/* 토픽(일자)별 버튼 + (펼쳐졌을 때) 하위 섹션 드롭다운 */}
            {topics.map((tp, i) => {
              const isActive = selectedIndex === i;                   // 현재 선택된 일자인가
              const isToday = isRegular && REGULAR_DATES[i] === today; // 오늘 날짜 일자인가('오늘' 뱃지)
              const isCheckpoint = tp.id.startsWith('reg-check');   // 점검일 — 호버 배경 상시 유지
              const expanded = openIndex === i && !!tp.subSections && tp.subSections.length > 0; // 드롭다운 펼침 여부
              const dateLabel = isRegular && REGULAR_DATES[i] ? fmtKDate(REGULAR_DATES[i]) : ''; // 한국식 날짜 라벨
              return (
                <div key={tp.id}>
                  {/* 일부 항목 앞에 '부록' 구분선 표시 */}
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
                  {/* 일자(2차 메뉴) 버튼 — 클릭 시 handleDayClick */}
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
                      {/* 정규과정 날짜 라벨(있을 때만) */}
                      {dateLabel && (
                        <span style={{ marginLeft: '6px', fontSize: '12.5px', opacity: 0.7, fontWeight: 500 }}>
                          {dateLabel}
                        </span>
                      )}
                      {/* 오늘에 해당하는 일자에 '오늘' 뱃지 */}
                      {isToday && (
                        <span style={{
                          marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                          borderRadius: '999px', background: 'var(--primary-blue, #0046C8)', color: '#fff',
                        }}>오늘</span>
                      )}
                    </span>
                    {/* 하위 섹션이 있으면 펼침 화살표(펼쳐지면 90도 회전) */}
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
                  {/* 펼쳐진 일자의 하위 섹션(3차 메뉴) 드롭다운 */}
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
                      {/* '개요' 항목 — selectedSubIndex를 null로(=일자 개요 콘텐츠) */}
                      <button
                        type="button"
                        onClick={() => setSelectedSubIndex(null)}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontSize: '15px',
                          // 개요 선택 중이면 강조 스타일
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
                      {/* 각 하위 섹션 버튼 — 클릭 시 해당 인덱스로 selectedSubIndex 설정 */}
                      {tp.subSections!.map((sub, si) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubIndex(si)}
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '15px',
                            // 현재 선택된 하위 섹션이면 강조 스타일
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
                          {/* 아이콘이 있으면 접두로 붙임 */}
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

        {/* 우측 콘텐츠 영역 */}
        <div className="sidebar-content">
          <div className="topic-card">
            <div className="topic-card-header">
              {/* 하위 섹션 활성 시 그 아이콘(없으면 일자 아이콘), 아니면 일자 아이콘 */}
              <div className="topic-card-icon">{activeSub ? (activeSub.icon || topic.icon) : topic.icon}</div>
              <div className="topic-card-title">
                {/* 하위 섹션 보기일 땐 상위 일자 제목 + 하위 섹션 제목, 아니면 일자 제목만 */}
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
              {/* activeSub가 있으면 하위 섹션 콘텐츠, 없으면 일자 개요 콘텐츠 렌더 */}
              {activeSub ? (
                <>
                  {/* 하위 섹션 요약(있을 때만) */}
                  {activeSub.summary && (
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                      {activeSub.summary}
                    </p>
                  )}
                  {/* 하위 섹션의 콘텐츠 블록들 */}
                  {activeSub.content.map((section, idx) => renderSection(section, idx))}
                </>
              ) : (
                <>
                  {/* 일자 설명 + 일자 콘텐츠 블록들 */}
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
