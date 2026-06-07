/**
 * ToastContext.tsx — 전역 토스트(스낵바) 알림 컨텍스트
 *
 * 역할:
 *  - 앱 어디서나 showToast로 잠깐 떴다 사라지는 알림을 띄울 수 있게 하는 전역 상태.
 *
 * 핵심 책임:
 *  - 토스트 목록 상태 관리 + 일정 시간(duration) 후 자동 제거(타이머).
 *  - 타입(success/error/info/warning)별 아이콘과 함께 화면 우측 등에 렌더.
 *
 * 주요 export:
 *  - ToastProvider: 토스트 상태를 제공하고 토스트 UI를 렌더하는 Provider.
 *  - useToast: showToast/removeToast 접근 훅(Provider 없으면 안전한 no-op 폴백).
 */
import { createContext, useContext, useState, useCallback, useRef, type ReactElement } from 'react';
import type { Toast, ToastType } from '../types';

// 컨텍스트로 노출하는 API — 토스트 띄우기/제거.
interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => number;   // 반환: 생성된 토스트 id
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// 토스트 고유 id 시퀀스(모듈 전역, 단조 증가).
let toastId = 0;

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * ToastProvider — 토스트 상태/타이머를 관리하고, children 아래에 토스트 컨테이너를 렌더.
 */
export function ToastProvider({ children }: ToastProviderProps): ReactElement {
  // 현재 표시 중인 토스트 목록.
  const [toasts, setToasts] = useState<Toast[]>([]);
  // id별 자동 제거 타이머 보관(언마운트/수동 제거 시 clearTimeout 위해 ref로 유지).
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // removeToast — 해당 id의 타이머를 정리하고 목록에서 제거.
  const removeToast = useCallback((id: number) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // showToast — 새 토스트를 추가하고 duration(기본 4초) 뒤 자동 제거 예약. 생성된 id 반환.
  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000): number => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* 스크린리더 알림용 role/aria-live — 동적으로 추가되는 토스트를 읽어줌 */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {/* 타입별 아이콘(조건부 렌더) */}
            <span className="toast-icon">
              {toast.type === 'success' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </span>
            <span className="toast-message">{toast.message}</span>
            {/* 수동 닫기 버튼 */}
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast — 토스트 API 접근 훅.
 * 엣지케이스: Provider 미설정 시 앱이 깨지지 않도록 console.warn만 하는 no-op 폴백을 반환한다.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (msg: string) => { console.warn('ToastProvider not found:', msg); return 0; },
      removeToast: () => {}
    };
  }
  return ctx;
}
