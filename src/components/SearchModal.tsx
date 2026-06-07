/**
 * SearchModal.tsx
 *
 * [이 파일이 무엇인가요?]
 *   화면 어디서든 띄울 수 있는 "통합 검색 팝업창(모달)"을 만드는 React 컴포넌트입니다.
 *   사용자가 검색어를 입력하면 블로그/게시판/갤러리 세 곳을 한 번에 찾아서,
 *   카테고리별로 묶어 보여주고, 결과를 누르면 그 상세 페이지로 이동시켜 줍니다.
 *
 * [초보자를 위한 용어 정리]
 *   - 컴포넌트(Component): 화면의 한 조각을 만들어 내는 함수. 이 함수가 반환하는
 *     JSX가 실제 화면(HTML)으로 그려집니다.
 *   - 모달(Modal): 본문 위에 떠서 사용자의 주의를 모으는 팝업창. 보통 어두운 배경(오버레이)
 *     위에 박스가 떠 있는 형태이며, 닫기 전에는 뒤 화면을 가립니다.
 *   - props: 부모 컴포넌트가 자식에게 건네주는 "입력값". 여기서는 isOpen, onClose.
 *   - state(상태): 컴포넌트가 기억하는 "변하는 값". 값이 바뀌면 화면이 자동으로 다시 그려집니다.
 *   - 훅(Hook): use로 시작하는 특수 함수(useState, useEffect 등). React 기능을 함수형
 *     컴포넌트 안에서 쓰게 해 줍니다.
 *   - JSX: 자바스크립트 안에 HTML처럼 보이는 문법을 섞어 쓰는 것. 화면 구조를 표현합니다.
 *   - 디바운스(debounce): 입력이 끝날 때까지 잠깐 기다렸다가 한 번만 실행하는 기법.
 *     글자 하나 칠 때마다 검색하면 너무 자주 호출되니, 마지막 입력 후 잠깐 쉬면 실행합니다.
 *
 * 핵심 책임:
 *   - 모달 열림/닫힘에 따른 상태 초기화, 입력 포커스, 배경 스크롤 잠금 처리
 *   - ESC 키로 모달 닫기 (키보드만 쓰는 사용자를 위한 접근성)
 *   - 입력에 대한 디바운스(300ms) 검색 실행 및 로딩/에러 처리
 *   - 다국어(t, language) 지원 및 결과 항목 렌더링/네비게이션
 *
 * 주요 export:
 *   - default: SearchModal (React 컴포넌트)
 */
// React 훅들과 타입을 가져옵니다.
//   - useState: 상태(변하는 값)를 만들 때 사용
//   - useEffect: "특정 시점에 부수효과(이벤트 등록, 스크롤 잠금 등)를 실행"할 때 사용
//   - useRef: 다시 그려져도 값이 유지되는 "보관함". DOM 요소나 타이머 ID를 담는 데 씀
//   - useCallback: 함수를 메모이즈(기억)해서 매 렌더마다 새로 만들지 않게 함
//   - type ReactElement, type ChangeEvent: 타입스크립트용 "타입"만 가져오는 import
//     (type 키워드는 "이건 값이 아니라 타입"이라는 표시 — 빌드 시 코드에서 사라짐)
import { useState, useEffect, useRef, useCallback, type ReactElement, type ChangeEvent } from 'react';
// useNavigate: 클릭 등으로 다른 페이지(라우트)로 이동시키는 react-router-dom의 훅
import { useNavigate } from 'react-router-dom';
// useLanguage: 현재 언어와 번역 함수를 전역에서 꺼내 쓰는 커스텀 훅(Context 기반)
import { useLanguage } from '../contexts/LanguageContext';
// searchAll: 블로그/게시판/갤러리를 한꺼번에 검색해 주는 유틸 함수(비동기)
import { searchAll } from '../utils/searchStorage';
// 검색 결과/항목의 "모양(타입)" 정의 (실제 값이 아니라 타입이라 type import)
import type { SearchResults, SearchResultItem } from '../types';

// SearchModal 컴포넌트가 받는 props 타입.
//   isOpen: 모달 표시 여부 (true면 보이고 false면 숨김)
//   onClose: 모달을 닫을 때 호출하는 콜백 함수 (반환값 없음 = () => void)
//   ※ interface는 타입스크립트에서 "객체의 모양"을 정의하는 문법입니다.
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SearchModal
 *   통합 검색 모달 컴포넌트.
 *
 * 왜 이렇게 만드나요?
 *   부모가 "열어/닫아"만 결정하고(isOpen, onClose), 실제 검색·렌더링은 이 컴포넌트가
 *   책임지도록 역할을 나눕니다. 이렇게 하면 재사용과 관리가 쉬워집니다.
 *
 * 매개변수:
 *   - isOpen: 모달 열림 여부 (false면 null을 반환하여 아무것도 렌더링하지 않음)
 *   - onClose: 모달 닫기 콜백
 * 반환값:
 *   - ReactElement (열려 있을 때) 또는 null (닫혀 있을 때)
 *     ※ null을 반환하면 React는 "이 컴포넌트는 화면에 아무것도 안 그린다"로 처리합니다.
 * 부수효과:
 *   - 열릴 때 body 스크롤 잠금, 입력 포커스, 키보드 이벤트 리스너 등록
 */
const SearchModal = ({ isOpen, onClose }: SearchModalProps): ReactElement | null => {
  // 다국어 번역 함수(t)와 현재 언어(language)를 Context에서 꺼냄.
  //   - t('어떤.키') 형태로 부르면 현재 언어에 맞는 문구를 돌려줍니다.
  //   - language는 'ko' / 'en' 같은 현재 언어 코드입니다.
  const { t, language } = useLanguage();
  // 결과 클릭 시 페이지 이동에 사용하는 함수. navigate('/경로')로 호출합니다.
  const navigate = useNavigate();
  // 검색 입력(input) DOM 요소를 가리키는 참조.
  //   - 모달이 열리면 이 input에 자동으로 커서를 두기(focus) 위해 사용합니다.
  //   - 처음엔 아직 화면에 없으니 null로 시작합니다.
  const inputRef = useRef<HTMLInputElement>(null);
  // 현재 검색어 입력 상태. setQuery로 바꾸면 화면이 다시 그려집니다.
  const [query, setQuery] = useState('');
  // 카테고리별 검색 결과 상태. 처음엔 세 카테고리 모두 빈 배열로 시작.
  const [results, setResults] = useState<SearchResults>({ blog: [], board: [], gallery: [] });
  // 검색 진행 중인지 나타내는 로딩 상태 (true면 "검색 중..." 표시).
  const [loading, setLoading] = useState(false);
  // 디바운스 타이머의 ID를 보관하는 참조.
  //   - 새 입력이 들어오면 이전에 예약해 둔 타이머를 취소해야 하는데,
  //     그 타이머를 "기억"해 두기 위해 useRef를 씁니다.
  //   - 주의: 타이머 ID는 화면에 보일 값이 아니므로 state가 아니라 ref를 씁니다.
  //     (state로 두면 값이 바뀔 때마다 불필요하게 화면이 다시 그려집니다.)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // [효과 1] 모달이 열릴 때 초기화 처리.
  //   - 검색어/결과를 비워 이전에 검색했던 잔상을 제거합니다.
  //   - setTimeout으로 100ms 뒤에 input에 포커스: 모달이 화면에 그려지고 애니메이션이
  //     시작된 직후라야 포커스가 안정적으로 먹히기 때문입니다(바로 호출하면 실패할 수 있음).
  //   - document.body.style.overflow = 'hidden'으로 배경(본문) 스크롤을 잠급니다.
  //     (모달이 떠 있는 동안 뒤 페이지가 스크롤되면 어색하기 때문)
  // cleanup(정리 함수): 아래 return으로 돌려주는 함수는 "다음 실행 전" 또는
  //   "컴포넌트가 사라질 때(언마운트)" 호출됩니다. 여기서 잠갔던 스크롤을 다시 풀어 줍니다.
  // 의존성 배열 [isOpen]: isOpen 값이 바뀔 때마다 이 효과를 다시 실행합니다.
  //   (의존성 배열은 "이 값들이 바뀌면 다시 실행하라"는 목록입니다.)
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ blog: [], board: [], gallery: [] });
      // inputRef.current?.focus() 의 ?. 는 "옵셔널 체이닝".
      //   current가 null이면(아직 input이 없으면) 에러 없이 그냥 건너뜁니다.
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      // 빈 문자열로 되돌리면 CSS 기본 스크롤 동작이 복구됩니다.
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // [효과 2] ESC 키를 누르면 모달을 닫는 키보드 핸들러를 등록.
  //   - 모달이 닫혀 있으면(!isOpen) 굳이 리스너를 달 필요가 없으니 바로 return으로 끝냅니다.
  //   - window.addEventListener로 키 입력을 감지하고, e.key === 'Escape'일 때만 onClose 호출.
  //   - cleanup에서 removeEventListener로 리스너를 떼어내 "메모리 누수"와 중복 등록을 막습니다.
  //     주의: addEventListener를 했으면 반드시 같은 함수로 removeEventListener 해야 합니다.
  // 의존성 [isOpen, onClose]: 둘 중 하나라도 바뀌면 리스너를 다시 설정합니다.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  /**
   * doSearch
   *   실제 비동기 검색을 수행하는 함수 (useCallback으로 메모이즈).
   *
   * 왜 useCallback을 쓰나요?
   *   컴포넌트가 다시 그려질 때마다 함수가 새로 만들어지는데, useCallback으로 감싸면
   *   의존성(여기선 빈 배열 [])이 그대로면 같은 함수를 재사용합니다.
   *   불필요한 재생성을 막아 성능에 도움이 됩니다.
   *
   * 왜 async/await인가요?
   *   검색은 시간이 걸리는 작업(서버/저장소 조회)이라 "비동기"입니다.
   *   await는 "결과가 올 때까지 기다린 뒤 다음 줄로 진행하라"는 뜻입니다.
   *
   * 매개변수:
   *   - q: 검색어 문자열
   * 반환값: Promise<void> (값을 직접 돌려주지 않고 상태를 바꿉니다)
   * 부수효과: loading 및 results 상태 갱신, 에러 시 콘솔 로깅
   * 엣지케이스: 공백만 있는 검색어는 결과를 비우고 즉시 종료
   */
  const doSearch = useCallback(async (q: string) => {
    // q.trim()은 앞뒤 공백을 제거한 문자열. 그게 비어 있으면(빈 문자열은 false 취급)
    // 검색할 게 없으니 결과를 비우고 끝냅니다.
    if (!q.trim()) {
      setResults({ blog: [], board: [], gallery: [] });
      return;
    }
    setLoading(true); // 검색 시작 → 화면에 "검색 중..." 표시
    try {
      // searchAll: 블로그/게시판/갤러리를 통합 검색하는 유틸. await로 결과를 기다림.
      const data = await searchAll(q);
      setResults(data); // 받아온 결과로 상태 갱신 → 화면 자동 갱신
    } catch (err) {
      // 검색 실패는 콘솔에만 기록하고 UI는 빈 결과/이전 결과를 그대로 둡니다.
      // (사용자에게 빨간 에러를 보여주기보다 조용히 처리하는 정책)
      console.error('Search error:', err);
    } finally {
      // finally는 성공하든 실패하든 항상 실행됩니다. 어느 경우든 로딩을 꺼 줍니다.
      setLoading(false);
    }
  }, []); // 빈 의존성 [] → 이 함수는 처음 한 번 만들어진 뒤 계속 재사용됩니다.

  /**
   * handleChange
   *   입력이 바뀔 때마다 호출되는 핸들러. 검색어 상태를 갱신하고,
   *   300ms 디바운스로 doSearch를 예약합니다.
   *
   * 디바운스 동작 흐름:
   *   글자를 칠 때마다 이전에 예약한 타이머를 취소(clearTimeout)하고 새 타이머를 겁니다.
   *   그래서 사용자가 입력을 멈추고 300ms가 지나야 비로소 마지막 입력값으로 검색이 한 번 실행됩니다.
   *   → 타자 중간중간 불필요한 검색이 안 나가고, 비동기 검색이 뒤죽박죽 도착하는
   *     "경쟁(race) 상황"도 줄어듭니다.
   *
   * 매개변수: e - input의 change(변경) 이벤트 객체
   * 부수효과: query 상태 갱신, 디바운스 타이머 재설정
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // 사용자가 입력창에 친 현재 전체 글자
    setQuery(val); // 입력값을 즉시 상태에 반영(입력창은 끊김 없이 글자가 보여야 하므로)
    // 이전 예약된 검색을 취소해 마지막 입력만 실제 검색되도록 디바운스합니다.
    if (timerRef.current) clearTimeout(timerRef.current);
    // 300ms 뒤 doSearch(val) 실행을 예약하고, 그 타이머 ID를 ref에 보관합니다.
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  /**
   * handleNavigate
   *   결과 항목을 클릭했을 때, 모달을 먼저 닫고 지정한 경로로 이동합니다.
   *   순서가 중요: 먼저 닫아야(onClose) 이동 후 모달이 남아 가리지 않습니다.
   * 매개변수: path - 이동할 라우트 경로(예: '/community/blog/3')
   * 부수효과: onClose 호출 후 navigate 실행
   */
  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  // 전체 결과 개수 = 세 카테고리 배열 길이의 합.
  //   "결과 없음" 메시지를 보여줄지 판단할 때 사용합니다.
  const totalResults = results.blog.length + results.board.length + results.gallery.length;
  // 공백을 뺀 실제 검색어가 있는지 여부 (true면 사용자가 의미 있는 글자를 입력한 상태).
  const hasQuery = query.trim().length > 0;

  // 모달이 닫혀 있으면 아무것도 그리지 않고 null 반환.
  //   주의(중요): 이 early return(조기 반환)은 반드시 위의 모든 훅(useState/useEffect/
  //   useCallback) 호출 "뒤"에 와야 합니다. 훅은 매 렌더마다 같은 순서로 호출되어야 하는데,
  //   훅보다 위에서 return하면 그 규칙이 깨져 React가 에러를 냅니다.
  if (!isOpen) return null;

  /**
   * renderItem
   *   검색 결과 하나를 클릭 가능한 버튼으로 그려 줍니다.
   * 매개변수:
   *   - item: 검색 결과 데이터(제목, 날짜 등)
   *   - type: 결과 카테고리('blog' | 'board' | 'gallery')
   *     ※ '|'는 타입스크립트의 "유니온 타입" — 셋 중 하나만 허용한다는 뜻.
   * 반환값: 클릭 시 상세 페이지로 이동하는 버튼 엘리먼트(JSX)
   */
  const renderItem = (item: SearchResultItem, type: 'blog' | 'board' | 'gallery') => {
    // 카테고리에 따라 이동 경로(path)와 화면에 보일 라벨(typeLabel)을 결정합니다.
    let path = '/';
    let typeLabel = '';

    if (type === 'blog') {
      // 블로그/게시판은 각 글의 id를 끼워 만든 상세 경로로 이동합니다.
      //   `...${item.id}` 는 template literal(백틱 문자열) — 문자열 안에 값을 끼워 넣는 문법.
      path = `/community/blog/${item.id}`;
      typeLabel = 'Blog';
    } else if (type === 'board') {
      path = `/community/board/${item.id}`;
      typeLabel = 'Board';
    } else {
      // 갤러리는 개별 상세가 아니라 단일 목록 페이지로 이동합니다.
      path = '/community/gallery';
      typeLabel = 'Gallery';
    }

    return (
      <button
        // key: 목록을 그릴 때 React가 각 항목을 구분하려고 요구하는 고유 식별자.
        //   `타입-id` 조합으로 카테고리가 달라도 겹치지 않는 값을 만듭니다.
        key={`${type}-${item.id}`}
        className="search-result-item"
        // 클릭하면 위에서 정한 path로 이동(모달은 handleNavigate 안에서 먼저 닫힘).
        onClick={() => handleNavigate(path)}
      >
        <span className="search-result-type">{typeLabel}</span>
        <div className="search-result-info">
          <span className="search-result-title">
            {/* 영어 모드면 titleEn 우선, 없으면(||) 기본 title로 폴백(대체).
                ※ || 는 앞 값이 비었으면(빈 문자열/undefined 등) 뒤 값을 쓰라는 뜻. */}
            {language === 'en' ? (item.titleEn || item.title) : item.title}
          </span>
          <span className="search-result-meta">
            {/* 카테고리별 메타 정보: 블로그=분류·날짜, 게시판=작성자·날짜, 갤러리=날짜.
                &&는 "앞이 참일 때만 뒤를 그려라"라는 조건부 렌더링 패턴입니다.
                &middot;는 가운뎃점(·) 기호이고, <>...</>는 불필요한 태그 없이 여러 요소를 묶는 Fragment입니다. */}
            {type === 'blog' && <>{language === 'en' ? (item.categoryEn || item.category) : item.category} &middot; {item.date}</>}
            {type === 'board' && <>{item.author} &middot; {item.date}</>}
            {type === 'gallery' && <>{item.date}</>}
          </span>
        </div>
      </button>
    );
  };

  return (
    // 오버레이(어두운 배경)를 클릭하면 모달을 닫습니다.
    <div className="search-modal-overlay" onClick={onClose}>
      {/* 내부 모달 박스: e.stopPropagation()으로 클릭이 위 오버레이까지 "전파(버블링)"되는 걸 막습니다.
          이게 없으면 모달 안을 클릭해도 오버레이의 onClose가 같이 불려 모달이 닫혀 버립니다. */}
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            {/* 검색 아이콘 (돋보기 모양 SVG 벡터 이미지) */}
            <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {/* 검색 입력 필드.
                - ref={inputRef}: 위에서 만든 참조와 연결 → 모달 열릴 때 자동 포커스 가능.
                - value={query} + onChange={handleChange}: "제어 컴포넌트" 패턴.
                  입력값을 항상 query 상태가 통제하므로 화면과 상태가 어긋나지 않습니다.
                - placeholder: 다국어 문구를 t()로 가져옵니다. */}
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={t('search.placeholder')}
              value={query}
              onChange={handleChange}
            />
            {/* ESC 안내 겸 닫기 버튼: 마우스 사용자도 누르면 모달이 닫힙니다. */}
            <button className="search-close-btn" onClick={onClose}>ESC</button>
          </div>
        </div>

        <div className="search-modal-body">
          {/* 검색 진행 중일 때만 로딩 메시지 표시 (loading이 true일 때만 && 뒤가 그려짐) */}
          {loading && (
            <div className="search-loading">{t('search.searching')}</div>
          )}

          {/* 로딩이 끝났고 + 검색어가 있고 + 결과가 0건일 때만 '결과 없음' 안내 */}
          {!loading && hasQuery && totalResults === 0 && (
            <div className="search-empty">{t('search.noResults')}</div>
          )}

          {/* 아직 검색어를 입력하지 않은 초기 상태에서 힌트 안내 표시 */}
          {!loading && !hasQuery && (
            <div className="search-hint">{t('search.hint')}</div>
          )}

          {/* 블로그 결과 그룹: 결과가 1건 이상일 때만 렌더링.
              .map(...)으로 배열의 각 항목을 renderItem으로 변환해 버튼 목록을 만듭니다. */}
          {!loading && results.blog.length > 0 && (
            <div className="search-group">
              <h4 className="search-group-title">{t('search.blog')}</h4>
              {results.blog.map((item) => renderItem(item, 'blog'))}
            </div>
          )}

          {/* 게시판 결과 그룹 */}
          {!loading && results.board.length > 0 && (
            <div className="search-group">
              <h4 className="search-group-title">{t('search.board')}</h4>
              {results.board.map((item) => renderItem(item, 'board'))}
            </div>
          )}

          {/* 갤러리 결과 그룹 */}
          {!loading && results.gallery.length > 0 && (
            <div className="search-group">
              <h4 className="search-group-title">{t('search.gallery')}</h4>
              {results.gallery.map((item) => renderItem(item, 'gallery'))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 이 컴포넌트를 다른 파일에서 import해서 쓸 수 있도록 기본 내보내기(default export)합니다.
export default SearchModal;
