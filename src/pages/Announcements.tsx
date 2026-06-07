/*
 * ============================================================================
 * Announcements.tsx — 공지사항 페이지
 * ----------------------------------------------------------------------------
 * [이 파일이 무엇인가?]
 *   AI Reboot Academy 전체 공지사항을 목록 형태로 보여주는 "페이지 컴포넌트"다.
 *   서버(Supabase)에서 공지 데이터를 받아와 화면에 그려주는 역할을 한다.
 *
 * [왜 필요한가?]
 *   학생/사용자에게 학원의 새 소식(중요 공지, 일정 변경 등)을 한곳에서 보여주기 위해서다.
 *   검색·카테고리 필터·펼침(아코디언) 기능으로 많은 공지 중 원하는 것을 쉽게 찾게 한다.
 *
 * [초보자가 알아야 할 배경 용어]
 *   - React 컴포넌트: 화면의 한 조각(여기서는 페이지 전체)을 만들어내는 "함수".
 *       함수가 JSX(HTML처럼 생긴 코드)를 return하면 그게 화면에 그려진다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 태그를 쓰는 문법. <div>...</div> 같은 것.
 *   - 상태(state): 컴포넌트가 기억하는 "변하는 값". 값이 바뀌면 화면이 자동으로 다시 그려진다.
 *   - props: 부모 컴포넌트가 자식 컴포넌트에게 건네주는 "입력값"(함수의 매개변수와 비슷).
 *   - Supabase: 데이터베이스(표 형태로 데이터를 저장)를 웹에서 쉽게 쓰게 해주는 백엔드 서비스.
 *   - RLS(Row Level Security): Supabase의 "행 단위 보안" 정책. 로그인/권한에 따라
 *       특정 행(데이터 줄)만 보이게 막는다. 그래서 권한이 없으면 데이터가 빈 채로 올 수 있다.
 *   - TypeScript: 자바스크립트에 "타입(자료형)"을 붙인 언어. 변수에 어떤 값이 들어올지
 *       미리 정해서 실수를 컴파일 단계에서 잡아준다. 파일 확장자 .tsx = TS + JSX.
 *
 * [화면 동작 흐름 한눈에 보기]
 *   1) 페이지가 처음 뜨면(마운트) → Supabase에서 공지 목록을 한 번 불러온다.
 *   2) 사용자가 검색어를 입력하거나 카테고리 버튼을 누르면 → 목록을 걸러서(필터) 보여준다.
 *   3) 공지 제목을 클릭하면 → 그 공지의 상세 내용이 아래로 펼쳐진다(아코디언).
 *
 * 핵심 책임:
 *   - Supabase의 announcements 테이블 조회(고정글 우선, 최신순 정렬)
 *   - 제목/내용 텍스트 검색 및 카테고리(일반/중요/일정) 필터링
 *   - 카테고리별 개수 집계 및 필터 버튼 라벨 표시
 *   - 각 공지의 아코디언 펼침/접힘으로 상세 내용 노출
 *
 * 주요 export:
 *   - default Announcements : 공지사항 페이지 컴포넌트
 *   - CategoryBadge         : 카테고리 색상 배지 컴포넌트
 *   - CATEGORY_LABEL        : 카테고리 키 → 한글 라벨 매핑
 *   - CATEGORY_COLOR        : 카테고리 키 → 배경/글자 색상 매핑
 * ============================================================================
 */

// [import] 다른 파일/라이브러리에서 필요한 도구를 가져온다.
//  - useState  : 컴포넌트의 "상태(변하는 값)"를 만드는 React 훅(Hook).
//  - useEffect : 화면이 뜨거나 값이 바뀔 때 "부수효과(데이터 불러오기 등)"를 실행하는 훅.
//  - useMemo   : 계산 결과를 "기억(캐싱)"해서, 입력이 안 바뀌면 다시 계산하지 않게 하는 훅.
//  - type ReactElement : 컴포넌트가 반환하는 "화면 요소"의 타입(자료형). type 키워드는 타입만 가져온다는 표시.
// 참고: 훅(Hook)이란 함수형 컴포넌트에서 React 기능(상태·생명주기 등)을 쓰게 해주는 use~ 함수다.
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';      // <head> 태그에 제목·SEO 정보를 넣어주는 컴포넌트
import getSupabase from '../utils/supabase';      // Supabase 연결 클라이언트를 가져오는 함수
import site from '../config/site';                // 사이트 공통 설정(접두사 등)
import type { Announcement } from '../types';     // 공지 한 건의 타입 정의(어떤 필드가 있는지)

// 조회 대상 테이블명. site.dbPrefix(사이트별 접두사)를 붙여 멀티 사이트 환경에서 충돌을 방지한다.
// 백틱(`)으로 감싼 "템플릿 문자열"은 ${...} 안의 값을 문자열에 끼워 넣는다.
// 예: dbPrefix가 'rest_'이면 TABLE은 'rest_announcements'가 된다.
// 주의: 백틱 문자열 안에는 주석을 절대 넣지 마라(그 자체가 문자열 내용이 되어 출력이 바뀐다).
const TABLE = `${site.dbPrefix}announcements`;

// 화면 상단 카테고리 필터 버튼 정의. 'all'은 전체 보기, 나머지는 개별 카테고리.
// 타입 `{ key: string; label: string }[]` = "key와 label 문자열을 가진 객체들의 배열".
// 배열로 만들어 두면 아래에서 .map()으로 버튼을 자동 반복 생성할 수 있다.
const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'general', label: '일반' },
  { key: 'important', label: '중요' },
  { key: 'schedule', label: '일정' },
];

// 카테고리 키 → 사용자에게 보여줄 한글 라벨 매핑(배지/필터 공용).
// Record<string, string> = "문자열 키로 문자열 값을 찾는 객체(사전)" 타입.
// 예: CATEGORY_LABEL['important'] === '중요'.
export const CATEGORY_LABEL: Record<string, string> = {
  general: '일반',
  important: '중요',
  schedule: '일정',
};

// 카테고리 키 → 배지 배경(bg)/글자(fg) 색상 매핑. 알 수 없는 키는 general 색상으로 폴백한다.
// "폴백(fallback)"이란 원하는 값이 없을 때 대신 쓰는 안전한 기본값을 말한다.
// 값의 타입 { bg: string; fg: string } = 배경색(bg)과 글자색(fg)을 가진 객체.
export const CATEGORY_COLOR: Record<string, { bg: string; fg: string }> = {
  general: { bg: '#eef2ff', fg: '#3730a3' },
  important: { bg: '#fee2e2', fg: '#991b1b' },
  schedule: { bg: '#d1fae5', fg: '#065f46' },
};

/**
 * CategoryBadge — 공지 카테고리를 색상 알약(pill) 형태로 표시하는 배지.
 *
 * [무엇을 하나] 카테고리 키를 받아 그에 맞는 색과 한글 라벨이 들어간 작은 표식(span)을 그린다.
 * [왜 이렇게 하나] 색상/라벨 표시 로직을 한 곳에 모아두면, 목록 어디서든 재사용하고
 *   디자인을 한 번에 바꿀 수 있다(중복 제거).
 *
 * @param category 카테고리 키(general/important/schedule 등) — 부모가 props로 넘겨준다.
 * @returns 카테고리 색상과 한글 라벨이 적용된 span 요소
 * 부수효과: 없음(받은 값만 화면에 그리는 "순수" 표시 컴포넌트).
 *
 * 참고: `({ category }: { category: string })`는 props 객체에서 category 값만 꺼내 쓰는
 *   "구조 분해 할당(destructuring)" 문법이다. props.category와 같은 뜻.
 */
export const CategoryBadge = ({ category }: { category: string }): ReactElement => {
  // 알 수 없는 카테고리는 general 색상으로 폴백하여 항상 유효한 색을 보장.
  // `||`(OR)는 왼쪽 값이 없거나(undefined) 거짓이면 오른쪽 값을 쓴다.
  // 즉 CATEGORY_COLOR[category]가 없으면 CATEGORY_COLOR.general을 c에 담는다.
  const c = CATEGORY_COLOR[category] || CATEGORY_COLOR.general;
  return (
    // style={{ ... }}: JSX에서 인라인 스타일은 "객체"로 준다(바깥 {}는 JS 표현식, 안쪽 {}는 객체).
    //   CSS의 background-color 같은 하이픈 이름은 카멜케이스(backgroundColor)로 쓴다.
    <span style={{
      fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', // borderRadius 999px = 완전한 알약 모양
      background: c.bg, color: c.fg, whiteSpace: 'nowrap', // whiteSpace nowrap = 라벨이 줄바꿈되지 않게
    }}>{CATEGORY_LABEL[category] || category}</span>
    // ↑ 라벨도 매핑에 없으면 원래 키(category)를 그대로 보여줘서 "빈 배지"가 생기는 걸 막는다.
  );
};

/**
 * Announcements — 공지사항 목록 페이지(기본 export).
 *
 * [무엇을 하나] 검색창 + 카테고리 필터 + 공지 목록(아코디언) 전체 화면을 구성한다.
 * [왜 이렇게 하나] 페이지 단위로 한 컴포넌트가 "데이터 불러오기 → 가공 → 화면 그리기"를
 *   모두 담당하게 해서, 라우터에서 이 컴포넌트 하나만 연결하면 페이지가 완성되도록 한다.
 *
 * @returns 공지 목록 + 검색/필터 UI를 렌더링하는 React 요소
 * 부수효과: 마운트 시 Supabase에서 공지 목록을 비동기 조회하여 상태에 저장.
 */
const Announcements = (): ReactElement => {
  // [상태 선언] useState(초깃값)는 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려준다.
  //   setXxx를 호출하면 React가 화면을 자동으로 다시 그린다(re-render).
  //   주의: items = 0 처럼 변수에 직접 대입하면 화면이 안 바뀐다. 반드시 setItems(...)를 써야 한다.
  const [items, setItems] = useState<Announcement[]>([]); // 조회된 전체 공지 목록(초기엔 빈 배열)
  const [loading, setLoading] = useState(true);           // 초기 로딩 스피너 표시 여부(처음엔 true=로딩중)
  const [query, setQuery] = useState('');                 // 검색어(제목·내용 대상, 초기엔 빈 문자열)
  const [category, setCategory] = useState('all');        // 선택된 카테고리 필터 키(초기엔 '전체')
  const [openId, setOpenId] = useState<string | null>(null); // 현재 펼쳐진 공지 id(아코디언, 단일 오픈) / null=모두 접힘

  // [useEffect] 화면이 처음 떴을 때(마운트) 데이터를 한 번 불러오는 부수효과.
  //   useEffect(실행할함수, 의존성배열) 형태다. 의존성 배열이 []이면 "처음 한 번만" 실행된다.
  //   주의: 의존성 배열을 아예 빼면 매 렌더마다 실행되어 무한 호출이 날 수 있으니 []를 꼭 둔다.
  useEffect(() => {
    // async 함수를 따로 만든 이유: useEffect의 콜백 자체는 async로 만들면 안 되기 때문에
    //   내부에 async load 함수를 정의하고 아래에서 호출한다.
    const load = async () => {
      const client = getSupabase(); // Supabase 연결 객체를 가져온다(환경설정 안 됐으면 null일 수 있음).
      // Supabase 미설정(환경변수 부재 등)이면 클라이언트가 null → 조회 생략하고 로딩만 종료.
      //   이런 "방어 코드"가 없으면 null.from(...) 호출에서 에러로 화면이 깨진다.
      if (!client) { setLoading(false); return; }
      // [비동기 조회] await는 "이 작업(서버 응답)이 끝날 때까지 기다린다"는 뜻.
      //   .from(TABLE)        : 어떤 테이블을 볼지 지정
      //   .select('*')        : 모든 컬럼(열)을 가져온다
      //   .order(...)         : 정렬 기준. 여러 번 쓰면 위에서부터 1순위, 2순위가 된다.
      //   고정 공지(is_pinned=true)를 먼저(ascending:false → true가 위), 그 안에서 최신 작성순으로 정렬.
      const { data } = await client
        .from(TABLE)
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      // 결과에서 data만 꺼내 쓴다. 데이터가 있으면 상태에 저장한다.
      // `data as Announcement[]`는 "이 값을 Announcement 배열 타입으로 간주하라"는 타입 단언이다.
      if (data) setItems(data as Announcement[]); // RLS 정책상 데이터가 없으면 빈 목록 유지
      setLoading(false); // 성공이든 실패든 로딩 표시는 반드시 끈다(안 끄면 영원히 스피너만 돈다).
    };
    load(); // 위에서 정의한 async 함수를 실제로 호출. 호출 결과(Promise)는 여기선 기다리지 않는다.
  }, []); // [] = "처음 한 번만" 실행(마운트 시점).

  // [useMemo] 비싼 계산을 매 렌더마다 다시 하지 않도록 결과를 기억한다.
  //   검색어/카테고리/원본목록이 바뀔 때만 다시 필터링한다(의존성 배열에 그 값들을 적었기 때문).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(); // 검색어 정규화: trim=앞뒤 공백 제거, toLowerCase=소문자화(대소문자 구분 없이 비교하려고)
    // .filter(조건함수): 조건이 true인 항목만 모아 새 배열을 만든다(원본 items는 그대로 둠 = 불변성 유지).
    return items.filter((a) => {
      // 'all'이 아니면서 카테고리가 다르면 제외(false를 반환하면 그 항목은 빠진다).
      if (category !== 'all' && a.category !== category) return false;
      // 검색어가 있으면 제목+내용 합친 문자열에 포함되는지 대소문자 무시 검사.
      //   `${a.title} ${a.content}`로 제목과 내용을 한 문자열로 합친 뒤 includes(q)로 포함 여부 확인.
      if (q && !`${a.title} ${a.content}`.toLowerCase().includes(q)) return false;
      return true; // 위 조건들을 모두 통과하면 남긴다.
    });
  }, [items, query, category]); // 이 셋 중 하나라도 바뀌면 재계산.

  // [useMemo] 카테고리별 공지 개수 집계. 필터 버튼에 (n) 형태로 표시하는 데 사용.
  //   items가 바뀔 때만 다시 센다.
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: items.length }; // 'all'은 전체 개수로 초기화
    // for...of로 공지를 하나씩 돌며 해당 카테고리 개수를 1씩 누적.
    //   (m[a.category] || 0)는 아직 그 키가 없으면 0부터 시작하라는 의미.
    for (const a of items) m[a.category] = (m[a.category] || 0) + 1; // 각 카테고리 누적
    return m; // 예: { all: 5, general: 3, important: 1, schedule: 1 }
  }, [items]);

  // [화면 그리기] 아래 JSX가 실제로 사용자에게 보이는 부분이다.
  //   <>...</>는 "Fragment"로, 여러 요소를 불필요한 div 없이 묶어주는 빈 껍데기 태그다.
  return (
    <>
      {/* 공지 페이지는 검색엔진 비노출(noindex) 처리 — noindex는 구글 등에 색인되지 말라는 표시 */}
      <SEOHead title="공지사항" path="/announcements" noindex />
      <section className="page-header">
        <div className="container">
          <h2>공지사항</h2>
          <p>AI Reboot Academy 전체 공지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 검색 + 카테고리 필터 영역(flex로 가로 배치, 화면 좁으면 줄바꿈) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
            {/* 검색 입력 영역(돋보기 아이콘 + 텍스트 입력) */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                value={query} // 입력칸이 보여줄 값을 상태(query)에 묶는다 = "제어 컴포넌트"(값의 단일 출처가 React 상태).
                // 사용자가 글자를 칠 때마다 onChange가 불리고, 입력값(e.target.value)을 검색 상태로 즉시 반영.
                // 주의: value와 onChange는 짝이다. value만 주고 onChange가 없으면 타이핑이 막힌다.
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목·내용 검색"
                style={{
                  width: '100%', padding: '10px 14px 10px 36px', fontSize: '14px', // 왼쪽 padding 36px = 돋보기 아이콘 자리 확보
                  border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '10px',
                  background: 'var(--bg-white, #fff)', color: 'var(--text-primary)', boxSizing: 'border-box',
                }}
              />
            </div>
            {/* 카테고리 필터 버튼 묶음 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {/* .map()으로 CATEGORY_FILTERS 배열을 돌며 버튼을 하나씩 자동 생성한다. */}
              {CATEGORY_FILTERS.map((c) => {
                const on = category === c.key; // 현재 선택된 필터인지 여부(활성 스타일 결정)
                return (
                  <button
                    key={c.key} // 주의: 반복 생성한 요소엔 고유 key가 필요하다(React가 항목을 구분하는 식별자).
                    type="button" // 폼 안의 button 기본 동작(submit)을 막기 위해 명시.
                    onClick={() => setCategory(c.key)} // 클릭하면 그 카테고리를 선택 상태로 바꾼다 → 목록이 다시 걸러짐.
                    style={{
                      padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                      borderRadius: '999px', border: '1px solid',
                      // 활성 버튼은 파란 배경, 비활성은 흰 배경으로 시각 구분(삼항연산자 조건 ? 참값 : 거짓값).
                      borderColor: on ? 'var(--primary-blue, #0046C8)' : 'var(--border-light, #e5e7eb)',
                      background: on ? 'var(--primary-blue, #0046C8)' : 'var(--bg-white, #fff)',
                      color: on ? '#fff' : 'var(--text-secondary, #6b7280)',
                    }}
                  >
                    {/* 라벨 옆에 개수 표시. 집계가 없으면(0이거나 undefined) (0)으로 표기 */}
                    {c.label} {counts[c.key] ? `(${counts[c.key]})` : '(0)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* [3분기 조건부 렌더링] 삼항연산자를 중첩해 상황별로 다른 화면을 보여준다.
              로딩 중 → 스피너 / 결과 있음 → 목록 / 결과 없음 → 빈 메시지 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length > 0 ? (
            <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', overflow: 'hidden' }}>
              {/* 걸러진 목록을 .map으로 돌며 공지 행을 그린다. idx는 0부터 시작하는 순번. */}
              {filtered.map((a, idx) => {
                const open = openId === a.id; // 이 행이 현재 펼쳐진 상태인지(열린 id와 같은지 비교)
                return (
                  // 첫 행(idx===0)만 위쪽 테두리를 빼서 카드 모서리와 겹치지 않게 한다.
                  <div key={a.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border-light, #f1f3f5)' }}>
                    {/* 공지 제목 행(클릭 시 아코디언 토글) */}
                    <button
                      type="button"
                      // 토글: 이미 열려 있으면(open) 닫고(null), 닫혀 있으면 이 공지 id를 연다.
                      //   openId에 하나의 id만 담기므로 "한 번에 하나만 펼쳐지는" 아코디언이 된다.
                      onClick={() => setOpenId(open ? null : a.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px',
                        background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent', // 고정 공지는 옅은 배경
                        border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit',
                      }}
                    >
                      {/* 좌측 번호 영역: 고정 공지는 압정 아이콘, 일반은 순번(idx+1, 1부터) 표시 */}
                      <span style={{ width: '36px', textAlign: 'center', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px' }}>
                        {a.is_pinned ? '📌' : idx + 1}
                      </span>
                      <CategoryBadge category={a.category} />{/* 위에서 정의한 배지 컴포넌트 재사용 */}
                      {/* 제목: 길면 말줄임(...) 처리, 고정 공지는 굵게 강조 */}
                      {/* minWidth:0 + overflow:hidden + textOverflow:ellipsis + whiteSpace:nowrap = 한 줄 말줄임 표준 조합 */}
                      <span style={{ flex: 1, fontWeight: a.is_pinned ? 700 : 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.title}
                      </span>
                      {/* 작성일(한국 로케일 날짜만) — created_at 문자열을 Date 객체로 바꿔 한국식 날짜로 표시 */}
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary, #9ca3af)', whiteSpace: 'nowrap' }}>
                        {new Date(a.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      {/* 펼침 화살표: 열려 있으면 180도 회전 애니메이션(transition으로 부드럽게) */}
                      <span style={{
                        color: 'var(--text-secondary, #9ca3af)', fontSize: '12px', flexShrink: 0,
                        transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                      }}>▼</span>
                    </button>
                    {/* [조건부 렌더링] open && (...) : open이 true일 때만 뒤의 JSX를 그린다.
                        false면 아무것도 안 그려지므로, 닫힌 공지의 상세 영역은 아예 화면에 없다. */}
                    {open && (
                      <div style={{
                        padding: '4px 18px 22px 66px', background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent', // 왼쪽 padding 66px = 제목 글자 위치에 맞춰 들여쓰기
                      }}>
                        {/* 메타 정보: 작성자(있을 때만) + 작성 일시(날짜+시각) */}
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)', marginBottom: '10px' }}>
                          {/* author_name && (...) : 작성자 이름이 있을 때만 그 부분을 보여준다(없으면 생략). */}
                          {a.author_name && <span>작성자 {a.author_name} · </span>}
                          {new Date(a.created_at).toLocaleString('ko-KR')}{/* toLocaleString은 날짜+시각을 함께 표시 */}
                        </div>
                        {/* 본문: 줄바꿈/공백 보존(pre-wrap), 긴 단어 줄바꿈 허용(break-word) */}
                        {/* whiteSpace:pre-wrap을 줘야 글쓴이가 입력한 엔터/들여쓰기가 그대로 보인다. */}
                        <div style={{ fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {a.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // 데이터 자체가 없으면 "등록된 공지 없음", 필터로 걸러져 비면 "검색 결과 없음"으로 구분 안내.
            //   items.length로 두 경우를 구분: 원본이 0건이면 진짜 공지가 없는 것, 아니면 필터 결과만 0건.
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>
              {items.length === 0 ? '등록된 공지사항이 없습니다.' : '검색 결과가 없습니다.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

// 이 파일의 "대표(default) export". 다른 곳에서 import Announcements from '...'로 가져다 쓴다.
export default Announcements;
