/**
 * Navbar.tsx
 *
 * [이 파일의 역할]
 * 사이트 전역 상단 내비게이션 바(Navbar) 컴포넌트.
 * 로고, 메뉴(드롭다운 포함), 검색 버튼, 언어 전환, 컬러 테마 선택,
 * 라이트/다크/오토 테마 토글, 사용자 인증 메뉴(로그인/로그아웃/마이페이지/관리자),
 * 모바일 햄버거 토글을 한 곳에서 관리한다.
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
import { useState, useEffect, useRef, type ReactElement, type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import SearchModal from '../SearchModal';
import site from '../../config/site';
import type { MenuItem } from '../../types';

// 설정에서 읽은 MenuItem에 다국어로 변환된 label을 더한 확장 타입.
// dropdown 하위 항목도 label이 포함된 형태로 좁힌다.
interface ResolvedMenuItem extends MenuItem {
  label: string;
  dropdown?: (MenuItem & { label: string })[];
}

/**
 * Navbar
 * 전역 상단 내비게이션 바를 렌더링하는 함수형 컴포넌트.
 * @returns {ReactElement} <nav> 루트의 내비게이션 UI
 * @remarks 부수효과: window scroll/mousedown 이벤트 리스너 등록/해제(useEffect),
 *          라우트 변경 감지, 로그아웃(signOut) 등 컨텍스트 호출.
 */
const Navbar = (): ReactElement => {
  // 스크롤이 50px을 넘었는지 여부(상단 고정 바 스타일 전환용)
  const [isScrolled, setIsScrolled] = useState(false);
  // 모바일(햄버거) 메뉴 열림 여부
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 현재 열려있는 드롭다운 메뉴의 인덱스(없으면 null)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  // 컬러 테마 선택 팝업(툴팁) 표시 여부
  const [showColorPicker, setShowColorPicker] = useState(false);
  // 사용자 메뉴 드롭다운 표시 여부
  const [showUserMenu, setShowUserMenu] = useState(false);
  // 검색 모달 표시 여부
  const [showSearch, setShowSearch] = useState(false);
  // 유저 메뉴 영역 참조 — 바깥 클릭 감지(outside click)에 사용
  const userMenuRef = useRef<HTMLDivElement>(null);
  // 현재 라우트 정보 — 변경 시 메뉴 자동 닫기 트리거로 사용
  const location = useLocation();
  // 테마 컨텍스트: 모드(light/dark/auto), 토글, 컬러 테마, 컬러 테마 변경 함수
  const { mode, toggleTheme, colorTheme, setColorTheme } = useTheme();
  // 언어 컨텍스트: 현재 언어, 언어 토글, 번역 함수 t
  const { language, toggleLanguage, t } = useLanguage();
  // 인증 컨텍스트: 로그인 여부, 관리자 여부, 프로필, 로그아웃 함수
  const { isLoggedIn, isAdmin, profile, signOut } = useAuth();

  // 스크롤 위치 감지: 50px 초과 시 navbar에 'scrolled' 스타일 적용.
  // 마운트 시 1회 리스너 등록, 언마운트 시 정리(cleanup)하여 누수 방지.
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 라우트(location) 변경 시 열려있던 모든 메뉴를 닫는다.
  // (페이지 이동 후에도 모바일/드롭다운/유저메뉴가 떠있는 것을 방지)
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setShowUserMenu(false);
  }, [location]);

  // 유저 메뉴 바깥 클릭(outside click) 감지: 메뉴 영역 밖을 누르면 닫는다.
  // mousedown 시점에 처리하고, 언마운트 시 리스너 정리.
  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      // ref 요소가 존재하고, 클릭 대상이 그 내부가 아니면 메뉴를 닫는다.
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * handleSignOut
   * 로그아웃을 수행하고 유저 메뉴를 닫는다.
   * @returns {Promise<void>}
   * @remarks 부수효과: 인증 컨텍스트의 signOut() 비동기 호출, showUserMenu 상태 변경.
   */
  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  // site.js 설정에서 메뉴 아이템을 읽고, labelKey를 t()로 변환
  // dropdown이 있으면 하위 항목도 동일하게 라벨을 번역하여 ResolvedMenuItem 형태로 만든다.
  const menuItems: ResolvedMenuItem[] = site.menuItems.map((item) => ({
    ...item,
    label: t(item.labelKey),
    dropdown: item.dropdown
      ? item.dropdown.map((sub) => ({ ...sub, label: t(sub.labelKey) }))
      : undefined
  }));

  /**
   * isActive
   * 주어진 메뉴 항목이 현재 경로에서 활성 상태인지 판정한다.
   * @param {ResolvedMenuItem} item - 판정할 메뉴 항목
   * @returns {boolean} 활성 여부
   * @remarks activePath가 있으면 우선 사용. 루트('/')는 정확 일치,
   *          그 외 경로는 startsWith로 하위 경로까지 활성 처리.
   */
  const isActive = (item: ResolvedMenuItem): boolean => {
    const checkPath = item.activePath || item.path;
    if (checkPath === '/') return location.pathname === '/';
    return location.pathname.startsWith(checkPath);
  };

  // 사용자 아바타에 표시할 이니셜: 표시명 > 이메일 순으로 첫 글자, 없으면 '?'를 대문자로.
  const userInitial = (profile?.display_name || profile?.email || '?')[0].toUpperCase();

  return (
    // 스크롤 상태에 따라 'scrolled' 클래스를 동적으로 부여
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-wrapper">
          {/* 로고: 클릭 시 홈으로 이동. 브랜드 텍스트는 설정의 parts 배열로 분할 렌더 */}
          <div className="logo">
            <Link to="/">
              <h1>
                {site.brand.parts.map((part, i) => (
                  <span key={i} className={part.className}>
                    {part.text}
                  </span>
                ))}
              </h1>
            </Link>
          </div>

          {/* 메인 메뉴: 모바일 메뉴 열림 시 'active'로 슬라이드인 표시 */}
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`${item.dropdown ? 'nav-item-dropdown' : ''} ${activeDropdown === index ? 'active' : ''}`}
                // 데스크탑 호버 시 드롭다운 열기/닫기(드롭다운이 있는 항목만)
                onMouseEnter={() => item.dropdown && setActiveDropdown(index)}
                onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  // 드롭다운이 있는 메뉴 항목
                  <>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item) ? 'active' : ''}`}
                      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                        // ≤1100px(햄버거 슬라이드인): 탭 시 드롭다운 토글
                        // 모바일에서는 페이지 이동을 막고(preventDefault) 드롭다운만 토글한다.
                        if (window.innerWidth <= 1100) {
                          e.preventDefault();
                          setActiveDropdown(activeDropdown === index ? null : index);
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                    {/* 하위 드롭다운 목록: 해당 인덱스가 활성일 때 'active' */}
                    <ul className={`dropdown-menu ${activeDropdown === index ? 'active' : ''}`}>
                      {item.dropdown.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link to={subItem.path}>{subItem.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  // 드롭다운이 없는 단일 링크 메뉴 항목
                  <Link to={item.path} className={`nav-link ${isActive(item) ? 'active' : ''}`}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* 우측 액션 영역: 검색/언어/컬러/테마/유저/햄버거 버튼 묶음 */}
          <div className="nav-actions">
            {/* 검색 기능이 켜진 경우에만 검색 버튼 노출 */}
            {site.features.search && (
              <button className="nav-search-btn" onClick={() => setShowSearch(true)} aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            {/* 언어 전환 버튼: 현재 ko면 'EN' 표기, 그 외엔 'KR' 표기 */}
            <button className="lang-switcher" onClick={toggleLanguage} aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}>
              {language === 'ko' ? 'EN' : 'KR'}
            </button>
            {/* 컬러 테마 선택 영역 */}
            <div className="color-picker-wrapper">
              <button
                className="color-picker-btn"
                // 클릭 시 컬러 피커 툴팁 열기/닫기 토글
                onClick={() => setShowColorPicker(!showColorPicker)}
                aria-label="Color theme"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r="2.5" style={{ fill: '#C8102E', stroke: 'none' }} />
                  <circle cx="17.5" cy="10.5" r="2.5" style={{ fill: '#C87200', stroke: 'none' }} />
                  <circle cx="8.5" cy="7.5" r="2.5" style={{ fill: '#00855A', stroke: 'none' }} />
                  <circle cx="6.5" cy="12" r="2.5" style={{ fill: '#0046C8', stroke: 'none' }} />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.24-.3-.39-.65-.39-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.5-9-10-9z" />
                </svg>
              </button>
              {/* 컬러 피커가 열렸을 때만 오버레이와 툴팁 렌더 */}
              {showColorPicker && (
                <>
                  {/* 오버레이 클릭 시 피커 닫기 */}
                  <div className="color-picker-overlay" onClick={() => setShowColorPicker(false)} />
                  <div className="color-picker-tooltip">
                    <div className="color-picker-arrow" />
                    {/* 설정의 컬러 목록을 점(dot) 버튼으로 나열, 현재 테마는 'active' */}
                    {site.colors.map((c) => (
                      <button
                        key={c.name}
                        className={`color-dot${colorTheme === c.name ? ' active' : ''}`}
                        style={{ background: c.color }}
                        // 컬러 선택 시 테마 변경 후 피커 닫기
                        onClick={() => { setColorTheme(c.name); setShowColorPicker(false); }}
                        aria-label={`${c.name} theme`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* 라이트/다크/오토 테마 토글 버튼. data-mode로 현재 모드 표시 */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="테마 전환" data-mode={mode}>
              {/* Light mode icon (sun) */}
              <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              {/* Dark mode icon (moon) */}
              <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              {/* Auto mode icon (sun+moon half) */}
              <svg className="auto-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" opacity="0.3" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              </svg>
            </button>
            {/* User Auth */}
            {/* 로그인 상태에 따라 유저 메뉴 또는 로그인 버튼 분기 */}
            {isLoggedIn ? (
              // 로그인 상태: 아바타 버튼 + 드롭다운(바깥 클릭 감지를 위해 ref 부착)
              <div className="nav-user-menu" ref={userMenuRef}>
                <button className="nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <span className="nav-user-avatar-placeholder">{userInitial}</span>
                </button>
                {/* 유저 메뉴가 열렸을 때만 드롭다운 렌더 */}
                {showUserMenu && (
                  <div className="nav-user-dropdown">
                    {/* 드롭다운 상단 사용자 정보 헤더(아바타 + 이름 + 이메일) */}
                    <div className="dropdown-user-header">
                      <span className="dropdown-user-avatar">{userInitial}</span>
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">{profile?.display_name || ''}</span>
                        <span className="dropdown-user-email">{profile?.email || ''}</span>
                      </div>
                    </div>
                    <div className="divider" />
                    {/* 마이페이지 링크 */}
                    <Link to="/mypage" className="dropdown-menu-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {t('auth.myPage')}
                    </Link>
                    {/* 관리자 권한(isAdmin)일 때만 관리자 페이지 링크 노출 */}
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
            {/* 모바일 햄버거 토글 버튼: 클릭 시 모바일 메뉴 열림/닫힘 전환 */}
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
      {/* 검색 기능이 켜진 경우에만 검색 모달을 마운트(표시 여부는 showSearch로 제어) */}
      {site.features.search && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
    </nav>
  );
};

export default Navbar;
