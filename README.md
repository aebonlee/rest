# AI Reboot Academy | 쉬었음청년 AI교육

> 쉬었음청년 대상 AI·바이브코딩 교육과정 LMS 사이트

**https://rest.dreamitbiz.com**

## Overview

쉬었음청년을 위한 AI 기술과 바이브코딩 교육과정을 운영하는 학습관리시스템(LMS)입니다.
6/1~6/22 총 80시간(선수과정 20H + 정규과정DT 52H + 기술코칭 8H) 교육을 통해
AI 리부트 경진대회 출품을 목표로 합니다.

## Tech Stack

- **Frontend**: React 19 + Vite 7 + TypeScript 5.8
- **Backend**: Supabase (DB prefix: `rest_`)
- **Auth**: Google OAuth + Kakao OAuth + Email
- **Deploy**: GitHub Pages (`gh-pages`)
- **Theme**: Dark Navy Blue (#0D2B5E), 5 color themes, Dark/Light mode

## Features

### Public Pages
- **Home** — 과정 개요, 핵심 정보, CTA
- **Curriculum** — 3단계 커리큘럼 상세 (선수/정규/기술코칭)
- **Schedule** — 6/1~6/22 일자별 일정표
- **Competition** — AI 리부트 경진대회 안내
- **Resources** — AI 도구, LLM 가이드, 참고자료

### Student LMS (Login Required)
- **Dashboard** — 출석/과제/진도 통계, 최근 공지
- **Materials** — 학습자료 다운로드 (카테고리 필터)
- **Assignments** — 과제 목록 및 제출/채점
- **Teams** — 팀 구성 및 팀원 정보
- **Projects** — 프로젝트 현황 (개인미니/팀미니/실전)
- **Q&A** — 질의응답 게시판

### Admin Panel
- 수강생 관리, 자료 업로드, 과제 출제/채점
- 출석 관리, 공지사항, 팀 편성, 프로젝트 관리

## Curriculum

| 과정 | 시간 | 내용 |
|------|------|------|
| 선수과정 | 20H (4일) | AI 기초, ChatGPT, Gemini, Solar, 웹 기초 |
| 정규과정 DT | 52H (13일) | AI 자동화, 프롬프트, 바이브코딩, 프로젝트 구현 |
| 기술코칭 | 8H (4회) | 1:1/팀 기술 코칭, 코드리뷰 |

## Supabase Tables

9개 테이블 (`rest_` prefix): announcements, materials, assignments, submissions, attendance, teams, projects, qna, resources

SQL: `supabase/rest_tables.sql`

## Development

```bash
# Install
npm install

# Dev server (port 5174)
npm run dev

# Type check
npm run typecheck

# Build
npm run build

# Deploy
npm run deploy
```

## Project Structure

```
src/
├── config/         # site.ts, curriculum.ts, admin.ts
├── components/     # Navbar, Footer, AuthGuard, AdminGuard, AdminSidebar
├── contexts/       # Auth, Theme, Language, Toast
├── hooks/          # useIdleTimeout
├── layouts/        # PublicLayout (routing)
├── pages/          # 25 pages (5 public + 4 auth + 8 student + 8 admin)
├── styles/         # 14 CSS files (base, site, admin, dark-mode, responsive...)
├── types/          # TypeScript interfaces
└── utils/          # supabase, auth, translations, notifications
```

## License

Private - DreamIT Biz
