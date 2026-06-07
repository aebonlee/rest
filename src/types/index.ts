/* ───────────────────────────────────────────
 *  Domain types for rest (AI Reboot Academy LMS)
 * ───────────────────────────────────────────
 *
 *  [파일 역할]
 *  AI Reboot Academy LMS(rest 프로젝트) 전반에서 공유되는 도메인 타입 정의 모음.
 *  컴포넌트/서비스/훅이 동일한 데이터 구조를 안전하게 주고받도록 단일 출처(SSOT)로 사용된다.
 *  런타임 코드는 전혀 없고 컴파일 타임에만 존재하는 TypeScript 타입/인터페이스만 export 한다.
 *
 *  [핵심 책임]
 *  - Supabase 등 백엔드와 주고받는 레코드의 형태(camelCase 도메인 모델 ↔ snake_case DB row) 명세
 *  - 결제(PortOne V1), 인증/사용자, 장바구니/주문, 사이트 설정, LMS(공지·자료·과제·출결 등) 타입 정의
 *  - 공용 유니온 타입(PaymentStatus, ThemeMode, ColorTheme, Language 등) 제공
 *
 *  [주요 export]
 *  Product/ProductRow/ProductInput, CartItem, Order 계열, UserProfile/AccountBlock,
 *  Comment 계열, Search 계열, SiteConfig 계열, Payment 계열, Toast, Theme/Language 타입,
 *  LMS 계열(Announcement, Material, Assignment, Submission, Attendance, Team, Project, QnAItem, Resource).
 */

// ─── Product (kept for template compatibility) ───
// 상품 도메인 모델(프론트엔드 사용용, camelCase). 원본 템플릿 호환을 위해 유지된다.
export interface Product {
  id: number;
  slug: string;
  category: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  imageUrl: string;
  isSoldOut: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 상품 DB row 형태(Supabase 테이블의 실제 컬럼명, snake_case). Product로 매핑하기 전 원시 데이터.
export interface ProductRow {
  id: number;
  slug: string;
  category: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  price: number;
  image_url: string;
  is_sold_out: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 상품 생성/수정 입력 타입. 모든 필드가 선택적(optional)이라 부분 업데이트(partial update)에 사용된다.
export interface ProductInput {
  slug?: string;
  category?: string;
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  price?: number;
  imageUrl?: string;
  isSoldOut?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

// ─── Cart ───
// 장바구니 항목. Product를 확장하고 수량(quantity)을 추가한 형태.
export interface CartItem extends Product {
  quantity: number;
}

// ─── Order ───
// 주문 생성 시 함께 전달되는 개별 품목 입력(snake_case, DB 저장 형태).
export interface OrderItemInput {
  product_title: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// 주문 생성 요청용 데이터. user_id는 비회원 결제 시 null일 수 있음.
export interface OrderData {
  order_number: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  total_amount: number;
  payment_method: string;
  user_id?: string | null; // 로그인 사용자 식별자(비회원이면 null/undefined)
  items?: OrderItemInput[];
}

// 저장/조회된 주문 레코드 전체 형태. 결제 상태와 PortOne 결제 ID, 취소/결제 시각 등을 포함.
export interface Order {
  id: string;
  order_number: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus; // 결제 진행 상태(아래 PaymentStatus 유니온)
  user_id?: string | null;
  portone_payment_id?: string; // PortOne 결제 식별자(결제 완료 후 채워짐)
  created_at: string;
  paid_at?: string; // 결제 완료 시각(미결제면 없음)
  cancelled_at?: string; // 취소 시각(취소되지 않았으면 없음)
  cancel_reason?: string;
  items?: OrderItemInput[]; // 주문 생성 시 전달된 품목
  order_items?: OrderItemInput[]; // DB 조인으로 함께 조회된 품목(별도 테이블)
}

// 결제 상태 유니온: 대기/완료/실패/취소/환불.
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

// ─── User / Auth ───
// 사용자 프로필. 인증(소셜 로그인 포함) 후 profiles 테이블에 저장되는 사용자 정보.
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  display_name: string;
  avatar_url: string;
  phone: string;
  provider: string; // 인증 제공자(google, kakao 등)
  role: string; // 권한 역할(student, instructor, admin 등) — RLS 정책 분기에 사용
  signup_domain: string; // 가입한 사이트 도메인(멀티사이트 구분용)
  visited_sites: string[]; // 사용자가 방문/이용한 사이트 목록
  last_sign_in_at: string;
  updated_at: string;
}

// 계정 차단/정지 정보. suspended_until이 null이면 무기한 또는 미정지.
export interface AccountBlock {
  status: string;
  reason: string;
  suspended_until: string | null; // 정지 해제 예정 시각(null이면 기한 없음)
}

// ─── Comment ───
// 댓글 도메인 모델(조회용, camelCase). postType으로 게시글 종류(blog/board 등)를 구분.
export interface Comment {
  id: number;
  postId: number;
  postType: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// 댓글 작성 입력 타입(id/createdAt 제외).
export interface CommentInput {
  postId: number;
  postType: string;
  authorId: string;
  authorName: string;
  content: string;
}

// ─── Search ───
// 통합 검색 결과의 단일 항목. 다국어(En) 및 발췌(excerpt) 필드는 콘텐츠 종류에 따라 선택적.
export interface SearchResultItem {
  id: number;
  title: string;
  titleEn?: string;
  excerpt?: string;
  excerptEn?: string;
  category?: string;
  categoryEn?: string;
  description?: string;
  descriptionEn?: string;
  author?: string;
  date: string;
}

// 통합 검색 결과를 콘텐츠 영역별(블로그/게시판/갤러리)로 묶은 구조.
export interface SearchResults {
  blog: SearchResultItem[];
  board: SearchResultItem[];
  gallery: SearchResultItem[];
}

// ─── Site Config ───
// 브랜드 로고 텍스트의 조각 단위. text와 CSS className을 쌍으로 가져 부분별 스타일링에 사용.
export interface BrandPart {
  text: string;
  className: string;
}

// 네비게이션 상위 메뉴 항목. dropdown이 있으면 하위 메뉴를 가진다.
export interface MenuItem {
  path: string;
  labelKey: string; // i18n 번역 키
  activePath?: string; // 활성 상태 판단용 경로(현재 경로와 비교)
  dropdown?: SubMenuItem[];
}

// 드롭다운 하위 메뉴 항목.
export interface SubMenuItem {
  path: string;
  labelKey: string;
}

// 패밀리 사이트(관련 사이트) 링크 정보.
export interface FamilySite {
  name: string;
  url: string;
}

// 테마 색상 선택 옵션. name은 ColorTheme 유니온으로 제한된다.
export interface ColorOption {
  name: ColorTheme;
  color: string;
}

// 회사/사업자 정보. 법적 표기(사업자번호, 통신판매업번호 등)는 사이트별로 선택적.
export interface CompanyInfo {
  name: string;
  ceo: string;
  bizNumber: string;
  salesNumber?: string; // 통신판매업 신고번호
  publisherNumber?: string; // 출판/간행물 등록번호
  address: string;
  email: string;
  phone: string;
  kakao?: string;
  businessHours?: string;
}

// 사이트별 기능 토글 플래그. 멀티사이트에서 기능 활성/비활성을 제어.
export interface SiteFeatures {
  shop: boolean;
  community: boolean;
  search: boolean;
  auth: boolean;
  license: boolean;
}

// 사이트 전체 설정. 멀티사이트 운영 시 사이트마다 다른 브랜드/메뉴/색상/회사정보를 정의.
export interface SiteConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  url: string;
  dbPrefix: string; // Supabase 테이블 접두어(사이트별 데이터 분리)
  parentSite: { name: string; url: string }; // 상위/모회사 사이트 링크
  brand: { parts: BrandPart[] }; // 로고를 조각 단위로 조합
  themeColor: string;
  company: CompanyInfo;
  features: SiteFeatures;
  colors: ColorOption[];
  menuItems: MenuItem[];
  footerLinks: { path: string; labelKey: string }[];
  familySites: FamilySite[];
}

// ─── Payment (PortOne V1) ───
// PortOne V1 결제 요청 페이로드. payMethod는 카드/계좌이체로 제한.
export interface PaymentRequest {
  orderId: string;
  orderName: string;
  totalAmount: number;
  payMethod: 'CARD' | 'TRANSFER';
  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

// 결제 성공 응답. 결제 식별자와 거래 ID를 반환.
export interface PaymentSuccess {
  paymentId: string;
  txId: string;
}

// 결제 실패/에러 응답.
export interface PaymentError {
  code: string;
  message: string;
}

// 결제 결과 유니온: 성공 또는 에러. code 필드 유무 등으로 분기(타입 가드) 가능.
export type PaymentResult = PaymentSuccess | PaymentError;

// ─── Toast ───
// 토스트 알림 종류 유니온.
export type ToastType = 'info' | 'success' | 'error' | 'warning';

// 화면에 표시되는 토스트 알림 한 건.
export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ─── Theme ───
// 테마 모드 유니온: 시스템 자동/라이트/다크.
export type ThemeMode = 'auto' | 'light' | 'dark';
// 강조 색상 테마 유니온.
export type ColorTheme = 'blue' | 'red' | 'green' | 'purple' | 'orange';

// ─── Language ───
// 지원 언어 유니온: 한국어/영어.
export type Language = 'ko' | 'en';

// ─── LMS Types ───
// 공지사항. is_pinned가 true면 목록 상단 고정.
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean; // 상단 고정 여부
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

// 강의 자료. day_number로 차시(일자)별 자료를 구분하고 파일 메타데이터를 포함.
export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number; // 바이트 단위 파일 크기
  day_number: number; // 강의 차시(몇 일차 자료인지)
  author_id: string;
  created_at: string;
}

// 과제. is_team이 true면 팀 단위 제출 과제.
export interface Assignment {
  id: string;
  title: string;
  description: string;
  category: string;
  day_number: number;
  due_date: string; // 마감 기한
  max_score: number; // 만점 점수
  is_team: boolean; // 팀 과제 여부
  created_at: string;
}

// 과제 제출물. score/graded_at은 채점 전이면 null.
export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  team_id: string | null; // 팀 과제면 팀 ID, 개인 과제면 null
  content: string;
  file_url: string;
  score: number | null; // 채점 전이면 null
  feedback: string;
  submitted_at: string;
  graded_at: string | null; // 채점 완료 시각(미채점이면 null)
}

// 출결 기록. status는 출석/결석/지각/공결 중 하나.
export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time: string;
  note: string;
}

// 팀. members로 소속 팀원 목록을 가진다.
export interface Team {
  id: string;
  name: string;
  description: string;
  project_topic: string;
  members: TeamMember[];
  created_at: string;
}

// 팀 구성원. role로 팀 내 역할(팀장 등)을 표기.
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 프로젝트. category는 개인미니/팀미니/실전, status는 진행 단계를 나타냄.
export interface Project {
  id: string;
  team_id: string;
  title: string;
  description: string;
  category: 'mini-personal' | 'mini-team' | 'real'; // 프로젝트 유형
  status: 'planning' | 'in-progress' | 'testing' | 'completed'; // 진행 단계
  repo_url: string;
  demo_url: string;
  presentation_url: string;
  llm_used: string[]; // 프로젝트에 사용한 LLM 목록
  created_at: string;
  updated_at: string;
}

// Q&A 항목. is_resolved로 답변 완료 여부, reply_* 필드로 답변 내용을 담는다.
export interface QnAItem {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  category: string;
  is_resolved: boolean; // 답변 완료(해결) 여부
  reply_content: string;
  reply_author: string;
  replied_at: string | null; // 답변 시각(미답변이면 null)
  created_at: string;
}

// 학습 리소스(도구/LLM/참고자료/튜토리얼) 링크. sort_order로 노출 순서 제어.
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'tool' | 'llm' | 'reference' | 'tutorial';
  icon: string;
  sort_order: number;
}
