/**
 * ThemeContext.tsx — 다크/라이트 모드 + 색상 테마 전역 컨텍스트
 *
 * ┌─ 이 파일이 뭐예요? (초보자용 큰 그림) ───────────────────────────────┐
 * │ "Context(컨텍스트)"는 React에서 여러 컴포넌트가 공유하는 값을        │
 * │ 한 곳에 모아두고, props로 일일이 넘기지 않아도(=prop drilling 방지)  │
 * │ 어디서든 꺼내 쓰게 해주는 기능입니다.                                │
 * │ 여기서는 "지금 화면이 라이트/다크 모드인가", "강조 색상은 무엇인가"를 │
 * │ 앱 전체가 공유합니다. 버튼 하나로 토글하면 앱 전체 색이 바뀌도록요.   │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * 역할:
 *  - 라이트/다크 테마와 색상 테마(blue/red/...)를 전역에서 관리하고 DOM에 반영.
 *
 * 핵심 책임:
 *  - mode(auto/light/dark)에 따라 실제 theme 결정. auto면 시간대 기반(06~18시 light) + 1분마다 갱신.
 *  - theme/colorTheme를 document.documentElement의 data-theme/data-color 속성으로 적용(CSS가 이를 참조).
 *  - 설정을 쿠키에 1년 보존(themeMode/colorTheme), 레거시 'theme' 쿠키는 정리.
 *
 * 알아두면 좋은 용어:
 *  - "mode"  = 사용자가 고른 선택지(auto/light/dark). auto는 "시간대에 맡긴다"는 뜻.
 *  - "theme" = mode를 해석해서 실제로 적용 중인 결과(light 또는 dark 둘 중 하나).
 *    → 즉 mode는 "의도", theme는 "현재 결과"라고 생각하면 헷갈리지 않습니다.
 *  - document.documentElement = HTML 문서의 최상위 <html> 태그. 여기에 속성을 달면
 *    CSS가 그 속성을 보고(예: [data-theme="dark"] { ... }) 색을 바꿉니다.
 *
 * 주요 export:
 *  - ThemeProvider: 테마 상태 제공 + DOM 동기화 Provider.
 *  - useTheme: 테마 접근 훅(Provider 밖에서 호출 시 에러).
 */

// React에서 필요한 기능들을 가져옵니다.
//  - createContext: 공유 통로(컨텍스트)를 만드는 함수
//  - useContext   : 그 통로에 담긴 값을 꺼내 쓰는 훅
//  - useState     : 컴포넌트가 기억하는 "상태(값)"를 만드는 훅
//  - useEffect    : 화면이 그려진 뒤(또는 값이 바뀔 때) 부수효과를 실행하는 훅
//  - type ReactElement: TypeScript에서 "React 요소" 타입(컴파일에만 쓰이고 실행에는 사라짐)
import { createContext, useContext, useState, useEffect, type ReactElement } from 'react';
// ThemeMode('auto'|'light'|'dark')와 ColorTheme('blue'|...) 타입 정의를 가져옵니다.
// 'import type'은 "타입만 가져온다"는 표시 — 실제 JS 코드로는 남지 않습니다.
import type { ThemeMode, ColorTheme } from '../types';

// 컨텍스트가 공급할 값의 "모양(형태)"을 미리 정의합니다.
// interface는 객체가 어떤 속성을 가져야 하는지 약속하는 설계도입니다(실행에는 영향 없음).
interface ThemeContextValue {
  theme: 'light' | 'dark';            // 실제 적용 중인 테마(auto가 해석된 결과)
  mode: ThemeMode;                    // 사용자가 고른 모드(auto/light/dark)
  toggleTheme: () => void;            // 모드 순환 토글(함수 타입: 인자 없고 반환 없음)
  colorTheme: ColorTheme;             // 색상 테마
  setColorTheme: (c: ColorTheme) => void; // 색상 테마를 바꾸는 함수
}

// 실제 컨텍스트 객체를 만듭니다. 초기값을 null로 둔 이유:
//  - Provider로 감싸지 않은 채 useTheme를 쓰면 null이 나오므로, 그걸 감지해 에러를 던지기 위함.
//  - 타입 <ThemeContextValue | null> 은 "값이거나 null일 수 있다"는 뜻입니다.
const ThemeContext = createContext<ThemeContextValue | null>(null);

// 현재 시각으로 라이트/다크 결정 — 06~18시는 light, 그 외 dark.
// 매개변수: 없음 / 반환: 'light' 또는 'dark'.
const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours(); // 지금 시각의 "시(0~23)"만 꺼냄(브라우저의 로컬 시간 기준)
  // 6 이상 18 미만이면 낮 → light, 아니면 밤 → dark.
  // 주의: 18시(오후 6시)는 18 < 18 이 거짓이라 dark로 처리됩니다(경계값 주의).
  return (hour >= 6 && hour < 18) ? 'light' : 'dark';
};

// 허용되는 색상 테마 목록(쿠키 값 검증에도 사용).
// 쿠키는 사용자가 임의로 조작할 수 있으므로, 이 "화이트리스트"에 있는 값만 신뢰합니다.
const COLOR_THEMES: ColorTheme[] = ['blue', 'red', 'green', 'purple', 'orange'];

/**
 * cookie 읽기 — 정규식으로 name=value를 찾아 디코드(없으면 null)
 *
 * 쿠키란? 브라우저가 보관하는 작은 문자열로, 새로고침/재방문해도 값이 남습니다.
 * document.cookie 는 "a=1; b=2; c=3" 처럼 한 줄로 이어진 문자열입니다.
 *
 * 정규식 (^| )name=([^;]+) 의 의미:
 *  - (^| )    : 문자열 맨 앞(^)이거나 공백 한 칸 — 다른 이름의 끝부분에 잘못 걸리지 않게 경계 표시
 *  - name=    : 우리가 찾는 쿠키 이름과 등호
 *  - ([^;]+)  : 세미콜론(;)이 아닌 글자들 = 그 쿠키의 "값" 부분(괄호로 묶어 따로 꺼냄 → match[2])
 */
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  // match가 있으면 match[2](값)을 디코드해서 돌려주고, 없으면 null.
  // decodeURIComponent: 저장할 때 encode한 특수문자를 원래 문자로 되돌림.
  // '?' 가 아니라 삼항연산자 'A ? B : C' 형태: match가 참이면 B, 아니면 C.
  return match ? decodeURIComponent(match[2]) : null;
};

/**
 * cookie 쓰기 (1년 유지, SameSite=Lax)
 * 매개변수: name(쿠키 이름), value(저장할 값) / 반환: 없음(void) / 부수효과: document.cookie 변경
 *
 * 옵션 설명:
 *  - path=/            : 사이트 전체 경로에서 이 쿠키를 사용
 *  - max-age=31536000  : 유효기간(초). 60*60*24*365 = 약 1년
 *  - SameSite=Lax      : 다른 사이트에서의 요청에 쿠키가 함부로 따라가지 않게 하는 보안 설정
 *
 * 주의: 아래 문자열은 백틱(`)으로 만든 템플릿 리터럴이라 ${...} 안의 값이 그대로 끼워집니다.
 *       이런 백틱 문자열 "내부"에는 주석을 넣으면 안 됩니다(주석 글자까지 값에 포함되어 출력이 깨짐).
 */
const setCookie = (name: string, value: string): void => {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`;
};

/**
 * cookie 삭제 (max-age=0)
 * 쿠키를 직접 지우는 API는 없어서, "유효기간을 0으로" 다시 써주면 브라우저가 즉시 폐기합니다.
 */
const removeCookie = (name: string): void => {
  document.cookie = `${name}=;path=/;max-age=0`;
};

// Provider 컴포넌트가 받을 props의 모양.
// children: 이 Provider로 감싸는 "내부 컴포넌트들"을 가리킴(React가 자동으로 넣어줌).
interface ThemeProviderProps {
  children: React.ReactNode; // ReactNode = 화면에 그릴 수 있는 모든 것(요소/문자열/배열 등)
}

/**
 * ThemeProvider — 테마/색상 상태를 관리하고 DOM/쿠키와 동기화.
 *
 * 무엇을: 테마 관련 상태(mode/theme/colorTheme)를 한 곳에서 관리하고,
 *         그 값을 children(앱 전체)에게 컨텍스트로 내려줍니다.
 * 왜:     색상/모드는 "앱 어디서나" 쓰이므로 한 군데서 관리해야 일관성이 유지됩니다.
 * 사용법: 보통 앱 최상단(예: App.tsx)에서 <ThemeProvider> ...앱... </ThemeProvider> 로 감쌉니다.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps): ReactElement => {
  // mode: 쿠키에서 복원, 유효하지 않으면 'auto'(lazy initializer).
  // useState(() => ...) 처럼 "함수"를 넘기면, 그 함수는 첫 렌더 때 딱 한 번만 실행됩니다(=lazy initializer).
  // 매 렌더마다 쿠키를 다시 읽는 낭비를 막으려는 패턴입니다.
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = getCookie('themeMode'); // 이전 방문 때 저장해둔 모드 읽기
    // 쿠키 값은 신뢰할 수 없으니 세 가지 허용값인지 확인 후에만 사용.
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    return 'auto'; // 저장된 값이 없거나 이상하면 기본값 auto
  });

  // theme: mode가 auto면 시간대 기반, 아니면 mode 그대로.
  // 화면에 실제로 적용되는 결과값이며, 위 mode를 "해석"한 것입니다.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // mode가 'auto'면 지금 시각으로 결정, 아니면 mode를 그대로 theme으로 사용.
    // (mode as 'light' | 'dark'): auto가 아니란 걸 코드로 보장했으니 TS에게 "이건 둘 중 하나야"라고 알려주는 단언.
    return mode === 'auto' ? getTimeBasedTheme() : (mode as 'light' | 'dark');
  });

  // colorTheme: 쿠키에서 복원하되 허용 목록에 있는 값만, 아니면 'blue'.
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const saved = getCookie('colorTheme');
    // includes로 화이트리스트 검증. saved가 null일 수 있어 (saved ?? '')로 빈 문자열 대체.
    //  - ?? (널 병합 연산자): 왼쪽이 null/undefined일 때만 오른쪽('') 사용.
    //  - (COLOR_THEMES as string[]): includes 비교를 위해 일시적으로 문자열 배열로 취급.
    return (COLOR_THEMES as string[]).includes(saved ?? '') ? (saved as ColorTheme) : 'blue';
  });

  // ── 부수효과(useEffect) 영역 ──────────────────────────────────────────
  // useEffect(콜백, [의존성]): 화면이 그려진 뒤, [의존성]에 든 값이 바뀔 때마다 콜백을 실행합니다.
  //  → 상태(state)를 화면 밖 세계(DOM, 쿠키, 타이머)와 "동기화"할 때 씁니다.

  // mode 변경 시 theme 재계산. auto면 즉시 계산 + 1분마다 시간대 재평가(cleanup으로 인터벌 해제).
  useEffect(() => {
    if (mode !== 'auto') {
      // auto가 아니면(=light/dark 고정) 그 값을 그대로 theme에 반영하고 끝.
      setTheme(mode as 'light' | 'dark');
      return; // 아래 인터벌 설정을 건너뜀(고정 모드에선 시간 감시가 필요 없음)
    }
    // 여기부터는 mode가 'auto'인 경우: 먼저 지금 시각으로 한 번 계산.
    setTheme(getTimeBasedTheme());
    // 시간이 흘러 낮↔밤 경계를 넘으면 자동 전환되도록 1분(60000ms)마다 재평가.
    const interval = setInterval(() => {
      setTheme(getTimeBasedTheme());
    }, 60000);
    // cleanup 함수: 이 useEffect가 다시 실행되기 직전 또는 컴포넌트가 사라질 때 호출됨.
    // 주의: 타이머를 정리하지 않으면 인터벌이 중복으로 쌓여 메모리 누수/오작동이 생깁니다.
    return () => clearInterval(interval);
  }, [mode]); // mode가 바뀔 때만 이 효과를 다시 실행

  // theme를 DOM 속성(data-theme)으로 반영 → CSS가 다크/라이트 스타일 전환.
  // 예: CSS에서 html[data-theme="dark"] 규칙으로 배경/글자색을 바꿉니다.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]); // theme이 바뀔 때마다 <html> 속성 갱신

  // colorTheme를 DOM 속성(data-color)으로 반영 + 쿠키 저장.
  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorTheme); // CSS가 강조색을 바꿈
    setCookie('colorTheme', colorTheme); // 다음 방문에도 유지되도록 저장
  }, [colorTheme]);

  // mode 저장 + 과거에 쓰던 레거시 'theme' 쿠키 정리.
  useEffect(() => {
    setCookie('themeMode', mode);        // 현재 모드를 쿠키에 보존
    removeCookie('theme'); // clean legacy // 예전 버전이 쓰던 'theme' 쿠키가 남아 있으면 제거
  }, [mode]);

  // toggleTheme — 모드를 auto → light → dark → auto 순으로 순환.
  // 부수효과: setMode 호출로 mode 상태가 바뀌고, 위 useEffect들이 연쇄적으로 동작합니다.
  const toggleTheme = () => {
    // setMode(prev => ...): "이전 값(prev)을 받아 새 값을 계산"하는 함수형 업데이트.
    // 최신 상태를 안전하게 참조하려고 직접 mode를 읽지 않고 prev를 씁니다.
    setMode(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto'; // prev === 'dark'인 경우 → 다시 auto로 한 바퀴
    });
  };

  // 계산/관리한 값들을 객체로 묶어 value로 내려보냅니다.
  // 이 Provider 안쪽(children)에 있는 어떤 컴포넌트든 useTheme()로 이 값을 꺼낼 수 있습니다.
  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, colorTheme, setColorTheme }}>
      {/* children: 이 Provider로 감싼 실제 앱 내용이 이 자리에 그대로 렌더링됩니다. */}
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme — 테마 컨텍스트 접근 훅. Provider 밖에서 쓰면 즉시 에러로 실수를 알림.
 *
 * 무엇을: 어떤 컴포넌트든 이 훅을 부르면 { theme, mode, toggleTheme, ... }를 받습니다.
 * 왜:     매번 useContext(ThemeContext)를 쓰고 null 체크하는 번거로움을 한 곳에 모았습니다(재사용).
 * 반환:   ThemeContextValue (null이 아님이 보장됨 — 아래 체크 덕분).
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext); // 가장 가까운 Provider의 value를 가져옴(없으면 null)
  if (!context) {
    // Provider로 감싸지 않은 곳에서 호출한 흔한 실수 → 조용히 깨지지 않고 명확한 에러로 알려줌.
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context; // 여기 도달했다면 context는 확실히 값이 있으므로 안전하게 반환.
};
