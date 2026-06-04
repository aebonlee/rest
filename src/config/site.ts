/**
 * 사이트 설정 파일 — rest.dreamitbiz.com
 * 쉬었음청년 AI교육 LMS 사이트
 */

import type { SiteConfig } from '../types';

const site: SiteConfig = {
  id: 'rest',
  name: 'AI Reboot Academy',
  nameKo: '쉬었음청년 AI교육',
  description: '쉬었음청년 대상 AI·바이브코딩 교육과정 - AI 리부트 경진대회 준비',
  url: 'https://rest.dreamitbiz.com',
  dbPrefix: 'rest_',
  parentSite: {
    name: 'DreamIT Biz',
    url: 'https://www.dreamitbiz.com'
  },
  brand: {
    parts: [
      { text: 'AI ', className: 'brand-dream' },
      { text: 'Reboot', className: 'brand-it' }
    ]
  },
  themeColor: '#0046C8',
  company: {
    name: '드림아이티비즈(DreamIT Biz)',
    ceo: '이애본',
    bizNumber: '601-45-20154',
    salesNumber: '제2024-수원팔달-0584호',
    address: '경기도 수원시 팔달구 매산로 45, 419호',
    email: 'aebon@dreamitbiz.com',
    phone: '010-3700-0629',
    kakao: 'aebon',
    businessHours: '평일: 09:00 ~ 18:00',
  },
  features: {
    shop: false,
    community: true,
    search: true,
    auth: true,
    license: false,
  },
  colors: [
    { name: 'blue', color: '#0046C8' },
    { name: 'red', color: '#C8102E' },
    { name: 'green', color: '#00855A' },
    { name: 'purple', color: '#6B21A8' },
    { name: 'orange', color: '#C87200' },
  ],
  menuItems: [
    {
      labelKey: 'site.nav.about',
      path: '/about',
      activePath: '/about',
      dropdown: [
        { path: '/about', labelKey: 'nav.about' },
        { path: '/classroom', labelKey: 'site.nav.classroom' },
        { path: '/curriculum', labelKey: 'site.nav.curriculum' },
        { path: '/schedule', labelKey: 'site.nav.schedule' },
        { path: '/instructor', labelKey: 'site.nav.instructor' },
      ]
    },
    { path: '/learning/prerequisite', labelKey: 'site.nav.prerequisite' },
    { path: '/learning/regular', labelKey: 'site.nav.regular' },
    { path: '/learning/coaching', labelKey: 'site.nav.coaching' },
    {
      labelKey: 'site.nav.assessment',
      path: '/assessment/prerequisite',
      activePath: '/assessment',
      dropdown: [
        { path: '/assessment/prerequisite', labelKey: 'site.nav.assessmentPre' },
        { path: '/assessment/diagnostic', labelKey: 'site.nav.assessmentDiag' },
        { path: '/assessment/summative', labelKey: 'site.nav.assessmentSum' },
      ]
    },
    { path: '/competition', labelKey: 'site.nav.competition' },
    {
      labelKey: 'site.nav.project',
      path: '/project-guide',
      activePath: '/project',
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
      dropdown: [
        { path: '/dashboard', labelKey: 'site.nav.dashboard' },
        { path: '/announcements', labelKey: 'site.nav.announcements' },
        { path: '/materials', labelKey: 'site.nav.materials' },
        { path: '/assignments', labelKey: 'site.nav.assignments' },
        { path: '/qna', labelKey: 'site.nav.qna' },
      ]
    },
  ],
  footerLinks: [
    { path: '/curriculum', labelKey: 'site.nav.curriculum' },
    { path: '/schedule', labelKey: 'site.nav.schedule' },
    { path: '/instructor', labelKey: 'site.nav.instructor' },
    { path: '/resources', labelKey: 'site.nav.resources' },
  ],
  familySites: [
    { name: 'DreamIT Biz (본사이트)', url: 'https://www.dreamitbiz.com' },
    { name: 'AI 프롬프트 엔지니어링', url: 'https://ai-prompt.dreamitbiz.com' },
    { name: 'ChatGPT 학습', url: 'https://chatgpt.dreamitbiz.com' },
    { name: '바이브코딩', url: 'https://vibe.dreamitbiz.com' },
  ]
};

export default site;
