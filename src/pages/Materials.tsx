/**
 * Materials.tsx — 학습자료(Materials) 페이지 컴포넌트
 *
 * [이 파일이 무엇인가요? — 초보자용 큰 그림]
 *  이 파일 하나가 화면의 "학습자료" 페이지 전체를 만듭니다.
 *  React에서는 "컴포넌트(Component)"라는 함수가 화면 조각을 그립니다.
 *  이 함수가 HTML처럼 생긴 JSX를 return 하면, React가 그걸 실제 웹 화면으로 바꿔 보여줍니다.
 *
 * 역할/책임:
 *  - Supabase의 materials 테이블에서 강의 학습자료 목록을 조회하여 카드 형태로 렌더링한다.
 *    (Supabase = 클라우드 데이터베이스 + 백엔드 서비스. 우리 앱은 여기서 자료 목록을 가져옵니다.)
 *  - 카테고리(선수과정/AI기본/LLM실습 등) 필터 버튼을 제공하여 자료를 분류·표시한다.
 *  - 각 자료의 파일 타입에 따라 아이콘을 보여주고, 파일 크기를 사람이 읽기 쉬운 단위로 변환한다.
 *  - file_url이 존재하는 자료에 대해 새 탭으로 열리는 다운로드 링크를 노출한다.
 *
 * [꼭 알아둘 용어]
 *  - JSX: 자바스크립트 안에서 HTML처럼 화면 구조를 쓰는 문법. <h2>학습자료</h2> 같은 형태.
 *  - 상태(State): 화면이 기억해야 하는 "변하는 값"(예: 로딩 중인지, 어떤 필터를 골랐는지).
 *                상태가 바뀌면 React가 화면을 자동으로 다시 그립니다(리렌더).
 *  - 비동기(async/await): 서버에서 데이터를 받아오는 작업은 시간이 걸립니다.
 *                         await는 "그 작업이 끝날 때까지 기다린다"는 뜻입니다.
 *
 * 주요 export:
 *  - default: Materials (페이지 컴포넌트)
 */

// [import] 다른 파일에서 만들어 둔 기능을 가져옵니다.
// - useState: 컴포넌트에 "기억(상태)"을 만들어 주는 React 훅(Hook).
// - useEffect: 화면이 처음 뜨거나 값이 바뀔 때 "어떤 동작"을 실행하게 해주는 훅.
// - type ReactElement: 컴포넌트가 반환하는 "화면 요소"의 타입(TypeScript 타입 표기).
//   (참고: 훅 = use로 시작하는 특수 함수. 반드시 컴포넌트 함수의 최상단에서만 호출해야 함)
import { useState, useEffect, type ReactElement } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
import { useAuth } from '../contexts/AuthContext';   // 로그인/인증 상태를 다루는 우리 앱의 컨텍스트 훅
import SEOHead from '../components/SEOHead';          // 페이지 제목/검색엔진 메타 정보를 넣어주는 컴포넌트
import getSupabase from '../utils/supabase';          // Supabase 클라이언트(서버 접속 객체)를 만들어 주는 함수
import site from '../config/site';                    // 사이트 설정값(DB 접두사 등)
import type { Material } from '../types';             // 학습자료 1건의 데이터 형태를 정의한 타입

// 사이트별 DB 접두사(dbPrefix)를 붙여 실제 Supabase 테이블명을 구성한다.
// (여러 사이트가 동일 DB를 공유할 때 테이블 충돌을 방지하기 위한 네이밍 규칙)
// 예: dbPrefix가 "rest_"라면 실제 테이블명은 "rest_materials"가 됩니다.
// 주의: 백틱(``)은 문자열 안에 ${변수}를 끼워 넣는 "템플릿 리터럴" 문법입니다.
const TABLES = { materials: `${site.dbPrefix}materials` };

// 카테고리 키 -> 화면 표시용 한글 라벨 매핑 테이블.
// 필터 버튼 렌더링과 카드 메타 정보의 카테고리 표기에 함께 사용된다.
// Record<string, string> = "문자열 키와 문자열 값으로 이뤄진 객체"라는 TypeScript 타입.
// (DB에는 'prerequisite' 같은 영어 키가 저장되고, 화면에는 '선수과정'처럼 한글로 보여주기 위함)
const categoryLabels: Record<string, string> = {
  all: '전체', prerequisite: '선수과정', ai_basic: 'AI기본', llm_practice: 'LLM실습',
  automation: '자동화', planning: '기획', design: '설계', implementation: '구현',
  debugging: '디버깅', coaching: '코칭',
};

// 학습자료 페이지 컴포넌트 본체.
// (): ReactElement 는 "이 함수는 인자를 받지 않고, 화면 요소를 반환한다"는 의미.
const Materials = (): ReactElement => {
  // 인증 컨텍스트 초기화/유지를 위해 호출(반환값은 사용하지 않음).
  // RLS가 적용된 테이블 접근 시 로그인 세션이 필요하므로 페이지 진입 시 컨텍스트를 활성화한다.
  // (RLS = Row Level Security. Supabase에서 "로그인한 사용자만 데이터를 볼 수 있게" 막는 보안 규칙)
  useAuth();

  // ----- 이 페이지가 기억하는 상태(State) 3가지 -----
  // useState는 [현재값, 값을바꾸는함수] 쌍을 돌려줍니다. setXxx를 호출해야만 화면이 다시 그려집니다.

  // materials: 서버에서 조회한 전체 학습자료 목록. 처음엔 빈 배열([])로 시작.
  // <Material[]> 는 "Material 객체들의 배열"이라는 타입 지정.
  const [materials, setMaterials] = useState<Material[]>([]);
  // activeCategory: 현재 선택된 필터 카테고리 키('all'이면 전체 표시). 처음엔 '전체'.
  const [activeCategory, setActiveCategory] = useState('all');
  // loading: 데이터 로딩 중 여부(스피너 표시 제어). 처음엔 true(아직 받아오는 중).
  const [loading, setLoading] = useState(true);

  // 마운트 시 1회 학습자료 목록을 비동기로 로드한다.
  // (마운트 = 컴포넌트가 화면에 처음 나타나는 순간)
  // useEffect의 두 번째 인자 [](빈 배열)이 "딱 한 번만 실행"을 의미합니다.
  // 주의: 이 배열에 값을 넣으면 그 값이 바뀔 때마다 다시 실행됩니다. 비워두면 최초 1회뿐.
  useEffect(() => {
    // useEffect의 콜백 자체는 async로 만들 수 없어서, 안에 async 함수를 따로 정의해 호출합니다.
    const load = async () => {
      const client = getSupabase(); // 서버에 접속할 Supabase 클라이언트를 준비
      // Supabase 클라이언트가 초기화되지 않았으면(환경변수 미설정 등) 로딩만 종료한다.
      // 이 방어 코드가 없으면 아래에서 client.from(...) 호출 시 에러로 앱이 멈출 수 있습니다.
      if (!client) { setLoading(false); return; }
      // [서버에서 데이터 가져오기 — 한 줄씩 풀어보기]
      //  .from(테이블명)            : 어떤 테이블에서 가져올지 지정
      //  .select('*')              : 모든 컬럼(열)을 가져오기
      //  .order('day_number')      : day_number 기준 오름차순 정렬(기본값이 오름차순)
      //  .order('created_at', { ascending: false }) : 같은 day 안에서는 만든 시각 내림차순(최신 먼저)
      //  await                     : 서버 응답이 올 때까지 기다림
      //  { data } = ...            : 응답 객체에서 data 속성만 꺼내오는 "구조 분해 할당"
      const { data } = await client.from(TABLES.materials).select('*').order('day_number').order('created_at', { ascending: false });
      // data가 null이 아닐 때만 상태 갱신(에러/빈 응답 시 기존 상태 유지).
      // as Material[] 는 "이 데이터를 Material 배열로 취급하라"는 TypeScript 타입 단언.
      if (data) setMaterials(data as Material[]);
      setLoading(false); // 성공/실패와 무관하게 로딩 표시는 끝냄(스피너 사라짐)
    };
    load(); // 위에서 정의한 비동기 함수를 실제로 실행
  }, []);

  // 선택된 카테고리에 따라 표시할 목록을 계산.
  // 'all'이면 전체, 아니면 category가 일치하는 자료만 필터링한다.
  // .filter(조건) 은 조건을 만족하는 항목만 모아 "새 배열"을 만듭니다(원본 materials는 그대로 보존 = 불변성).
  // 주의: 이 변수는 렌더링될 때마다 새로 계산됩니다. activeCategory가 바뀌면 화면도 자동으로 갱신됩니다.
  const filtered = activeCategory === 'all' ? materials : materials.filter(m => m.category === activeCategory);

  // 바이트 수를 사람이 읽기 쉬운 단위(B/KB/MB)로 변환한다.
  // 예: 2048 -> "2.0KB", 1500000 -> "1.4MB"
  // (1KB = 1024B, 1MB = 1024 * 1024B 라는 컴퓨터 단위 규칙을 사용)
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;                              // 1KB 미만: 바이트 그대로
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`; // 1MB 미만: KB 단위(소수 첫째자리)
    // .toFixed(1) 은 소수점 첫째 자리까지 반올림한 "문자열"을 반환합니다.
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;                 // 그 이상: MB 단위(소수 첫째자리)
  };

  // ----- 화면 그리기(JSX) -----
  // return 안에 있는 것이 실제로 사용자에게 보이는 화면입니다.
  // <> ... </> 는 "Fragment"로, 여러 요소를 의미 없는 껍데기로 묶는 빈 태그입니다.
  return (
    <>
      {/* SEO 메타 설정. 학습자료는 비공개 페이지이므로 noindex로 검색 노출 차단 */}
      {/* (noindex = 검색엔진에게 "이 페이지는 검색결과에 넣지 마"라고 알리는 표시) */}
      <SEOHead title="학습자료" path="/materials" noindex />
      <section className="page-header">
        <div className="container">
          <h2>학습자료</h2>
          <p>과정별 학습자료를 다운로드할 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="curriculum-filter">
            {/* categoryLabels의 각 항목을 필터 버튼으로 렌더링. 현재 활성 카테고리에는 active 클래스 부여 */}
            {/* Object.entries(객체) 는 객체를 [키, 값] 쌍의 배열로 바꿔줍니다. 그걸 .map으로 하나씩 버튼으로 변환. */}
            {/* 주의: 목록을 .map으로 그릴 때 각 항목에는 반드시 고유한 key가 필요합니다(여기선 key={key}). */}
            {Object.entries(categoryLabels).map(([key, label]) => (
              // 템플릿 리터럴로 클래스명을 조합: 선택된 버튼이면 'active'가 붙고, 아니면 빈 문자열.
              <button key={key} className={`filter-btn ${activeCategory === key ? 'active' : ''}`}
                // 버튼 클릭 시 그 버튼의 key를 활성 카테고리로 설정 -> filtered 재계산 -> 화면 갱신
                onClick={() => setActiveCategory(key)}>{label}</button>
            ))}
          </div>

          {/* 로딩 중이면 스피너, 데이터가 있으면 카드 목록, 없으면 빈 메시지를 조건부 렌더링 */}
          {/* JSX에서는 if문 대신 삼항연산자(조건 ? A : B)로 "상황에 따라 다른 화면"을 그립니다. */}
          {loading ? (
            // 1) 아직 로딩 중: 빙글빙글 도는 스피너 표시
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length > 0 ? (
            // 2) 로딩 끝 + 보여줄 자료가 1개 이상: 카드 목록 표시
            <div className="materials-list">
              {/* filtered 배열의 각 자료(m)를 카드 하나로 변환. key={m.id}로 각 카드를 구분 */}
              {filtered.map((m) => (
                <div key={m.id} className="material-card">
                  <div className="material-icon">
                    {/* 파일 타입별 이모지 아이콘 매핑: pdf=문서, zip=압축, pptx=발표, 그 외=일반 파일 */}
                    {/* 삼항연산자를 연달아 써서 여러 경우를 구분합니다(중첩 삼항). */}
                    <EmojiIcon char={m.file_type === 'pdf' ? '📄' : m.file_type === 'zip' ? '📦' : m.file_type === 'pptx' ? '📊' : '📁'} />
                  </div>
                  <div className="material-info">
                    <h4>{m.title}</h4>
                    <p>{m.description}</p>
                    <div className="material-meta">
                      <span>Day {m.day_number}</span>
                      {/* 라벨 매핑에 없는 카테고리면 원본 키를 그대로 표시(fallback) */}
                      {/* || 는 "왼쪽 값이 없거나 비었으면 오른쪽 값을 쓰라"는 의미. */}
                      <span>{categoryLabels[m.category] || m.category}</span>
                      <span>{formatFileSize(m.file_size)}</span>
                    </div>
                  </div>
                  {/* file_url이 있을 때만 다운로드 버튼 노출. 새 탭 + rel=noopener로 안전하게 외부 링크 열기 */}
                  {/* "조건 && 화면" 패턴: 조건이 참일 때만 오른쪽 요소를 그립니다(거짓이면 아무것도 안 그림). */}
                  {/* target="_blank" = 새 탭에서 열기 / rel="noopener noreferrer" = 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 옵션 */}
                  {m.file_url && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '16px' }}>
                      다운로드
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // 3) 로딩 끝 + 보여줄 자료가 0개: 안내 문구 표시
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 학습자료가 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

// 이 파일의 대표 결과물(Materials 컴포넌트)을 다른 파일에서 import 할 수 있게 내보냅니다.
export default Materials;
