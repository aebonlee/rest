/**
 * AuthGuard.tsx — 로그인 보호 래퍼(라우트 가드)
 *
 * [이 파일이 무엇인가요?]
 *  - "라우트 가드(route guard)"라고 부르는 보호 컴포넌트입니다.
 *  - 어떤 화면(페이지)을 이 컴포넌트로 감싸 두면, "로그인한 사용자만" 그 화면을
 *    볼 수 있도록 문지기(guard) 역할을 합니다.
 *  - 예를 들어 "내 강의실" 같은 페이지는 로그인한 사람만 봐야 하므로
 *    <AuthGuard><내강의실 /></AuthGuard> 처럼 감싸서 사용합니다.
 *
 * [초보자가 알아야 할 배경/용어]
 *  - 컴포넌트(component): React에서 화면의 한 조각을 만드는 함수입니다.
 *    함수가 JSX(아래 <div>...</div> 처럼 HTML 비슷하게 생긴 것)를 반환하면
 *    그게 화면에 그려집니다.
 *  - props: 부모가 자식 컴포넌트에게 건네주는 "입력값"입니다.
 *    여기서는 children(감쌀 화면)을 props로 받습니다.
 *  - children: 이 컴포넌트가 감싸고 있는 "안쪽 내용물"을 가리키는 특별한 prop입니다.
 *    <AuthGuard>여기 있는 것</AuthGuard> 의 "여기 있는 것"이 children이 됩니다.
 *  - 인증(authentication): "당신이 누구인지" 확인하는 과정. 즉 로그인 여부를 말합니다.
 *  - 컨텍스트(Context): 여러 컴포넌트가 공유하는 전역 데이터 저장소입니다.
 *    로그인 상태처럼 앱 전체에서 필요한 정보를 props로 일일이 넘기지 않고
 *    한 곳(AuthContext)에서 꺼내 쓰게 해 줍니다.
 *
 * [핵심 책임 — 이 컴포넌트가 하는 일 3가지]
 *  1. 인증 상태를 아직 확인하는 중(loading)이면 → 로딩 스피너만 보여줍니다.
 *  2. 로그인이 안 되어 있으면(미로그인) → /login 페이지로 보내되,
 *     원래 가려던 위치(location)를 함께 넘겨 로그인 후 그 자리로 돌아오게 합니다.
 *  3. 로그인이 되어 있으면 → 감싼 화면(children)을 그대로 보여줍니다.
 *
 * [주요 export]
 *  - default: AuthGuard (보호 래퍼 컴포넌트)
 */

// react-router-dom: 화면(페이지) 이동(라우팅)을 담당하는 라이브러리입니다.
//  - Navigate: 화면에 그려지는 순간 다른 주소로 이동시키는 컴포넌트(코드로 하는 페이지 이동).
//  - useLocation: 지금 사용자가 머무는 현재 주소(경로/쿼리 등) 정보를 알려주는 훅(hook).
//    (훅이란? 함수형 컴포넌트 안에서 React 기능을 꺼내 쓰게 해 주는, 이름이 use로 시작하는 함수입니다.)
import { Navigate, useLocation } from 'react-router-dom';
// useAuth: 우리가 직접 만든 커스텀 훅. AuthContext(전역 인증 정보)에서 로그인 상태 등을 꺼내 옵니다.
import { useAuth } from '../contexts/AuthContext';
// type import: 타입(ReactElement)만 가져온다는 표시입니다.
//  - TypeScript에서 'type' 키워드를 붙이면 "실행 코드가 아니라 타입 정보만"이라는 뜻이라,
//    빌드 결과물에서 깔끔하게 제거되어 번들 크기에 영향을 주지 않습니다.
//  - ReactElement: "화면에 그릴 수 있는 React 요소" 하나를 가리키는 타입입니다.
import type { ReactElement } from 'react';

// AuthGuardProps: 이 컴포넌트가 받을 props의 "모양(타입)"을 정의합니다.
//  - interface는 TypeScript에서 객체의 구조(어떤 속성이 어떤 타입인지)를 설명하는 문법입니다.
//  - 이렇게 타입을 미리 정해 두면, 잘못된 값을 넘길 때 편집기/컴파일러가 미리 경고해 줍니다.
interface AuthGuardProps {
  children: React.ReactNode;   // 보호 대상(로그인해야 볼 수 있는 화면). ReactNode는 화면에 그릴 수 있는 거의 모든 것(요소, 문자열, 배열 등)을 포함하는 넓은 타입.
}

// AuthGuard — children을 인증 여부에 따라 렌더/차단한다.
//  - 매개변수: { children } — props 객체에서 children만 꺼내 쓰는 "구조 분해 할당" 문법입니다.
//    (props.children 이라고 쓰는 대신 children 이라고 짧게 쓰려는 것.)
//  - 반환값 타입 ReactElement | null:
//      * ReactElement = 무언가를 화면에 그려서 반환할 수 있다.
//      * null = "아무것도 그리지 않음"을 반환할 수도 있다. (| 는 "또는"이라는 뜻)
//  - 부수효과(side effect): 미로그인일 때 Navigate를 반환하면 실제로 페이지가 /login으로 바뀝니다.
const AuthGuard = ({ children }: AuthGuardProps): ReactElement | null => {
  // 전역 인증 컨텍스트에서 로그인 여부와 초기 로딩 상태를 가져온다.
  //  - isLoggedIn: 현재 로그인되어 있으면 true, 아니면 false.
  //  - loading: 앱이 켜질 때 "이미 로그인된 세션이 있는지" 서버/저장소에 확인하는 동안 true.
  //    이 확인이 끝나면 false가 됩니다.
  //  - 구조 분해 할당으로 useAuth()가 돌려준 객체에서 두 값을 한 번에 꺼냅니다.
  const { isLoggedIn, loading } = useAuth();
  // 현재 사용자가 보고 있던 위치(주소) 정보를 가져옵니다.
  // 미로그인이라 로그인 페이지로 보낼 때, "원래 어디로 가려 했는지"를 기억해 두기 위해 사용합니다.
  const location = useLocation();   // 미로그인 리다이렉트 시 복귀 지점으로 사용

  // [상태 1] 세션 확인이 아직 진행 중일 때.
  //  - 주의: 이 검사를 가장 먼저 하는 이유가 중요합니다.
  //    loading 중에는 isLoggedIn 값이 아직 확정되지 않았을 수 있습니다.
  //    만약 loading을 먼저 처리하지 않으면, 잠깐 동안 "로그인 안 됨"으로 잘못 판단해
  //    화면이 깜빡이거나 엉뚱하게 /login으로 튕길 수 있습니다(화면 깜빡임 = flicker).
  //  - 그래서 확인이 끝날 때까지는 로딩 스피너만 보여 줍니다.
  if (loading) {
    return (
      // inline style(인라인 스타일): JSX에서는 style에 객체({ })를 넘깁니다.
      //   바깥 { }는 "JSX 안에서 자바스크립트를 쓴다"는 표시,
      //   안쪽 { }는 실제 스타일 객체입니다. (그래서 style={{ ... }} 처럼 중괄호가 두 겹)
      //   화면 한가운데에 스피너를 두기 위해 flex로 가로/세로 가운데 정렬합니다.
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {/* loading-spinner: CSS에서 정의된 빙글빙글 도는 로딩 표시. 내용물은 비어 있고 모양은 CSS가 담당. */}
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // [상태 2] 확인이 끝났고, 로그인이 안 되어 있을 때.
  //  - !isLoggedIn 의 '!'는 "아니다(부정)"라는 뜻. 즉 "로그인되어 있지 않다면".
  //  - <Navigate ... /> 가 화면에 그려지는 순간 사용자는 /login 페이지로 이동합니다.
  //  - state={{ from: location }}: 이동하면서 "원래 가려던 위치"를 함께 전달합니다.
  //    로그인 페이지에서 로그인에 성공하면 이 from 값을 읽어 그 화면으로 되돌려 보낼 수 있습니다.
  //  - replace: 브라우저 방문 기록을 "남기지 않고 교체"합니다.
  //    주의: replace가 없으면 로그인 후 사용자가 "뒤로 가기"를 눌렀을 때
  //    다시 이 보호 페이지 → 다시 /login 으로 튕기는 무한 루프 같은 불편이 생길 수 있습니다.
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // [상태 3] 확인도 끝났고 로그인도 되어 있을 때 → 보호 대상(children)을 그대로 보여 줍니다.
  //  - <>{children}</> 의 <>...</>는 "Fragment(프래그먼트)"입니다.
  //    불필요한 <div> 같은 껍데기 태그를 추가하지 않고 여러 자식을 묶어 반환할 때 씁니다.
  return <>{children}</>;
};

// 이 파일의 기본(default) export. 다른 파일에서 import AuthGuard from '...' 형태로 가져다 씁니다.
export default AuthGuard;
