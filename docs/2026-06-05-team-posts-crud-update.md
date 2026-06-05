# 2026-06-05 — 팀 게시글 CRUD 완성(수정 추가) + 관리자 글 작성 허용

## 배경
배포 후 점검 중 두 가지 확인:
1. 팀 게시글에 **수정(Update)** 기능이 없어 CRUD가 아닌 **CRD**만 됨 (오타·내용 변경 시 삭제 후 재작성해야 함).
2. **관리자 화면에 "글쓰기" 폼이 안 보임** — 새 글 폼이 `{!isAdmin && ...}`로 관리자에게 숨겨져 있었고,
   `rest_team_posts` INSERT RLS도 "팀원만" 허용이라 관리자는 폼을 열어도 저장 불가였음.

## 변경

### DB — `supabase/team_posts_update_admin_2026-06-05.sql` (Supabase SQL 에디터에서 1회 실행 필요)
- `rest_team_posts` **UPDATE RLS 신설** — 작성자 본인 또는 관리자(ADMIN_EMAILS 7인).
- `rest_team_posts` **INSERT RLS 교체** — 팀원 **또는 관리자**가 작성 가능(OR 분기 추가).

### 유틸 — `src/utils/projectTeams.ts`
- `TeamPostEdit` 타입 + `updateTeamPost(postId, patch)` 추가 (title/content/category/code/link_url 수정).

### UI — `src/pages/ProjectBoard.tsx`
- 글 카드에 **수정** 버튼 추가(작성자·관리자) → 인라인 수정 폼(카테고리/제목/내용/링크/코드 + 저장·취소).
- 새 글 작성 폼의 `!isAdmin` 게이트 제거 → **관리자도 글 작성 가능**(폼 제목 "새 글 작성 (관리자)").

## 검증
- `npm run build` 통과. ProjectBoard 청크 16.57 kB.

## 배포 메모
- **SQL을 먼저 실행**해야 관리자 글 작성/수정이 동작함(미적용 시 RLS로 저장·수정 거부).
- 프론트는 `npm run deploy`(gh-pages).
