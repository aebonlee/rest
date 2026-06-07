/**
 * SearchModal.tsx
 *
 * 역할:
 *   전역 통합 검색 모달 컴포넌트. 사용자가 입력한 검색어로 블로그/게시판/갤러리
 *   세 카테고리를 한 번에 검색하여 결과를 그룹별로 보여주고, 결과 클릭 시 해당
 *   상세 페이지로 라우팅한다.
 *
 * 핵심 책임:
 *   - 모달 열림/닫힘에 따른 상태 초기화, 입력 포커스, 배경 스크롤 잠금 처리
 *   - ESC 키로 모달 닫기 (키보드 접근성)
 *   - 입력에 대한 디바운스(300ms) 검색 실행 및 로딩/에러 처리
 *   - 다국어(t, language) 지원 및 결과 항목 렌더링/네비게이션
 *
 * 주요 export:
 *   - default: SearchModal (React 컴포넌트)
 */
import { useState, useEffect, useRef, useCallback, type ReactElement, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { searchAll } from '../utils/searchStorage';
import type { SearchResults, SearchResultItem } from '../types';

// SearchModal 컴포넌트가 받는 props 타입.
//   isOpen: 모달 표시 여부
//   onClose: 모달을 닫을 때 호출하는 콜백
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SearchModal
 *   통합 검색 모달 컴포넌트.
 * 매개변수:
 *   - isOpen: 모달 열림 여부 (false면 null을 반환하여 아무것도 렌더링하지 않음)
 *   - onClose: 모달 닫기 콜백
 * 반환값:
 *   - ReactElement (열려 있을 때) 또는 null (닫혀 있을 때)
 * 부수효과:
 *   - 열릴 때 body 스크롤 잠금, 입력 포커스, 키보드 이벤트 리스너 등록
 */
const SearchModal = ({ isOpen, onClose }: SearchModalProps): ReactElement | null => {
  // 다국어 번역 함수(t)와 현재 언어(language)
  const { t, language } = useLanguage();
  // 결과 클릭 시 라우팅에 사용하는 네비게이터
  const navigate = useNavigate();
  // 검색 입력 요소 참조 (모달 오픈 시 자동 포커스 용)
  const inputRef = useRef<HTMLInputElement>(null);
  // 현재 검색어 입력 상태
  const [query, setQuery] = useState('');
  // 카테고리별 검색 결과 상태
  const [results, setResults] = useState<SearchResults>({ blog: [], board: [], gallery: [] });
  // 검색 진행 중 로딩 상태
  const [loading, setLoading] = useState(false);
  // 디바운스 타이머 참조 (입력마다 이전 타이머를 취소하기 위해 보관)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 모달 오픈 시 초기화 처리.
  //   - 검색어/결과 초기화로 이전 검색 잔상 제거
  //   - 100ms 지연 후 입력에 포커스 (모달 렌더/애니메이션 직후 포커스 보장)
  //   - body 스크롤을 잠가 배경 스크롤 방지
  // cleanup: 모달이 닫히거나 언마운트될 때 body 스크롤 잠금 해제
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ blog: [], board: [], gallery: [] });
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키 입력 시 모달을 닫는 키보드 핸들러 등록.
  //   - 모달이 닫혀 있으면(!isOpen) 리스너를 달지 않고 조기 반환
  //   - cleanup에서 리스너를 제거해 누수 방지
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
   *   실제 비동기 검색을 수행하는 콜백 (useCallback으로 메모이즈).
   * 매개변수:
   *   - q: 검색어 문자열
   * 반환값: Promise<void>
   * 부수효과: loading 및 results 상태 갱신, 에러 시 콘솔 로깅
   * 엣지케이스: 공백만 있는 검색어는 결과를 비우고 즉시 종료
   */
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ blog: [], board: [], gallery: [] });
      return;
    }
    setLoading(true);
    try {
      // searchAll: 블로그/게시판/갤러리를 통합 검색하는 유틸
      const data = await searchAll(q);
      setResults(data);
    } catch (err) {
      // 검색 실패는 콘솔에만 기록하고 UI는 빈 결과/이전 결과 유지
      console.error('Search error:', err);
    } finally {
      // 성공/실패 무관하게 로딩 해제
      setLoading(false);
    }
  }, []);

  /**
   * handleChange
   *   입력 변경 핸들러. 검색어 상태를 갱신하고 300ms 디바운스로 doSearch 호출.
   * 매개변수: e - input change 이벤트
   * 부수효과: query 상태 갱신, 디바운스 타이머 재설정
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    // 이전 예약된 검색을 취소해 마지막 입력만 실제 검색되도록 디바운스
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  /**
   * handleNavigate
   *   결과 항목 클릭 시 모달을 닫고 지정 경로로 이동.
   * 매개변수: path - 이동할 라우트 경로
   * 부수효과: onClose 호출 후 navigate 실행
   */
  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  // 전체 결과 개수 (빈 결과/없음 메시지 분기 판단에 사용)
  const totalResults = results.blog.length + results.board.length + results.gallery.length;
  // 공백 제외 실제 검색어 존재 여부
  const hasQuery = query.trim().length > 0;

  // 모달이 닫혀 있으면 렌더링하지 않음 (이 위치의 early return은 위 훅 호출 이후라 훅 순서 규칙 유지)
  if (!isOpen) return null;

  /**
   * renderItem
   *   단일 검색 결과 항목을 버튼 형태로 렌더링.
   * 매개변수:
   *   - item: 검색 결과 데이터
   *   - type: 결과 카테고리('blog' | 'board' | 'gallery')
   * 반환값: 클릭 시 상세 페이지로 이동하는 버튼 엘리먼트
   */
  const renderItem = (item: SearchResultItem, type: 'blog' | 'board' | 'gallery') => {
    // 카테고리별 이동 경로 및 라벨 결정
    let path = '/';
    let typeLabel = '';

    if (type === 'blog') {
      // 블로그/게시판은 id 기반 상세 경로, 갤러리는 단일 목록 경로
      path = `/community/blog/${item.id}`;
      typeLabel = 'Blog';
    } else if (type === 'board') {
      path = `/community/board/${item.id}`;
      typeLabel = 'Board';
    } else {
      path = '/community/gallery';
      typeLabel = 'Gallery';
    }

    return (
      <button
        key={`${type}-${item.id}`}
        className="search-result-item"
        onClick={() => handleNavigate(path)}
      >
        <span className="search-result-type">{typeLabel}</span>
        <div className="search-result-info">
          <span className="search-result-title">
            {/* 영어 모드면 titleEn 우선, 없으면 기본 title로 폴백 */}
            {language === 'en' ? (item.titleEn || item.title) : item.title}
          </span>
          <span className="search-result-meta">
            {/* 카테고리별 메타 정보: 블로그=분류·날짜, 게시판=작성자·날짜, 갤러리=날짜 */}
            {type === 'blog' && <>{language === 'en' ? (item.categoryEn || item.category) : item.category} &middot; {item.date}</>}
            {type === 'board' && <>{item.author} &middot; {item.date}</>}
            {type === 'gallery' && <>{item.date}</>}
          </span>
        </div>
      </button>
    );
  };

  return (
    // 오버레이 클릭 시 모달 닫기
    <div className="search-modal-overlay" onClick={onClose}>
      {/* 내부 모달: 클릭 이벤트 버블링을 막아 오버레이 onClose가 트리거되지 않게 함 */}
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            {/* 검색 아이콘 (돋보기 SVG) */}
            <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {/* 검색 입력 필드: ref로 자동 포커스, onChange로 디바운스 검색 */}
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={t('search.placeholder')}
              value={query}
              onChange={handleChange}
            />
            {/* ESC 안내 겸 닫기 버튼 */}
            <button className="search-close-btn" onClick={onClose}>ESC</button>
          </div>
        </div>

        <div className="search-modal-body">
          {/* 검색 진행 중 로딩 표시 */}
          {loading && (
            <div className="search-loading">{t('search.searching')}</div>
          )}

          {/* 검색어는 있으나 결과가 0건일 때 '결과 없음' 안내 */}
          {!loading && hasQuery && totalResults === 0 && (
            <div className="search-empty">{t('search.noResults')}</div>
          )}

          {/* 아직 검색어를 입력하지 않은 초기 상태의 힌트 안내 */}
          {!loading && !hasQuery && (
            <div className="search-hint">{t('search.hint')}</div>
          )}

          {/* 블로그 결과 그룹 (결과가 있을 때만 렌더) */}
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

export default SearchModal;
