/**
 * LanguageContext.tsx
 *
 * 이 파일이 하는 일 (한 줄 요약):
 *  - 앱 전체에서 "지금 화면을 한국어로 보여줄지, 영어로 보여줄지"를 한 곳에서 관리하고,
 *    어디서든 번역 문자열을 꺼내 쓸 수 있게 해주는 모듈이다.
 *
 * 왜 필요한가? (배경 설명):
 *  - 다국어 지원을 i18n(internationalization, 국제화)이라고 부른다. i + (가운데 글자 18개) + n 이라 i18n.
 *  - 만약 "현재 언어" 값을 컴포넌트마다 따로 들고 있으면, 언어를 바꿀 때 모든 컴포넌트를 일일이
 *    수정해야 해서 매우 번거롭다. 그래서 React 의 "Context" 기능으로 언어 상태를 앱 최상단에
 *    한 번만 만들어 두고, 하위 컴포넌트들이 공유해서 꺼내 쓰도록 한다.
 *
 * 초보자가 알아두면 좋은 핵심 용어:
 *  - Context(컨텍스트): 컴포넌트 트리 전체에 값을 "방송(broadcast)"하듯 전달하는 React 기능.
 *    props 를 부모 -> 자식 -> 손자... 로 계속 내려보내는 번거로움(prop drilling)을 없애준다.
 *  - Provider(공급자): Context 값을 실제로 채워서 하위 트리에 내려보내는 컴포넌트.
 *  - Hook(훅): use 로 시작하는 함수. 컴포넌트 안에서 상태/기능을 빌려 쓰는 React 의 도구.
 *    (예: useState = 상태 만들기, useContext = Context 값 꺼내기)
 *  - 커스텀 훅: 우리가 직접 만든 훅(여기서는 useLanguage). 반복되는 Context 사용 코드를 함수로 묶은 것.
 *
 * 이 파일이 밖으로 내보내는(export) 것 2가지:
 *  - LanguageProvider : 앱을 감싸서 "언어 상태"를 하위 전체에 공급하는 Provider 컴포넌트.
 *  - useLanguage       : 하위 컴포넌트에서 { language, toggleLanguage, t } 를 간편하게 꺼내 쓰는 훅.
 */

// React 에서 필요한 도구들을 가져온다(import).
//  - createContext : Context(공유 통로)를 만드는 함수
//  - useContext    : 만들어 둔 Context 의 값을 꺼내는 훅
//  - useState      : 컴포넌트 안에서 변하는 값(상태)을 관리하는 훅
//  - type ReactElement : "JSX 한 덩어리"를 가리키는 타입. 'type' 키워드는 "이건 값이 아니라 타입만
//    가져온다"는 표시(TypeScript 문법). 컴파일 후 실제 코드에는 남지 않아 번들 크기에 영향이 없다.
import { createContext, useContext, useState, type ReactElement } from 'react';
// 언어별 번역 사전(객체). 예: translations['ko'].header.title, translations['en'].header.title
// translations[language] 형태로 "현재 언어에 해당하는 번역 묶음"에 접근한다.
import { translations } from '../utils/translations';
// Language 는 'ko' | 'en' 처럼 "허용되는 언어 값만" 모아둔 유니온 타입(union type)이다.
// 유니온 타입: 여러 값 중 "이 중 하나만 가능"을 뜻함. 오타나 잘못된 언어 코드를 컴파일 단계에서 막아준다.
// 'import type' 이므로 타입 정보만 가져오며 실행 코드에는 포함되지 않는다.
import type { Language } from '../types';

// Context 를 통해 하위 트리에 전달할 "값의 모양(형태)"을 미리 정의한다.
// interface: 객체가 어떤 속성을 가져야 하는지 약속(설계도)을 적는 TypeScript 문법.
interface LanguageContextValue {
  language: Language;          // 현재 선택된 언어 ('ko' 또는 'en')
  toggleLanguage: () => void;  // 언어를 ko <-> en 으로 전환하는 함수 (인자 없음, 반환값 없음)
  t: (key: string) => string;  // 키 경로(문자열)를 받아 번역된 문자열을 돌려주는 함수. 'translate'의 약자.
}

// 실제 Context 객체를 생성한다. 제네릭 <...> 으로 "이 Context 가 담을 값의 타입"을 알려준다.
// 초기값을 null 로 둔 이유: Provider 로 감싸지 않은 곳에서 잘못 사용하면 값이 null 이 되어,
// 아래 useLanguage 훅에서 "Provider 안에서 써라"는 에러를 던져 실수를 빨리 발견하게 하기 위함이다.
const LanguageContext = createContext<LanguageContextValue | null>(null);

// Provider 컴포넌트가 받을 props(속성)의 모양을 정의.
// children : Provider 가 감쌀 하위 컴포넌트들. <LanguageProvider> 와 </LanguageProvider> 사이에 들어가는 내용.
interface LanguageProviderProps {
  children: React.ReactNode;   // ReactNode: JSX, 문자열, 숫자 등 "화면에 렌더 가능한 모든 것"을 포괄하는 타입.
}

/**
 * LanguageProvider 컴포넌트
 *
 * 무엇을 하나:
 *  - "현재 언어 상태(language)" + "언어 전환 함수(toggleLanguage)" + "번역 함수(t)" 세 가지를
 *    하나의 묶음으로 만들어, 자신이 감싼 하위 컴포넌트 전체에 Context 로 공급한다.
 *
 * 왜 이렇게 하나:
 *  - 앱의 가장 바깥쪽(예: App 또는 main 부근)에서 <LanguageProvider>로 한 번만 감싸두면,
 *    그 안의 어떤 깊숙한 컴포넌트라도 useLanguage() 한 줄로 언어/번역 기능을 쓸 수 있다.
 *
 * 매개변수: { children } - 감쌀 하위 트리 (구조 분해 할당으로 props 에서 children 만 꺼냄)
 * 반환값  : ReactElement - 화면에 그려질 JSX 한 덩어리
 */
export const LanguageProvider = ({ children }: LanguageProviderProps): ReactElement => {
  // useState 로 "현재 언어" 상태를 만든다.
  //  - language    : 현재 값을 읽는 변수
  //  - setLanguage : 값을 바꿀 때 호출하는 함수 (이 함수를 통해서만 바꿔야 React 가 화면을 다시 그린다)
  //  - <Language>  : 이 상태가 가질 수 있는 타입을 명시 (즉 'ko' | 'en')
  //  - 'ko'        : 초기값(기본 언어는 한국어). 처음 렌더될 때 딱 한 번만 사용된다.
  // 주의: language = 'en' 처럼 변수에 직접 대입하면 안 된다. 반드시 setLanguage 를 써야 재렌더가 일어난다.
  const [language, setLanguage] = useState<Language>('ko');

  // 언어 토글(전환) 함수.
  // 현재가 'ko' 이면 'en' 으로, 그 외('en')이면 'ko' 로 바꾼다.
  const toggleLanguage = () => {
    // setLanguage 에 "이전 값(prev)을 받아 새 값을 돌려주는 함수"를 넘기는 방식 = 함수형 업데이트.
    // 왜 prev 를 쓰나: 바깥 변수 language 를 직접 읽는 대신, React 가 보장하는 "가장 최신 상태"를
    // 인자로 받아 계산하므로, 빠르게 여러 번 호출되어도 값이 꼬이지 않고 안전하다.
    // prev === 'ko' ? 'en' : 'ko' 는 삼항 연산자: (조건) ? (참일때) : (거짓일때) 형태의 짧은 if-else.
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

  /**
   * t (translate) 함수
   *
   * 무엇을 하나:
   *  - 'header.title' 처럼 점(.)으로 이어진 키 경로를 받아, 중첩된 번역 객체를 단계별로 파고들어
   *    최종 번역 문자열을 찾아 돌려준다.
   *
   * 왜 점(.) 표기를 쓰나:
   *  - 번역 사전이 { header: { title: '제목' } } 처럼 계층 구조라서, 'header.title' 한 문자열로
   *    그 깊은 위치를 간결하게 가리키기 위함이다.
   *
   * 폴백(fallback) 규칙:
   *  - 경로가 존재하지 않거나 끝까지 갔는데 문자열이 아니면(예: 객체이거나 undefined),
   *    번역 대신 "키 문자열 자체"를 그대로 돌려준다.
   *  - 이렇게 하면 화면에 'header.title' 같은 키가 노출되어, 번역이 빠졌다는 사실을 바로 눈치챌 수 있다.
   *
   * 매개변수: key (string) - 'a.b.c' 형태의 번역 키 경로
   * 반환값  : string       - 찾은 번역 문자열, 없으면 입력한 key 그대로
   */
  const t = (key: string): string => {
    // 문자열 'a.b.c' 를 '.' 기준으로 잘라 배열 ['a','b','c'] 로 만든다.
    const keys = key.split('.');
    // 탐색 시작점: 현재 언어의 번역 묶음 전체.
    // 타입을 unknown 으로 둔 이유: 깊이 들어갈수록 값의 정확한 타입을 알기 어렵기 때문에
    // "아직 무엇인지 모르는 값"이라는 안전한 타입으로 시작한다.
    let value: unknown = translations[language];
    // keys 배열을 순서대로 돌며 한 단계씩 안으로 들어간다.
    // 예: value = translations['ko'] -> value['header'] -> value['title']
    for (const k of keys) {
      // (value as Record<string, unknown>) : "value 를 '문자열 키 -> 알 수 없는 값' 형태의 객체로
      //   취급하겠다"는 타입 단언(as). unknown 인 채로는 속성 접근이 막히기 때문에 잠깐 형태를 알려주는 것.
      // ?.[k] : 옵셔널 체이닝(optional chaining). value 가 null/undefined 이면 에러 없이 그냥 undefined 를 준다.
      //   덕분에 중간 경로가 끊겨도 앱이 죽지 않고 안전하게 다음 줄로 넘어간다.
      value = (value as Record<string, unknown>)?.[k];
    }
    // 마지막 결과가 진짜 "문자열"일 때만 번역으로 인정한다.
    // 문자열이 아니면(경로가 없어 undefined 이거나, 더 깊은 객체에서 멈춘 경우 등) 원래 key 를 그대로 반환.
    // typeof value === 'string' : 값의 타입이 문자열인지 검사하는 가장 안전한 방법.
    return (typeof value === 'string' ? value : key);
  };

  return (
    // Provider 로 감싸고 value 에 {language, toggleLanguage, t} 묶음을 넣으면,
    // 이 안쪽(children)의 모든 컴포넌트가 useLanguage() 로 이 값들을 꺼내 쓸 수 있다.
    // 주의: value 에 매 렌더마다 새 객체가 만들어지므로, 아주 큰 앱에서 성능 최적화가 필요하면
    //       useMemo 로 감싸는 기법을 쓰기도 한다(여기서는 단순함을 위해 생략).
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {/* children: 이 Provider 가 감싼 하위 컴포넌트 전체가 이 자리에 그대로 렌더된다. */}
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * useLanguage 커스텀 훅
 *
 * 무엇을 하나:
 *  - 컴포넌트에서 LanguageContext 의 값({ language, toggleLanguage, t })을 한 줄로 꺼내 쓰게 해준다.
 *    사용 예: const { t, toggleLanguage } = useLanguage();
 *
 * 왜 따로 만드나:
 *  - 매번 useContext(LanguageContext) 를 직접 부르고 null 검사를 반복하는 대신,
 *    그 과정을 이 훅 하나로 묶어 재사용성과 안전성을 높인다.
 *
 * 반환값: LanguageContextValue (절대 null 이 아님 - 아래 검사를 통과했으므로)
 */
export const useLanguage = (): LanguageContextValue => {
  // 현재 컴포넌트가 속한 트리에서 가장 가까운 LanguageProvider 가 제공한 값을 가져온다.
  const context = useContext(LanguageContext);
  // 방어 로직(엣지케이스 처리):
  // Provider 로 감싸지 않은 곳에서 이 훅을 쓰면 context 가 null(초기값) 이 된다.
  // 그대로 두면 나중에 context.t 호출 시 알 수 없는 에러가 나므로, 여기서 명확한 메시지로 먼저 막는다.
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  // 여기까지 왔다면 context 는 반드시 유효한 값이므로 안심하고 반환한다.
  return context;
};
