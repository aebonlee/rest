/**
 * 사이트 설정 파일 — rest.dreamitbiz.com
 * 쉬었음청년 AI교육 LMS 사이트
 *
 * [역할/책임]
 * - 이 LMS 인스턴스 전반에서 사용하는 단일 사이트 설정(SiteConfig)을 정의한다.
 * - 브랜드명/메타 정보, 회사(사업자) 정보, 기능 플래그(features),
 *   상단 네비게이션 메뉴(menuItems), 푸터 링크, 패밀리 사이트 목록 등을
 *   한 곳에 모아 컴포넌트들이 import 해서 참조하도록 한다.
 * - 멀티 사이트 베이스 코드(rest 기반)에서 사이트마다 이 파일만 교체하면
 *   동일 코드로 서로 다른 브랜드/메뉴/DB 접두사를 운영할 수 있게 한다.
 *
 * [주요 export]
 * - default export `site`: SiteConfig 타입의 사이트 전역 설정 객체.
 */

// SiteConfig 타입 정의를 가져와 아래 site 객체의 구조/타입을 강제한다.
import type { SiteConfig } from '../types';

// 사이트 전역 설정 객체. 타입 주석(: SiteConfig)으로 누락/오타 필드를 컴파일 단계에서 차단한다.
const site: SiteConfig = {
  id: 'rest',                                   // 사이트 식별자(내부 키). 여러 사이트 구분에 사용.
  name: 'AI Reboot Academy',                    // 영문 사이트명(메타/타이틀 등)
  nameKo: '쉬었음청년 AI교육',                   // 한글 사이트명(UI 노출용)
  description: '쉬었음청년 대상 AI·바이브코딩 교육과정 - AI 리부트 경진대회 준비', // 메타 설명(SEO/OG)
  url: 'https://rest.dreamitbiz.com',           // 서비스 정식 URL(절대 경로 생성·canonical 등에 사용)
  dbPrefix: 'rest_',                            // Supabase 테이블 접두사. 사이트별 데이터 격리/RLS 정책의 네이밍 기준.
  // 상위(모회사) 사이트 정보 — 푸터/브랜드 연결 등에 사용
  parentSite: {
    name: 'DreamIT Biz',
    url: 'https://www.dreamitbiz.com'
  },
  // 브랜드 로고 텍스트 구성. parts 배열을 순서대로 렌더링하며 part마다 스타일 클래스를 분리 적용한다.
  brand: {
    parts: [
      { text: 'AI ', className: 'brand-dream' }, // 앞부분 'AI ' (className으로 색/굵기 분리)
      { text: 'Reboot', className: 'brand-it' }  // 뒷부분 'Reboot'
    ]
  },
  themeColor: '#0046C8',                         // 테마 메인 컬러(브라우저 테마/포인트 컬러)
  // 사업자(법적) 정보 — 푸터/약관/사업자 표기에 사용
  company: {
    name: '드림아이티비즈(DreamIT Biz)',
    ceo: '이애본',
    bizNumber: '601-45-20154',                   // 사업자등록번호
    salesNumber: '제2024-수원팔달-0584호',        // 통신판매업 신고번호
    address: '경기도 수원시 팔달구 매산로 45, 419호',
    email: 'aebon@dreamitbiz.com',
    phone: '010-3700-0629',
    kakao: 'aebon',                              // 카카오 채널/ID
    businessHours: '평일: 09:00 ~ 18:00',
  },
  // 기능 플래그 — UI/라우트의 on/off를 전역 제어한다. 사이트마다 켜고 끌 수 있다.
  features: {
    shop: false,                                 // 쇼핑/결제 기능 비활성
    community: true,                             // 커뮤니티(게시판) 활성
    search: true,                               // 검색 기능 활성
    auth: true,                                 // 로그인/인증 활성(Supabase Auth + RLS 전제)
    license: false,                            // 라이선스/수료증 발급 기능 비활성
  },
  // 사이트에서 사용 가능한 색상 팔레트(테마/태그 색 선택 등). name은 식별자, color는 HEX 값.
  colors: [
    { name: 'blue', color: '#0046C8' },
    { name: 'red', color: '#C8102E' },
    { name: 'green', color: '#00855A' },
    { name: 'purple', color: '#6B21A8' },
    { name: 'orange', color: '#C87200' },
  ],
  // 상단 네비게이션 메뉴 정의.
  // - labelKey: i18n 번역 키(실제 텍스트는 번역 리소스에서 조회)
  // - path: 클릭 시 이동 경로(드롭다운 부모는 대표 경로)
  // - activePath: 현재 경로가 이 값으로 시작하면 메뉴를 '활성' 표시(부모 메뉴 강조용)
  // - dropdown: 하위 메뉴 목록(있으면 펼침 메뉴)
  menuItems: [
    {
      labelKey: 'site.nav.about',
      path: '/about',
      activePath: '/about',                      // /about 하위 어디에 있어도 부모 활성 처리
      dropdown: [
        { path: '/about', labelKey: 'nav.about' },
        { path: '/classroom', labelKey: 'site.nav.classroom' },
        { path: '/curriculum', labelKey: 'site.nav.curriculum' },
        { path: '/schedule', labelKey: 'site.nav.schedule' },
        { path: '/instructor', labelKey: 'site.nav.instructor' },
      ]
    },
    // 드롭다운 없는 단일 링크 메뉴(학습 카테고리). activePath 생략 시 path 기준으로 활성 판정.
    { path: '/learning/prerequisite', labelKey: 'site.nav.prerequisite' },
    { path: '/learning/regular', labelKey: 'site.nav.regular' },
    { path: '/learning/coaching', labelKey: 'site.nav.coaching' },
    {
      labelKey: 'site.nav.assessment',
      path: '/assessment/prerequisite',          // 부모 클릭 시 대표(첫) 하위로 이동
      activePath: '/assessment',                 // /assessment/* 전체에서 부모 활성
      dropdown: [
        { path: '/assessment/prerequisite', labelKey: 'site.nav.assessmentPre' },
        { path: '/assessment/diagnostic', labelKey: 'site.nav.assessmentDiag' },
        { path: '/assessment/summative', labelKey: 'site.nav.assessmentSum' },
      ]
    },
    { path: '/competition', labelKey: 'site.nav.competition' },
    {
      labelKey: 'site.nav.project',
      path: '/project-guide',                    // 대표 경로는 /project-guide 이지만
      activePath: '/project',                    // 활성 판정은 /project 접두사 전체로 넓게 잡음
      dropdown: [
        { path: '/project-guide', labelKey: 'site.nav.projectIntro' },
        { path: '/project-vote', labelKey: 'site.nav.projectVote' },
        { path: '/project-board', labelKey: 'site.nav.projectBoard' },
        { path: '/projects/apps', labelKey: 'site.nav.projectApps' },
      ]
    },
    { path: '/resources', labelKey: 'site.nav.resources' },
    {
      labelKey: 'site.nav.lms',
      path: '/dashboard',
      activePath: '/dashboard',
      // LMS 영역 하위 메뉴 — 로그인(auth) 사용자가 접근하는 학습 관리 화면들.
      // 각 화면 데이터는 dbPrefix(rest_) 테이블 + RLS 정책으로 접근 제어됨을 전제.
      dropdown: [
        { path: '/dashboard', labelKey: 'site.nav.dashboard' },
        { path: '/announcements', labelKey: 'site.nav.announcements' },
        { path: '/materials', labelKey: 'site.nav.materials' },
        { path: '/assignments', labelKey: 'site.nav.assignments' },
        { path: '/qna', labelKey: 'site.nav.qna' },
      ]
    },
  ],
  // 푸터에 노출할 빠른 링크 목록(상단 메뉴 중 일부를 재노출).
  footerLinks: [
    { path: '/curriculum', labelKey: 'site.nav.curriculum' },
    { path: '/schedule', labelKey: 'site.nav.schedule' },
    { path: '/instructor', labelKey: 'site.nav.instructor' },
    { path: '/resources', labelKey: 'site.nav.resources' },
  ],
  // 패밀리 사이트(외부 형제 서비스) 목록 — 푸터의 사이트 모음/링크에 사용.
  familySites: [
    { name: 'DreamIT Biz (본사이트)', url: 'https://www.dreamitbiz.com' },
    { name: 'AI 프롬프트 엔지니어링', url: 'https://ai-prompt.dreamitbiz.com' },
    { name: 'ChatGPT 학습', url: 'https://chatgpt.dreamitbiz.com' },
    { name: '바이브코딩', url: 'https://vibe.dreamitbiz.com' },
  ]
};

// 사이트 전역 설정을 기본 export — 앱 전반에서 import site from '...' 형태로 사용한다.
export default site;
