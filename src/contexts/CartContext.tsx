/**
 * CartContext.tsx — 장바구니 전역 상태 컨텍스트(쇼핑 기능용)
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
import { createContext, useContext, useState, useEffect, useCallback, type ReactElement } from 'react';
import type { CartItem, Product } from '../types';
import site from '../config/site';

interface CartContextValue {
  cartItems: CartItem[];
  cartTotal: number;    // 합계 금액
  cartCount: number;    // 총 수량
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// 사이트별로 분리되는 sessionStorage 키(다른 사이트 카트와 충돌 방지).
const STORAGE_KEY = `${site.id}_cart`;

// loadCart — sessionStorage에서 저장된 카트를 복원(없거나 파싱 실패 시 빈 배열).
const loadCart = (): CartItem[] => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
};

interface CartProviderProps {
  children: React.ReactNode;
}

// CartProvider — 카트 상태와 조작 함수들을 컨텍스트로 제공.
export const CartProvider = ({ children }: CartProviderProps): ReactElement => {
  // 초기값은 sessionStorage에서 복원(lazy initializer).
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);

  // 카트가 바뀔 때마다 sessionStorage에 저장(새로고침 보존).
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // addItem — 상품 추가. 이미 있으면 수량 +1(최대 99), 품절이면 무시.
  const addItem = useCallback((product: Product) => {
    if (product.isSoldOut) return;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 99) }   // 99개 상한 클램프
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];   // 신규 항목은 수량 1로
    });
  }, []);

  // removeItem — 특정 상품을 카트에서 제거.
  const removeItem = useCallback((productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  // updateQuantity — 수량 직접 지정. 1~99 범위를 벗어나면 무시(불변 업데이트).
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1 || quantity > 99) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  // clearCart — 카트 전체 비우기.
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // 파생값: 합계 금액/총 수량. Number(...)||0 으로 NaN·잘못된 값 방어.
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

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
      {children}
    </CartContext.Provider>
  );
};

// 쇼핑 기능이 꺼져 Provider가 없을 때 사용하는 안전한 빈 카트(no-op).
const EMPTY_CART: CartContextValue = {
  cartItems: [],
  cartTotal: 0,
  cartCount: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

// useCart — 카트 접근 훅. Provider가 없으면(features.shop === false) 빈 카트를 반환해 안전.
export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  // CartProvider가 없으면 (features.shop === false) 빈 카트 반환
  return context ?? EMPTY_CART;
};
