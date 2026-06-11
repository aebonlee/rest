/**
 * Learning.tsx — 학습(커리큘럼) 페이지
 *
 * ───────────────────────────────────────────────────────────────────────────
 * [초보자를 위한 배경 설명]
 * 이 파일은 "한 화면(페이지) 전체"를 그려내는 React 컴포넌트입니다.
 *
 *  · React 란? UI를 '컴포넌트'라는 작은 함수 조각으로 나눠 만드는 라이브러리입니다.
 *    각 컴포넌트는 화면에 그릴 내용을 JSX(아래 참고)로 'return' 합니다.
 *  · JSX 란? 자바스크립트 안에 HTML처럼 생긴 문법을 섞어 쓰는 것입니다.
 *    예) return <div>안녕</div> 처럼요. 실제로는 함수 호출로 변환됩니다.
 *  · TypeScript(.tsx) 란? 자바스크립트에 '타입(자료형) 검사'를 더한 언어입니다.
 *    예) (hex: string) 은 "hex 는 문자열이어야 한다"는 약속을 코드로 적은 것입니다.
 *  · 라우팅(routing) 이란? 주소(URL)에 따라 다른 화면을 보여주는 구조입니다.
 *    여기서는 /learning/regular 처럼 URL 끝의 :phase 부분으로 어떤 과정을 볼지 정합니다.
 *
 * 역할:
 *  - URL 파라미터(:phase)에 따라 사전과정/정규과정/코칭 중 하나의 커리큘럼을 사이드바 메뉴와
 *    본문(콘텐츠 카드) 형태로 렌더링하는 페이지 컴포넌트.
 *    (렌더링 = '화면에 그리다'라는 뜻입니다.)
 *
 * 핵심 책임:
 *  - phase 값을 phaseMap에서 조회해 해당 토픽 목록·제목·부제 키를 결정(없으면 홈으로 리다이렉트).
 *  - 사이드바: 일자(2차 메뉴) 아코디언 + 일자별 하위 섹션(3차 메뉴) 드롭다운 네비게이션.
 *    (아코디언 = 한 번에 한 항목만 펼쳐지고 다른 건 접히는 UI 패턴입니다.)
 *  - 본문: 선택된 일자(또는 하위 섹션)의 ContentSection 배열을 renderSection으로 다양한 블록
 *    (텍스트/리스트/코드/표/SVG/콜아웃/컬러 팔레트)으로 렌더링.
 *  - 정규과정은 오늘 날짜에 해당하는 Day를 초기 선택(computeInitialIndex)하고 '오늘' 뱃지 표시.
 *  - 코드 복사(CodeBlock), 색상칩 복사(ColorChip), 색상 학습 자료(ColorPalette) 보조 UI 제공.
 *
 * 이 파일의 큰 그림(읽는 순서 추천):
 *   1) 상단의 상수 데이터(phaseMap, 색 데이터 등) — '무엇을 보여줄지'의 재료.
 *   2) 작은 부품 컴포넌트(CodeBlock, ColorChip, ColorPalette) — 재사용되는 UI 조각.
 *   3) renderSection — 데이터 한 덩어리를 알맞은 모양으로 그려주는 함수.
 *   4) 맨 아래 Learning — 위 부품들을 모아 페이지 전체를 조립하는 본체.
 *
 * 주요 export:
 *  - default: Learning (React 페이지 컴포넌트)
 *    (export default = 다른 파일에서 이 컴포넌트를 '대표 결과물'로 가져다 쓸 수 있게 내보냄)
 */

// ── import: 다른 파일/라이브러리에서 필요한 기능을 가져오는 구문 ──
// useState: 컴포넌트가 '기억해야 할 값(상태)'을 다루는 React 훅(hook). (값, 그 값을 바꾸는 함수) 쌍을 돌려줌.
// type ReactElement: "이 함수는 화면 요소를 반환한다"는 것을 표시하는 TypeScript 타입(실제 코드는 아님).
import { useState, type ReactElement } from 'react';
// useParams: 현재 URL의 동적 부분(:phase)을 꺼내는 훅. Navigate: 다른 주소로 이동시키는 컴포넌트.
import { useParams, Navigate } from 'react-router-dom';
// useLanguage: 다국어(i18n) 번역 함수 t를 제공하는 우리 프로젝트의 커스텀 훅.
import { useLanguage } from '../contexts/LanguageContext';
// SEOHead: 검색엔진/공유용 메타 태그(<title> 등)를 넣어주는 우리 컴포넌트.
import SEOHead from '../components/SEOHead';
// 학습 데이터(과정별 토픽 목록)와 그 형태를 설명하는 타입들을 가져옴.
import {
  prerequisiteTopics,
  regularTopics,
  coachingTopics,
  type Topic,          // 일자(토픽) 한 개의 데이터 형태
  type ContentSection, // 본문 블록 한 개의 데이터 형태
} from '../data/learningData';
// REGULAR_DATES: 정규과정 일자별 날짜 배열, fmtKDate: 한국식 날짜 포맷 함수, todayISO: 오늘 날짜 문자열.
import { REGULAR_DATES, fmtKDate, todayISO } from '../config/regularSchedule';

// phase(URL 파라미터) → 해당 과정의 토픽 목록과 i18n 제목/부제 키 매핑 테이블.
// Learning 컴포넌트에서 phaseMap[phase]로 조회해 어떤 커리큘럼을 보여줄지 결정한다.
// 개념: Record<string, {...}> 는 "문자열을 키로, {...} 모양의 값을 갖는 객체"라는 TypeScript 타입.
//       즉 phaseMap['regular'] 처럼 문자열로 꺼내 쓸 수 있는 사전(dictionary) 형태입니다.
const phaseMap: Record<string, { topics: Topic[]; titleKey: string; subtitleKey: string }> = {
  prerequisite: {
    topics: prerequisiteTopics,
    titleKey: 'site.learning.prerequisite.title',     // 번역 함수 t()에 넘길 '키'. 실제 글자는 번역 파일에 있음.
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
// 예) calloutColors['tip'] → 초록 배경 + 💡 이모지 + 'TIP' 라벨.
const calloutColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  tip:  { bg: '#ecfdf5', border: '#10b981', emoji: '💡', label: 'TIP' },
  warn: { bg: '#fef2f2', border: '#ef4444', emoji: '⚠️', label: '주의' },
  info: { bg: '#eff6ff', border: '#3b82f6', emoji: 'ℹ️', label: '참고' },
};

/**
 * CodeBlock — 복사 버튼이 달린 코드 블록 UI.
 *
 * [개념] 이것은 작은 '컴포넌트'입니다. 화살표 함수( = (...) => (...) ) 로 정의했고,
 *        중괄호 안의 { lang, content } 는 '구조 분해 할당'으로 props(부모가 넘긴 입력값)을 꺼낸 것.
 *
 * @param lang  코드 언어 라벨(헤더에 표시, 없으면 'code'). 끝의 '?'는 "없어도 됨(선택)"이라는 뜻.
 * @param content  표시 및 클립보드 복사 대상 코드 문자열
 * @returns 언어 헤더 + 복사 버튼 + <pre><code> 코드 영역
 * 부수효과: 복사 버튼 클릭 시 클립보드 쓰기 및 1.5초간 '복사됨' 상태 표시.
 *           (부수효과 = 화면 그리기 외에 바깥 세상에 영향을 주는 일. 여기선 클립보드 쓰기.)
 */
const CodeBlock = ({ lang, content, wrap }: { lang?: string; content: string; wrap?: boolean }): ReactElement => {
  // copied: 복사 성공 후 잠깐 true가 되어 버튼 라벨/색을 '복사됨'으로 바꾼다.
  // [개념] useState(false) → 초기값 false. [현재값, 바꾸는함수] 두 개를 배열로 돌려줌.
  //        setCopied(true) 를 호출하면 React가 이 컴포넌트를 자동으로 다시 그려준다(리렌더).
  const [copied, setCopied] = useState(false);

  // 코드 복사 핸들러 — 우선 Clipboard API 시도, 실패 시 textarea+execCommand 폴백.
  // [개념] async/await: 시간이 걸리는 작업(클립보드 쓰기)을 '기다렸다가' 다음 줄로 넘어가게 함.
  //        await가 실패(거부)하면 catch 블록으로 점프한다.
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content); // 최신 브라우저의 표준 복사 API
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500); // 1.5초 뒤 원래 상태로 복귀
    } catch {
      // 권한 부재 등 — execCommand 폴백
      // 화면 밖(보이지 않는) textarea에 값을 넣고 선택 후 복사 명령 실행
      // 주의: execCommand('copy')는 '구식' 방법이지만, clipboard API가 막힌 환경(권한/구형 브라우저)을 위한 대비책.
      const ta = document.createElement('textarea'); // 임시 입력 상자를 메모리에 생성
      ta.value = content;
      ta.style.position = 'fixed';  // 화면 흐름에 영향 안 주도록 고정 배치
      ta.style.opacity = '0';       // 눈에 안 보이게(투명)
      document.body.appendChild(ta); // 실제 문서에 잠깐 끼워 넣어야 select가 동작함
      ta.select();                   // 안의 텍스트 전체 선택
      try { document.execCommand('copy'); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* noop */ } // noop = 아무것도 안 함
      document.body.removeChild(ta); // 임시 요소 정리(끼워 넣은 것을 다시 제거)
    }
  };

  // ↓ 여기서부터가 화면에 그릴 내용(JSX). style={{...}} 의 바깥 중괄호는 'JS 표현식', 안쪽은 '객체'.
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
        {/* lang이 없으면(undefined/빈문자열) 'code'를 대신 표시 (|| = OR 기본값) */}
        <span style={{
          fontSize: '13px',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>{lang || 'code'}</span>
        <button
          type="button"
          // onClick={handleCopy}: 클릭하면 위에서 만든 handleCopy 실행
          onClick={handleCopy}
          // aria-label: 화면낭독기(접근성)용 설명 라벨
          aria-label="코드 복사"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            fontSize: '14px',
            fontWeight: 600,
            // copied 상태에 따라 텍스트/배경/테두리색을 초록 계열로 전환
            // [개념] 조건 ? A : B 는 삼항 연산자. "조건이 참이면 A, 아니면 B".
            color: copied ? '#10b981' : '#cbd5e1',
            background: copied ? '#064e3b' : '#334155',
            border: `1px solid ${copied ? '#10b981' : '#475569'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {/* copied면 체크 아이콘+'복사됨', 아니면 복사 아이콘+'복사' */}
          {/* <>...</>는 'Fragment' — 불필요한 div 없이 여러 요소를 묶는 빈 껍데기 */}
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />{/* 체크(✓) 모양 선 */}
              </svg>
              복사됨
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />{/* 겹친 사각형 = '복사' 아이콘 */}
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              복사
            </>
          )}
        </button>
      </div>
      {/* 실제 코드 본문 — 가로 스크롤 가능, 모노스페이스 폰트 */}
      {/* <pre>는 공백/줄바꿈을 그대로 보존하는 태그(코드 표시에 적합) */}
      <pre style={{
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '16px 18px',
        borderRadius: '0 0 8px 8px',
        fontSize: '15px',
        fontFamily: "'JetBrains Mono', 'Consolas', 'Courier New', monospace",
        margin: 0,
        // wrap=true(코칭): 긴 줄을 자동 줄바꿈하고 줄간격을 넓혀 가독성↑. 아니면 기존 가로 스크롤.
        ...(wrap
          ? { whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const, overflowWrap: 'break-word' as const, lineHeight: 2.1 }
          : { overflowX: 'auto' as const, lineHeight: 1.6 }),
      }}>
        {/* 중괄호 안의 content는 위 props로 받은 코드 문자열을 그대로 출력 */}
        <code>{content}</code>
      </pre>
    </div>
  );
};

// ── 🎨 색상환 · 컬러 팔레트 (Day4 참고자료) ──
// 아래 BASE_12/TONES/HARMONY/SEMANTIC/TOOLS는 ColorPalette에서 사용하는 정적 데이터.
// '정적 데이터'란? 사용자 입력이나 시간에 따라 바뀌지 않는, 미리 정해 둔 값들입니다.
// 컴포넌트 바깥에 두는 이유: 매번 컴포넌트가 다시 그려질 때 새로 만들 필요가 없어 효율적이기 때문.

// 색상환 기본 12색 — 이름과 HEX 쌍 배열.
// [개념] : { name: string; hex: string }[]  → "이런 모양의 객체들로 이루어진 배열"이라는 타입.
const BASE_12: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#ef4444' }, { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' }, { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' }, { name: 'Green', hex: '#22c55e' },
  { name: 'Emerald', hex: '#10b981' }, { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' }, { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' }, { name: 'Pink', hex: '#ec4899' },
];

// 톤(명도) 단계 라벨 — TONES 각 배열의 인덱스와 1:1로 매핑된다(50이 가장 밝음).
// [개념] as const: "이 배열은 절대 안 바뀌고, 값도 정확히 이 숫자들"이라고 못박는 TypeScript 표시.
const TONE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
// 계열별 10단계 명도 HEX 배열 — TONE_STEPS 순서와 동일.
// 즉 TONES.Blue[0] 은 50단계(가장 밝은 파랑), TONES.Blue[9] 는 900단계(가장 어두운 파랑).
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
// '시멘틱(semantic)'은 '의미를 담은'이라는 뜻. 빨강=오류처럼 색 자체가 의미를 갖습니다.
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
 *
 * 왜 필요한가? 색 칩 배경이 밝으면 검은 글자가, 어두우면 흰 글자가 잘 보입니다.
 *             이 함수가 배경 밝기를 계산해 자동으로 적절한 글자색을 골라줍니다.
 *
 * @param hex  배경색 HEX(#포함/미포함 모두 허용)
 * @returns 밝은 배경이면 어두운 글자('#1a1a1a'), 어두우면 흰 글자('#ffffff')
 * 동작: WCAG 상대 휘도 공식(sRGB→선형 변환 후 가중 합)으로 밝기를 계산하고 0.45를 임계값으로 분기.
 *       (WCAG = 웹 접근성 표준. '휘도'는 사람 눈이 느끼는 밝기를 수치화한 것.)
 */
const readableText = (hex: string): string => {
  const h = hex.replace('#', ''); // '#'이 있으면 제거 → 'ef4444' 같은 6자리 숫자만 남김
  // HEX의 R/G/B 각 2자리를 0~1 범위로 정규화
  // [개념] slice(0,2)='ef', parseInt(...,16)=16진수로 해석 → 255로 나눠 0~1 비율로 바꿈.
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  // sRGB 감마 보정 해제(선형화) — WCAG 휘도 계산 전처리
  // 화면 색은 사람 눈에 맞게 '왜곡(감마)'되어 저장되므로, 밝기 계산 전에 그 왜곡을 되돌립니다.
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  // 상대 휘도(밝기) = 가중 합. 사람 눈은 초록(G)에 가장 민감해 가중치가 가장 큼(0.7152).
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.45 ? '#1a1a1a' : '#ffffff'; // 0.45보다 밝으면 검은 글자, 아니면 흰 글자
};

/**
 * ColorChip — 클릭하면 HEX를 복사하는 단일 색상 칩.
 * @param hex  칩 배경색이자 복사 대상 HEX
 * @param label  칩 상단 굵은 라벨(선택)
 * @param sub  칩 하단 보조 텍스트(선택)
 * @param height  칩 최소 높이(px, 기본 56)  ← '= 56'은 안 넘기면 56을 쓰는 '기본값'
 * @returns 색 배경의 버튼 형태 칩(글자색은 readableText로 자동 대비 보장)
 * 부수효과: 클릭 시 HEX 클립보드 복사 및 1.2초간 '✓ 복사됨' 표시.
 */
const ColorChip = ({ hex, label, sub, height = 56 }: { hex: string; label?: string; sub?: string; height?: number }): ReactElement => {
  const [copied, setCopied] = useState(false); // 복사 직후 잠깐 true (라벨을 '복사됨'으로 바꾸기 위함)
  const fg = readableText(hex); // 배경 대비 가독 글자색 자동 결정 (fg = foreground = 전경/글자색)
  // HEX 복사 핸들러 — Clipboard API 우선, 실패 시 textarea+execCommand 폴백. (CodeBlock과 동일한 패턴)
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
    // 주의: 여기서는 try가 끝난 '뒤'에 setCopied를 두어, 성공이든 폴백이든 똑같이 표시되도록 했습니다.
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200); // 1.2초 뒤 원래 표시(HEX)로 복귀
  };
  return (
    <button
      type="button"
      onClick={copy}
      // title: 마우스를 올리면 뜨는 작은 설명 풍선 (백틱 ``는 변수 끼워넣기용 템플릿 문자열)
      title={`${hex} 복사`}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px',
        background: hex, color: fg, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px',
        padding: '8px 10px', minHeight: `${height}px`, cursor: 'pointer', textAlign: 'left',
        fontSize: '12.5px', lineHeight: 1.3, transition: 'transform 0.1s',
      }}
    >
      {/* 라벨(선택) — label && (...) 는 "label이 있을 때만 뒤를 그린다"는 흔한 조건부 렌더 패턴 */}
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
 *
 * [개념] 이 컴포넌트는 함수 본문 없이 곧바로 '(...)' 로 JSX를 반환합니다(중괄호+return 생략).
 *        화살표 함수가 () => (값) 형태면 그 값을 바로 돌려준다는 의미입니다.
 *        또한 위에서 만든 ColorChip을 여러 번 재사용 — '작은 부품을 모아 큰 화면을 만드는' React의 핵심.
 */
const ColorPalette = (): ReactElement => (
  <div style={{ margin: '4px 0 8px' }}>
    {/* 12색상환 카테고리 */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
      {/* 난색/한색/중성 3분류 카드 — 인라인 배열을 map으로 렌더 */}
      {/* [개념] .map(...)은 배열의 각 항목을 화면 요소로 1:1 변환하는, JSX에서 가장 많이 쓰는 반복 방법. */}
      {[
        { t: '난색 (Warm)', d: '빨강·주황·노랑 — 따뜻함·활력·식욕', bg: '#fff7ed', bd: '#f97316' },
        { t: '한색 (Cool)', d: '초록·파랑·보라 — 차분·신뢰·집중', bg: '#eff6ff', bd: '#3b82f6' },
        { t: '중성 (Neutral)', d: '흰·회색·검정 — 균형·여백', bg: '#f9fafb', bd: '#6b7280' },
      ].map((c) => (
        // key={c.t}: React가 목록 항목을 구별하려면 형제끼리 '고유한 key'가 필요(없으면 경고/버그 가능).
        <div key={c.t} style={{ background: c.bg, borderLeft: `4px solid ${c.bd}`, borderRadius: '0 8px 8px 0', padding: '10px 12px' }}>
          <div style={{ fontWeight: 700, marginBottom: '2px', color: '#1a1a1a' }}>{c.t}</div>
          <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>

    {/* 기본 12색 팔레트 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>기본 12색 팔레트</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '20px' }}>
      {/* BASE_12 → 색상칩 그리드. key={c.hex}: HEX가 색마다 고유하므로 key로 사용. */}
      {BASE_12.map((c) => <ColorChip key={c.hex} hex={c.hex} label={c.name} height={64} />)}
    </div>

    {/* 톤 9단계 */}
    <h5 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>색의 톤(Tone) — 같은 계열 명도 단계</h5>
    <div style={{ marginBottom: '20px' }}>
      {/* 계열(Blue/Green/Red/Gray)별로 한 행씩, 각 행은 명도 단계 칩들 */}
      {/* [개념] Object.entries(객체)는 {Blue:[...], ...}를 [['Blue',[...]], ...] 형태의 배열로 바꿔 map 가능하게 함. */}
      {Object.entries(TONES).map(([name, hexes]) => (
        <div key={name} style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '4px' }}>{name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TONE_STEPS.length}, 1fr)`, gap: '4px' }}>
            {/* 인덱스 i로 TONE_STEPS의 단계 숫자(50~900)를 라벨로 매칭 */}
            {/* map의 두 번째 인자 i는 '몇 번째 항목인지'(0부터)를 알려주는 인덱스. 같은 위치의 단계 숫자를 꺼냄. */}
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
          {/* target="_blank": 새 탭에서 열기. rel="noopener noreferrer": 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정(필수 습관). */}
          <a href={tl.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>{tl.name}</a>
          {` — ${tl.desc}`}{/* 링크 뒤에 ' — 설명'을 붙임. 중괄호+백틱이라 JSX가 이 문자열을 그대로 출력 */}
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
 *
 * 왜 이렇게 하는가? 학습 데이터는 종류가 다양합니다(글/목록/코드/표/그림 등).
 *   섹션 객체에 어떤 필드가 들어 있느냐에 따라 알맞은 모양으로 그려야 하므로,
 *   "있는 필드만 골라 그리는" 조건부 렌더(field && <JSX>)를 줄줄이 나열했습니다.
 *
 * @param section  렌더할 콘텐츠 섹션(subtitle/text/items/code/table/svg/callout/colorPalette 중 존재하는 필드만 출력)
 * @param idx  React key 및 컨테이너 식별용 인덱스(목록에서 몇 번째인지)
 * @returns 섹션 컨테이너 div(존재하는 하위 필드들을 순서대로 조건부 렌더)
 * 주의: section.svg는 dangerouslySetInnerHTML로 주입되므로 신뢰 가능한 데이터여야 함.
 *       (사용자 입력 같은 외부 문자열을 여기 넣으면 XSS 보안 취약점이 됩니다. 우리 데이터 파일만 넣으세요.)
 */
const renderSection = (section: ContentSection, idx: number, wrapCode = false): ReactElement => (
  <div key={idx} style={{ marginBottom: '20px' }}>
    {/* 소제목(있을 때만) */}
    {section.subtitle && (
      <h4 style={{
        fontSize: '16px',
        fontWeight: 700,
        margin: '24px 0 10px',
        // var(--text-primary, #1a1a1a): CSS 변수 --text-primary를 쓰되, 없으면 #1a1a1a로 대체(테마 대응).
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
        {/* items 배열의 각 문자열을 <li>로. j는 인덱스(여기선 항목이 단순 문자열이라 key로 인덱스 사용). */}
        {section.items.map((item, j) => <li key={j}>{item}</li>)}
      </ul>
    )}
    {/* 코드 블록(복사 가능) — 위에서 만든 CodeBlock 부품 재사용 */}
    {section.code && (
      <CodeBlock lang={section.code.lang} content={section.code.content} wrap={wrapCode} />
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
              {/* headers 배열 → 표 머리(<th>)들. i는 위치 인덱스. */}
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
            {/* 바깥 map은 '행', 안쪽 map은 그 행의 '셀'. ri=행 번호, ci=칸 번호. */}
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
    {/* [개념] dangerouslySetInnerHTML: 문자열을 'HTML 그대로' 화면에 꽂는 방법. '위험할 수 있다'는 경고가 이름에 담겨 있음. */}
    {/* 주의: 외부/사용자 입력을 여기 넣으면 악성 스크립트가 실행될 수 있습니다. 신뢰된 정적 데이터에만 사용하세요. */}
    {section.svg && (
      <div
        style={{ margin: '10px 0 18px', textAlign: 'center', overflowX: 'auto' }}
        dangerouslySetInnerHTML={{ __html: section.svg }}
      />
    )}
    {/* 콜아웃(강조 박스) — type별 calloutColors로 스타일 결정 */}
    {section.callout && (
      <div style={{
        // calloutColors[section.callout.type]: 'tip'/'warn'/'info' 중 하나로 색 묶음을 꺼냄.
        // 주의: type 값이 세 키 중 하나가 아니면 undefined가 되어 .bg 접근에서 오류가 납니다(데이터 검증 필요).
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
    {/* 색채 학습 자료 블록(플래그가 true일 때만) — 위에서 만든 ColorPalette 부품 사용 */}
    {section.colorPalette && <ColorPalette />}
  </div>
);

// 정규과정: 오늘 날짜에 해당하는 Day를 기본 선택(없으면 지난 마지막 Day)
/**
 * computeInitialIndex — 초기 선택할 일자 인덱스 계산.
 *
 * 왜 필요한가? 정규과정에 처음 들어오면 '오늘 진도'가 바로 보이는 게 친절합니다.
 *             그래서 오늘 또는 그 이전 중 가장 최근 일자를 자동으로 골라 줍니다.
 *
 * @param phase  현재 과정(정규가 아니면 항상 0 반환). 끝의 '?'는 값이 없을 수도 있다는 뜻.
 * @returns 정규과정일 때 오늘 이전(포함)인 마지막 일자 인덱스, 그 외 0
 * 동작: REGULAR_DATES를 순회하며 today 이하인 가장 큰 인덱스를 idx로 갱신(엣지: 모두 미래면 0 유지).
 */
const computeInitialIndex = (phase?: string): number => {
  if (phase !== 'regular') return 0; // 정규과정이 아니면 항상 첫 항목(0)부터
  const today = todayISO();          // 오늘 날짜를 'YYYY-MM-DD' 문자열로
  let idx = 0;
  // 날짜가 비어있지 않고(today 이하)인 항목을 만날 때마다 idx 갱신 → 마지막 매칭이 남음
  // [개념] 문자열 날짜 비교(d <= today)는 'YYYY-MM-DD' 형식이라 사전순=날짜순으로 정확히 동작합니다.
  // 주의: forEach는 중간에 멈추지 못해 끝까지 돕니다. 그래서 '마지막으로 조건을 만족한 i'가 idx에 남게 됩니다.
  REGULAR_DATES.forEach((d, i) => { if (d && d <= today) idx = i; });
  return idx;
};

/**
 * Learning — 학습 페이지 메인 컴포넌트(default export).
 *
 * 이 컴포넌트가 페이지의 '본체'입니다. 위에서 정의한 데이터/부품/함수를 모두 모아 조립합니다.
 *
 * @returns SEO 헤드 + 페이지 헤더 + (사이드바 네비 | 콘텐츠 카드) 레이아웃
 * 부수효과: 잘못된 phase면 "/"로 리다이렉트. 사이드바 클릭으로 선택 일자/하위 섹션/펼침 상태를 변경.
 */
const Learning = (): ReactElement => {
  const { phase } = useParams<{ phase: string }>(); // URL의 :phase 파라미터를 꺼냄(구조 분해)
  const { t } = useLanguage();                       // i18n 번역 함수 t(키) → 해당 언어 문자열
  // selectedIndex: 현재 선택된 일자(2차 메뉴) 인덱스. 정규과정이면 오늘 기준 초기화.
  // [개념] useState(() => 계산함수): 초기값 계산이 무거울 때 '함수로' 넘기면 첫 렌더에만 1번 실행됩니다(지연 초기화).
  const [selectedIndex, setSelectedIndex] = useState<number>(() => computeInitialIndex(phase));
  // subIndex: null = 일자 개요(2차 메뉴 콘텐츠), 0~N = 3차 메뉴 상세
  // [개념] <number | null> 은 "숫자이거나 null일 수 있다"는 유니언 타입.
  const [selectedSubIndex, setSelectedSubIndex] = useState<number | null>(null);
  // openIndex: 드롭다운(3차 메뉴)이 펼쳐진 일자 — 아코디언(한 번에 하나만 열림)
  const [openIndex, setOpenIndex] = useState<number | null>(() => computeInitialIndex(phase));
  // half: 정규과정처럼 일자 메뉴가 많을 때 좌측 메뉴를 전반(0)/후반(1)으로 나눠 보여줄 현재 절반.
  const [half, setHalf] = useState<0 | 1>(() => {
    const tps = phase ? phaseMap[phase]?.topics : undefined;
    const m = tps ? Math.ceil(tps.length / 2) : 0;
    return computeInitialIndex(phase) >= m ? 1 : 0;
  });

  // phase에 해당하는 설정 조회 — 없으면(잘못된 URL) 홈으로 즉시 리다이렉트.
  // [개념] phase ? A : undefined → phase가 있으면 phaseMap에서 찾고, 아예 없으면 undefined.
  const config = phase ? phaseMap[phase] : undefined;
  // 주의: 이 'return'은 훅(useState) 호출보다 반드시 '뒤'에 있어야 합니다.
  //       React 규칙상 훅은 조건/early return보다 항상 먼저, 매번 같은 순서로 호출돼야 하기 때문입니다.
  if (!config) return <Navigate to="/" replace />; // replace: 뒤로가기 기록에 잘못된 주소를 남기지 않음

  const { topics, titleKey, subtitleKey } = config; // config 객체에서 세 값을 한 번에 꺼냄
  const isRegular = phase === 'regular';            // 정규과정 여부(날짜 라벨/오늘 뱃지 등에 사용)
  const today = todayISO();                          // 오늘 날짜 문자열
  const topic = topics[selectedIndex];               // 현재 선택된 일자 토픽
  // 일자 메뉴가 많으면(정규과정) 좌측 메뉴 상단에 전/후반 구분 탭을 두고 절반씩만 보여준다.
  const mid = Math.ceil(topics.length / 2);
  const useHalfTabs = isRegular && topics.length > 10;
  const dayNum = (tp?: { title?: string }): string => (tp?.title?.match(/Day\s*(\d+)/)?.[1] ?? '');
  // 하위 섹션 존재 여부 / 현재 활성화된 하위 섹션(없거나 개요면 null)
  // [개념] !!(...) 는 값을 true/false로 강제 변환. (값이 있으면 true, 없으면 false)
  const hasSubSections = !!(topic.subSections && topic.subSections.length > 0);
  // activeSub: 하위 섹션을 보고 있는 중이면 그 섹션 객체, 아니면 null(=개요 보기).
  // [개념] topic.subSections! 의 '!'는 "여기선 절대 undefined 아님"을 TypeScript에 단언(non-null assertion).
  //        앞의 hasSubSections 검사로 실제 안전이 보장되기에 쓸 수 있습니다.
  // 점검일(reg-check-*)은 하위섹션을 '별도 페이지'가 아니라 한 페이지에 모두 스택하고, 사이드바 하위메뉴는 책갈피(앵커 스크롤)로 쓴다.
  const topicIsCheckpoint = topic.id.startsWith('reg-check');
  const activeSub = (hasSubSections && selectedSubIndex !== null && !topicIsCheckpoint)
    ? topic.subSections![selectedSubIndex]
    : null;

  // 일자 클릭 — 아코디언: 다른 일자면 그 일자를 열고 나머지는 닫힘, 같은 일자 다시 클릭이면 닫힘
  /**
   * handleDayClick — 사이드바 일자 버튼 클릭 핸들러.
   * @param i  클릭된 일자 인덱스
   * 부수효과: selectedIndex/selectedSubIndex/openIndex 상태 갱신(아코디언 토글).
   */
  const handleDayClick = (i: number) => {
    const tp = topics[i]; // 클릭된 일자 데이터
    const hasSubs = !!(tp.subSections && tp.subSections.length > 0); // 그 일자에 하위 섹션이 있는가
    if (i !== selectedIndex) {
      // 다른 일자 선택: 그 일자로 전환 + 개요부터 보여주고 + 하위 있으면 펼침
      setSelectedIndex(i);
      setSelectedSubIndex(null);          // 개요부터 보여줌
      setOpenIndex(hasSubs ? i : null);   // 새 일자 펼침(openIndex가 1개뿐이라 나머지는 자동으로 닫힘)
    } else {
      // 같은 일자 다시 클릭 — 펼침 토글(닫혀 있으면 열고, 열려 있으면 닫음)
      setSelectedSubIndex(null);
      // [개념] set함수에 '이전값 => 새값' 형태를 넘기면 '직전 상태 기준으로' 안전하게 계산합니다(권장 패턴).
      setOpenIndex((prev) => (prev === i ? null : (hasSubs ? i : null)));
    }
  };

  // ↓ 페이지 전체를 그리는 JSX. 맨 바깥 <>...</>는 여러 최상위 요소를 묶는 Fragment.
  return (
    <>
      {/* 과정 제목 기반 SEO 메타 + canonical 경로 */}
      {/* t(titleKey) as string: 번역 결과를 문자열 타입으로 단언(SEOHead가 string을 요구하기 때문) */}
      <SEOHead title={t(titleKey) as string} path={`/learning/${phase}`} />

      {/* 페이지 헤더: 과정 제목/부제 */}
      <section className="page-header">
        <div className="container">
          <h2>{t(titleKey)}</h2>{/* 번역된 제목 */}
          <p>{t(subtitleKey)}</p>{/* 번역된 부제 */}
        </div>
      </section>

      <div className="sidebar-layout">
        {/* 좌측 사이드바 네비게이션 */}
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {/* 일자 메뉴가 많으면(정규과정) 좌측 메뉴 상단에 전/후반 구분 탭 */}
            {useHalfTabs && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {([0, 1] as const).map((h) => (
                  <button key={h} type="button"
                    onClick={() => { setHalf(h); handleDayClick(h === 0 ? 0 : mid); }}
                    style={{
                      flex: 1, padding: '8px 6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      borderRadius: '8px', border: '1px solid var(--border-light, #e5e7eb)',
                      background: half === h ? 'var(--primary-blue, #0046C8)' : 'var(--bg-white, #fff)',
                      color: half === h ? '#fff' : 'var(--text-secondary, #6b7280)',
                    }}>
                    {h === 0
                      ? `전반부 · Day ${dayNum(topics[0])}~${dayNum(topics[mid - 1])}`
                      : `후반부 · Day ${dayNum(topics[mid])}~${dayNum(topics[topics.length - 1])}`}
                  </button>
                ))}
              </div>
            )}
            {/* 토픽(일자)별 버튼 + (펼쳐졌을 때) 하위 섹션 드롭다운 */}
            {/* map 콜백이 { ... return JSX } 형태인 이유: 아래처럼 변수들을 먼저 계산해야 하기 때문. */}
            {topics.map((tp, i) => {
              if (useHalfTabs && (half === 0 ? i >= mid : i < mid)) return null; // 현재 절반(전/후반)만 표시
              const isActive = selectedIndex === i;                   // 현재 선택된 일자인가
              const isToday = isRegular && REGULAR_DATES[i] === today; // 오늘 날짜 일자인가('오늘' 뱃지)
              const isCheckpoint = tp.id.startsWith('reg-check');   // 점검일 — id가 'reg-check'로 시작하면 점검일
              const expanded = openIndex === i && !!tp.subSections && tp.subSections.length > 0; // 드롭다운 펼침 여부
              const dateLabel = isRegular && REGULAR_DATES[i] ? fmtKDate(REGULAR_DATES[i]) : ''; // 한국식 날짜 라벨(없으면 빈 문자열)
              return (
                // key={tp.id}: 각 일자의 고유 id를 key로(인덱스보다 안정적이라 권장).
                <div key={tp.id}>
                  {/* 일부 항목 앞에 '부록' 구분선 표시 (tp.dividerBefore 플래그가 true일 때만) */}
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
                      <span style={{ flex: 1, height: '1px', background: 'var(--border-light, #e5e7eb)' }} />{/* 왼쪽 선 */}
                      부록
                      <span style={{ flex: 1, height: '1px', background: 'var(--border-light, #e5e7eb)' }} />{/* 오른쪽 선 */}
                    </div>
                  )}
                  {/* 일자(2차 메뉴) 버튼 — 클릭 시 handleDayClick(i) 실행 */}
                  <button
                    // 템플릿 문자열로 클래스 조합: 항상 'sidebar-item', 선택 중이면 뒤에 ' active' 추가.
                    className={`sidebar-item${isActive ? ' active' : ''}`}
                    // 화살표로 감싸야 '클릭할 때' 실행됨(바로 호출 X)
                    onClick={() => handleDayClick(i)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      // 점검일(1차/2차)은 배경을 '다크 그린'으로 상시 표시해 일반 일자와 구분.
                      //  - 선택 중(active)이면 더 진한 그린, 평상시엔 다크 그린. 글자는 흰색.
                      //  - 인라인 스타일이 CSS의 active/hover보다 우선하므로 상태와 무관하게 그린이 유지됨.
                      // [개념] ...(조건 ? {객체} : {}) — 스프레드(...)로 '조건이 참일 때만' 스타일 속성을 펼쳐 넣음.
                      ...(isCheckpoint
                        ? { background: isActive ? '#14532d' : '#166534', color: '#ffffff' }
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
                        // expanded면 ▶를 90도 돌려 ▼처럼 보이게(transition으로 부드럽게 회전).
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                        display: 'inline-block',
                      }}>▶</span>
                    )}
                  </button>
                  {/* 펼쳐진 일자의 하위 섹션(3차 메뉴) 드롭다운 — expanded가 true일 때만 그림 */}
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
                      {/* '개요' 항목 — 클릭 시 selectedSubIndex를 null로(=일자 개요 콘텐츠 표시) */}
                      <button
                        type="button"
                        onClick={() => { setSelectedSubIndex(null); if (isCheckpoint) document.getElementById('lesson-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          fontSize: '15px',
                          // 개요 선택 중(selectedSubIndex===null)이면 강조 스타일
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
                      {/* subSections!: 위 expanded 검사로 존재가 보장되므로 '!'로 단언. si=하위 섹션 인덱스. */}
                      {tp.subSections!.map((sub, si) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => { setSelectedSubIndex(si); if (isCheckpoint) document.getElementById('sub-' + sub.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '15px',
                            // 현재 선택된 하위 섹션(selectedSubIndex===si)이면 강조 스타일
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
                          {/* 아이콘이 있으면 접두로 붙임. sub.icon이 없으면 빈 문자열('')을 붙여 제목만 표시. */}
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
          <div className="topic-card" id="lesson-top">
            <div className="topic-card-header">
              {/* 하위 섹션 활성 시 그 아이콘(없으면 일자 아이콘), 아니면 일자 아이콘 */}
              {/* activeSub.icon || topic.icon: 하위 아이콘이 없으면(||) 일자 아이콘으로 대체 */}
              <div className="topic-card-icon">{activeSub ? (activeSub.icon || topic.icon) : topic.icon}</div>
              <div className="topic-card-title">
                {/* 하위 섹션 보기일 땐 상위 일자 제목 + 하위 섹션 제목, 아니면 일자 제목만 */}
                {activeSub ? (
                  <>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)', display: 'block', marginBottom: '4px' }}>
                      {topic.title}{/* 위에 작게: 어떤 일자에 속한 섹션인지 알려줌 */}
                    </span>
                    {activeSub.title}{/* 크게: 현재 하위 섹션 제목 */}
                  </>
                ) : topic.title}
              </div>
            </div>
            <div className="topic-card-body">
              {/* 점검일이면 모든 하위섹션을 한 페이지에 스택(앵커 id=책갈피), activeSub면 하위섹션 단독, 아니면 일자 개요 */}
              {topicIsCheckpoint && hasSubSections ? (
                <>
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                    {topic.description}
                  </p>
                  {topic.content.map((section, idx) => renderSection(section, idx, phase === 'coaching'))}
                  {topic.subSections!.map((sub) => (
                    <div key={sub.id} id={`sub-${sub.id}`} style={{ scrollMarginTop: '84px', marginTop: '44px', paddingTop: '20px', borderTop: '2px solid var(--border-light, #e5e7eb)' }}>
                      <h2 style={{ fontSize: '21px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary, #111827)' }}>{sub.icon ? `${sub.icon} ` : ''}{sub.title}</h2>
                      {sub.summary && (
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary, #6b7280)', margin: '0 0 18px', lineHeight: 1.7 }}>{sub.summary}</p>
                      )}
                      {sub.content.map((section, idx) => renderSection(section, idx, phase === 'coaching'))}
                    </div>
                  ))}
                </>
              ) : activeSub ? (
                <>
                  {/* 하위 섹션 요약(있을 때만) */}
                  {activeSub.summary && (
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                      {activeSub.summary}
                    </p>
                  )}
                  {/* 하위 섹션의 콘텐츠 블록들 — 각 section을 renderSection으로 그림 */}
                  {activeSub.content.map((section, idx) => renderSection(section, idx, phase === 'coaching'))}
                </>
              ) : (
                <>
                  {/* 일자 설명 + 일자 콘텐츠 블록들 */}
                  <p style={{ fontSize: '16px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                    {topic.description}
                  </p>
                  {topic.content.map((section, idx) => renderSection(section, idx, phase === 'coaching'))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 이 파일의 대표 결과물로 Learning 컴포넌트를 내보냄(라우터가 이걸 가져다 페이지로 사용).
export default Learning;
