/**
 * AdminGuard.tsx
 *
 * [이 파일을 한 문장으로]
 *   "관리자만 들어갈 수 있는 페이지" 앞을 지키는 문지기(Guard) 컴포넌트다.
 *
 * [왜 필요한가? — 초보자용 배경 설명]
 *   웹사이트에는 누구나 볼 수 있는 페이지(예: 홈)도 있지만,
 *   관리자만 봐야 하는 페이지(예: 회원 관리, 통계 대시보드)도 있다.
 *   그런데 화면에서 메뉴만 숨겨봤자, 사용자가 주소창에 직접 '/admin' 같은 URL을 치면
 *   페이지가 그냥 열려버릴 수 있다.
 *   그래서 "이 페이지를 보여주기 전에, 정말 관리자가 맞는지 코드로 한 번 더 검사"하는
 *   장치가 필요하다. 그 장치가 바로 이 AdminGuard다.
 *
 * [핵심 용어 미리보기]
 *   - 컴포넌트(Component): 화면의 한 조각을 만드는 함수. React에서는 함수가 곧 화면 조각이다.
 *   - children: 어떤 컴포넌트로 "감싼" 안쪽 내용. <AdminGuard><관리자페이지/></AdminGuard> 라고 쓰면
 *               <관리자페이지/>가 AdminGuard의 children이 된다.
 *   - 라우트(Route): URL 주소 하나하나(예: /admin, /login)와 그 주소에서 보여줄 화면의 짝.
 *   - 가드(Guard): 어떤 화면을 보여주기 전에 조건을 검사해서 통과/차단을 결정하는 컴포넌트.
 *   - 리다이렉트(Redirect): 사용자를 다른 주소로 자동으로 이동시키는 것.
 *   - Context(컨텍스트): 여러 컴포넌트가 공유하는 전역 데이터 보관소. 여기서는 로그인 정보를 꺼내 쓴다.
 *
 * [이 가드가 하는 일의 순서]
 *   1) AuthContext(인증 정보 보관소)에서 로그인 여부 / 관리자 여부 / 로딩 상태를 읽는다.
 *   2) 아직 인증 정보를 불러오는 중(loading)이면 → 섣불리 판단하지 말고 로딩 스피너를 보여준다.
 *   3) 로그인하지 않았다면 → 로그인 페이지(/login)로 보낸다. (원래 가려던 곳을 기억해 둠)
 *   4) 로그인은 했지만 관리자가 아니면 → 홈(/)으로 돌려보낸다.
 *   5) 위 검사를 전부 통과한 진짜 관리자에게만 → 보호 대상 페이지(children)를 보여준다.
 *
 * [export 정리]
 *   - default export: AdminGuard 컴포넌트 (이 파일의 주인공)
 */

// react-router-dom: 페이지(주소) 이동을 다루는 라이브러리.
//   - Navigate: "다른 주소로 이동시켜라"를 뜻하는 컴포넌트. 이걸 화면에 그리면(return 하면) 그 즉시 이동이 일어난다.
//   - useLocation: 지금 사용자가 있는 위치(현재 URL 정보)를 알려주는 훅(hook).
//     ※ 훅(hook): 이름이 use로 시작하는 특수 함수. 컴포넌트에 기능(상태, 라우터 정보 등)을 "연결"해 준다.
import { Navigate, useLocation } from 'react-router-dom';
// useAuth: 우리 프로젝트가 직접 만든 훅. 로그인 정보(로그인했는지, 관리자인지 등)를 꺼내 쓰게 해준다.
import { useAuth } from '../contexts/AuthContext';
// ReactElement: "React가 화면에 그릴 수 있는 요소"를 가리키는 타입(type).
//   - type import: 실제 코드가 아니라 '타입 정보'만 가져온다는 표시. 빌드 결과물에는 포함되지 않는다(TypeScript 문법).
import type { ReactElement } from 'react';

// AdminGuard가 받을 입력값(props)의 모양을 미리 정의한 타입.
//   ※ props: 부모 컴포넌트가 자식 컴포넌트에게 건네주는 값들의 묶음(함수의 매개변수 같은 것).
//   ※ interface: TypeScript에서 "객체가 어떤 속성을 가져야 하는지" 규칙을 적는 문법.
interface AdminGuardProps {
  children: React.ReactNode; // 가드를 통과했을 때 렌더링할 보호 대상 노드
  // ↑ React.ReactNode: 화면에 그릴 수 있는 거의 모든 것(컴포넌트, 텍스트, 숫자, 배열 등)을 허용하는 넓은 타입.
}

/**
 * AdminGuard
 *   관리자 권한이 필요한 라우트를 감싸서 접근을 제어하는 가드 컴포넌트.
 *
 * @param children 인증/권한 검사를 통과했을 때 렌더링할 자식 노드
 * @returns 상황에 따라 셋 중 하나: 로딩 스피너 / 리다이렉트(Navigate) / children.
 *          타입은 ReactElement(그릴 요소) 또는 null(아무것도 안 그림)이다.
 * @sideeffect(부수효과) 조건을 만족하지 못하면 Navigate를 그려서 사용자를 다른 주소로 이동시킨다.
 *          ※ 부수효과: 화면을 그리는 것 외에 '추가로 일어나는 일'(여기서는 페이지 이동).
 */
// 화살표 함수로 컴포넌트를 정의한다. { children }은 props에서 children만 꺼내는 '구조 분해 할당'.
//   ': AdminGuardProps'는 입력 타입, ': ReactElement | null'은 반환 타입을 명시한 것(TypeScript).
const AdminGuard = ({ children }: AdminGuardProps): ReactElement | null => {
  // 전역 인증 보관소(AuthContext)에서 필요한 값 3가지를 한 번에 꺼낸다(구조 분해).
  //   - isLoggedIn: 로그인했는지 여부 (true/false)
  //   - isAdmin: 관리자 권한이 있는지 여부 (true/false)
  //   - loading: 인증 정보를 아직 불러오는 중인지 여부 (true면 "확인 중")
  // ※ 왜 loading이 필요한가? 로그인 정보는 보통 서버/저장소에서 비동기로 불러오므로,
  //    불러오기 전 잠깐 동안은 "로그인했는지 아닌지 아직 모름" 상태가 존재하기 때문.
  const { isLoggedIn, isAdmin, loading } = useAuth();
  // 지금 사용자가 있는 위치(현재 URL 등)를 가져온다.
  // 비로그인 사용자를 로그인 페이지로 보낼 때, "원래 어디로 가려고 했는지"를 함께 기억해 두기 위함.
  const location = useLocation();

  // [1단계] 아직 인증 상태가 확정되지 않았다면(불러오는 중) → 판단을 미루고 로딩 화면만 보여준다.
  // 주의: 이 검사를 빼먹으면, loading 중에는 isLoggedIn이 잠깐 false일 수 있어서
  //       로그인한 사용자도 순간적으로 로그인 페이지로 튕겨나가는 버그가 생긴다.
  //       그래서 "확실해질 때까지 기다린다"는 의미로 가장 먼저 검사한다.
  if (loading) {
    return (
      // 화면 정중앙에 스피너를 놓기 위한 컨테이너.
      //   - display:flex + justifyContent/alignItems: center → 가로·세로 모두 가운데 정렬
      //   - minHeight: 60vh → 화면 높이의 60%를 최소 높이로 잡아 스피너가 위로 쏠리지 않게 함 (vh = 화면 높이 100분의 1)
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {/* 실제로 빙글빙글 도는 스피너. 회전 애니메이션은 'loading-spinner' CSS 클래스에 정의되어 있다 */}
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // [2단계] 로그인하지 않은 사용자 → 로그인 페이지(/login)로 이동시킨다.
  //   - state={{ from: location }}: 원래 가려던 위치를 함께 넘긴다.
  //       → 로그인 페이지가 이 값을 읽으면, 로그인 성공 후 원래 페이지로 되돌려보낼 수 있다.
  //   - replace: 브라우저 히스토리에서 현재 항목을 '교체'한다(추가하지 않음).
  //       주의: replace를 안 쓰면, 로그인 후 '뒤로가기'를 눌렀을 때 다시 가드 → 다시 로그인으로
  //             빙빙 도는(무한 루프 같은) 어색한 동작이 생길 수 있다. 그래서 replace로 막는다.
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // [3단계] 로그인은 했지만 관리자가 아닌 사용자 → 홈(/)으로 돌려보낸다.
  //   여기까지 왔다는 건 "로그인은 됨"이 보장된 상태이므로, 남은 검사는 권한(isAdmin)뿐이다.
  //   권한 없는 사람에게 관리자 페이지가 깜빡이라도 보이지 않도록 차단하는 것이 목적.
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // [4단계] 위 모든 검사를 통과한 '진짜 관리자'에게만 보호 대상(children)을 그대로 보여준다.
  //   <>...</> 는 'Fragment'(빈 껍데기)다. 불필요한 <div> 같은 추가 태그 없이 children만 감싸서 렌더링하기 위함.
  return <>{children}</>;
};

// 이 컴포넌트를 다른 파일에서 import해서 쓸 수 있도록 기본(default) 내보내기.
//   예) <AdminGuard><AdminPage /></AdminGuard> 처럼 사용한다.
export default AdminGuard;
