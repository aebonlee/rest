/**
 * Navbar.tsx
 *
 * [이 파일의 역할]
 * 사이트 전역 상단 내비게이션 바(Navbar) 컴포넌트.
 * 로고, 메뉴(드롭다운 포함), 검색 버튼, 언어 전환, 컬러 테마 선택,
 * 라이트/다크/오토 테마 토글, 사용자 인증 메뉴(로그인/로그아웃/마이페이지/관리자),
 * 모바일 햄버거 토글을 한 곳에서 관리한다.
 *
 * [초보자를 위한 배경 지식]
 * - 이 파일은 "React 컴포넌트"다. 화면의 한 조각(상단 바)을 그려내는 함수이며, 함수가 JSX를 return 하면 그게 화면이 된다.
 * - JSX: JavaScript 안에 HTML처럼 생긴 문법을 섞어 쓰는 것. JSX 안에서 JS 값을 넣을 땐 중괄호 {}.
 * - "상태(state)": 화면이 기억해야 하는 값. 바뀌면 React가 화면을 다시 그린다(리렌더). useState로 만든다.
 * - "훅(Hook)": use로 시작하는 특수 함수. 컴포넌트 맨 위에서 항상 같은 순서로 호출(조건문/반복문 안 금지).
 * - "컨텍스트(Context)": 공유 값(테마/언어/로그인)을 props 없이 꺼내 쓰게 해주는 기능.
 *
 * [핵심 책임]
 * - 스크롤 위치에 따라 navbar 스타일 변경(scrolled 클래스).
 * - 라우트(location) 변경 시 모바일 메뉴/드롭다운/유저메뉴 자동 닫기.
 * - 유저 메뉴 바깥 클릭 시 닫기(outside click).
 * - site.js 설정 기반 메뉴 렌더링 + 다국어(t) 라벨 변환.
 * - 인증 컨텍스트(useAuth) 기반 로그인 상태/관리자 권한별 UI 분기.
 *
 * [주요 export]
 * - default: Navbar 컴포넌트
 */

// React 도구들. useState=상태, useEffect=부수효과, useRef=DOM 참조.
// type ReactElement/MouseEvent는 TypeScript 타입만 가져온다(`type`이면 실행 코드엔 안 들어감).
import { useState, useEffect, useRef, type ReactElement, type MouseEvent } from 'react';
// react-router-dom. Link=새로고침 없는 이동 링크, useLocation=현재 URL 경로 정보.
import { Link, useLocation } from 'react-router-dom';
// 아래 3개는 직접 만든 컨텍스트에서 값을 꺼내는 커스텀 훅들이다.
import { useTheme } from '../../contexts/ThemeContext';       // 테마(밝기/색상) 관련
import { useLanguage } from '../../contexts/LanguageContext'; // 다국어 관련
import { useAuth } from '../../contexts/AuthContext';         // 로그인/권한 관련
import SearchModal from '../SearchModal';                     // 검색 팝업 컴포넌트
import site from '../../config/site';                         // 사이트 설정(메뉴/브랜드/색상 등)
import type { MenuItem, SubMenuItem } from '../../types';      // 메뉴 항목의 타입 정의

// [타입] interface는 "객체의 모양"을 정의하는 TypeScript 문법.
// 설정에서 읽은 MenuItem에 다국어로 변환된 label을 더한 확장 타입.
// `extends MenuItem`는 "MenuItem의 모든 속성을 물려받는다". dropdown 하위도 label 포함 형태로 좁힌다.
interface ResolvedMenuItem extends MenuItem {
  label: string;                                     // 화면에 보일, 이미 번역된 메뉴 이름
  dropdown?: (SubMenuItem & { label: string })[];    // ?는 "있어도 되고 없어도 됨"(선택 속성)
}

/**
 * Navbar
 * 전역 상단 내비게이션 바를 렌더링하는 함수형 컴포넌트.
 * @returns {ReactElement} <nav> 루트의 내비게이션 UI
 * @remarks 부수효과: window scroll/mousedown 리스너 등록/해제(useEffect), 라우트 변경 감지, signOut 호출.
 * [읽는 순서 팁] 1) useState/useRef/컨텍스트로 다루는 값 파악 → 2) useEffect 3개로 자동 실행 파악 → 3) JSX로 화면 확인.
 */
const Navbar = (): ReactElement => {
  // ── [상태(state) 선언] useState(초기값)는 [현재값, set함수] 배열을 돌려준다.
  //    주의: 상태를 직접 isScrolled = true 로 바꾸면 안 됨. 반드시 set함수를 써야 React가 안다.

  // 스크롤이 50px을 넘었는지 여부(상단 고정 바 스타일 전환용)
  const [isScrolled, setIsScrolled] = useState(false);
  // 모바일(햄버거) 메뉴 열림 여부
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 현재 열려있는 드롭다운 메뉴의 인덱스(없으면 null). <number | null>은 "숫자 또는 null"(유니온 타입).
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  // 표시 설정(언어·컬러·모드) 풍선 팝오버 표시 여부 — 상단바를 간결하게 하려고 한곳에 묶음
  const [showSettings, setShowSettings] = useState(false);
  // 사용자 메뉴 드롭다운 표시 여부
  const [showUserMenu, setShowUserMenu] = useState(false);
  // 검색 모달 표시 여부
  const [showSearch, setShowSearch] = useState(false);

  // 유저 메뉴 영역 참조 — 바깥 클릭 감지(outside click)에 사용.
  // useRef는 DOM 요소를 가리키는 상자. JSX의 ref={userMenuRef}로 연결하면 .current가 실제 <div>가 된다.
  // 주의: ref 값이 바뀌어도 화면은 다시 안 그려진다(상태와 다른 점).
  const userMenuRef = useRef<HTMLDivElement>(null);
  // 표시 설정 팝오버 영역 참조 — 바깥 클릭 시 닫기
  const settingsRef = useRef<HTMLDivElement>(null);

  // 현재 라우트 정보 — 변경 시 메뉴 자동 닫기 트리거. location.pathname 에 현재 경로(예: '/courses')가 들어 있다.
  const location = useLocation();

  // ── [컨텍스트에서 공유 값 꺼내기] 아래 {} 는 "구조 분해 할당": 객체에서 필요한 속성만 골라 변수로 꺼낸다.

  // 테마 컨텍스트: 모드(light/dark/auto), 토글, 컬러 테마, 컬러 테마 변경 함수
  const { mode, toggleTheme, colorTheme, setColorTheme } = useTheme();
  // 언어 컨텍스트: 현재 언어, 언어 토글, 번역 함수 t. t(key)는 번역 키→현재 언어 문자열(translate).
  const { language, toggleLanguage, t } = useLanguage();
  // 인증 컨텍스트: 로그인 여부, 관리자 여부, 프로필, 로그아웃. (보통 Supabase 인증+권한(RLS) 기반)
  const { isLoggedIn, isAdmin, profile, signOut } = useAuth();

  // ── [useEffect: 부수효과] useEffect(함수, 의존성). []=마운트 시 1회, [x]=x 바뀔 때마다.
  //    return한 함수는 "정리(cleanup)" — 언마운트/다음 실행 직전 호출(리스너 해제 등 누수 방지).

  // 스크롤 위치 감지: 50px 초과 시 'scrolled' 적용. 언마운트 시 정리.
  // 주의: add/removeEventListener에는 "같은" 함수를 넘겨야 해제된다(그래서 handleScroll을 변수로).
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50); // window.scrollY = 세로 스크롤 픽셀 수
    window.addEventListener('scroll', handleScroll);              // 스크롤 때마다 handleScroll 실행
    return () => window.removeEventListener('scroll', handleScroll); // 언마운트 시 리스너 제거(정리)
  }, []); // 최초 1회만 등록

  // 라우트(location) 변경 시 열려있던 모든 메뉴를 닫는다(이동 후 메뉴 잔존 방지).
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowUserMenu(false);
    setShowSettings(false);
  }, [location]); // location이 바뀔 때(=페이지 이동 시)마다 실행

  // 유저 메뉴 바깥 클릭(outside click) 감지: 메뉴 밖을 누르면 닫는다.
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      // userMenuRef.current=실제 <div>(없으면 null), .contains(노드)=내부 포함 여부, e.target as Node=클릭 대상(타입 단언).
      // 즉 "메뉴가 떠 있고 && 클릭한 곳이 메뉴 바깥"이면 닫는다.
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    // 주의: 'click'이 아닌 'mousedown'을 쓰면 더 먼저 발생해 타이밍 충돌(눌렀는데 바로 닫힘)을 줄인다.
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside); // 정리(cleanup)
  }, []); // 최초 1회만 등록

  /**
   * handleSignOut
   * 로그아웃 후 유저 메뉴를 닫는다.
   * @returns {Promise<void>}
   * @remarks 부수효과: signOut() 비동기 호출, showUserMenu 상태 변경.
   * [async/await] signOut()은 서버 통신(비동기). await로 끝날 때까지 기다린 뒤 다음 줄 실행 → 순서 보장.
   */
  const handleSignOut = async () => {
    await signOut();          // 로그아웃이 끝날 때까지 기다림
    setShowUserMenu(false);   // 완료 후 유저 메뉴 닫기
  };

  // site.js 설정의 메뉴를 읽고 labelKey를 t()로 번역. dropdown이 있으면 하위도 번역해 ResolvedMenuItem로 만든다.
  // [개념] .map()은 각 원소를 변형해 "새 배열"을 만든다(원본 유지=불변성).
  // [개념] { ...item, label: ... } 의 `...`(스프레드)는 item 속성을 모두 복사한 뒤 label을 추가/덮어쓴다.
  const menuItems: ResolvedMenuItem[] = site.menuItems.map((item) => ({
    ...item,                  // 기존 메뉴 속성(path, labelKey 등)을 모두 복사
    label: t(item.labelKey),  // 번역 키를 현재 언어 문자열로 변환
    dropdown: item.dropdown   // dropdown이 있으면 하위 항목도 번역, 없으면 undefined (삼항: 조건 ? 참값 : 거짓값)
      ? item.dropdown.map((sub) => ({ ...sub, label: t(sub.labelKey) }))
      : undefined
  }));

  /**
   * isActive
   * 주어진 메뉴 항목이 현재 경로에서 활성인지 판정한다.
   * @param {ResolvedMenuItem} item - 판정할 메뉴 항목
   * @returns {boolean} 활성 여부
   * @remarks activePath 우선. 루트('/')는 정확 일치, 그 외는 startsWith로 하위 경로까지 활성.
   * [왜?] 모든 경로가 '/'로 시작하므로 홈에 startsWith를 쓰면 늘 활성처럼 보인다. 그래서 홈만 ===로 검사하고
   * 나머지는 startsWith로 /courses/123 같은 하위 경로에서도 상위 메뉴를 활성 표시한다.
   */
  const isActive = (item: ResolvedMenuItem): boolean => {
    // activePath가 있으면 그것을, 없으면 path. (||는 왼쪽이 비면 오른쪽을 쓰는 기본값 패턴)
    const checkPath = item.activePath || item.path;
    if (checkPath === '/') return location.pathname === '/'; // 홈은 정확히 일치할 때만 활성
    return location.pathname.startsWith(checkPath);          // 그 외엔 하위 경로 포함 활성
  };

  // 아바타 이니셜: 표시명 > 이메일 순 첫 글자, 없으면 '?'를 대문자로.
  // [옵셔널 체이닝 ?.] profile이 null/undefined여도 에러 없이 undefined가 된다.
  // [순서] (display_name || email || '?') → [0] 첫 글자 → 대문자. 주의: 항상 '?'가 보장돼 [0] 에러가 안 난다.
  const userInitial = (profile?.display_name || profile?.email || '?')[0].toUpperCase();

  // ── [return: 화면(JSX)] className=HTML의 class. {조건 && <요소/>}=참일 때만 그림. {조건 ? A : B}=분기.
  //    onClick={() => ...}=클릭될 때 실행(화살표함수로 감쌈). 주의: onClick={fn()}처럼 ()를 붙이면 즉시 실행됨.
  return (
    // 스크롤 상태에 따라 'scrolled' 클래스를 동적 부여(isScrolled가 true면 추가)
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-wrapper">
          {/* 로고: 클릭 시 홈으로 이동. 브랜드 텍스트는 설정의 parts 배열로 분할 렌더 */}
          <div className="logo">
            <Link to="/">
              <h1>
                {/* parts 배열의 각 조각을 <span>으로 그린다. key는 React가 목록 항목을 구분하는 표식. */}
                {site.brand.parts.map((part, i) => (
                  <span key={i} className={part.className}>
                    {part.text}
                  </span>
                ))}
              </h1>
            </Link>
          </div>

          {/* 메인 메뉴: 모바일 메뉴 열림 시 'active'로 슬라이드인 */}
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {/* menuItems 배열을 순회하며 메뉴 <li>들을 만든다 */}
            {menuItems.map((item, index) => (
              <li
                key={index}
                // 드롭다운이 있으면 'nav-item-dropdown', 현재 열린 인덱스면 'active' 클래스 부여
                className={`${item.dropdown ? 'nav-item-dropdown' : ''} ${activeDropdown === index ? 'active' : ''}`}
                // 데스크탑 호버 시 드롭다운 열기/닫기(드롭다운 있는 항목만 — && 단축 평가)
                onMouseEnter={() => item.dropdown && setActiveDropdown(index)}
                onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  // 드롭다운이 있는 항목. <>...</>는 Fragment: 불필요한 div 없이 여러 요소를 묶는다.
                  <>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item) ? 'active' : ''}`}
                      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                        // ≤1100px(햄버거): 탭 시 드롭다운 토글. 모바일에선 이동을 막고(preventDefault) 드롭다운만 토글.
                        // 주의: 모바일엔 호버가 없어 클릭으로 연다. 데스크탑(1100 초과)에선 이 if를 건너뛰어 정상 이동.
                        if (window.innerWidth <= 1100) {
                          e.preventDefault(); // 링크의 기본 동작(페이지 이동) 취소
                          // 이미 열려있으면 닫고(null), 아니면 이 인덱스를 열도록 토글
                          setActiveDropdown(activeDropdown === index ? null : index);
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                    {/* 하위 드롭다운 목록: 해당 인덱스가 활성일 때 'active'로 펼침 */}
                    <ul className={`dropdown-menu ${activeDropdown === index ? 'active' : ''}`}>
                      {/* 하위 항목들을 순회하며 렌더. divider면 클릭 불가한 섹션 라벨로 표시 */}
                      {item.dropdown.map((subItem, subIndex) => (
                        subItem.divider ? (
                          <li
                            key={subIndex}
                            style={{ padding: '7px 16px 3px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.02em', color: 'var(--text-secondary, #9ca3af)', borderTop: '1px solid var(--border-light, #e5e7eb)', marginTop: '4px', cursor: 'default', pointerEvents: 'none' }}
                          >
                            {subItem.label}
                          </li>
                        ) : (
                          <li key={subIndex}>
                            <Link to={subItem.path!}>{subItem.label}</Link>
                          </li>
                        )
                      ))}
                    </ul>
                  </>
                ) : (
                  // 드롭다운이 없는 단일 링크 항목 (item.className이 있으면 추가로 붙여 개별 스타일링)
                  <Link to={item.path} className={`nav-link ${isActive(item) ? 'active' : ''} ${item.className || ''}`}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* 우측 액션 영역: 검색/언어/컬러/테마/유저/햄버거 버튼 묶음 */}
          <div className="nav-actions">
            {/* 검색 기능이 켜진 경우에만 검색 버튼 노출 (설정값으로 기능 on/off) */}
            {site.features.search && (
              // aria-label: 화면 낭독기(접근성)에게 버튼 의미를 알려주는 속성
              <button className="nav-search-btn" onClick={() => setShowSearch(true)} aria-label="Search">
                {/* 돋보기 아이콘(SVG). 원+손잡이 선 */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            {/* 표시 설정(언어·컬러·모드)을 한 버튼(⚙️) 풍선 팝오버로 묶어 상단바를 간결하게 유지 */}
            <div className="nav-settings" ref={settingsRef}>
              <button
                className="nav-settings-btn"
                onClick={() => setShowSettings((v) => !v)}
                aria-label="표시 설정 (언어·컬러·화면 모드)"
                title="표시 설정 (언어·컬러·화면 모드)"
              >
                {/* 톱니바퀴(설정) 아이콘 */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              {showSettings && (
                <div className="nav-settings-popover">
                  <div className="nav-settings-arrow" />

                  {/* 언어 */}
                  <div className="nav-settings-section">
                    <span className="nav-settings-label">언어 / Language</span>
                    <button className="nav-settings-pill" onClick={toggleLanguage}>
                      {language === 'ko' ? '한국어 → English' : 'English → 한국어'}
                    </button>
                  </div>

                  {/* 화면 모드 (라이트/다크/오토 순환) */}
                  <div className="nav-settings-section">
                    <span className="nav-settings-label">화면 모드</span>
                    <button className="nav-settings-pill" onClick={toggleTheme} data-mode={mode}>
                      {mode === 'light' ? '☀️ 라이트' : mode === 'dark' ? '🌙 다크' : '🌗 자동'}
                    </button>
                  </div>

                  {/* 컬러 테마 */}
                  <div className="nav-settings-section nav-settings-colorsection">
                    <span className="nav-settings-label">컬러 테마</span>
                    <div className="nav-settings-dots">
                      {site.colors.map((c) => (
                        <button
                          key={c.name}
                          className={`color-dot${colorTheme === c.name ? ' active' : ''}`}
                          style={{ background: c.color }}
                          onClick={() => setColorTheme(c.name)}
                          aria-label={`${c.name} theme`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* User Auth */}
            {/* 로그인 상태에 따라 유저 메뉴 또는 로그인 버튼 분기 (삼항 ? :) */}
            {isLoggedIn ? (
              // 로그인 상태: 아바타 버튼 + 드롭다운. ref={userMenuRef}로 outside click 감지에 연결.
              <div className="nav-user-menu" ref={userMenuRef}>
                <button className="nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                  {/* 아바타 이미지 대신 이름 첫 글자(userInitial)를 보여준다 */}
                  <span className="nav-user-avatar-placeholder">{userInitial}</span>
                </button>
                {/* 유저 메뉴가 열렸을 때만 드롭다운 렌더 */}
                {showUserMenu && (
                  <div className="nav-user-dropdown">
                    {/* 드롭다운 상단 사용자 정보 헤더(아바타 + 이름 + 이메일) */}
                    <div className="dropdown-user-header">
                      <span className="dropdown-user-avatar">{userInitial}</span>
                      <div className="dropdown-user-info">
                        {/* display_name이 없으면 || 오른쪽 ''(빈 문자열)을 보여줘 에러 방지 */}
                        <span className="dropdown-user-name">{profile?.display_name || ''}</span>
                        <span className="dropdown-user-email">{profile?.email || ''}</span>
                      </div>
                    </div>
                    <div className="divider" />
                    {/* 마이페이지 링크 (t('auth.myPage')로 번역된 라벨) */}
                    <Link to="/mypage" className="dropdown-menu-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {t('auth.myPage')}
                    </Link>
                    {/* 관리자(isAdmin)일 때만 관리자 링크 노출.
                        주의: 화면에서 숨기는 것만으론 보안이 안 된다. 실제 접근 제어는 서버(권한/RLS)에서 한 번 더 막아야 한다. */}
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-menu-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        관리자
                      </Link>
                    )}
                    <div className="divider" />
                    {/* 로그아웃 버튼: handleSignOut으로 로그아웃 후 메뉴 닫기 */}
                    <button onClick={handleSignOut} className="dropdown-menu-item logout">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 비로그인 상태: 로그인 페이지로 이동하는 버튼
              <Link to="/login" className="nav-login-btn">Login</Link>
            )}
            {/* 모바일 햄버거 토글 버튼: 클릭 시 모바일 메뉴 열림/닫힘 전환.
                안의 빈 <span> 3개는 CSS로 햄버거(≡) 줄 3개를 그리는 용도다. */}
            <button
              className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="메뉴 토글"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
      {/* 검색 기능이 켜진 경우에만 검색 모달 마운트(표시 여부는 showSearch로 제어).
          isOpen/onClose는 SearchModal에 넘기는 props(부모→자식 데이터/콜백 전달). */}
      {site.features.search && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
    </nav>
  );
};

// 이 파일의 기본(default) 내보내기. 다른 파일에서 `import Navbar from '...'`로 가져와 쓴다.
export default Navbar;
