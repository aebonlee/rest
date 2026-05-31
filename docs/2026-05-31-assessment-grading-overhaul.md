# 학습평가 개편 + 성적 Supabase 연동 (2026-05-31)

## 1. 작업 개요
- **사이트**: rest.dreamitbiz.com (AI Reboot Academy)
- **GitHub**: https://github.com/aebonlee/rest
- **목적**:
  1. 선수/사후 평가를 **각 20문항 채점형**으로 재편하고 성적을 Supabase에 저장
  2. 진단평가는 **사후평가 전 자습용 오픈 문제 50개**(정답·해설 상시 공개, 채점 없음)로 전환
  3. 학생 대시보드 + 관리자 화면에 **성적 연동 UI** 추가

## 2. 평가 체계 변경 (Before → After)

| 평가 | Before | After |
|------|--------|-------|
| 선수평가(prerequisite) | 50문항 · 합격 60 | **20문항 · 문항당 5점(100점) · 합격 40점 · 채점형** |
| 진단평가(diagnostic) | 50문항 · 합격 70 | **50문항 · 채점 없음 · 정답·해설 상시 공개(자습)** |
| 사후평가(summative) | 50문항 · 합격 80 | **20문항 · 문항당 5점(100점) · 합격 60점 · 채점형** |

- 채점형 20문항은 **기존 50문항 풀(pool)에서 대표 문항을 선별**해 1~20번으로 재번호
  - 선수: `[1,2,3,4,5,6,7,10,11,16,17,18,24,25,29,31,34,39,45,49]` (바이브코딩·HTML·CSS·JS·React·Git)
  - 사후: `[1,2,3,4,5,6,7,8,9,10,11,12,16,19,24,26,30,41,44,50]` (에이전트·Supabase·LLM·DevTools·배포·경진대회)
- 메뉴/번역 명칭도 `선수평가 / 진단평가 / 사후평가`로 통일

## 3. 변경/신규 파일

| 파일 | 변경 |
|------|------|
| `src/data/assessmentData.ts` | `AssessmentMode` 추가, 50문항을 pool로 보존하고 `pick()`으로 20문항 선별. 진단평가 `mode:'practice'`. |
| `src/pages/Assessment.tsx` | `reveal`(채점완료 또는 자습) 기준으로 정답·해설 노출, 진단평가 자습 모드, 제출 시 성적 저장, 저장 상태 표시. |
| `src/utils/assessments.ts` | **신규** — `saveAssessmentResult`(업서트) / `getMyAssessments` / `getAllAssessments`. |
| `supabase/rest_tables.sql` | **신규 테이블 `rest_assessments`** + RLS(본인 조회·관리자 전체 조회) + 인덱스. |
| `src/pages/Dashboard.tsx` | "내 학습평가 성적" 카드(선수/사후 점수·합격여부·응시일) 추가. |
| `src/pages/admin/AdminGrades.tsx` | **신규** — 수강생별 성적표 + 평가별 요약(응시/합격/평균). |
| `src/components/AdminSidebar.tsx` | "학습평가 성적" 메뉴 추가. |
| `src/layouts/PublicLayout.tsx` | `/admin/grades` 라우트 등록. |
| `src/utils/translations.ts` | 평가 메뉴 명칭 선수/사후로 변경(ko·en). |

## 4. rest_assessments 테이블
```sql
rest_assessments(
  id, student_id, student_name, student_email,
  type CHECK (prerequisite|summative),
  score(0~100), correct, total, passed, answers JSONB, submitted_at,
  UNIQUE(student_id, type)   -- 재응시 시 업서트로 갱신
)
```
- RLS: `SELECT` = 본인 행 또는 ADMIN_EMAILS, `INSERT/UPDATE` = 본인(`auth.uid()=student_id`)
- **배포 전 Supabase SQL Editor에서 이 테이블을 먼저 생성해야 성적 저장이 동작합니다.**

## 5. 동작
- 채점형: 제출 → 5점 환산 채점 → 로그인 상태면 `rest_assessments` 업서트 → 사이드바에 저장 상태 표시(저장됨/실패/비로그인 안내)
- 자습형(진단): 제출 버튼 없음, 정답·해설이 처음부터 공개, "선택 초기화"만 제공
- 대시보드: 본인 선수/사후 점수·합격 표시, 미응시 시 평가 링크
- 관리자 `/admin/grades`: 본 사이트 가입 학생 × 평가 성적 매트릭스 + 통계

## 6. 검증
- [x] `tsc -b` 0 error
- [x] `npm run build` 성공
- [x] Vite dev 모듈 트랜스폼 정상(assessmentData/Assessment/assessments 200)
- [x] `pick()` 선별 번호 전부 풀(1~50) 내 존재 → 모듈 로드 시 예외 없음

## 7. 후속(미완료)
- **수강생 명단 ↔ 회원가입 일치도 확인**: 외부 수강생 명단 파일 + `user_profiles`(signup_domain=rest.dreamitbiz.com) 데이터 필요. 명단 수령 후 대조 스크립트/관리자 화면으로 진행 예정.
- 사후평가 합격선(현재 60점) 운영 기준 최종 확정
