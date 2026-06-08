/* ───────────────────────────────────────────
 *  Domain types for rest (AI Reboot Academy LMS)
 * ───────────────────────────────────────────
 *
 *  [이 파일이 뭐예요? — 한 줄 요약]
 *  "우리 앱이 다루는 데이터들이 각각 어떤 모양(형태)이어야 하는지"를 적어둔 설계 도면 파일이다.
 *
 *  [초보자를 위한 배경 지식]
 *  - TypeScript(타입스크립트): JavaScript에 "타입(=값의 종류) 검사" 기능을 더한 언어.
 *    예) name은 문자열(string), price는 숫자(number) 이런 식으로 미리 정해두면,
 *    실수로 숫자 자리에 글자를 넣었을 때 "실행 전에" 에디터/컴파일러가 빨간 줄로 알려준다.
 *  - 이 파일에는 실제로 "동작하는 코드(함수/계산)"가 한 줄도 없다.
 *    오직 "데이터의 모양 설명"만 있다. 즉, 컴파일(코드 변환)이 끝나면 이 내용은 사라지고,
 *    개발 중에만 "안전벨트" 역할을 한다. (런타임=실제 실행 시점에는 영향 없음)
 *
 *  [자주 나오는 용어 미리보기]
 *  - interface(인터페이스): "객체(여러 값을 담은 묶음)가 가져야 할 속성 목록"을 정의하는 도구.
 *    예) UserProfile은 id, email, name ... 을 반드시(또는 선택적으로) 가진다고 약속.
 *  - type ... = A | B : "유니온(union) 타입". "이것 또는 저것 중 하나"라는 뜻.
 *    예) 'pending' | 'paid' 는 "두 글자값 중 정확히 하나만 허용".
 *  - 물음표(?) 가 붙은 속성: "선택적(optional) 속성". 있어도 되고 없어도 된다는 뜻.
 *    주의: 물음표가 없으면 "반드시 있어야 하는 필수 속성"이다.
 *  - | null : "이 값은 null(비어있음)일 수도 있다"는 표시. 값이 아직 없는 상태를 표현할 때 쓴다.
 *  - extends : "기존 인터페이스를 그대로 물려받아(상속) 거기에 속성을 더한다"는 뜻.
 *
 *  [이 파일을 왜 따로 만들까? — 설계 의도]
 *  여러 화면(컴포넌트)과 서버 통신 코드(서비스)가 "똑같은 데이터 모양"을 공유해야 한다.
 *  모양 정의를 여기 한 곳에만 두면(=단일 출처, SSOT: Single Source Of Truth),
 *  나중에 구조가 바뀌어도 여기 한 군데만 고치면 되어 실수가 줄어든다.
 *
 *  [이 프로젝트(rest)에서 자주 보이는 패턴]
 *  - camelCase  : userName 처럼 단어 사이를 대문자로 구분 → 프론트엔드(앱 내부)에서 쓰는 표기.
 *  - snake_case : user_name 처럼 밑줄로 구분 → 데이터베이스(Supabase) 컬럼 이름 표기.
 *    그래서 같은 개념인데 표기만 다른 타입이 쌍으로 나오기도 한다(예: Product ↔ ProductRow).
 *  - Supabase: 데이터베이스 + 인증을 제공하는 백엔드 서비스. 우리가 데이터를 저장/조회하는 곳.
 *  - RLS(Row Level Security): "행(row) 단위 접근 제어". 로그인한 사용자의 역할(role)에 따라
 *    어떤 데이터를 읽고 쓸 수 있는지 DB가 직접 막아주는 보안 규칙. (그래서 role 필드가 중요)
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
// (export = "다른 파일에서 import 해서 쓸 수 있게 공개한다"는 뜻. 안 붙이면 이 파일 안에서만 쓸 수 있음)
export interface Product {
  id: number;            // 상품 고유 번호(숫자). 각 상품을 구별하는 식별자(키).
  slug: string;          // URL에 쓰는 사람이 읽기 좋은 식별 문자열(예: "ai-basic-course").
  category: string;      // 상품 분류(카테고리).
  title: string;         // 상품 제목(한국어).
  titleEn: string;       // 상품 제목(영어). 다국어 지원을 위해 별도 필드로 둔다.
  description: string;   // 상품 설명(한국어).
  descriptionEn: string; // 상품 설명(영어).
  price: number;         // 가격(숫자). 문자열이 아니라 숫자라서 바로 계산에 쓸 수 있다.
  imageUrl: string;      // 상품 이미지 주소(URL).
  isSoldOut: boolean;    // 품절 여부(참/거짓). boolean = true 또는 false 둘 중 하나.
  isActive: boolean;     // 노출(활성) 여부. false면 화면에 안 보이게 처리할 수 있다.
  sortOrder: number;     // 정렬 순서(작을수록 앞쪽 등, 노출 순서를 정하는 값).
  createdAt: string;     // 생성 시각. 날짜를 문자열(ISO 형식 등)로 저장한다.
  updatedAt: string;     // 마지막 수정 시각.
}

// 상품 DB row 형태(Supabase 테이블의 실제 컬럼명, snake_case). Product로 매핑하기 전 원시 데이터.
// 주의: 위 Product와 "내용은 같지만 이름 표기만 다르다"(titleEn ↔ title_en).
//       DB에서 막 꺼낸 데이터는 이 모양이고, 화면에서 쓰기 좋게 Product(camelCase)로 변환해 사용한다.
export interface ProductRow {
  id: number;
  slug: string;
  category: string;
  title: string;
  title_en: string;        // DB 컬럼은 snake_case → 프론트의 titleEn 과 짝을 이룬다.
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
// 왜 전부 물음표(?)일까: "수정할 항목만 골라서 보내고 싶기" 때문.
//   예) 가격만 바꾸고 싶으면 { price: 5000 } 만 보내면 된다. id가 없는 이유는
//       "어떤 상품을 고칠지"는 보통 별도 인자로 넘기고, 여기는 "바꿀 내용"만 담기 때문.
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
// extends Product = "Product의 모든 속성(id, title, price ...)을 그대로 물려받고",
//   거기에 quantity 한 개만 더한다는 뜻. 같은 속성을 반복해서 다시 쓰지 않아도 된다(중복 방지).
export interface CartItem extends Product {
  quantity: number; // 장바구니에 담은 개수. price * quantity 로 소계 계산에 쓰인다.
}

// ─── Order ───
// 주문 생성 시 함께 전달되는 개별 품목 입력(snake_case, DB 저장 형태).
export interface OrderItemInput {
  product_title: string; // 주문 당시 상품 제목(나중에 상품명이 바뀌어도 기록은 그대로 남기려고 복사해 둠).
  quantity: number;      // 주문 수량.
  unit_price: number;    // 1개당 가격.
  subtotal: number;      // 이 품목 소계(= unit_price * quantity). 미리 계산해 저장.
}

// 주문 생성 요청용 데이터. user_id는 비회원 결제 시 null일 수 있음.
export interface OrderData {
  order_number: string;  // 주문 번호(사람이 읽고 문의할 때 쓰는 번호).
  user_email: string;    // 주문자 이메일.
  user_name: string;     // 주문자 이름.
  user_phone: string;    // 주문자 전화번호.
  total_amount: number;  // 총 결제 금액.
  payment_method: string;// 결제 수단(예: 카드, 계좌이체).
  user_id?: string | null; // 로그인 사용자 식별자(비회원이면 null/undefined)
                           // 주의: '?'(선택적)와 '| null'(빈 값 허용)이 둘 다 붙어 있다.
                           //   → 아예 속성이 없을 수도(undefined), 있지만 비어있을 수도(null) 있다는 뜻.
  items?: OrderItemInput[]; // 주문 품목 목록. []는 "배열(여러 개를 담는 목록)"을 뜻함.
}

// 저장/조회된 주문 레코드 전체 형태. 결제 상태와 PortOne 결제 ID, 취소/결제 시각 등을 포함.
// OrderData(요청용)와 달리, 이건 "DB에 저장된 뒤 다시 읽어온 완성된 주문"이라 id/상태 등이 더 많다.
export interface Order {
  id: string;            // DB가 부여한 고유 id.
  order_number: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus; // 결제 진행 상태(아래 PaymentStatus 유니온). 정해진 몇 가지 값만 허용.
  user_id?: string | null;
  portone_payment_id?: string; // PortOne 결제 식별자(결제 완료 후 채워짐)
                               // 결제 전에는 아직 값이 없으므로 선택적(?)으로 둔다.
  created_at: string;          // 주문이 만들어진 시각.
  paid_at?: string;            // 결제 완료 시각(미결제면 없음 → 그래서 선택적).
  cancelled_at?: string;       // 취소 시각(취소되지 않았으면 없음).
  cancel_reason?: string;      // 취소 사유.
  items?: OrderItemInput[];        // 주문 생성 시 전달된 품목
  order_items?: OrderItemInput[];  // DB 조인으로 함께 조회된 품목(별도 테이블)
                                   // 참고: 품목은 보통 'order_items'라는 별도 테이블에 저장되고,
                                   //   주문을 조회할 때 함께(JOIN) 가져온다. 그래서 두 가지 이름이 공존.
}

// 결제 상태 유니온: 대기/완료/실패/취소/환불.
// 유니온 타입의 장점: payment_status에 'paidd'(오타)처럼 엉뚱한 값을 넣으면 즉시 타입 오류로 잡힌다.
//   pending(결제 대기) / paid(결제 완료) / failed(실패) / cancelled(취소) / refunded(환불).
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

// ─── User / Auth ───
// 사용자 프로필. 인증(소셜 로그인 포함) 후 profiles 테이블에 저장되는 사용자 정보.
// 인증(authentication) = "이 사람이 누구인지 확인하는 절차"(로그인). 그 결과로 만들어지는 사용자 정보다.
export interface UserProfile {
  id: string;          // 사용자 고유 id(보통 인증 시스템이 발급).
  email: string;       // 이메일.
  name: string;        // 실명(또는 가입 시 이름).
  display_name: string;// 화면에 표시할 이름(별명 등).
  avatar_url: string;  // 프로필 사진 주소.
  phone: string;       // 전화번호.
  provider: string; // 인증 제공자(google, kakao 등). 어떤 소셜 계정으로 로그인했는지.
  role: string; // 권한 역할(student, instructor, admin 등) — RLS 정책 분기에 사용
                // 중요: 이 role 값에 따라 DB(RLS)가 데이터 접근 권한을 다르게 준다(보안의 핵심).
  signup_domain: string; // 가입한 사이트 도메인(멀티사이트 구분용)
  visited_sites: string[]; // 사용자가 방문/이용한 사이트 목록 (string[] = 문자열들의 배열).
  last_sign_in_at: string; // 마지막 로그인 시각.
  updated_at: string;      // 프로필 마지막 수정 시각.
}

// 계정 차단/정지 정보. suspended_until이 null이면 무기한 또는 미정지.
export interface AccountBlock {
  status: string; // 계정 상태(예: active, suspended 등).
  reason: string; // 차단/정지 사유.
  suspended_until: string | null; // 정지 해제 예정 시각(null이면 기한 없음)
                                  // 주의: 코드에서 이 값을 쓸 때는 "null인지" 먼저 확인해야 안전하다.
}

// ─── Comment ───
// 댓글 도메인 모델(조회용, camelCase). postType으로 게시글 종류(blog/board 등)를 구분.
export interface Comment {
  id: number;        // 댓글 고유 번호.
  postId: number;    // 어떤 글(게시물)에 달린 댓글인지 가리키는 번호.
  postType: string;  // 그 글의 종류(blog/board 등). postId만으로는 어느 테이블의 글인지 모를 수 있어 함께 둠.
  authorId: string;  // 작성자 id.
  authorName: string;// 작성자 표시 이름.
  content: string;   // 댓글 내용.
  createdAt: string; // 작성 시각.
}

// 댓글 작성 입력 타입(id/createdAt 제외).
// 왜 id와 createdAt이 없을까: 둘 다 "저장하는 순간 서버/DB가 자동으로 만들어 주는 값"이라,
//   클라이언트(앱)가 보낼 필요가 없기 때문. 입력 타입은 "사용자가 채워야 하는 것"만 담는다.
export interface CommentInput {
  postId: number;
  postType: string;
  authorId: string;
  authorName: string;
  content: string;
}

// ─── Search ───
// 통합 검색 결과의 단일 항목. 다국어(En) 및 발췌(excerpt) 필드는 콘텐츠 종류에 따라 선택적.
// 통합 검색 = 블로그/게시판/갤러리 등 여러 곳을 한 번에 검색한 결과를 한 모양으로 모은 것.
//   콘텐츠마다 가진 정보가 달라서 공통이 아닌 필드는 선택적(?)으로 둔다.
export interface SearchResultItem {
  id: number;            // 검색 결과 항목의 id.
  title: string;         // 제목(한국어, 필수).
  titleEn?: string;      // 제목(영어, 있을 때만).
  excerpt?: string;      // 본문 발췌(미리보기 문구). 있는 콘텐츠만.
  excerptEn?: string;    // 발췌(영어).
  category?: string;     // 분류.
  categoryEn?: string;   // 분류(영어).
  description?: string;  // 설명.
  descriptionEn?: string;// 설명(영어).
  author?: string;       // 작성자(있는 경우).
  date: string;          // 날짜(필수).
}

// 통합 검색 결과를 콘텐츠 영역별(블로그/게시판/갤러리)로 묶은 구조.
export interface SearchResults {
  blog: SearchResultItem[];    // 블로그 검색 결과 목록.
  board: SearchResultItem[];   // 게시판 검색 결과 목록.
  gallery: SearchResultItem[]; // 갤러리 검색 결과 목록.
}

// ─── Site Config ───
// 브랜드 로고 텍스트의 조각 단위. text와 CSS className을 쌍으로 가져 부분별 스타일링에 사용.
// 예) 로고 "AI Reboot" 에서 "AI"는 파란색, "Reboot"는 회색처럼 부분마다 다른 색을 주고 싶을 때 쓴다.
export interface BrandPart {
  text: string;      // 표시할 글자 조각.
  className: string; // 그 조각에 입힐 CSS 클래스 이름(스타일).
}

// 네비게이션 상위 메뉴 항목. dropdown이 있으면 하위 메뉴를 가진다.
export interface MenuItem {
  path: string;        // 클릭 시 이동할 경로(예: "/courses").
  labelKey: string;    // i18n 번역 키. (i18n = 다국어 처리. 직접 글자 대신 "키"를 두고,
                       //   현재 언어에 맞는 번역문을 찾아 보여준다 → 한/영 전환이 쉬워진다)
  activePath?: string; // 활성 상태 판단용 경로(현재 경로와 비교). 현재 보고 있는 페이지면 메뉴를 강조 표시.
  dropdown?: SubMenuItem[]; // 하위 메뉴 목록. 없으면(undefined) 단순 링크 메뉴.
}

// 드롭다운 하위 메뉴 항목.
export interface SubMenuItem {
  path?: string;     // 이동 경로(divider면 생략).
  labelKey: string;  // 번역 키.
  divider?: boolean; // true면 클릭 불가한 섹션 구분선(라벨만 표시).
}

// 패밀리 사이트(관련 사이트) 링크 정보.
export interface FamilySite {
  name: string; // 사이트 이름.
  url: string;  // 사이트 주소.
}

// 테마 색상 선택 옵션. name은 ColorTheme 유니온으로 제한된다.
export interface ColorOption {
  name: ColorTheme; // 'blue' | 'red' | ... 처럼 정해진 색 이름만 허용(아래 ColorTheme 참고).
  color: string;    // 실제 색상값(예: "#1e90ff").
}

// 회사/사업자 정보. 법적 표기(사업자번호, 통신판매업번호 등)는 사이트별로 선택적.
export interface CompanyInfo {
  name: string;             // 회사명.
  ceo: string;              // 대표자명.
  bizNumber: string;        // 사업자등록번호.
  salesNumber?: string;     // 통신판매업 신고번호 (없는 사이트도 있어 선택적).
  publisherNumber?: string; // 출판/간행물 등록번호.
  address: string;          // 주소.
  email: string;            // 대표 이메일.
  phone: string;            // 대표 전화.
  kakao?: string;           // 카카오 문의 채널(선택).
  businessHours?: string;   // 운영 시간(선택).
}

// 사이트별 기능 토글 플래그. 멀티사이트에서 기능 활성/비활성을 제어.
// 토글(toggle) = 켜기/끄기 스위치. true면 그 기능을 보여주고, false면 숨긴다.
//   같은 코드베이스로 여러 사이트를 운영할 때, 사이트마다 필요한 기능만 켤 수 있게 해 준다.
export interface SiteFeatures {
  shop: boolean;      // 쇼핑(상품/결제) 기능 사용 여부.
  community: boolean; // 커뮤니티(게시판) 기능 사용 여부.
  search: boolean;    // 검색 기능 사용 여부.
  auth: boolean;      // 로그인/회원 기능 사용 여부.
  license: boolean;   // 라이선스 관련 기능 사용 여부.
}

// 사이트 전체 설정. 멀티사이트 운영 시 사이트마다 다른 브랜드/메뉴/색상/회사정보를 정의.
export interface SiteConfig {
  id: string;          // 사이트 식별자.
  name: string;        // 사이트 이름(영문 등).
  nameKo: string;      // 사이트 이름(한국어).
  description: string; // 사이트 설명.
  url: string;         // 사이트 주소.
  dbPrefix: string; // Supabase 테이블 접두어(사이트별 데이터 분리)
                    // 예) prefix가 "rest_"면 rest_orders, rest_products 처럼 테이블 이름 앞에 붙어
                    //     여러 사이트 데이터가 한 DB에서 섞이지 않게 구분된다.
  parentSite: { name: string; url: string }; // 상위/모회사 사이트 링크
                                             // (중괄호 {} 안에 즉석으로 정의한 작은 객체 타입)
  brand: { parts: BrandPart[] }; // 로고를 조각 단위로 조합 (BrandPart 들의 배열을 담는다)
  themeColor: string;            // 기본 테마 색상.
  company: CompanyInfo;          // 회사 정보(위 CompanyInfo 타입 재사용).
  features: SiteFeatures;        // 기능 on/off 설정.
  colors: ColorOption[];         // 선택 가능한 색상 테마 목록.
  menuItems: MenuItem[];         // 상단 메뉴 구성.
  footerLinks: { path: string; labelKey: string }[]; // 푸터(하단) 링크 목록.
  familySites: FamilySite[];     // 패밀리 사이트 링크 목록.
}

// ─── Payment (PortOne V1) ───
// PortOne V1 결제 요청 페이로드. payMethod는 카드/계좌이체로 제한.
// PortOne = 결제 대행 서비스(여러 결제수단을 한 번에 연동). "페이로드"=보낼 데이터 묶음.
export interface PaymentRequest {
  orderId: string;     // 우리 주문 번호.
  orderName: string;   // 결제창에 표시될 주문명.
  totalAmount: number; // 결제 금액.
  payMethod: 'CARD' | 'TRANSFER'; // 결제 방식: 카드 또는 계좌이체 둘 중 하나만.
  customer: {          // 구매자 정보(객체 안에 객체 = 중첩 구조).
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

// 결제 성공 응답. 결제 식별자와 거래 ID를 반환.
export interface PaymentSuccess {
  paymentId: string; // 결제 건 식별자.
  txId: string;      // 거래(transaction) 고유 ID.
}

// 결제 실패/에러 응답.
export interface PaymentError {
  code: string;    // 에러 코드.
  message: string; // 에러 메시지(사용자/개발자에게 보여줄 설명).
}

// 결제 결과 유니온: 성공 또는 에러. code 필드 유무 등으로 분기(타입 가드) 가능.
// 타입 가드(type guard) = "지금 이 값이 둘 중 어느 쪽인지" 코드로 확인하는 것.
//   예) if ('code' in 결과) { 에러 처리 } else { 성공 처리 }
//      → PaymentError에만 있는 code 속성의 유무로 두 경우를 안전하게 구분한다.
export type PaymentResult = PaymentSuccess | PaymentError;

// ─── Toast ───
// 토스트 알림 종류 유니온.
// 토스트(toast) = 화면 모서리에 잠깐 떴다 사라지는 작은 알림 메시지.
export type ToastType = 'info' | 'success' | 'error' | 'warning';

// 화면에 표시되는 토스트 알림 한 건.
export interface Toast {
  id: number;       // 알림 고유 번호(여러 개가 동시에 떠도 구분/제거하기 위함).
  message: string;  // 보여줄 문구.
  type: ToastType;  // 알림 종류(색상/아이콘이 종류에 따라 달라짐).
}

// ─── Theme ───
// 테마 모드 유니온: 시스템 자동/라이트/다크.
// auto = 사용자의 운영체제(OS) 설정을 따라감 / light = 밝은 테마 / dark = 어두운 테마.
export type ThemeMode = 'auto' | 'light' | 'dark';
// 강조 색상 테마 유니온.
export type ColorTheme = 'blue' | 'red' | 'green' | 'purple' | 'orange';

// ─── Language ───
// 지원 언어 유니온: 한국어/영어.
export type Language = 'ko' | 'en';

// ─── LMS Types ───
// LMS(Learning Management System) = 학습 관리 시스템. 공지/자료/과제/출결 등 강의 운영 데이터들.

// 공지사항. is_pinned가 true면 목록 상단 고정.
export interface Announcement {
  id: string;          // 공지 고유 id.
  title: string;       // 제목.
  content: string;     // 본문.
  category: string;    // 분류.
  is_pinned: boolean;  // 상단 고정 여부 (true면 목록 맨 위에 항상 보이게 처리).
  author_id: string;   // 작성자 id.
  author_name: string; // 작성자 표시 이름.
  created_at: string;  // 작성 시각.
  updated_at: string;  // 수정 시각.
}

// 강의 자료. day_number로 차시(일자)별 자료를 구분하고 파일 메타데이터를 포함.
export interface Material {
  id: string;          // 자료 id.
  title: string;       // 자료 제목.
  description: string; // 설명.
  category: string;    // 분류.
  file_url: string;    // 첨부 파일 주소.
  file_type: string;   // 파일 종류(pdf, zip 등).
  file_size: number;   // 바이트 단위 파일 크기 (1MB 약 1,000,000바이트. 화면에는 보기 좋게 변환해 표시).
  day_number: number;  // 강의 차시(몇 일차 자료인지)
  author_id: string;   // 등록자 id.
  created_at: string;  // 등록 시각.
}

// 과제. is_team이 true면 팀 단위 제출 과제.
export interface Assignment {
  id: string;          // 과제 id.
  title: string;       // 과제 제목.
  description: string; // 과제 설명.
  category: string;    // 분류.
  day_number: number;  // 어느 차시 과제인지.
  due_date: string;    // 마감 기한
  max_score: number;   // 만점 점수
  is_team: boolean;    // 팀 과제 여부 (true면 팀 단위로 한 번 제출).
  created_at: string;  // 생성 시각.
}

// 과제 제출물. score/graded_at은 채점 전이면 null.
export interface Submission {
  id: string;            // 제출물 id.
  assignment_id: string; // 어떤 과제에 대한 제출인지(과제 id 참조).
  student_id: string;    // 제출한 학생 id.
  student_name: string;  // 학생 이름.
  team_id: string | null; // 팀 과제면 팀 ID, 개인 과제면 null
  content: string;       // 제출 내용(텍스트).
  file_url: string;      // 제출 파일 주소.
  score: number | null;  // 채점 전이면 null
                         // 주의: 0점과 "아직 채점 안 함(null)"은 다르다! null 체크를 따로 해야 한다.
  feedback: string;      // 채점자 피드백.
  submitted_at: string;  // 제출 시각.
  graded_at: string | null; // 채점 완료 시각(미채점이면 null)
}

// 출결 기록. status는 출석/결석/지각/공결 중 하나.
export interface Attendance {
  id: string;         // 출결 기록 id.
  student_id: string; // 학생 id.
  date: string;       // 해당 날짜.
  status: 'present' | 'absent' | 'late' | 'excused'; // present 출석 / absent 결석 / late 지각 / excused 공결.
  check_in_time: string; // 입실(체크인) 시각.
  note: string;          // 비고(메모).
}

// 팀. members로 소속 팀원 목록을 가진다.
export interface Team {
  id: string;            // 팀 id.
  name: string;          // 팀 이름.
  description: string;   // 팀 소개.
  project_topic: string; // 프로젝트 주제.
  members: TeamMember[]; // 팀원 목록(TeamMember 들의 배열).
  created_at: string;    // 생성 시각.
}

// 팀 구성원. role로 팀 내 역할(팀장 등)을 표기.
export interface TeamMember {
  id: string;    // 팀원 id.
  name: string;  // 이름.
  email: string; // 이메일.
  role: string;  // 팀 내 역할(예: leader, member).
}

// 프로젝트. category는 개인미니/팀미니/실전, status는 진행 단계를 나타냄.
export interface Project {
  id: string;          // 프로젝트 id.
  team_id: string;     // 소속 팀 id.
  title: string;       // 프로젝트 제목.
  description: string; // 설명.
  category: 'mini-personal' | 'mini-team' | 'real'; // 프로젝트 유형
                                                    // mini-personal 개인 미니 / mini-team 팀 미니 / real 실전.
  status: 'planning' | 'in-progress' | 'testing' | 'completed'; // 진행 단계
                                                                // planning 기획, in-progress 진행, testing 테스트, completed 완료.
  repo_url: string;         // 소스 코드 저장소(깃) 주소.
  demo_url: string;         // 데모(시연) 주소.
  presentation_url: string; // 발표 자료 주소.
  llm_used: string[];       // 프로젝트에 사용한 LLM 목록 (LLM = 대규모 언어 모델, 예: Claude, GPT).
  created_at: string;       // 생성 시각.
  updated_at: string;       // 수정 시각.
}

// Q&A 항목. is_resolved로 답변 완료 여부, reply_* 필드로 답변 내용을 담는다.
export interface QnAItem {
  id: string;          // 질문 id.
  title: string;       // 질문 제목.
  content: string;     // 질문 내용.
  author_id: string;   // 질문자 id.
  author_name: string; // 질문자 이름.
  category: string;    // 분류.
  is_resolved: boolean;// 답변 완료(해결) 여부
  reply_content: string; // 답변 본문.
  reply_author: string;  // 답변자 이름.
  replied_at: string | null; // 답변 시각(미답변이면 null)
  created_at: string;        // 질문 작성 시각.
}

// 학습 리소스(도구/LLM/참고자료/튜토리얼) 링크. sort_order로 노출 순서 제어.
export interface Resource {
  id: string;          // 리소스 id.
  title: string;       // 리소스 제목.
  description: string; // 설명.
  url: string;         // 링크 주소.
  category: 'tool' | 'llm' | 'reference' | 'tutorial'; // tool 도구 / llm 모델 / reference 참고자료 / tutorial 튜토리얼.
  icon: string;        // 표시할 아이콘(이름 또는 주소).
  sort_order: number;  // 노출 순서(작을수록 앞).
}
