# 사이트 점검 보고서 — AI Reboot Academy LMS (rest)

- **점검일**: 2026-06-10
- **대상**: rest.dreamitbiz.com (React 19 + Vite 7 + TypeScript + Supabase)
- **배포**: GitHub Actions 자동배포(main push) → GitHub Pages
- **점검 범위**: 메인부터 전체 라우트·빌드·데이터 정합성·구현 예시·보안·코드 위생

---

## 1. 종합 요약
| 항목 | 상태 |
|---|---|
| 프로덕션 빌드 | ✅ 성공 (3.1s, 타입 에러 0) |
| 라우트/페이지 | ✅ 약 40개 라우트, 75개 페이지 컴포넌트 정상 |
| 프로젝트 섹션 정합성 | ✅ 팀번호 단일 소스 전 페이지 일치 |
| 구현 예시 앱 | ✅ project01~26 **26/26 HTTP 200** |
| 보안 | ✅ 하드코딩 키 없음, anon key + RLS |
| 코드 위생 | ✅ 양호 (console.log 1 · TODO 1 · any 2 파일) |
| 미해결/권고 | ⚠️ 번들 청크 크기, 유휴 레포 정리 |

**판정: 운영 가능(Production Ready).** 치명 결함 없음. 성능 최적화 권고 사항 일부.

---

## 2. 빌드 점검
- `npm run build` 성공, TypeScript(noUnusedLocals/Parameters strict) 에러 0.
- 코드 스플리팅 적용(페이지별 청크 분리).
- ⚠️ **대형 청크 경고(>500KB)**:
  - `Learning` 753.7 KB (gzip 237.8 KB) — 정규/사전/코칭 학습 데이터 방대
  - `xlsx` 429.2 KB (gzip 141.8 KB) — 성적 엑셀 내보내기 의존성
  - `index` 487.2 KB (gzip 145.0 KB)
- 권고: `manualChunks`로 vendor 분리, `xlsx`는 내보내기 시점 동적 import, Learning 데이터 라우트 분할.

## 3. 라우트·페이지 인벤토리
- 공개: `/`, `/about`, `/curriculum`, `/schedule`, `/competition`, `/resources`, `/announcements`, `/qna`
- 학습: `/learning/regular`, `/learning/prerequisite`, `/learning/coaching`
- 평가: `/assessment/diagnostic`, `/assessment/prerequisite`, `/assessment/summative`
- 프로젝트: `/project-vote`(팀구성), `/project-schedule`(일정), `/project-checklist`(수행점검), `/project-board`(게시판), `/project-padlets`(패들렛), `/project-submit`(산출물), `/project-guide`, `/projects/apps`(구현 예시)
- 대시보드/마이: `/dashboard`, `/classroom`, `/instructor`
- 관리자: `/admin`, `/admin/{roster,students,teams,attendance,grades,assignments,announcements,materials,projects}`
- **SEO**: SEOHead 43개 페이지 적용, 비공개 페이지 noindex 처리.

## 4. 프로젝트 섹션 정합성 (집중 점검)
- **번호 단일 소스**: `boardOrder.ts`(23개) = `TEAM_PROJECTS`(id 1~23) = `buildTeamNumbers(주제→번호)`. 팀구성·수행점검·게시판·패들렛·산출물·구현예시·관리자 팀편성 **전 페이지 동일 번호·번호순 정렬** 확인.
- **강사 최종 확정**: `rest_settings.project_vote_locked = true` (확정 잠금 활성). 팀원/팀장 신청·수정·삭제 잠금. 아이디어 제안은 검토용으로 분리.
- **데이터 정리 완료**: 변형 중복(부모복지 3건→1건), 잔여 한국사 팀 삭제, 문화재 2번→취업자격증 교체, 밀려도 23번 재등록 — 전수 점검 0행.
- **구현 예시 매칭**: `REPO_BY_BOARD`로 보드 1~23 전부 콘텐츠 일치 레포 연결. 유휴 레포 4개(06·07·08·11) 하단 별도 섹션 분리.

## 5. 구현 예시 앱 (project01~26)
- **26개 전부 HTTP 200** (github.io/projectNN). Vite+React+TS, GitHub Actions 자동배포, Pages build_type=workflow.
- 6/5 생성(01~17) + 6/9 신규(18~26). 각 앱: 인터랙티브 데모 + 정보/팀 탭 + OpenAI(선택) 연동.
- 콘텐츠 기반 연결로 번호 재정렬 영향 해소. 팀이 자체 배포 주소(demo_url) 제출 시 우선 연결.

## 6. 보안 점검
- ✅ 하드코딩 비밀키 없음. 노출된 `eyJ...`/`service_role` 문자열은 **학습 콘텐츠·주석**(경고 예시)으로 확인.
- ✅ 클라이언트는 anon key만 사용 — RLS로 보호. service_role 미사용.
- ✅ OpenAI 키는 각 구현 예시 앱에서 사용자가 입력(localStorage), 서버 미전송.
- ✅ 관리자 라우트 AuthGuard/역할 분기.

## 7. 코드 위생
- console.log/debug: 1개 파일 · TODO/FIXME: 1개 파일 · `any`/`as any`: 2개 파일 → **매우 양호**.
- Git: 클린 상태, 최신 커밋 `f52cbe0`.

## 8. 발견 이슈 및 권고
| 우선순위 | 이슈 | 권고 |
|---|---|---|
| 중 | Learning/xlsx/index 청크 >500KB | manualChunks·동적 import로 초기 로드 경감 |
| 하 | 유휴 레포 4개(06·07·08·11) | 아카이브 토픽 지정 또는 README 안내(갤러리 분리는 완료) |
| 하 | `any` 2파일, console.log 1 | 점진 정리 |
| 정보 | OpenAI 키 사용자 입력 방식 | 공개 배포에 적절(키 미박제) — 유지 |

---

## 9. 결론
전체 라우트·빌드·데이터 정합성·배포가 **정상 동작**하며, 프로젝트 팀구성→발표 흐름과 26개 구현 예시가 일관되게 연결됨. **운영에 지장 없는 상태**이며, 성능(번들 분할)만 후속 개선 권고.

— 점검: Claude Opus 4.8 · 2026-06-10
