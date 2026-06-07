/**
 * LanguageContext.tsx
 *
 * 역할/책임:
 *  - 애플리케이션 전역의 다국어(국제화, i18n) 상태를 관리하는 React Context 모듈.
 *  - 현재 선택된 언어(language) 상태를 보관하고, 한국어('ko')와 영어('en') 사이를 토글한다.
 *  - 점(.)으로 구분된 키 경로를 받아 번역 문자열을 반환하는 t() 함수를 제공한다.
 *
 * 주요 export:
 *  - LanguageProvider : 하위 컴포넌트 트리에 언어 상태/유틸을 공급하는 Provider 컴포넌트.
 *  - useLanguage       : Context 값(language, toggleLanguage, t)을 꺼내 쓰는 커스텀 훅.
 */
import { createContext, useContext, useState, type ReactElement } from 'react';
// 언어별 번역 사전(객체). translations[language] 형태로 접근한다.
import { translations } from '../utils/translations';
// 'ko' | 'en' 등 지원 언어를 나타내는 유니온 타입.
import type { Language } from '../types';

// Context 를 통해 하위 트리에 노출되는 값의 형태(인터페이스).
interface LanguageContextValue {
  language: Language;          // 현재 선택된 언어
  toggleLanguage: () => void;  // 언어를 ko<->en 으로 전환하는 함수
  t: (key: string) => string; // 키 경로로 번역 문자열을 조회하는 함수
}

// 언어 Context 생성. 초기값은 null 이며, Provider 밖에서 사용 시 useLanguage 가 에러를 던진다.
const LanguageContext = createContext<LanguageContextValue | null>(null);

// Provider 컴포넌트가 받는 props. children 은 감쌀 하위 트리.
interface LanguageProviderProps {
  children: React.ReactNode;
}

/**
 * LanguageProvider
 * 언어 상태(language)와 조작 함수(toggleLanguage), 번역 함수(t)를
 * Context 값으로 만들어 하위 컴포넌트 전체에 공급한다.
 */
export const LanguageProvider = ({ children }: LanguageProviderProps): ReactElement => {
  // 현재 언어 상태. 기본값은 한국어('ko').
  const [language, setLanguage] = useState<Language>('ko');

  // 언어 토글: 현재가 'ko'면 'en'으로, 아니면 'ko'로 전환한다.
  // 함수형 업데이트(prev 사용)로 직전 상태를 안전하게 참조한다.
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

  /**
   * t: 점(.)으로 구분된 키 경로(예: 'header.title')를 받아 중첩 번역 객체를 따라 내려가며 값을 찾는다.
   * 찾은 값이 문자열이면 그 값을, 아니면(경로가 없거나 객체인 경우) 키 문자열 자체를 폴백으로 반환한다.
   */
  const t = (key: string): string => {
    // 'a.b.c' -> ['a','b','c'] 로 분해.
    const keys = key.split('.');
    // 현재 언어의 번역 객체에서 탐색을 시작.
    let value: unknown = translations[language];
    // 키 경로를 순차적으로 파고든다.
    for (const k of keys) {
      // 옵셔널 체이닝(?.)으로 중간 단계가 undefined/null 이어도 런타임 에러 없이 안전하게 진행.
      value = (value as Record<string, unknown>)?.[k];
    }
    // 최종 값이 문자열일 때만 번역으로 인정하고, 그 외(미존재/객체 등)는 키를 그대로 반환하여 누락을 식별하기 쉽게 한다.
    return (typeof value === 'string' ? value : key);
  };

  return (
    // Context 값으로 현재 언어, 토글 함수, 번역 함수를 묶어 하위 트리에 제공.
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * useLanguage
 * LanguageContext 값을 꺼내 쓰는 커스텀 훅.
 * Provider 외부에서 호출되면 context 가 null 이므로 명시적 에러를 던져 오용을 방지한다.
 */
export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  // Provider 바깥에서 사용한 경우의 방어 로직(엣지케이스).
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
