# 기술코칭 부록 추가 — SEO·OG 메타 & 공유 캐시 잡기 (2026-06-18)

## 요청
기술코칭 메뉴의 부록으로, SEO 내용을 정리하고 카카오·페이스북 디버거를 이용한
캐시 정리 및 OG 항목별 내용을 학습할 수 있도록 자료화하여 메뉴로 추가.

## 구현
- `src/data/learningData.ts` `coachingTopics`에 신규 부록 Topic `coach-seo` 추가
  (`dividerBefore: true` → 기술코칭 사이드바에서 "부록" 그룹으로 표시)
- 기술코칭 단계(`/learning/coaching`)는 `coachingTopics`를 자동 렌더링하므로
  별도 라우팅/메뉴 코드 수정 없이 메뉴에 노출됨

## 자료 구성 (coach-seo)
0. 왜 챙겨야 하나(첫인상=공유 카드)
1. 메타 태그 3계층(검색 SEO / Open Graph / Twitter Card) — 표
2. 검색용 메타 기본기(title·description·canonical·robots)
3. **OG 항목별 완전 정리** — og:title/description/image/url/type/site_name/locale 표
4. Twitter Card
5. 우리 사이트 실제 적용 — `SEOHead.tsx`(React 19 head hoisting), 절대 URL 패턴 코드
6. 미리보기가 안 바뀌는 이유 = SNS OG 캐시
7. **카카오 공유 디버거**로 캐시 갱신 실습 (developers.kakao.com/tool/debugger/sharing)
8. **페이스북 공유 디버거**로 Scrape Again 실습 (developers.facebook.com/tools/debug/)
9. 자주 겪는 문제→원인→처방 표
10. 제출 전 셀프 체크
11. 실습 과제(기초/응용/심화)

## 검증
- `npm run typecheck` ✓
- `npm run build` ✓
