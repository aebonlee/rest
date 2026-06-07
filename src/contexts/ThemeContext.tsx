/**
 * ThemeContext.tsx — 다크/라이트 모드 + 색상 테마 전역 컨텍스트
 *
 * 역할:
 *  - 라이트/다크 테마와 색상 테마(blue/red/...)를 전역에서 관리하고 DOM에 반영.
 *
 * 핵심 책임:
 *  - mode(auto/light/dark)에 따라 실제 theme 결정. auto면 시간대 기반(06~18시 light) + 1분마다 갱신.
 *  - theme/colorTheme를 document.documentElement의 data-theme/data-color 속성으로 적용(CSS가 이를 참조).
 *  - 설정을 쿠키에 1년 보존(themeMode/colorTheme), 레거시 'theme' 쿠키는 정리.
 *
 * 주요 export:
 *  - ThemeProvider: 테마 상태 제공 + DOM 동기화 Provider.
 *  - useTheme: 테마 접근 훅(Provider 밖에서 호출 시 에러).
 */
import { createContext, useContext, useState, useEffect, type ReactElement } from 'react';
import type { ThemeMode, ColorTheme } from '../types';

interface ThemeContextValue {
  theme: 'light' | 'dark';            // 실제 적용 중인 테마(auto가 해석된 결과)
  mode: ThemeMode;                    // 사용자가 고른 모드(auto/light/dark)
  toggleTheme: () => void;            // 모드 순환 토글
  colorTheme: ColorTheme;             // 색상 테마
  setColorTheme: (c: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// 현재 시각으로 라이트/다크 결정 — 06~18시는 light, 그 외 dark.
const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'light' : 'dark';
};

// 허용되는 색상 테마 목록(쿠키 값 검증에도 사용).
const COLOR_THEMES: ColorTheme[] = ['blue', 'red', 'green', 'purple', 'orange'];

/** cookie 읽기 — 정규식으로 name=value를 찾아 디코드(없으면 null) */
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

/** cookie 쓰기 (1년 유지, SameSite=Lax) */
const setCookie = (name: string, value: string): void => {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`;
};

/** cookie 삭제 (max-age=0) */
const removeCookie = (name: string): void => {
  document.cookie = `${name}=;path=/;max-age=0`;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// ThemeProvider — 테마/색상 상태를 관리하고 DOM/쿠키와 동기화.
export const ThemeProvider = ({ children }: ThemeProviderProps): ReactElement => {
  // mode: 쿠키에서 복원, 유효하지 않으면 'auto'(lazy initializer).
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = getCookie('themeMode');
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    return 'auto';
  });

  // theme: mode가 auto면 시간대 기반, 아니면 mode 그대로.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return mode === 'auto' ? getTimeBasedTheme() : (mode as 'light' | 'dark');
  });

  // colorTheme: 쿠키에서 복원하되 허용 목록에 있는 값만, 아니면 'blue'.
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const saved = getCookie('colorTheme');
    return (COLOR_THEMES as string[]).includes(saved ?? '') ? (saved as ColorTheme) : 'blue';
  });

  // mode 변경 시 theme 재계산. auto면 즉시 계산 + 1분마다 시간대 재평가(cleanup으로 인터벌 해제).
  useEffect(() => {
    if (mode !== 'auto') {
      setTheme(mode as 'light' | 'dark');
      return;
    }
    setTheme(getTimeBasedTheme());
    const interval = setInterval(() => {
      setTheme(getTimeBasedTheme());
    }, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  // theme를 DOM 속성(data-theme)으로 반영 → CSS가 다크/라이트 스타일 전환.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // colorTheme를 DOM 속성(data-color)으로 반영 + 쿠키 저장.
  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorTheme);
    setCookie('colorTheme', colorTheme);
  }, [colorTheme]);

  // mode 저장 + 과거에 쓰던 레거시 'theme' 쿠키 정리.
  useEffect(() => {
    setCookie('themeMode', mode);
    removeCookie('theme'); // clean legacy
  }, [mode]);

  // toggleTheme — 모드를 auto → light → dark → auto 순으로 순환.
  const toggleTheme = () => {
    setMode(prev => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme — 테마 컨텍스트 접근 훅. Provider 밖에서 쓰면 즉시 에러로 실수를 알림.
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
