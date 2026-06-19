/**
 * 사이트 설정 파일 — rest.dreamitbiz.com
 * 쉬었음청년 AI교육 LMS 사이트
 *
 * [이 파일을 처음 보는 사람을 위한 큰 그림]
 * - 이 파일은 "설정 파일(config)"입니다. 화면을 그리는 코드가 아니라,
 *   사이트 곳곳에서 공통으로 쓰는 값(이름, 회사 정보, 메뉴 구성 등)을
 *   한 군데 모아 두는 '데이터 모음집'입니다.
 * - 코드 중간중간에 같은 값을 반복해서 적는 대신, 여기 한 곳만 고치면
 *   사이트 전체에 반영되도록 하는 것이 목적입니다. (DRY 원칙: 중복을 줄이자)
 *
 * [초보자가 알아둘 용어]
 * - LMS: Learning Management System(학습 관리 시스템). 강의/과제/공지 등을 다루는 사이트.
 * - Supabase: 데이터베이스와 로그인 기능을 제공하는 백엔드 서비스(우리 DB가 여기에 있음).
 * - RLS(Row Level Security): "행 단위 보안". 로그인한 사용자가 자기 데이터만 볼 수 있게
 *   데이터베이스가 자동으로 걸러주는 보안 규칙. (예: 내 과제만 조회 가능)
 * - i18n: internationalization(국제화)의 줄임말. 글자를 코드에 직접 쓰지 않고
 *   '번역 키'만 두면, 언어 설정에 따라 실제 문구로 바꿔주는 방식.
 *
 * [역할/책임]
 * - 이 LMS 인스턴스 전반에서 사용하는 단일 사이트 설정(SiteConfig)을 정의한다.
 * - 브랜드명/메타 정보, 회사(사업자) 정보, 기능 플래그(features),
 *   상단 네비게이션 메뉴(menuItems), 푸터 링크, 패밀리 사이트 목록 등을
 *   한 곳에 모아 컴포넌트들이 import 해서 참조하도록 한다.
 * - 멀티 사이트 베이스 코드(rest 기반)에서 사이트마다 이 파일만 교체하면
 *   동일 코드로 서로 다른 브랜드/메뉴/DB 접두사를 운영할 수 있게 한다.
 *   (즉, 화면 코드는 그대로 두고 이 '설정'만 바꿔 다른 사이트를 만든다.)
 *
 * [주요 export]
 * - default export `site`: SiteConfig 타입의 사이트 전역 설정 객체.
 *   (export = "이 파일 밖에서도 쓸 수 있게 내보낸다"는 뜻)
 */

// SiteConfig 타입 정의를 가져와 아래 site 객체의 구조/타입을 강제한다.
// 개념: TypeScript의 'type'은 "이 객체는 어떤 모양이어야 한다"는 설계도입니다.
//       'import type'은 "타입(설계도)만 가져온다"는 표시로, 실행 코드에는 영향을 주지 않습니다.
// 주의: 경로 '../types'는 이 파일(config 폴더) 기준으로 한 단계 위(src) 폴더의 types를 가리킵니다.
import type { SiteConfig } from '../types';

// 사이트 전역 설정 객체. 타입 주석(: SiteConfig)으로 누락/오타 필드를 컴파일 단계에서 차단한다.
// 개념: 'const'는 다시 대입할 수 없는 변수(상수)를 만든다는 뜻입니다.
//       ': SiteConfig'는 "이 객체는 SiteConfig 설계도를 따라야 한다"는 약속이라,
//       필드 이름을 잘못 쓰거나 빠뜨리면 코드를 실행하기도 전에 빨간 줄(에러)로 알려줍니다.
const site: SiteConfig = {
  id: 'rest',                                   // 사이트 식별자(내부 키). 여러 사이트 구분에 사용.
  name: 'AI Reboot Academy',                    // 영문 사이트명(메타/타이틀 등)
  nameKo: '쉬었음청년 AI교육',                   // 한글 사이트명(UI 노출용)
  description: '쉬었음청년 대상 AI·바이브코딩 교육과정 - AI 리부트 경진대회 준비', // 메타 설명(SEO/OG)
  // SEO: 검색엔진 최적화. OG: Open Graph(카톡/페북에 링크 공유할 때 뜨는 미리보기 정보).
  url: 'https://rest.dreamitbiz.com',           // 서비스 정식 URL(절대 경로 생성·canonical 등에 사용)
  // canonical: "이 페이지의 대표 주소"를 검색엔진에 알려주는 표준 URL.
  dbPrefix: 'rest_',                            // Supabase 테이블 접두사. 사이트별 데이터 격리/RLS 정책의 네이밍 기준.
  // 풀어 설명: 한 데이터베이스를 여러 사이트가 공유할 때, 표 이름 앞에 'rest_'를 붙여서
  //           (예: rest_users) 사이트끼리 데이터가 섞이지 않게 구분합니다.
  // 상위(모회사) 사이트 정보 — 푸터/브랜드 연결 등에 사용
  parentSite: {
    name: 'DreamIT Biz',
    url: 'https://www.dreamitbiz.com'
  },
  // 브랜드 로고 텍스트 구성. parts 배열을 순서대로 렌더링하며 part마다 스타일 클래스를 분리 적용한다.
  // 왜 쪼갰나: 'AI '와 'Reboot'에 서로 다른 색/굵기를 주려고 두 조각으로 나눴습니다.
  //          (한 덩어리 문자열로는 부분마다 다른 스타일을 줄 수 없기 때문)
  brand: {
    parts: [
      { text: 'AI ', className: 'brand-dream' }, // 앞부분 'AI ' (className으로 색/굵기 분리)
      { text: 'Reboot', className: 'brand-it' }  // 뒷부분 'Reboot'
      // className: CSS에서 스타일을 찾아 적용하기 위한 '이름표'. 실제 색상은 CSS 파일에 정의됨.
    ]
  },
  themeColor: '#0046C8',                         // 테마 메인 컬러(브라우저 테마/포인트 컬러)
  // '#0046C8'은 HEX 색상 코드(빨강R/초록G/파랑B를 16진수로 표현). 여기서는 파란색.
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
  // 개념: '플래그(flag)'는 true/false로 기능을 켜고 끄는 스위치입니다.
  //       코드를 지우지 않고도 false로만 바꾸면 해당 기능이 화면에서 사라지게 만들 수 있습니다.
  features: {
    shop: false,                                 // 쇼핑/결제 기능 비활성
    community: true,                             // 커뮤니티(게시판) 활성
    search: true,                               // 검색 기능 활성
    auth: true,                                 // 로그인/인증 활성(Supabase Auth + RLS 전제)
    // auth가 true라는 건: 로그인 기능을 켰고, 위에서 설명한 RLS 보안 규칙으로 데이터 접근을 막는다는 뜻.
    license: false,                            // 라이선스/수료증 발급 기능 비활성
  },
  // 사이트에서 사용 가능한 색상 팔레트(테마/태그 색 선택 등). name은 식별자, color는 HEX 값.
  // 개념: 대괄호 [ ]는 '배열'(여러 항목을 순서대로 담는 목록)입니다. 항목마다 { } 객체가 들어 있습니다.
  colors: [
    { name: 'blue', color: '#0046C8' },
    { name: 'red', color: '#C8102E' },
    { name: 'green', color: '#00855A' },
    { name: 'purple', color: '#6B21A8' },
    { name: 'orange', color: '#C87200' },
  ],
  // 상단 네비게이션 메뉴 정의.
  // - labelKey: i18n 번역 키(실제 텍스트는 번역 리소스에서 조회)
  //   주의: 여기 적힌 'site.nav.about' 같은 값은 화면에 그대로 뜨는 글자가 아니라,
  //         번역 파일에서 진짜 문구를 찾아오는 '열쇠'입니다. (예: 'site.nav.about' → "교육소개")
  // - path: 클릭 시 이동 경로(드롭다운 부모는 대표 경로)
  // - activePath: 현재 경로가 이 값으로 시작하면 메뉴를 '활성' 표시(부모 메뉴 강조용)
  //   풀어 설명: 지금 보고 있는 페이지 주소가 activePath로 '시작'하면 그 메뉴를 강조(밑줄/색)합니다.
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
    // 즉, 펼침 메뉴가 필요 없는 항목은 dropdown/activePath 없이 path와 labelKey만 둡니다.
    { path: '/learning/prerequisite', labelKey: 'site.nav.prerequisite' },
    { path: '/learning/regular', labelKey: 'site.nav.regular' },
    { path: '/learning/coaching', labelKey: 'site.nav.coaching' },
    {
      labelKey: 'site.nav.assessment',
      path: '/assessment/prerequisite',          // 부모 클릭 시 대표(첫) 하위로 이동
      activePath: '/assessment',                 // /assessment/* 전체에서 부모 활성
      // 주의: path와 activePath가 다른 이유 — 클릭하면 첫 번째 하위 화면으로 보내되(path),
      //       /assessment로 시작하는 어떤 하위 페이지에 있든 부모 메뉴를 강조하려는 것(activePath).
      dropdown: [
        { path: '/assessment/prerequisite', labelKey: 'site.nav.assessmentPre' },
        { path: '/assessment/diagnostic', labelKey: 'site.nav.assessmentDiag' },
        { path: '/assessment/summative', labelKey: 'site.nav.assessmentSum' },
      ]
    },
    {
      labelKey: 'site.nav.competition',
      path: '/competition',                      // 부모 클릭 시 경진대회 안내로 이동
      activePath: '/competition',                // /competition/* 전체에서 부모 활성
      dropdown: [
        { path: '/competition', labelKey: 'site.nav.competitionInfo' },
        { path: '/competition/pre-eval', labelKey: 'site.nav.competitionPreEval' },
        { path: '/competition/eval-summary', labelKey: 'site.nav.competitionEvalSummary' },
        { path: '/competition/result', labelKey: 'site.nav.competitionResult' },
      ]
    },
    {
      labelKey: 'site.nav.project',
      path: '/project-guide',                    // 대표 경로는 /project-guide 이지만
      activePath: '/project',                    // 활성 판정은 /project 접두사 전체로 넓게 잡음
      // 풀어 설명: activePath가 '/project'이므로 '/project-guide', '/project-vote',
      //           '/project-board', '/projects/apps' 처럼 /project로 시작하는 주소 모두에서 부모가 활성화됩니다.
      dropdown: [
        // [참고·예시] 그룹
        { path: '/project-guide', labelKey: 'site.nav.projectIntro' },
        { path: '/projects/apps', labelKey: 'site.nav.projectApps' },
        // [팀 활동] 그룹 — 라이프사이클 순서(팀구성 → 일정 → 점검 → 평가 → 협업 → 패들렛 → 제출 → 결과)
        { divider: true, labelKey: 'site.nav.teamActivities' },
        { path: '/project-vote', labelKey: 'site.nav.projectVote' },
        { path: '/project-schedule', labelKey: 'site.nav.projectTimeline' },
        { path: '/project-checklist', labelKey: 'site.nav.projectChecklist' },
        { path: '/project-board', labelKey: 'site.nav.projectBoard' },
        { path: '/project-padlets', labelKey: 'site.nav.projectPadlets' },
        { path: '/project-submit', labelKey: 'site.nav.projectSubmit' },
      ]
    },
    // 개인별 PBL활동 — 단일 링크(드롭다운 없음). className으로 자간·여백을 별도 조정한다.
    { path: '/pbl', activePath: '/pbl', labelKey: 'site.nav.pbl', className: 'nav-link-pbl' },
    { path: '/resources', labelKey: 'site.nav.resources' },
    {
      labelKey: 'site.nav.lms',
      path: '/dashboard',
      activePath: '/dashboard',
      // LMS 영역 하위 메뉴 — 로그인(auth) 사용자가 접근하는 학습 관리 화면들.
      // 각 화면 데이터는 dbPrefix(rest_) 테이블 + RLS 정책으로 접근 제어됨을 전제.
      // 다시 정리: 위 features.auth가 true이고, 이 메뉴들은 로그인한 사람만 자기 데이터를 보도록
      //          데이터베이스의 RLS 규칙이 보호합니다. (예: 남의 과제는 못 봄)
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
  // 푸터(footer): 페이지 맨 아래 영역. 여기서는 자주 쓰는 메뉴 몇 개를 다시 보여줍니다.
  footerLinks: [
    // 학습 3개 과정(핵심 콘텐츠) — 상단 메뉴와 동일 경로로 푸터에서도 바로 진입
    { path: '/learning/prerequisite', labelKey: 'site.nav.prerequisite' },
    { path: '/learning/regular', labelKey: 'site.nav.regular' },
    { path: '/learning/coaching', labelKey: 'site.nav.coaching' },
    // 안내·정보 페이지
    { path: '/curriculum', labelKey: 'site.nav.curriculum' },
    { path: '/schedule', labelKey: 'site.nav.schedule' },
    { path: '/resources', labelKey: 'site.nav.resources' },
  ],
  // 패밀리 사이트(외부 형제 서비스) 목록 — 푸터의 사이트 모음/링크에 사용.
  // '패밀리 사이트'는 같은 회사가 운영하는 다른 서비스들로, 서로 링크를 걸어 줍니다.
  familySites: [
    { name: 'DreamIT Biz (본사이트)', url: 'https://www.dreamitbiz.com' },
    { name: 'AI 프롬프트 엔지니어링', url: 'https://ai-prompt.dreamitbiz.com' },
    { name: 'ChatGPT 학습', url: 'https://chatgpt.dreamitbiz.com' },
    { name: '바이브코딩', url: 'https://vibe.dreamitbiz.com' },
  ]
};

// 사이트 전역 설정을 기본 export — 앱 전반에서 import site from '...' 형태로 사용한다.
// 개념: 'export default'는 이 파일의 '대표 결과물'을 하나 내보낸다는 뜻입니다.
//       그래서 다른 파일에서 가져올 때 { } 중괄호 없이 원하는 이름으로 받을 수 있습니다.
//       예: import site from '@/config/site';  (받는 쪽 이름은 자유)
export default site;
