/**
 * 파일 역할:
 *   Vite 클라이언트 환경에 대한 전역 타입 선언 파일(ambient declaration).
 *   런타임 코드는 전혀 없으며, TypeScript 컴파일러에게 Vite가 주입하는
 *   타입 정보(import.meta.env 등)와 프로젝트 전용 환경변수의 형태를 알려준다.
 *
 * 핵심 책임:
 *   - Vite가 제공하는 클라이언트 타입(예: import.meta.env, 에셋 import 등)을 참조.
 *   - 이 프로젝트에서 사용하는 커스텀 환경변수(VITE_*)의 타입을 정의하여
 *     코드 전반에서 import.meta.env.VITE_... 사용 시 자동완성과 타입 검사 지원.
 *
 * 주요 export:
 *   없음(이 파일은 .d.ts 선언 파일로, 전역 인터페이스만 확장/병합한다).
 */

/// <reference types="vite/client" />

// 앱에서 사용하는 환경변수(import.meta.env)의 타입 정의.
// Vite는 VITE_ 접두어가 붙은 변수만 클라이언트 번들에 노출한다.
interface ImportMetaEnv {
  // Supabase 프로젝트 URL (백엔드 엔드포인트)
  readonly VITE_SUPABASE_URL: string;
  // Supabase anon(공개) 키 — 클라이언트에서 RLS 정책 하에 사용되는 공개 키
  readonly VITE_SUPABASE_ANON_KEY: string;
}

// import.meta.env가 위에서 정의한 ImportMetaEnv 타입을 갖도록 ImportMeta를 확장.
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
