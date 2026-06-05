# 2026-06-05 — 프로젝트 관리(팀 게시판) 2차 고도화: 자료 링크 · 강사 피드백 · 자료 정리

## 배경
팀 프로젝트 협업 강화 요청. 기존 `/project-board`(팀별 비공개 게시판)에는 이미
카테고리(회의록/아이디어/자료/기타)·댓글·소스코드 첨부가 있었으나, 다음이 빠져 있었다.
1. **자료(링크) 공유** — "자료" 글도 본문 텍스트 + 코드뿐, 구글드라이브·노션·깃허브 같은 URL을
   클릭 가능한 형태로 공유할 방법이 없었음.
2. **강사 피드백 댓글** — 댓글 작성 RLS가 `auth.uid()=author_id AND 팀원`이라 강사(팀 비소속 관리자)는
   댓글을 못 달았고, UI도 `!isAdmin`으로 입력창을 숨겨 둠.
3. **자료 정리 안내** — 글이 쌓이면 산만해지나 정리 가이드/모아보기가 없었음.

## 변경

### DB — `supabase/team_board_resource_feedback_2026-06-05.sql` (Supabase SQL 에디터에서 1회 실행 필요)
- `rest_team_posts.link_url TEXT DEFAULT ''` 추가 — 자료 링크.
- `rest_team_comments.is_staff BOOLEAN DEFAULT false` 추가 — 강사 댓글 표시 플래그.
- 댓글 insert RLS 교체 — 팀원 **또는 관리자(ADMIN_EMAILS 7인)** 가 작성 가능하도록 OR 분기 추가.
  (`auth.uid()=author_id`는 유지해 작성자 위조 방지.)
- 댓글 select 정책은 팀원 + 주 강사 3계정으로 이미 열려 있어 피드백 흐름엔 충분(주석으로 명시).

### 유틸 — `src/utils/projectTeams.ts`
- `TeamPost.link_url`, `TeamComment.is_staff` 필드 추가.
- `createTeamPost(..., linkUrl='')`, `createTeamComment(..., isStaff=false)` 파라미터 추가.

### UI — `src/pages/ProjectBoard.tsx`
- **자료 링크 입력**: 새 글 폼에 `🔗 자료 링크(선택)` 칸 추가. 등록 시 함께 저장·초기화.
- **링크 카드 렌더**: 글에 `link_url`이 있으면 클릭 가능한 링크 카드(`🔗 … ↗`)로 표시. `safeUrl()`로
  `http(s)` 없으면 `https://` 보정.
- **자료 모아보기**: 링크가 있는 글을 모은 접이식 `📎 우리 팀 자료 모음(N)` 패널 — 제목+URL+열기.
- **강사 피드백 댓글**: 댓글 입력창의 `!isAdmin` 게이트 제거(관리자도 작성). 관리자가 달면
  `is_staff=true`로 저장되고, 댓글에 `👩‍🏫 강사` 배지 + 연한 노란 배경으로 강조. 버튼/플레이스홀더도
  관리자일 땐 "피드백"으로 표기.
- **정리 안내 카드**: 상단에 접이식 `📚 프로젝트 자료, 이렇게 정리하세요` 가이드(카테고리별 사용법·
  제목 컨벤션·링크/코드 첨부 안내·강사 피드백 설명).
- 페이지 헤더 안내 문구에 자료 링크·강사 피드백 언급 추가.

## 검증
- `npm run build` (tsc -b + vite build) 통과, 타입 에러 없음. `ProjectBoard` 청크 14.32 kB.

## 배포 메모
- **DB 마이그레이션 SQL을 Supabase에서 먼저 실행**해야 링크/강사 배지/관리자 댓글이 동작함
  (컬럼·RLS 미적용 시 등록은 되어도 링크/플래그가 비어 보일 수 있음).
- 프론트는 `npm run deploy`(gh-pages) 수동 배포.
