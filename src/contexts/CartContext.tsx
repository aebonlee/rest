/**
 * CartContext.tsx — 장바구니 전역 상태 컨텍스트(쇼핑 기능용)
 *
 * [이 파일이 무엇인가요?]
 *  - "장바구니(Cart)" 데이터를 앱 어디서든 꺼내 쓸 수 있게 해 주는 파일입니다.
 *  - 예) 상품 목록 화면에서 "담기"를 누르면, 멀리 떨어진 헤더의 장바구니 아이콘
 *    숫자도 같이 바뀌어야 하죠. 이렇게 떨어진 컴포넌트가 같은 데이터를 보게
 *    해 주는 것이 React의 "Context(전역 보관함)"입니다.
 *
 * [초보자가 알아야 할 용어]
 *  - Context: props로 한 단계씩 내려보내지 않고도(=props drilling 방지) 멀리 있는
 *    컴포넌트가 같은 데이터를 꺼내 쓰게 해 주는 "전역 보관함".
 *  - Provider: Context에 "실제 값"을 채워 자식들에게 공급하는 컴포넌트. <Provider>로
 *    감싼 영역 안에서만 그 값을 꺼낼 수 있다.
 *  - Hook(훅): use로 시작하는 함수(useState/useEffect/useContext 등). 컴포넌트나
 *    다른 훅의 "최상단"에서만 호출해야 한다(조건문/반복문 안에서 호출 금지).
 *  - sessionStorage: 브라우저 임시 저장소. "탭"을 닫으면 사라진다.
 *    (localStorage는 탭을 닫아도 남음 — 여기선 일부러 sessionStorage 사용)
 *
 * 역할:
 *  - 상품 담기/빼기/수량변경/비우기와 합계·개수 계산을 전역으로 제공.
 *  - sessionStorage에 장바구니를 보존해 새로고침에도 유지(탭 종료 시 소멸).
 *
 * 핵심 책임:
 *  - cartItems 상태 + 변경 시 sessionStorage 동기화(useEffect).
 *  - 수량 범위(1~99) 클램프, 품절 상품 추가 차단, NaN 방어 합계 계산.
 *
 * 주요 export:
 *  - CartProvider: 장바구니 상태 제공 Provider.
 *  - useCart: 장바구니 접근 훅(Provider 없으면 빈 카트 폴백 — features.shop=false 대비).
 */

// React에서 가져오는 도구들:
//  - createContext: 새 Context(보관함)를 만든다.
//  - useContext: 만들어 둔 Context에서 값을 꺼낸다.
//  - useState: 컴포넌트가 기억할 "상태(state)"를 만든다(값이 바뀌면 화면 다시 그림).
//  - useEffect: 렌더링 이후 "부수효과(저장/구독 등)"를 실행한다.
//  - useCallback: 함수를 "기억(메모이즈)"해 매 렌더마다 새로 만들지 않게 한다.
//  - type ReactElement: TypeScript용 타입(컴포넌트가 반환하는 JSX 요소의 타입).
//    참고: 'type'을 붙여 import하면 "타입 전용"이라 빌드된 JS에는 남지 않는다.
import { createContext, useContext, useState, useEffect, useCallback, type ReactElement } from 'react';
// CartItem(장바구니 한 줄: 상품 + 수량), Product(상품) 타입. 'type'이라 런타임엔 사라짐.
import type { CartItem, Product } from '../types';
// 사이트별 설정(예: site.id). 같은 코드로 여러 사이트를 운영하기 위한 구분값.
import site from '../config/site';

// CartContextValue — 이 Context가 외부에 제공할 "값의 모양(타입)" 정의.
// 즉, useCart()를 쓰면 아래 항목들을 받을 수 있다는 "계약서"이다.
interface CartContextValue {
  cartItems: CartItem[];                                          // 장바구니에 담긴 항목 목록
  cartTotal: number;    // 합계 금액 = (가격 × 수량)의 총합
  cartCount: number;    // 총 수량 = 모든 항목 수량의 합
  addItem: (product: Product) => void;                           // 상품 담기
  removeItem: (productId: number) => void;                       // 특정 상품 빼기
  updateQuantity: (productId: number, quantity: number) => void; // 특정 상품 수량 변경
  clearCart: () => void;                                         // 전체 비우기
}

// 실제 Context 객체 생성. 초기값을 null로 두는 이유:
//  - "Provider로 감싸지 않은 상태"인지 아래(useCart)에서 판별하기 위함.
// <CartContextValue | null> 은 "값이 있거나(value) 아직 없거나(null)"라는 타입 표시.
const CartContext = createContext<CartContextValue | null>(null);

// 사이트별로 분리되는 sessionStorage 키(다른 사이트 카트와 충돌 방지).
// 백틱(`) 안의 ${...}는 "템플릿 리터럴"로, 변수를 문자열에 끼워 넣는다.
// 예) site.id가 'rest'면 STORAGE_KEY는 'rest_cart'가 된다.
// 주의: 백틱 문자열 내부에는 주석을 절대 넣지 말 것(문자열 값이 바뀜).
const STORAGE_KEY = `${site.id}_cart`;

// loadCart — sessionStorage에서 저장된 카트를 복원(없거나 파싱 실패 시 빈 배열).
// 반환값: CartItem[] (복원된 장바구니 또는 빈 배열)
// 왜 try/catch? 저장값이 손상돼 JSON.parse가 실패할 수 있는데, 그때 앱이 죽지 않도록
// "빈 배열"로 안전하게 폴백하기 위해서이다(방어적 프로그래밍).
const loadCart = (): CartItem[] => {
  try {
    // getItem: 저장된 문자열을 읽는다. 없으면 null이 반환된다.
    const saved = sessionStorage.getItem(STORAGE_KEY);
    // saved가 있으면(truthy) JSON 문자열을 객체 배열로 되돌리고, 없으면 빈 배열을 반환.
    // (삼항 연산자: 조건 ? 참일때 : 거짓일때)
    // 'as CartItem[]'는 TS에게 "이 결과를 CartItem 배열로 취급해"라고 알리는 타입 단언.
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    // JSON.parse 실패 등 어떤 오류가 나도 빈 배열로 안전 복귀.
    return [];
  }
};

// CartProviderProps — CartProvider가 받는 props(매개변수)의 타입.
interface CartProviderProps {
  // children: <CartProvider> ...여기 내용... </CartProvider> 의 "안쪽 내용".
  // React.ReactNode는 JSX로 넣을 수 있는 거의 모든 것(요소/문자열/배열 등)을 의미.
  children: React.ReactNode;
}

// CartProvider — 카트 상태와 조작 함수들을 컨텍스트로 제공.
// 사용처: 보통 앱 최상단(App)에서 <CartProvider>로 전체를 감싼다.
// 그래야 그 안의 모든 화면에서 useCart()로 같은 장바구니를 공유할 수 있다.
export const CartProvider = ({ children }: CartProviderProps): ReactElement => {
  // 초기값은 sessionStorage에서 복원(lazy initializer).
  // useState(loadCart)처럼 "함수 자체"를 넘기면(loadCart() 가 아님!) React가
  // 첫 렌더 때 딱 한 번만 그 함수를 실행한다 = "지연(lazy) 초기화".
  // 주의: useState(loadCart()) 로 쓰면 매 렌더마다 불필요하게 실행되니 함수 참조를 넘긴다.
  // setCartItems: 상태를 바꾸는 함수. 이걸 호출해야 화면이 다시 그려진다(직접 대입 금지).
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);

  // 카트가 바뀔 때마다 sessionStorage에 저장(새로고침 보존).
  // useEffect(실행할일, [의존성배열]):
  //  - 의존성 배열 [cartItems] 안의 값이 바뀔 때마다 위 함수가 다시 실행된다.
  //  - 즉, 장바구니가 변할 때마다 최신 내용을 저장소에 기록한다.
  // JSON.stringify: 배열/객체를 "문자열"로 변환(저장소엔 문자열만 넣을 수 있어서).
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // addItem — 상품 추가. 이미 있으면 수량 +1(최대 99), 품절이면 무시.
  // 매개변수: product(담을 상품). 반환: 없음(void). 부수효과: cartItems 상태 변경.
  // useCallback(함수, []) : 의존성 배열이 비어 있어 처음 만든 함수를 계속 재사용.
  //   → 자식에 props로 넘길 때 "매번 새 함수"로 보이지 않게 해 불필요한 재렌더를 줄인다.
  const addItem = useCallback((product: Product) => {
    // 품절이면 early return(아무 일도 안 하고 종료). — 엣지케이스 방어.
    if (product.isSoldOut) return;
    // setCartItems에 "함수형 업데이트"를 넘긴다. prev는 "직전 최신 상태".
    // 왜 함수형으로? 연속 호출 시에도 항상 최신 값을 기준으로 계산해 경쟁 상태를 피하기 위함.
    setCartItems(prev => {
      // 같은 id 상품이 이미 카트에 있는지 찾는다(find: 첫 일치 항목 또는 undefined).
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // 이미 있으면: 그 항목만 수량 +1, 나머지는 그대로 둔 "새 배열"을 만든다.
        // map은 원본을 안 바꾸고 새 배열을 만든다(=불변성 유지). React 상태 직접 수정 금지!
        return prev.map(item =>
          item.id === product.id
            // { ...item }으로 기존 값 복사 후 quantity만 덮어쓴다(얕은 복사 + 새 객체).
            ? { ...item, quantity: Math.min(item.quantity + 1, 99) }   // 99개 상한 클램프
            // 일치하지 않는 항목은 손대지 않고 그대로 반환.
            : item
        );
      }
      // 카트에 없던 새 상품이면: 기존 목록을 펼치고(...prev) 새 항목을 뒤에 추가.
      // 새 항목은 상품 정보(...product)에 quantity:1을 붙여 만든다.
      return [...prev, { ...product, quantity: 1 }];   // 신규 항목은 수량 1로
    });
  }, []);

  // removeItem — 특정 상품을 카트에서 제거.
  // 매개변수: productId(제거할 상품의 id). 부수효과: cartItems 상태 변경.
  const removeItem = useCallback((productId: number) => {
    // filter: "조건을 만족하는 것만 남긴" 새 배열을 만든다.
    // id가 다른 항목만 남기므로 → 결과적으로 해당 id 항목이 빠진다(불변성 유지).
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  // updateQuantity — 수량 직접 지정. 1~99 범위를 벗어나면 무시(불변 업데이트).
  // 매개변수: productId(대상 상품), quantity(새 수량). 부수효과: cartItems 상태 변경.
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    // 허용 범위(1~99) 밖이면 그냥 종료 — 잘못된 입력으로 상태가 망가지는 것을 막는다.
    if (quantity < 1 || quantity > 99) return;
    setCartItems(prev =>
      // 대상 항목만 quantity를 새 값으로 바꾼 새 객체로 교체, 나머지는 그대로.
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  // clearCart — 카트 전체 비우기.
  // 부수효과: cartItems를 빈 배열로 만든다 → useEffect가 저장소도 빈 배열로 갱신.
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // 파생값: 합계 금액/총 수량. Number(...)||0 으로 NaN·잘못된 값 방어.
  // "파생값"이란? 상태(cartItems)로부터 계산해 낸 값. 따로 state로 저장하지 않고
  // 렌더할 때마다 계산한다(상태를 중복 저장하면 불일치 버그가 생기기 쉬움).
  // reduce(누적함수, 초기값0): 배열을 훑으며 하나의 값으로 합쳐 준다.
  //  - Number(item.price): 문자열로 들어온 가격도 숫자로 변환.
  //  - || 0: 변환 결과가 NaN(숫자 아님)이면 NaN은 falsy라 0으로 대체 → 합계가 NaN 되는 사고 방지.
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  // 총 수량: 각 항목 수량을 모두 더한다(마찬가지로 NaN은 0으로 방어).
  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Provider의 value에 "공급할 값"을 모아 넘긴다.
  // 이 영역(=children) 안의 어떤 컴포넌트든 useCart()로 아래 값들을 꺼낼 수 있다.
  // 주의: value에 매번 새 객체를 넘기면 하위 소비자가 자주 재렌더될 수 있다.
  //   (대규모 최적화 시 useMemo로 감싸기도 하지만, 여기선 단순함을 우선한 구조다.)
  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      cartCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {/* children: <CartProvider>로 감싼 안쪽 내용을 그대로 그 자리에 렌더한다. */}
      {children}
    </CartContext.Provider>
  );
};

// 쇼핑 기능이 꺼져 Provider가 없을 때 사용하는 안전한 빈 카트(no-op).
// no-op = "no operation"(아무 일도 안 하는 함수). 호출해도 에러 없이 조용히 통과시키기 위함.
// 왜 필요? 쇼핑 기능(features.shop)이 꺼진 사이트에선 <CartProvider>로 감싸지 않을 수 있다.
// 그때도 useCart()를 호출한 컴포넌트가 터지지 않도록 "빈 장바구니"를 미리 만들어 둔다.
const EMPTY_CART: CartContextValue = {
  cartItems: [],
  cartTotal: 0,
  cartCount: 0,
  addItem: () => {},        // 아무 동작 안 함
  removeItem: () => {},     // 아무 동작 안 함
  updateQuantity: () => {}, // 아무 동작 안 함
  clearCart: () => {},      // 아무 동작 안 함
};

// useCart — 카트 접근 훅. Provider가 없으면(features.shop === false) 빈 카트를 반환해 안전.
// 사용 예) const { cartCount, addItem } = useCart();
// 이렇게 "커스텀 훅"으로 감싸면 쓰는 쪽이 useContext/CartContext 세부를 몰라도 된다.
export const useCart = (): CartContextValue => {
  // useContext: 가장 가까운 위쪽 <CartContext.Provider>의 value를 가져온다.
  // Provider가 위에 없으면 createContext에서 준 초기값(null)이 그대로 들어온다.
  const context = useContext(CartContext);
  // CartProvider가 없으면 (features.shop === false) 빈 카트 반환
  // ?? 는 "널 병합 연산자": 왼쪽이 null 또는 undefined일 때만 오른쪽 값을 쓴다.
  //   → Provider가 있으면 context를, 없으면 EMPTY_CART를 돌려준다(앱이 죽지 않음).
  return context ?? EMPTY_CART;
};
