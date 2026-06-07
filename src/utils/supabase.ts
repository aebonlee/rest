/**
 * supabase.ts
 *
 * [이 파일이 무엇인가 — 한 줄 요약]
 *   "주문(orders)" 데이터를 저장/조회하는 모든 코드를 한곳에 모아둔 파일이다.
 *   화면(컴포넌트) 쪽에서는 여기 있는 함수만 import해서 쓰면 되고,
 *   "DB에 어떻게 저장하는지" 같은 세부사항은 몰라도 된다. 이런 계층을 데이터 액세스 계층(DAL)이라 부른다.
 *
 * [초보자가 먼저 알아야 할 용어]
 *   - Supabase: PostgreSQL 데이터베이스 + 인증 + 서버리스 함수를 묶어 제공하는 클라우드 서비스.
 *               프론트엔드 코드에서 직접 DB에 접근할 수 있게 도와주는 "백엔드 대용" 도구라고 보면 된다.
 *   - 클라이언트(client): Supabase 서버와 통신하는 객체. createClient()로 만든다.
 *   - 환경변수(env): 코드에 직접 적지 않고 외부에서 주입하는 설정값(URL, 비밀키 등).
 *                    Vite에서는 import.meta.env.VITE_... 형태로 읽는다. (VITE_ 접두사가 있어야 브라우저로 노출됨)
 *   - 폴백(fallback): "원래 방법이 안 될 때 대신 쓰는 대안". 여기서는 env가 없으면
 *                     실제 DB 대신 메모리(변수) 안에 주문을 임시 저장한다 → 로컬/데모 환경에서도 앱이 돌아간다.
 *   - RLS(Row Level Security): DB 행(row) 단위 접근 권한 규칙. "이 사용자는 자기 주문만 볼 수 있다" 같은
 *                              보안 정책을 DB가 직접 강제한다. 권한이 없으면 쿼리가 막히거나 0건이 반환된다.
 *   - Promise / async / await: 비동기(시간이 걸리는) 작업을 다루는 문법.
 *                              네트워크 요청처럼 결과를 "나중에" 받는 작업은 Promise를 반환하고,
 *                              await를 붙이면 그 결과가 올 때까지 기다렸다가 다음 줄로 넘어간다.
 *
 * [핵심 책임]
 *   - 환경변수가 설정된 경우에만 실제 Supabase에 연결한다.
 *   - 환경변수가 없으면 인메모리 저장소(_memoryOrders)로 폴백하여 로컬/데모 환경에서도 동작을 보장한다.
 *   - 주문 생성, 주문번호 조회, 결제 상태 업데이트, 결제 검증(Edge Function), 사용자별 주문 조회를 제공한다.
 *   - PKCE 기반 인증 세션 설정 및 RLS(Row Level Security) 정책과 연계된 권한 처리를 한다.
 *
 * [주요 export]
 *   - TABLES: 테이블명 상수 (site.dbPrefix 접두사 적용)
 *   - createOrder, getOrderByNumber, updateOrderStatus, verifyPayment, getOrdersByUser: 데이터 함수
 *   - default export: getSupabase (클라이언트 획득 함수)
 */
// createClient: 클라이언트를 만드는 함수 / SupabaseClient: 그 클라이언트의 타입(TS에서 변수 모양을 알려줌)
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// 'import type'은 "타입 정보만" 가져온다는 뜻. 실행 코드가 아니라 컴파일 후 사라지므로 번들 크기에 영향이 없다.
import type { OrderData, Order, PaymentStatus } from '../types';
import site from '../config/site';

// 빌드 시점에 Vite가 주입하는 환경변수. 설정되지 않으면 undefined → 인메모리 폴백 모드로 동작.
// 주의: 두 값 중 하나라도 없으면 아래 getSupabase가 null을 반환하고, 모든 함수가 메모리 폴백으로 동작한다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Supabase 테이블명 (site.dbPrefix 기반) */
// 프로젝트별로 같은 DB를 공유할 때 충돌을 막기 위해 dbPrefix를 붙여 테이블명을 구성한다.
// 예: dbPrefix가 'rest_'라면 실제 테이블명은 'rest_orders', 'rest_order_items'가 된다.
// 백틱(`...`)은 "템플릿 리터럴"로, ${ } 안에 변수를 끼워 넣어 문자열을 조립한다.
// 'as const'는 이 객체의 값들을 "읽기 전용 + 정확한 문자열 타입"으로 고정해 실수 변경을 막아준다.
export const TABLES = {
  orders: `${site.dbPrefix}orders`,
  order_items: `${site.dbPrefix}order_items`,
} as const;

// Supabase client - initialized only when env vars are set
// 싱글턴 클라이언트 캐시. 최초 getSupabase 호출 시 한 번만 생성된다.
// (싱글턴 = 앱 전체에서 딱 하나만 존재하는 인스턴스. 매번 새로 만들면 낭비라서 한 번 만들고 재사용한다.)
let supabase: SupabaseClient | null = null;
// Supabase 미설정(폴백) 환경에서 주문을 임시 보관하는 인메모리 저장소. 새로고침 시 소실됨.
// 주의: 이 배열은 그냥 자바스크립트 변수일 뿐이라 브라우저를 새로고침하면 내용이 전부 사라진다. (영구 저장 아님)
let _memoryOrders: Order[] = [];

/**
 * Supabase 클라이언트를 지연 생성/반환한다.
 * - 지연 생성(lazy init): "필요해질 때 비로소 만든다". 모듈 로드 즉시 만들지 않고 첫 호출 때 생성한다.
 * - 매개변수: 없음
 * - 반환값: 환경변수가 있으면 SupabaseClient, 없으면 null
 * - 부수효과: 최초 호출 시 모듈 전역 `supabase` 변수에 클라이언트를 캐시한다.
 */
const getSupabase = (): SupabaseClient | null => {
  // 아직 생성되지 않았고 env 값이 둘 다 있을 때만 생성 (env 없으면 계속 null 유지)
  // !supabase: 아직 만든 적 없다는 뜻 → 이미 만들었다면 이 if를 건너뛰고 캐시된 걸 그대로 반환한다.
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // PKCE 플로우: SPA에서 안전한 OAuth 인증 코드 교환을 위해 사용
        // (SPA는 비밀키를 숨길 수 없는 환경이라, 코드 가로채기를 막는 PKCE 방식이 더 안전하다.)
        flowType: 'pkce',
        detectSessionInUrl: true,   // OAuth 리다이렉트 URL의 세션 정보를 자동 감지 (로그인 후 돌아온 URL에서 토큰을 꺼냄)
        autoRefreshToken: true,     // 액세스 토큰 만료 전 자동 갱신 (사용자가 갑자기 로그아웃되는 걸 방지)
        persistSession: true,       // 세션을 로컬 스토리지에 저장해 새로고침 후에도 로그인 상태 유지
      }
    });
  }
  return supabase;
};

/**
 * Create an order with order items
 * Falls back to in-memory store when Supabase is not configured
 *
 * 주문과 주문항목을 함께 생성한다.
 * - 매개변수: orderData (주문 입력 데이터: 주문번호, 사용자 정보, 금액, 결제수단, 항목 등)
 * - 반환값: 생성된 Order 객체 (Promise) — async 함수이므로 호출 측에서 await로 받아야 한다.
 * - 부수효과: Supabase orders/order_items 테이블에 INSERT, 또는 폴백 시 _memoryOrders에 push.
 */
export const createOrder = async (orderData: OrderData): Promise<Order> => {
  const client = getSupabase();

  // 폴백 경로: Supabase 미설정 시 메모리에 주문 생성 후 반환
  if (!client) {
    const order: Order = {
      id: crypto.randomUUID(),          // 클라이언트에서 임시 UUID 발급 (브라우저 내장 기능, 거의 안 겹치는 고유 문자열)
      ...orderData,                     // 스프레드(...): orderData의 모든 속성을 그대로 복사해 넣음 (불변성 유지에 자주 쓰는 패턴)
      payment_status: 'pending',        // 결제 전 기본 상태
      created_at: new Date().toISOString()  // 생성 시각을 표준 문자열(예: 2026-06-07T...)로 기록
    };
    _memoryOrders.push(order);          // 메모리 배열에 추가 (실제 DB INSERT 대신)
    return order;                       // 폴백은 여기서 끝 → 아래 DB 코드는 실행되지 않음
  }

  // Insert order
  // DB 스키마에 맞는 컬럼만 추려서 payload 구성 (items는 별도 테이블로 분리 저장)
  // 주의: orderData 전체를 그대로 보내면 DB에 없는 컬럼 때문에 에러가 날 수 있으므로, 필요한 필드만 골라 담는다.
  const orderPayload: Record<string, unknown> = {
    order_number: orderData.order_number,
    user_email: orderData.user_email,
    user_name: orderData.user_name,
    user_phone: orderData.user_phone,
    total_amount: orderData.total_amount,
    payment_method: orderData.payment_method
  };
  // user_id는 로그인 사용자가 있을 때만 포함 (비회원 주문은 생략)
  // 'if (orderData.user_id)'는 값이 있을 때(빈 문자열/undefined가 아닐 때)만 true가 된다.
  if (orderData.user_id) orderPayload.user_id = orderData.user_id;

  // orders 테이블에 INSERT 후 생성된 단일 행을 반환받음(.single())
  // 메서드 체이닝 흐름: from(어느 테이블).insert(넣을 데이터).select(넣은 결과 돌려줘).single(한 건만)
  // .single()은 정확히 1건을 기대한다 → 0건이거나 2건 이상이면 error에 값이 채워진다.
  const { data: order, error: orderError } = await client
    .from(TABLES.orders)
    .insert(orderPayload)
    .select()
    .single();

  // 구조 분해 할당으로 받은 error가 있으면 즉시 throw해서 호출 측이 알아채게 한다.
  if (orderError) throw orderError;

  // Insert order items
  // 주문에 항목이 있을 때만 order_items 테이블에 일괄 INSERT
  // (orderData.items가 없거나 빈 배열이면 굳이 DB를 건드릴 필요가 없다.)
  if (orderData.items && orderData.items.length > 0) {
    const { error: itemsError } = await client
      .from(TABLES.order_items)
      .insert(
        // 각 항목에 방금 생성된 주문 id(order.id)를 FK로 연결
        // .map(): 배열의 각 원소를 변환해 새 배열을 만든다. 여기선 각 item을 DB 컬럼 모양으로 바꾼다.
        // FK(외래 키): "이 주문항목이 어느 주문에 속하는지"를 가리키는 연결고리. order_id로 orders와 묶인다.
        orderData.items.map(item => ({
          order_id: order.id,
          product_title: item.product_title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }))
      );

    if (itemsError) throw itemsError;
  }

  // 주의: order는 DB가 돌려준 행이라 타입이 불확실해서 'as Order'로 타입을 단언(assert)해 알려준다.
  // (as는 "이 값을 이 타입으로 취급해"라는 TS 문법일 뿐, 실제 값을 바꾸지는 않는다.)
  return order as Order;
};

/**
 * Get order by order number
 * Falls back to in-memory store when Supabase is not configured
 *
 * 주문번호로 단일 주문을 조회한다.
 * - 매개변수: orderNumber (사용자에게 노출되는 주문번호 문자열)
 * - 반환값: 해당 주문(Order, 항목 포함) 또는 없으면 null (Promise)
 * - 부수효과: 없음(읽기 전용). 폴백 시 _memoryOrders에서 검색.
 */
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  const client = getSupabase();

  // 폴백: 메모리에서 주문번호 일치 항목 검색, 없으면 null
  // .find()는 조건에 맞는 첫 원소를 돌려주고, 없으면 undefined를 준다.
  // '|| null'은 undefined일 때 null로 바꿔 반환 타입(Order | null)을 맞춰준다.
  if (!client) {
    return _memoryOrders.find(o => o.order_number === orderNumber) || null;
  }

  // orders에서 주문번호로 최대 1건 조회 (.single() 대신 limit(1)로 0건 에러 방지)
  // 주의: 여기서 .single()을 쓰면 "결과 0건"일 때도 에러가 난다. 조회 안 됨은 정상 상황이므로
  //       limit(1)로 0~1건을 받고, 아래에서 빈 배열인지 직접 검사하는 방식이 더 안전하다.
  const { data: orders, error } = await client
    .from(TABLES.orders)
    .select('*')                          // '*'는 모든 컬럼을 가져오라는 뜻
    .eq('order_number', orderNumber)      // .eq(컬럼, 값): "컬럼 = 값"인 행만 (WHERE 조건)
    .limit(1);

  if (error) throw error;
  // 결과가 비어 있으면 주문 없음
  if (!orders || orders.length === 0) return null;

  const order = orders[0];

  // Fetch order items
  // 조회된 주문 id로 연결된 주문항목들을 추가 조회 (에러는 무시하고 빈 배열 폴백)
  // 주의: 여기서는 error를 일부러 받지 않는다(구조 분해에서 data만 뽑음). 항목 조회가 실패해도
  //       주문 본문은 보여주는 게 사용자 경험상 낫다는 판단. 아래 'items || []'로 안전하게 처리한다.
  const { data: items } = await client
    .from(TABLES.order_items)
    .select('*')
    .eq('order_id', order.id);

  // 주문 본문에 항목 배열을 합쳐 반환
  // { ...order, items: ... }: order의 모든 속성을 복사한 새 객체를 만들고 items 속성을 추가/덮어쓴다.
  // 'items || []'는 items가 null/undefined이면 빈 배열을 쓴다 → 화면에서 .map 돌릴 때 에러 방지.
  return { ...order, items: items || [] } as Order;
};

/**
 * Update order payment status
 *
 * 주문의 결제 상태를 업데이트한다.
 * - 매개변수:
 *     orderId      업데이트 대상 주문 id (폴백 시 order_number도 허용)
 *     status       변경할 결제 상태 (pending/paid/cancelled 등)
 *     paymentId    PortOne 결제 식별자 (선택 — '?'가 붙은 매개변수는 생략 가능)
 *     cancelReason 취소 사유 (status가 cancelled일 때 선택)
 * - 반환값: 업데이트된 Order, 또는 폴백에서 못 찾으면 undefined (Promise)
 * - 부수효과: orders 테이블 UPDATE (또는 _memoryOrders 갱신). RLS 권한 부족 시 예외 throw.
 */
export const updateOrderStatus = async (
  orderId: string,
  status: PaymentStatus,
  paymentId?: string,
  cancelReason?: string
): Promise<Order | undefined> => {
  const client = getSupabase();

  // 폴백: 메모리 주문을 id 또는 주문번호로 찾아 상태 갱신
  // .findIndex()는 조건에 맞는 첫 원소의 "위치(인덱스)"를 돌려주고, 없으면 -1을 준다.
  if (!client) {
    const idx = _memoryOrders.findIndex(o => o.id === orderId || o.order_number === orderId);
    if (idx >= 0) {                        // -1이 아니면(즉 찾았으면) 갱신 진행
      _memoryOrders[idx].payment_status = status;
      if (paymentId) _memoryOrders[idx].portone_payment_id = paymentId;
      // 결제 완료 시 결제 시각 기록
      if (status === 'paid') _memoryOrders[idx].paid_at = new Date().toISOString();
      // 취소 시 취소 시각/사유 기록
      if (status === 'cancelled') {
        _memoryOrders[idx].cancelled_at = new Date().toISOString();
        if (cancelReason) _memoryOrders[idx].cancel_reason = cancelReason;
      }
    }
    // 주의: idx가 -1이면 _memoryOrders[-1]은 undefined → 반환 타입의 'undefined'와 일치한다(못 찾음 의미).
    return _memoryOrders[idx];
  }

  // DB에 항상 존재하는 핵심 컬럼만 담는 기본 payload
  // Record<string, unknown>: "문자열 키 → 아무 타입 값"인 일반 객체 타입. 동적으로 속성을 추가하기 좋다.
  const updatePayload: Record<string, unknown> = { payment_status: status };
  if (status === 'paid') updatePayload.paid_at = new Date().toISOString();
  if (status === 'cancelled') {
    updatePayload.cancelled_at = new Date().toISOString();
    if (cancelReason) updatePayload.cancel_reason = cancelReason;
  }

  // Build full payload with optional columns (may not exist in DB yet)
  // portone_payment_id 같은 선택 컬럼은 DB 마이그레이션 전일 수 있어 별도로 분리
  // (마이그레이션 = DB 구조를 바꾸는 작업. 아직 컬럼을 안 만들었으면 그 컬럼에 쓰려다 에러가 난다.)
  const extras: Record<string, unknown> = {};
  if (paymentId) extras.portone_payment_id = paymentId;

  let result: Order[] | null = null;

  try {
    // 1차 시도: 선택 컬럼까지 포함한 전체 payload로 업데이트
    // { ...updatePayload, ...extras }: 두 객체를 합쳐 하나의 업데이트 데이터로 만든다.
    const { data, error } = await client
      .from(TABLES.orders)
      .update({ ...updatePayload, ...extras })
      .eq('id', orderId)                 // id가 일치하는 행만 수정
      .select();                         // 수정된 행들을 돌려받음

    if (error) throw error;              // throw하면 즉시 아래 catch로 점프한다
    result = data as Order[] | null;
  } catch {
    // Fallback: update without optional columns
    // 선택 컬럼이 DB에 없어 1차가 실패하면, 핵심 컬럼만으로 재시도
    // (이렇게 두 번 시도하는 이유: 구버전 DB에서도 최소한의 상태 업데이트는 성공시키기 위해서다.)
    const { data, error } = await client
      .from(TABLES.orders)
      .update(updatePayload)
      .eq('id', orderId)
      .select();

    if (error) throw error;
    result = data as Order[] | null;
  }

  // 업데이트된 행이 0건이면: RLS UPDATE 정책 차단 또는 주문 미존재 → 명시적 에러로 전파
  // 주의: 에러 없이도 result가 빈 배열일 수 있다. RLS가 "수정 권한 없음"으로 행을 안 돌려주는 경우인데,
  //       이건 조용히 넘기면 버그를 놓치기 쉬우므로 일부러 에러를 던져 원인을 알려준다.
  if (!result || result.length === 0) {
    throw new Error('UPDATE_NO_ROWS: 주문 업데이트 권한이 없거나 해당 주문을 찾을 수 없습니다. Supabase orders 테이블의 UPDATE RLS 정책을 확인하세요.');
  }

  return result[0];
};

/**
 * Verify payment via Edge Function
 *
 * Supabase Edge Function('verify-payment')을 통해 결제를 서버 측에서 검증한다.
 * - Edge Function: Supabase가 실행해주는 서버리스 함수(클라우드 함수). 비밀키가 필요한 민감한 검증은
 *                  반드시 서버에서 해야 한다 → 브라우저 코드는 결과만 받는다(결제 위변조 방지).
 * - 매개변수: paymentId(결제 식별자), orderId(주문 id)
 * - 반환값: { verified: boolean } (Promise)
 * - 부수효과: 폴백 시 updateOrderStatus를 호출해 자동 'paid' 처리(개발/데모용).
 */
export const verifyPayment = async (
  paymentId: string,
  orderId: string
): Promise<{ verified: boolean }> => {
  const client = getSupabase();
  if (!client) {
    // Fallback: auto-approve for dev/demo
    // 실제 검증 서버가 없으므로 개발/데모 환경에서는 무조건 결제 완료 처리
    // 주의: 이건 어디까지나 개발 편의용이다. 실제 운영 환경(env 설정됨)에서는 아래 Edge Function이 진짜 검증한다.
    await updateOrderStatus(orderId, 'paid', paymentId);
    return { verified: true };
  }

  // Edge Function 호출: 결제사 API와 대조하는 검증 로직은 서버에서 수행
  // functions.invoke(함수이름, { body: 보낼데이터 }) 형태로 호출한다.
  const { data, error } = await client.functions.invoke('verify-payment', {
    body: { paymentId, orderId }
  });

  if (error) throw error;
  return data as { verified: boolean };
};

/**
 * Get orders by user ID
 *
 * 특정 사용자의 주문 목록을 항목과 함께 최신순으로 조회한다.
 * - 매개변수: userId (조회할 사용자 id)
 * - 반환값: Order 배열 (실패/폴백 시 빈 배열) (Promise)
 * - 부수효과: 없음(읽기 전용). 에러 발생 시 console.error로 로깅 후 빈 배열 반환.
 */
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const client = getSupabase();
  if (!client) return [];               // 폴백 환경에서는 사용자별 조회를 지원하지 않고 빈 배열 반환

  // 중첩 select: orders와 함께 연결된 order_items를 한 번에 조인 조회
  // "*, 자식테이블(*)" 문법은 Supabase에서 부모-자식 관계를 한 번의 쿼리로 같이 가져오는 방법이다.
  // 주의: 이게 가능하려면 DB에 두 테이블 사이 FK 관계가 설정돼 있어야 한다.
  const selectQuery = `*, ${TABLES.order_items}(*)`;
  const { data, error } = await client
    .from(TABLES.orders)
    .select(selectQuery)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });   // 최신 주문이 먼저 오도록 내림차순 정렬 (ascending: false = 내림차순)

  if (error) {
    // 조회 실패 시 throw 대신 로깅 후 빈 배열 반환 (UI가 깨지지 않도록)
    // (목록 조회는 실패해도 화면 전체를 멈추기보다 "주문 없음"처럼 보여주는 편이 사용자에게 덜 나쁘다.)
    console.error('getOrdersByUser error:', error);
    return [];
  }
  // 'as unknown as Order[]': 중첩 조인 결과는 타입이 복잡해 TS가 바로 못 받아들이므로,
  // 일단 unknown(아무 타입)으로 거친 뒤 Order[]로 단언하는 2단계 변환을 쓴다. (강제 형변환 우회 패턴)
  return (data || []) as unknown as Order[];
};

// 기본 export: 클라이언트 획득 함수. 다른 모듈에서 직접 쿼리할 때 사용.
// (named export는 import { 이름 }로, default export는 import 원하는이름 으로 가져온다.)
export default getSupabase;
