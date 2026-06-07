/**
 * AdminStudents.tsx
 * ------------------------------------------------------------------
 * [이 파일은 무엇인가?]
 *   관리자(admin) 화면의 "수강생 관리" 페이지를 그리는 React 컴포넌트입니다.
 *   Supabase(클라우드 데이터베이스 + 인증 서비스)의 user_profiles 테이블에서
 *   회원 목록을 읽어와, 본 사이트(rest.dreamitbiz.com) 기준으로
 *   "가입자" 또는 "방문자"를 골라 표(table) 형태로 보여줍니다.
 *
 * [초보자가 알아야 할 배경 용어 — 쉬운 말로]
 *   - 컴포넌트(component): 화면의 한 조각을 만들어내는 "함수". 이 함수가
 *     JSX(아래 설명)를 반환하면 React가 그걸 실제 화면으로 그려줍니다.
 *   - JSX: 자바스크립트 안에 HTML처럼 생긴 문법을 섞어 쓰는 React의 표기법.
 *     예) <div>안녕</div> 처럼 보이지만 사실은 자바스크립트입니다.
 *   - 상태(state): 컴포넌트가 "기억"하는 값. 상태가 바뀌면 React가 화면을
 *     자동으로 다시 그립니다(re-render). useState 훅으로 만듭니다.
 *   - 훅(hook): use로 시작하는 React 전용 함수(useState, useEffect, useMemo 등).
 *     컴포넌트에 "상태"나 "부수효과" 같은 기능을 끼워 넣는 도구입니다.
 *   - Supabase: 회원 가입/로그인(인증)과 데이터 저장(데이터베이스)을 해주는
 *     백엔드 서비스. 프론트엔드(이 코드)에서 client 객체로 호출합니다.
 *   - RLS(Row Level Security): Supabase(PostgreSQL)에서 "어떤 사용자가 어떤
 *     행(row)을 볼 수 있는지" 데이터베이스가 직접 통제하는 보안 규칙.
 *     관리자 권한이 없으면 user_profiles 조회가 빈 결과로 돌아올 수 있습니다.
 *
 * [핵심 책임]
 *   - scope(가입자/방문자)에 따라 Supabase 쿼리 조건을 분기해 데이터 로딩
 *   - groupByPerson 유틸로 동일인(전화/이름 기준)을 통합해 한 명으로 표시
 *   - 키워드(이름·이메일·전화)로 클라이언트(브라우저) 측 필터링
 *   - 로딩 / 결과 없음 / 결과 테이블 상태를 각각 다르게 화면에 표시
 *
 * [주요 export]
 *   - default export: AdminStudents (React 함수형 컴포넌트)
 */

// React 훅과 타입을 가져옵니다.
//  - useState: 상태(state)를 만드는 훅
//  - useEffect: "부수효과"(데이터 불러오기 등 화면 그리기 외의 작업)를 처리하는 훅
//  - useMemo: 계산 결과를 캐시(기억)해 불필요한 재계산을 막는 훅
//  - type ReactElement: 컴포넌트가 반환하는 "React 화면 요소"의 타입(TS 전용)
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar'; // 좌측 관리자 메뉴 컴포넌트
import SEOHead from '../../components/SEOHead';           // <head> 안의 title/meta를 다루는 컴포넌트
import getSupabase from '../../utils/supabase';           // Supabase 클라이언트를 만들어주는 함수
import site from '../../config/site';                     // 사이트 설정(url 등)이 담긴 객체
import { groupByPerson } from '../../utils/people';       // 동일인 통합 유틸 함수
import type { UserProfile } from '../../types';           // 회원 한 명(계정)의 데이터 모양(타입)

// 본 사이트의 호스트네임을 site.url에서 추출합니다(예: 'rest.dreamitbiz.com').
//  - new URL(...)은 문자열 주소를 분석해 hostname/path 등으로 쪼개주는 내장 기능입니다.
//  - 이 값을 signup_domain / visited_sites 비교의 "기준값"으로 씁니다.
//  - 참고: 컴포넌트 바깥(파일 최상단)에 두었기 때문에 화면을 다시 그려도
//    매번 다시 계산하지 않고, 앱이 실행되는 동안 한 번만 계산됩니다.
const REST_HOSTNAME = new URL(site.url).hostname; // 'rest.dreamitbiz.com'

// 조회 범위를 나타내는 타입(둘 중 하나만 가능):
//  'signup'  = 본 사이트에서 "가입"한 회원
//  'visited' = 본 사이트에 "방문"한 적이 있는 회원
//  (TS의 "유니온 타입": 정해진 문자열 값만 허용해 오타·잘못된 값을 막아줍니다.)
type Scope = 'signup' | 'visited';

/**
 * AdminStudents
 * 수강생 관리 페이지 전체를 그려서 반환하는 함수형 컴포넌트.
 *
 * 매개변수: 없음 (props를 받지 않습니다)
 * 반환값: ReactElement — 이 페이지의 전체 화면(UI)
 * 부수효과:
 *   - useEffect 안에서 Supabase를 비동기로 조회해 students 상태를 채웁니다.
 *     (네트워크 요청은 "부수효과"라서 렌더링 함수 본문이 아니라 useEffect에 둡니다.)
 */
const AdminStudents = (): ReactElement => {
  // [상태 선언]
  // useState(초기값)은 [현재값, 값을바꾸는함수] 형태의 배열을 돌려줍니다.
  // 아래는 그 배열을 구조분해(destructuring)로 두 변수에 한 번에 담는 표현입니다.

  // 조회된 "원본 계정" 목록(동일인 통합 전, 즉 계정 1개 = 항목 1개).
  // <UserProfile[]>는 "UserProfile 객체들의 배열"이라는 타입 표시입니다.
  const [students, setStudents] = useState<UserProfile[]>([]);
  // 데이터를 불러오는 중인지 여부. true면 스피너(빙글빙글)를 보여줍니다.
  const [loading, setLoading] = useState(true);
  // 현재 조회 범위(가입자 / 방문자). 초기값은 'signup'(가입자).
  const [scope, setScope] = useState<Scope>('signup');
  // 검색창에 입력된 키워드(이름·이메일·전화). 초기값은 빈 문자열.
  const [keyword, setKeyword] = useState('');

  // [부수효과: 데이터 불러오기]
  // useEffect(실행할함수, [의존성배열])
  //  - 컴포넌트가 처음 화면에 나타날 때 한 번 실행되고,
  //  - 이후에는 의존성 배열(여기선 [scope]) 안의 값이 바뀔 때마다 다시 실행됩니다.
  //  - 즉, 사용자가 "가입자 ↔ 방문자" 버튼을 눌러 scope가 바뀌면 재조회합니다.
  useEffect(() => {
    // async 함수를 따로 정의하는 이유:
    //  useEffect의 콜백 자체는 async로 만들 수 없습니다(반환값 규약이 다름).
    //  그래서 내부에 async 함수 load를 정의하고 아래에서 호출합니다.
    const load = async () => {
      setLoading(true); // 조회 시작 → 스피너 켜기
      const client = getSupabase(); // Supabase 클라이언트 가져오기
      // 방어 코드: 환경설정(키 등) 누락으로 client가 없으면(null)
      // 더 진행하지 말고 스피너만 끄고 함수를 빠져나갑니다.
      // 주의: 이 early return이 없으면 아래에서 null.from(...) 호출로 에러가 납니다.
      if (!client) { setLoading(false); return; }

      // [기본 쿼리 만들기]
      // user_profiles 테이블에서 모든 컬럼('*')을 가져오되,
      // last_sign_in_at(최근 접속 시각)을 기준으로 내림차순(최신순) 정렬합니다.
      //  - 메서드 체이닝: .from().select().order() 처럼 점(.)으로 연달아 호출합니다.
      const query = client
        .from('user_profiles')
        .select('*')
        .order('last_sign_in_at', { ascending: false });

      // [조회 범위에 따른 조건 추가]
      if (scope === 'signup') {
        // 가입자 모드: signup_domain 컬럼 값이 본 사이트 호스트네임과
        // "정확히 일치(eq = equals)"하는 행만 남깁니다.
        query.eq('signup_domain', REST_HOSTNAME);
      } else {
        // 방문자 모드: visited_sites(배열 컬럼) 안에 본 사이트 호스트네임이
        // "포함(contains)"된 행만 남깁니다.
        //  - 주의: 두 번째 인자가 배열([REST_HOSTNAME])인 이유는, 배열 컬럼에
        //    대한 "포함" 비교라 비교 대상도 배열 형태로 넘겨야 하기 때문입니다.
        query.contains('visited_sites', [REST_HOSTNAME]);
      }

      // [실제 요청 보내기]
      // await: 비동기 작업(네트워크 요청)이 끝날 때까지 기다린 뒤 결과를 받습니다.
      // 결과 객체에서 data만 꺼내 씁니다(구조분해). (에러는 error에 담기지만 여기선 미사용)
      const { data } = await query;
      // data가 존재할 때만 상태를 갱신합니다.
      //  - 조회 실패/권한 부족(RLS) 등으로 data가 null이면 기존 목록을 그대로 둡니다.
      //  - as UserProfile[]: TS에게 "이 data를 UserProfile 배열로 취급해라"라고
      //    알려주는 "타입 단언". 실제 모양이 다르면 런타임에 문제가 될 수 있으니 주의.
      if (data) setStudents(data as UserProfile[]);
      setLoading(false); // 조회 끝 → 스피너 끄기
    };
    load(); // 위에서 정의한 async 함수를 실제로 실행
    // 주의(비동기 경쟁): scope를 아주 빠르게 연달아 바꾸면, 먼저 보낸 요청이
    // 나중에 도착해 화면과 안 맞을 수 있습니다(레이스 컨디션). 이 코드에는
    // 그걸 막는 취소 처리가 없으니, 데이터가 꼬이면 이 부분을 의심해 보세요.
  }, [scope]); // ← 의존성 배열: scope가 바뀔 때만 이 효과를 다시 실행

  // [동일인 통합]
  // groupByPerson: 전화/이름 등을 기준으로 같은 사람의 여러 계정을 하나로 묶는 유틸.
  //  - 한 사람이 이메일 2개로 가입했어도 화면엔 "한 명"으로 표시됩니다.
  // useMemo(계산함수, [의존성]): 의존성(여기선 students)이 바뀔 때만 다시 계산하고,
  //  안 바뀌면 이전 결과를 재사용합니다 → 불필요한 무거운 계산을 줄여 성능을 지킵니다.
  const people = useMemo(() => groupByPerson(students), [students]);

  // [키워드 필터링]
  // people 또는 keyword가 바뀔 때만 다시 계산합니다(useMemo).
  const filtered = useMemo(() => {
    // 키워드가 비었거나 공백뿐이면(.trim()으로 양끝 공백 제거) 전체를 그대로 반환.
    if (!keyword.trim()) return people;
    // 대소문자를 구분하지 않고 비교하려고 키워드를 소문자로 바꿔 둡니다.
    const k = keyword.trim().toLowerCase();
    // filter: 조건을 만족하는 항목만 골라 새 배열을 만듭니다(원본은 그대로 — 불변성 유지).
    return people.filter(g =>
      // (1) 그 사람의 이메일들 중 하나라도 키워드 k를 포함하면 통과.
      //     some: "하나라도 만족하면 true". includes: 부분 문자열 포함 검사.
      g.emails.some(e => e.toLowerCase().includes(k)) ||
      // (2) 통합된 계정들 중 하나라도 display_name 또는 name에 키워드를 포함하면 통과.
      g.accounts.some(a =>
        // (a.display_name || '') : display_name이 없을(null/undefined) 때 빈 문자열로 대체.
        //   → .toLowerCase() 호출 중 에러가 나지 않도록 안전하게 처리하는 흔한 패턴입니다.
        (a.display_name || '').toLowerCase().includes(k) ||
        (a.name || '').toLowerCase().includes(k)
      ) ||
      // (3) 전화번호에 키워드가 포함되면 통과(숫자라 소문자 변환은 불필요).
      (g.phone || '').includes(k)
    );
  }, [people, keyword]); // ← people 또는 keyword가 바뀔 때만 재계산

  // [화면 그리기] 여기서부터가 JSX(반환하는 UI)입니다.
  return (
    // <>...</>는 "Fragment": 의미 없는 div로 감싸지 않고 여러 요소를 묶는 빈 껍데기.
    <>
      {/* SEOHead: 이 페이지의 <title>과 메타 정보를 설정.
          noindex → 검색엔진이 이 관리자 페이지를 색인하지 않도록(노출 금지) 지시. */}
      <SEOHead title="수강생 관리" path="/admin/students" noindex />
      <div className="admin-layout">
        {/* 좌측 관리자 사이드바(메뉴) */}
        <AdminSidebar />
        <div className="admin-content">
          {/* 상단 헤더: 제목/설명(왼쪽) + 인원 통계(오른쪽) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>수강생 관리</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                {/* {조건 ? A : B} 는 "삼항 연산자": 조건이 참이면 A, 거짓이면 B를 표시.
                    현재 scope에 따라 안내 문구가 '가입한' / '접속한' 으로 바뀝니다. */}
                <strong>rest.dreamitbiz.com</strong>{scope === 'signup' ? '에서 가입한 회원' : '에 접속한 회원'}만 표시됩니다.
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              {/* 필터링된 인원수. 검색 중(keyword가 있을)이면 전체 인원수도 함께 표시.
                  {keyword && `...`} 는 "단축 평가": keyword가 빈 문자열(거짓)이면
                  오른쪽을 그리지 않고, 값이 있으면(참) 오른쪽 문자열을 표시합니다. */}
              총 {filtered.length}명{keyword && ` (전체 ${people.length}명 중)`}
              {/* 통합된 사람 수(people.length)와 원본 계정 수(students.length)가 다르면
                  = 동일인 통합이 실제로 일어났다는 뜻 → 계정 개수를 따로 표기. */}
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>

          {/* 필터 컨트롤 영역(범위 토글 + 검색창) */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'var(--bg-secondary, #f8f9fa)',
            borderRadius: '8px',
          }}>
            {/* 범위 토글 버튼 그룹(가입자 / 방문자) */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                // 클릭하면 scope를 'signup'으로 바꿈 → useEffect가 다시 돌아 재조회.
                onClick={() => setScope('signup')}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  // 현재 선택된 범위면 강조색(파랑) 배경, 아니면 투명.
                  background: scope === 'signup' ? 'var(--primary-blue, #0046C8)' : 'transparent',
                  color: scope === 'signup' ? '#fff' : 'var(--text-primary, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >본 사이트 가입자</button>
              <button
                type="button"
                // 클릭하면 scope를 'visited'로 바꿈 → 방문자 기준으로 재조회.
                onClick={() => setScope('visited')}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  // 현재 선택된 범위면 강조색 배경, 아니면 투명.
                  background: scope === 'visited' ? 'var(--primary-blue, #0046C8)' : 'transparent',
                  color: scope === 'visited' ? '#fff' : 'var(--text-primary, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >본 사이트 방문자</button>
            </div>
            {/* 검색 입력창.
                value={keyword} + onChange 로 keyword 상태와 입력값을 묶는 방식을
                "제어 컴포넌트(controlled component)"라고 합니다 → 입력 즉시 keyword가
                갱신되고, 그에 따라 filtered가 다시 계산되어 결과가 실시간으로 좁혀집니다.
                e.target.value 는 사용자가 방금 입력한 현재 글자입니다. */}
            <input
              type="search"
              placeholder="이름·이메일·전화 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '6px',
                background: 'var(--bg-card, #fff)',
                color: 'var(--text-primary, #1a1a1a)',
              }}
            />
          </div>

          {/* [상태별 화면 분기 — 삼항 연산자 2단 중첩]
              loading 이면        → 스피너
              아니고 결과 0건이면 → 빈 상태 안내
              그 외(결과 있음)    → 테이블 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary, #f8f9fa)',
              borderRadius: '12px',
              color: 'var(--text-secondary, #6b7280)',
            }}>
              {/* 검색 중이면 "검색 결과 없음", 그렇지 않으면 scope별로 다른 빈 상태 안내. */}
              {keyword
                ? '검색 결과가 없습니다.'
                : scope === 'signup'
                  ? '본 사이트에서 가입한 회원이 아직 없습니다.'
                  : '본 사이트에 방문한 회원이 아직 없습니다.'}
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr><th>이름</th><th>이메일</th><th>전화번호</th><th>가입방식</th><th>가입처</th><th>역할</th><th>최근접속</th></tr>
                </thead>
                <tbody>
                  {/* filtered 배열을 .map(...)으로 한 항목씩 <tr>(표의 한 줄)로 변환합니다.
                      배열 → JSX 목록을 만드는 가장 흔한 패턴입니다.
                      g는 "통합된 한 사람"의 데이터 묶음입니다. */}
                  {filtered.map(g => {
                    // 대표 계정(primary): 여러 계정 중 화면 표시 기준으로 삼을 한 계정.
                    // (이름/역할/가입처/최근접속 등은 이 대표 계정 값을 씁니다.)
                    const s = g.primary;
                    return (
                      // key: React가 목록의 각 항목을 구분하는 고유 식별자.
                      // 주의: key가 없거나 중복되면 화면이 잘못 갱신될 수 있습니다.
                      // 여기선 g.key(사람마다 고유한 값)를 사용합니다.
                      <tr key={g.key}>
                        <td>
                          {g.name}
                          {/* 한 사람의 계정이 2개 이상으로 통합됐다면(isMerged=true) 배지 표시.
                              title 속성은 마우스를 올리면 뜨는 설명 툴팁입니다. */}
                          {g.isMerged && (
                            <span title={`동일 전화번호 ${g.phone}로 ${g.accounts.length}개 계정`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 7px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}계정</span>
                          )}
                        </td>
                        <td>
                          {/* 통합된 모든 이메일을 한 줄씩 표시.
                              i는 인덱스(0부터). 첫 이메일(i===0)은 기본 스타일,
                              그 외(i>0)는 작은 글씨/보조색으로 흐리게 표시합니다.
                              여기서 key는 이메일 문자열(e) 자체를 고유값으로 씁니다. */}
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '13px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        {/* 전화번호가 없으면(빈 값) '-'를 대신 표시(|| 단축 평가). */}
                        <td>{g.phone || '-'}</td>
                        {/* 가입방식(provider) 표시:
                            1) g.accounts에서 provider만 뽑고(map),
                            2) filter(Boolean)으로 빈 값(null/'' 등)을 제거,
                            3) new Set(...)으로 중복을 없앤 뒤,
                            4) Array.from(...)으로 다시 배열로 만들고,
                            5) .join(', ')으로 콤마로 이어 붙임.
                            결과가 빈 문자열이면 '-'를 표시. */}
                        <td>{Array.from(new Set(g.accounts.map(a => a.provider).filter(Boolean))).join(', ') || '-'}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                          {/* 가입처(가입한 도메인). 없으면 '-'. */}
                          {s.signup_domain || '-'}
                        </td>
                        {/* 역할(role) 배지. className에 역할명을 넣어 CSS로 색을 다르게 줍니다.
                            예) role-badge admin / role-badge user
                            주의: 백틱(`...`) 문자열 안에는 주석을 넣으면 출력이 깨지므로 넣지 않습니다. */}
                        <td><span className={`role-badge ${s.role}`}>{s.role}</span></td>
                        {/* 최근 접속일 표시.
                            값이 있으면 new Date(...)로 날짜 객체를 만들고
                            toLocaleDateString('ko-KR')로 한국식 날짜 문자열로 바꿔 표시,
                            값이 없으면 '-' 표시. */}
                        <td>{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 이 컴포넌트를 다른 파일에서 가져다 쓸 수 있도록 기본(default) 내보내기.
export default AdminStudents;
