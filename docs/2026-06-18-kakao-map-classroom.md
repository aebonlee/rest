# 카카오맵 실제 구현 — 온라인강의실(/classroom) (2026-06-18)

## 요청
카카오맵을 실제로 한 페이지에 구현.

## 구현
- `src/components/KakaoMap.tsx` — 재사용 지도 컴포넌트
  - `VITE_KAKAO_JS_KEY`(JavaScript 키)로 SDK를 `autoload=false`로 1회 주입
  - `libraries=services`로 주소 지오코딩 → 마커 + 말풍선(InfoWindow)
  - 지오코딩 실패 시 기본 좌표(lat/lng) 폴백
  - **키 미설정/로드 실패 시** 지도 대신 주소 + "카카오맵에서 열기" 링크 폴백
    → 클린 빌드/프리뷰에서도 페이지 안 깨짐
- `src/pages/Classroom.tsx` — 오프라인 카드에 `<KakaoMap>` 임베드
  - address = `서울 용산구 후암로57길 302 4층 (공간 햅삐 서울역점)`, placeName 말풍선
- `.env.example` — `VITE_KAKAO_JS_KEY` 안내 추가
- `.github/workflows/deploy.yml` — 빌드 env에 `VITE_KAKAO_JS_KEY` 시크릿 전달

## 검증
- `npm run typecheck` ✓
- `npm run build` ✓
- 로컬에서 키 없이도 폴백 박스 정상 렌더(빌드 영향 없음)

## 사용자 설정 (지도 실제 표시 조건)
1. Kakao Developers → 내 애플리케이션 → 앱 키 → **JavaScript 키** 복사
2. **플랫폼 → Web** 에 도메인 등록: `https://rest.dreamitbiz.com`, (로컬 테스트 시 `http://localhost:5173`)
3. GitHub → 저장소 Settings → Secrets and variables → Actions →
   **`VITE_KAKAO_JS_KEY`** 시크릿 추가 (= 위 JavaScript 키)
4. 재배포되면 /classroom 오프라인 카드에 지도가 표시됨
   - 로컬 개발: 프로젝트 루트 `.env`에 `VITE_KAKAO_JS_KEY=...` 추가 후 `npm run dev`

주의: JavaScript 키는 프론트에 노출되는 값이므로 반드시 **플랫폼 도메인 제한 + 사용량 한도**로 방어
(기술코칭 부록 "Google·Kakao 개발자 콘솔" 참고).
