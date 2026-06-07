/**
 * ToastContext.tsx — 전역 토스트(스낵바) 알림 컨텍스트
 *
 * ┌─ 이 파일이 무엇인가? ────────────────────────────────────────────────┐
 * │ "토스트(toast)"는 화면 구석에 잠깐 떴다가 몇 초 뒤 스스로 사라지는    │
 * │ 작은 알림 메시지다. (예: "저장되었습니다", "로그인 실패")             │
 * │ 빵 굽는 토스터에서 빵이 톡 튀어나오는 모습에 빗대 "토스트"라 부른다.  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * 왜 "컨텍스트(Context)"로 만드는가?
 *  - 토스트는 앱의 아무 화면, 아무 버튼에서나 띄우고 싶다.
 *  - 만약 컨텍스트가 없다면, 토스트를 띄우는 함수를 부모 → 자식 → 손자…로
 *    props를 통해 계속 손에서 손으로 넘겨줘야 한다(이를 "prop drilling"이라 함).
 *  - React Context는 이런 값을 "한 번 제공해 두면 트리 아래 어디서든 꺼내 쓰는"
 *    전역 배달 시스템이다. 그래서 showToast 같은 함수를 전역에 공유한다.
 *
 * 초보자가 알아둘 용어:
 *  - Provider(공급자): 컨텍스트 값을 "여기서부터 아래로 공급한다"고 감싸는 컴포넌트.
 *  - Hook(훅): use로 시작하는 함수. 컴포넌트 안에서 React 기능(상태 등)을 쓰는 도구.
 *  - useState: 화면을 다시 그리게 만드는 "상태" 저장소.
 *  - useRef: 화면 다시 그리기와 무관하게 값을 보관하는 "상자"(여기선 타이머 보관용).
 *  - useCallback: 함수를 매 렌더마다 새로 만들지 않고 "기억(메모)"해서 재사용하는 도구.
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
// React에서 컨텍스트/상태/훅을 만들기 위한 도구들을 가져온다.
//  - createContext: 새 컨텍스트(전역 배달 통로)를 만든다.
//  - useContext: 만들어진 컨텍스트에서 값을 꺼낸다.
//  - useState: 컴포넌트 상태(바뀌면 화면 다시 그림).
//  - useCallback: 함수를 메모이즈(불필요한 재생성 방지).
//  - useRef: 렌더와 무관하게 값을 담아두는 상자.
//  - type ReactElement: "이 함수는 JSX(화면 요소)를 반환한다"는 타입 표기(TS 전용, 실행엔 영향 X).
//    참고: import 앞의 type은 "타입만 가져온다"는 TypeScript 문법으로, 번들에 코드가 남지 않는다.
import { createContext, useContext, useState, useCallback, useRef, type ReactElement } from 'react';
// Toast(토스트 한 개의 모양)와 ToastType('success'|'error'|...)의 타입 정의를 가져온다.
import type { Toast, ToastType } from '../types';

// 컨텍스트로 노출하는 API — 토스트 띄우기/제거.
// (interface = TypeScript에서 "객체가 어떤 모양이어야 하는지" 정하는 설계도)
interface ToastContextValue {
  // showToast: 메시지를 받아 토스트를 띄운다.
  //  - type?, duration? 의 물음표(?)는 "생략 가능한 선택 인자"라는 뜻.
  //  - 반환값 number = 생성된 토스트의 고유 id(나중에 removeToast로 지울 때 쓸 수 있음).
  showToast: (message: string, type?: ToastType, duration?: number) => number;   // 반환: 생성된 토스트 id
  // removeToast: 특정 id의 토스트를 즉시 제거한다(반환값 없음 = void).
  removeToast: (id: number) => void;
}

// 컨텍스트 생성. 초기값을 null로 둔 이유:
//  - Provider로 감싸기 전에는 "아직 값이 없음"을 명확히 하기 위함.
//  - 나중에 useToast에서 null인지 검사해 폴백을 제공한다(파일 하단 참고).
const ToastContext = createContext<ToastContextValue | null>(null);

// 토스트 고유 id 시퀀스(모듈 전역, 단조 증가).
//  - 모듈 최상단의 let 변수라 컴포넌트 바깥에 산다 → 앱 전체에서 단 하나만 존재.
//  - 토스트를 만들 때마다 1씩 늘려(++toastId) 서로 겹치지 않는 고유 번호를 부여한다.
//  - 주의: 이건 React 상태가 아니라 평범한 변수다. 값이 변해도 화면이 다시 그려지지 않는다.
//    "겹치지 않는 번호표"가 목적이지 화면 표시용이 아니므로 일부러 상태로 두지 않았다.
let toastId = 0;

// ToastProvider가 받는 props의 타입.
interface ToastProviderProps {
  // children = 이 Provider로 감싸는 "안쪽 내용물" 전체(앱의 나머지 화면).
  //  - React.ReactNode = 문자열/숫자/JSX 등 화면에 그릴 수 있는 거의 모든 것.
  children: React.ReactNode;
}

/**
 * ToastProvider — 토스트 상태/타이머를 관리하고, children 아래에 토스트 컨테이너를 렌더.
 *
 * 무엇을 하나:
 *  1) 현재 떠 있는 토스트 목록(toasts)을 상태로 들고 있다.
 *  2) showToast / removeToast 함수를 컨텍스트로 공급한다.
 *  3) 화면 한쪽(toast-container)에 실제 토스트 UI를 그린다.
 *
 * 사용법: 보통 앱 최상단(App.tsx 등)에서 <ToastProvider>...</ToastProvider>로 한 번 감싼다.
 * 반환: 화면 요소(ReactElement) — children + 토스트 컨테이너.
 */
export function ToastProvider({ children }: ToastProviderProps): ReactElement {
  // 현재 표시 중인 토스트 목록.
  //  - useState는 [현재값, 바꾸는함수] 한 쌍을 돌려준다.
  //  - <Toast[]>는 "토스트 객체들의 배열"이라는 타입. 초기값은 빈 배열 [].
  //  - 이 배열이 바뀌면(setToasts) React가 화면을 자동으로 다시 그린다.
  const [toasts, setToasts] = useState<Toast[]>([]);

  // id별 자동 제거 타이머 보관(언마운트/수동 제거 시 clearTimeout 위해 ref로 유지).
  //  - 왜 useRef인가? 타이머 핸들은 "화면에 보이는 값"이 아니라 "내부적으로 들고만 있을 값"이다.
  //    상태로 두면 바뀔 때마다 불필요하게 화면을 다시 그린다. ref는 그런 부작용 없이 값만 보관한다.
  //  - 구조는 { 토스트id: 타이머핸들 } 형태의 객체(Record<number, 타이머>).
  //  - ReturnType<typeof setTimeout>: setTimeout이 돌려주는 핸들의 타입(브라우저/Node 환경 차이를 자동 대응).
  //  - 실제 값은 항상 timersRef.current 안에 들어 있다(ref의 약속된 사용법).
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // removeToast — 해당 id의 타이머를 정리하고 목록에서 제거.
  //  - useCallback(..., [])로 감싼 이유: 의존성이 없어 "항상 같은 함수"를 유지 → 컨텍스트 값이
  //    매 렌더마다 새로 안 만들어져, 이 함수를 쓰는 쪽의 불필요한 재실행을 줄인다.
  const removeToast = useCallback((id: number) => {
    // 1) 예약돼 있던 자동 제거 타이머를 취소한다.
    //    (이미 끝났거나 없는 id여도 clearTimeout(undefined)는 에러 없이 무시되므로 안전)
    clearTimeout(timersRef.current[id]);
    // 2) 보관 중이던 타이머 핸들도 객체에서 지운다(메모리 정리 + 흔적 제거).
    delete timersRef.current[id];
    // 3) 목록에서 이 id를 제외한 새 배열을 만들어 상태를 교체한다.
    //    - prev => prev.filter(...) 처럼 "이전 값을 받아 새 값을 돌려주는" 형태(업데이트 함수)를 쓴다.
    //    - 주의(불변성): 기존 배열을 직접 건드리지 않고(splice X) filter로 "새 배열"을 만든다.
    //      React는 배열의 참조(주소)가 바뀌어야 변경을 알아채고 다시 그린다. 그래서 새 배열이 필수.
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // showToast — 새 토스트를 추가하고 duration(기본 4초) 뒤 자동 제거 예약. 생성된 id 반환.
  //  - 매개변수: message(보일 글), type(없으면 'info'), duration(없으면 4000ms = 4초).
  //  - 부수효과: 상태 추가 + setTimeout 예약(시간이 지나면 자동으로 removeToast 호출).
  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000): number => {
    // 새 고유 id 발급. ++toastId는 "먼저 1 올린 뒤 그 값을 쓴다"(전위 증가).
    const id = ++toastId;
    // 목록 끝에 새 토스트를 더한다. [...prev, 새것] = 기존을 펼쳐 복사하고 뒤에 추가(불변성 유지).
    setToasts((prev) => [...prev, { id, message, type }]);
    // duration 뒤에 스스로 사라지도록 타이머를 걸고, 그 핸들을 id로 보관한다.
    //  - 이렇게 보관해 둬야 사용자가 X로 먼저 닫을 때(또는 언마운트 시) clearTimeout으로 취소 가능.
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    // 호출한 쪽이 필요하면 이 id로 직접 제거할 수 있도록 반환.
    return id;
    // 의존성 배열에 removeToast를 넣은 이유: 이 함수 안에서 removeToast를 사용하기 때문.
    // (removeToast는 [] 의존성이라 안 바뀌므로, showToast도 사실상 안정적으로 유지된다.)
  }, [removeToast]);

  return (
    // Provider의 value로 두 함수를 묶어 컨텍스트에 공급한다.
    //  - 이 아래(children) 어디서든 useToast()로 showToast/removeToast를 꺼내 쓸 수 있게 된다.
    //  - 주의: value={{...}}처럼 매 렌더 새 객체를 넘기지만, 안의 함수들이 useCallback으로 안정적이라
    //    실질적인 변경은 거의 없다(불필요한 재렌더 최소화).
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* 스크린리더 알림용 role/aria-live — 동적으로 추가되는 토스트를 읽어줌 */}
      {/* role="status" + aria-live="polite": 시각장애 사용자의 화면낭독기가 새로 뜬 토스트 글을
          (사용자 작업을 끊지 않고 "정중하게") 읽어주게 하는 접근성(a11y) 속성. */}
      <div className="toast-container" role="status" aria-live="polite">
        {/* toasts 배열을 돌며 토스트 하나하나를 화면 요소로 변환(map). */}
        {/* key={toast.id}: React가 목록의 각 항목을 구분하는 고유 식별자. 추가/삭제 시 어떤 항목이
            바뀌었는지 정확히 알아 효율적으로 다시 그린다. 주의: key엔 배열 index 대신 고유 id를 쓸 것. */}
        {toasts.map((toast) => (
          // className에 백틱 템플릿 문자열을 써서 타입별 클래스를 조합한다.
          //  - 예: type이 'error'면 "toast-item toast-error"가 된다(색/아이콘 스타일 분기용).
          //  - 주의: 백틱 문자열 안에는 절대 주석을 넣지 말 것(그대로 출력에 섞여 깨짐).
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {/* 타입별 아이콘(조건부 렌더) */}
            {/* {조건 && <JSX/>} 패턴: 조건이 참일 때만 뒤의 요소를 그린다(거짓이면 아무것도 안 그림). */}
            <span className="toast-icon">
              {/* 성공: 체크 표시가 있는 동그라미 아이콘 */}
              {toast.type === 'success' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              {/* 에러: X 표시가 든 동그라미 아이콘 */}
              {toast.type === 'error' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {/* 정보: 'i' 형태(원 안 막대+점) 아이콘 */}
              {toast.type === 'info' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
              {/* 경고: 삼각형 안 느낌표 아이콘 */}
              {toast.type === 'warning' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
            </span>
            {/* 실제로 보여줄 메시지 텍스트 */}
            <span className="toast-message">{toast.message}</span>
            {/* 수동 닫기 버튼 */}
            {/* onClick에 () => removeToast(toast.id) 형태의 화살표 함수를 넘긴다.
                - 이유: removeToast(toast.id)를 그냥 쓰면 렌더 즉시 실행돼 버린다.
                  "클릭했을 때 실행"하려면 함수로 감싸 '나중에 부를 함수'를 넘겨야 한다. */}
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
  // 위에서 만든 컨텍스트에서 현재 값을 꺼낸다. Provider 안이면 실제 값, 밖이면 초기값 null.
  const ctx = useContext(ToastContext);
  // ctx가 null이면(= ToastProvider로 감싸지지 않았으면) 안전한 가짜 구현을 돌려준다.
  if (!ctx) {
    return {
      // showToast 호출 시 경고만 찍고 0(가짜 id)을 반환 → 호출부가 깨지지 않게.
      showToast: (msg: string) => { console.warn('ToastProvider not found:', msg); return 0; },
      // removeToast는 그냥 아무것도 안 함.
      removeToast: () => {}
    };
  }
  // 정상 경로: Provider가 공급한 실제 { showToast, removeToast }를 그대로 반환.
  return ctx;
}
