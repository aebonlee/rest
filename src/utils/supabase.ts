/**
 * supabase.ts
 *
 * 이 파일의 역할:
 *   - Supabase 클라이언트를 지연 초기화(lazy init)하고, 주문(orders)/주문항목(order_items)
 *     관련 데이터 접근 로직을 한곳에 모은 데이터 액세스 계층(DAL)이다.
 *
 * 핵심 책임:
 *   - 환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)가 설정된 경우에만 실제 Supabase에 연결.
 *   - 환경변수가 없으면 인메모리 저장소(_memoryOrders)로 폴백하여 로컬/데모 환경에서도 동작 보장.
 *   - 주문 생성, 주문번호 조회, 결제 상태 업데이트, 결제 검증(Edge Function), 사용자별 주문 조회 제공.
 *   - PKCE 기반 인증 세션 설정 및 RLS(Row Level Security) 정책과 연계된 권한 처리.
 *
 * 주요 export:
 *   - TABLES: 테이블명 상수 (site.dbPrefix 접두사 적용)
 *   - createOrder, getOrderByNumber, updateOrderStatus, verifyPayment, getOrdersByUser: 데이터 함수
 *   - default export: getSupabase (클라이언트 획득 함수)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { OrderData, Order, PaymentStatus } from '../types';
import site from '../config/site';

// 빌드 시점에 Vite가 주입하는 환경변수. 설정되지 않으면 undefined → 인메모리 폴백 모드로 동작.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Supabase 테이블명 (site.dbPrefix 기반) */
// 프로젝트별로 같은 DB를 공유할 때 충돌을 막기 위해 dbPrefix를 붙여 테이블명을 구성한다.
export const TABLES = {
  orders: `${site.dbPrefix}orders`,
  order_items: `${site.dbPrefix}order_items`,
} as const;

// Supabase client - initialized only when env vars are set
// 싱글턴 클라이언트 캐시. 최초 getSupabase 호출 시 한 번만 생성된다.
let supabase: SupabaseClient | null = null;
// Supabase 미설정(폴백) 환경에서 주문을 임시 보관하는 인메모리 저장소. 새로고침 시 소실됨.
let _memoryOrders: Order[] = [];

/**
 * Supabase 클라이언트를 지연 생성/반환한다.
 * - 매개변수: 없음
 * - 반환값: 환경변수가 있으면 SupabaseClient, 없으면 null
 * - 부수효과: 최초 호출 시 모듈 전역 `supabase` 변수에 클라이언트를 캐시한다.
 */
const getSupabase = (): SupabaseClient | null => {
  // 아직 생성되지 않았고 env 값이 둘 다 있을 때만 생성 (env 없으면 계속 null 유지)
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // PKCE 플로우: SPA에서 안전한 OAuth 인증 코드 교환을 위해 사용
        flowType: 'pkce',
        detectSessionInUrl: true,   // OAuth 리다이렉트 URL의 세션 정보를 자동 감지
        autoRefreshToken: true,     // 액세스 토큰 만료 전 자동 갱신
        persistSession: true,       // 세션을 로컬 스토리지에 저장해 새로고침 후에도 유지
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
 * - 반환값: 생성된 Order 객체 (Promise)
 * - 부수효과: Supabase orders/order_items 테이블에 INSERT, 또는 폴백 시 _memoryOrders에 push.
 */
export const createOrder = async (orderData: OrderData): Promise<Order> => {
  const client = getSupabase();

  // 폴백 경로: Supabase 미설정 시 메모리에 주문 생성 후 반환
  if (!client) {
    const order: Order = {
      id: crypto.randomUUID(),          // 클라이언트에서 임시 UUID 발급
      ...orderData,
      payment_status: 'pending',        // 결제 전 기본 상태
      created_at: new Date().toISOString()
    };
    _memoryOrders.push(order);
    return order;
  }

  // Insert order
  // DB 스키마에 맞는 컬럼만 추려서 payload 구성 (items는 별도 테이블로 분리 저장)
  const orderPayload: Record<string, unknown> = {
    order_number: orderData.order_number,
    user_email: orderData.user_email,
    user_name: orderData.user_name,
    user_phone: orderData.user_phone,
    total_amount: orderData.total_amount,
    payment_method: orderData.payment_method
  };
  // user_id는 로그인 사용자가 있을 때만 포함 (비회원 주문은 생략)
  if (orderData.user_id) orderPayload.user_id = orderData.user_id;

  // orders 테이블에 INSERT 후 생성된 단일 행을 반환받음(.single())
  const { data: order, error: orderError } = await client
    .from(TABLES.orders)
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) throw orderError;

  // Insert order items
  // 주문에 항목이 있을 때만 order_items 테이블에 일괄 INSERT
  if (orderData.items && orderData.items.length > 0) {
    const { error: itemsError } = await client
      .from(TABLES.order_items)
      .insert(
        // 각 항목에 방금 생성된 주문 id(order.id)를 FK로 연결
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
  if (!client) {
    return _memoryOrders.find(o => o.order_number === orderNumber) || null;
  }

  // orders에서 주문번호로 최대 1건 조회 (.single() 대신 limit(1)로 0건 에러 방지)
  const { data: orders, error } = await client
    .from(TABLES.orders)
    .select('*')
    .eq('order_number', orderNumber)
    .limit(1);

  if (error) throw error;
  // 결과가 비어 있으면 주문 없음
  if (!orders || orders.length === 0) return null;

  const order = orders[0];

  // Fetch order items
  // 조회된 주문 id로 연결된 주문항목들을 추가 조회 (에러는 무시하고 빈 배열 폴백)
  const { data: items } = await client
    .from(TABLES.order_items)
    .select('*')
    .eq('order_id', order.id);

  // 주문 본문에 항목 배열을 합쳐 반환
  return { ...order, items: items || [] } as Order;
};

/**
 * Update order payment status
 *
 * 주문의 결제 상태를 업데이트한다.
 * - 매개변수:
 *     orderId      업데이트 대상 주문 id (폴백 시 order_number도 허용)
 *     status       변경할 결제 상태 (pending/paid/cancelled 등)
 *     paymentId    PortOne 결제 식별자 (선택)
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
  if (!client) {
    const idx = _memoryOrders.findIndex(o => o.id === orderId || o.order_number === orderId);
    if (idx >= 0) {
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
    return _memoryOrders[idx];
  }

  // DB에 항상 존재하는 핵심 컬럼만 담는 기본 payload
  const updatePayload: Record<string, unknown> = { payment_status: status };
  if (status === 'paid') updatePayload.paid_at = new Date().toISOString();
  if (status === 'cancelled') {
    updatePayload.cancelled_at = new Date().toISOString();
    if (cancelReason) updatePayload.cancel_reason = cancelReason;
  }

  // Build full payload with optional columns (may not exist in DB yet)
  // portone_payment_id 같은 선택 컬럼은 DB 마이그레이션 전일 수 있어 별도로 분리
  const extras: Record<string, unknown> = {};
  if (paymentId) extras.portone_payment_id = paymentId;

  let result: Order[] | null = null;

  try {
    // 1차 시도: 선택 컬럼까지 포함한 전체 payload로 업데이트
    const { data, error } = await client
      .from(TABLES.orders)
      .update({ ...updatePayload, ...extras })
      .eq('id', orderId)
      .select();

    if (error) throw error;
    result = data as Order[] | null;
  } catch {
    // Fallback: update without optional columns
    // 선택 컬럼이 DB에 없어 1차가 실패하면, 핵심 컬럼만으로 재시도
    const { data, error } = await client
      .from(TABLES.orders)
      .update(updatePayload)
      .eq('id', orderId)
      .select();

    if (error) throw error;
    result = data as Order[] | null;
  }

  // 업데이트된 행이 0건이면: RLS UPDATE 정책 차단 또는 주문 미존재 → 명시적 에러로 전파
  if (!result || result.length === 0) {
    throw new Error('UPDATE_NO_ROWS: 주문 업데이트 권한이 없거나 해당 주문을 찾을 수 없습니다. Supabase orders 테이블의 UPDATE RLS 정책을 확인하세요.');
  }

  return result[0];
};

/**
 * Verify payment via Edge Function
 *
 * Supabase Edge Function('verify-payment')을 통해 결제를 서버 측에서 검증한다.
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
    await updateOrderStatus(orderId, 'paid', paymentId);
    return { verified: true };
  }

  // Edge Function 호출: 결제사 API와 대조하는 검증 로직은 서버에서 수행
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
  if (!client) return [];

  // 중첩 select: orders와 함께 연결된 order_items를 한 번에 조인 조회
  const selectQuery = `*, ${TABLES.order_items}(*)`;
  const { data, error } = await client
    .from(TABLES.orders)
    .select(selectQuery)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });   // 최신 주문이 먼저 오도록 내림차순 정렬

  if (error) {
    // 조회 실패 시 throw 대신 로깅 후 빈 배열 반환 (UI가 깨지지 않도록)
    console.error('getOrdersByUser error:', error);
    return [];
  }
  return (data || []) as unknown as Order[];
};

// 기본 export: 클라이언트 획득 함수. 다른 모듈에서 직접 쿼리할 때 사용.
export default getSupabase;
