/**
 * PublicLayout.tsx — 앱 전체 레이아웃 + 라우팅(주소→화면 연결) 정의
 *
 * [이 파일이 뭐예요?]
 *  - "레이아웃(Layout)"이란 모든 페이지에 공통으로 들어가는 뼈대를 말해요.
 *    이 앱은 화면 위쪽에 항상 Navbar(메뉴 바), 아래쪽에 항상 Footer(바닥글)를 보여주고,
 *    그 가운데(<main>) 영역만 현재 주소(URL)에 따라 다른 페이지로 갈아끼웁니다.
 *  - "라우팅(Routing)"이란 브라우저 주소창의 경로(예: /curriculum)를 보고
 *    어떤 컴포넌트(=화면)를 보여줄지 결정하는 일이에요. 여기서는 react-router-dom 라이브러리를 씁니다.
 *
 * [초보가 알아두면 좋은 용어]
 *  - 컴포넌트(Component): 화면의 한 조각을 만드는 함수. React에서는 함수가 JSX(HTML 비슷한 문법)를 반환하면
 *    그게 화면이 됩니다.
 *  - JSX: 자바스크립트 안에서 HTML처럼 생긴 태그를 쓰는 문법. <div>, <Route> 같은 것들.
 *  - 라우트(Route): "이 경로(path)면 이 화면(element)을 보여줘"라는 한 쌍의 규칙.
 *
 * 역할:
 *  - 상단 Navbar / 하단 Footer를 고정하고, 그 사이 <main>에 라우트별 페이지를 렌더한다.
 *
 * 핵심 책임:
 *  - 모든 페이지를 React.lazy로 코드 스플리팅하여 초기 번들을 줄임(Suspense fallback=Loading).
 *    (코드 스플리팅 = 앱 전체 코드를 한 번에 받지 않고, 필요한 페이지 코드만 그때그때 내려받기.
 *     → 첫 화면이 더 빨리 뜸)
 *  - 접근 권한에 따라 라우트를 구분: 공개 / 로그인 필요(AuthGuard) / 관리자(AdminGuard).
 *    (Guard = "문지기". 권한이 없으면 페이지 대신 로그인 화면 등으로 돌려보냄)
 *  - site.features.auth 플래그로 인증 관련 라우트를 조건부 등록.
 *    (플래그 = on/off 스위치 값. 설정 파일에서 켜고 끌 수 있음)
 *
 * 주요 export:
 *  - default: PublicLayout (라우터 레이아웃 컴포넌트)
 */

// import: 다른 파일에 있는 기능을 이 파일로 가져오는 구문.
// - lazy: 페이지를 "필요할 때 늦게(lazy) 불러오기" 위한 React 함수.
// - Suspense: lazy로 불러오는 동안 임시 화면(fallback)을 대신 보여주는 React 컴포넌트.
// - type ReactElement: 컴포넌트가 반환하는 "React 화면 요소"의 타입(TypeScript용). `type`을 붙이면
//   실제 코드가 아니라 "타입 정보만" 가져온다는 뜻이라, 빌드 결과물에 포함되지 않아 더 가벼워요.
import { lazy, Suspense, type ReactElement } from 'react';
// react-router-dom: 주소(URL)와 화면을 연결해주는 라우팅 라이브러리.
// - Routes: 여러 Route를 감싸는 컨테이너. 현재 주소와 "가장 잘 맞는" Route 하나만 골라 렌더함.
// - Route: 경로(path)와 보여줄 화면(element)을 짝지어주는 규칙 하나.
// - Navigate: 화면 대신 "다른 경로로 즉시 이동"시키는 리다이렉트용 컴포넌트.
import { Routes, Route, Navigate } from 'react-router-dom';
// AuthGuard: 로그인한 사용자만 통과시키는 문지기 컴포넌트.
import AuthGuard from '../components/AuthGuard';
// AdminGuard: 관리자만 통과시키는 문지기 컴포넌트.
import AdminGuard from '../components/AdminGuard';
// Navbar/Footer: 모든 페이지에 공통으로 보이는 상단 메뉴/하단 바닥글.
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
// ProjectLayout: '프로젝트' 섹션 좌측 사이드바 공통 레이아웃(하위 라우트를 Outlet에 렌더).
import ProjectLayout from './ProjectLayout';
// site: 사이트 전반의 설정값(기능 on/off 플래그 등)이 담긴 설정 객체.
import site from '../config/site';

// ── 아래 페이지들은 모두 lazy import → 해당 라우트 진입 시에만 청크 다운로드(코드 스플리팅) ──
//   lazy(() => import('...')) 패턴 설명:
//   - import('...') 는 "그 파일을 비동기로 나중에 불러오는" 동적 임포트입니다(파일 첫 줄의 정적 import와 다름).
//   - lazy(...)로 감싸면, 해당 컴포넌트가 화면에 처음 필요해질 때 비로소 그 코드 조각을 내려받습니다.
//   - 그래서 사용자가 방문하지 않은 페이지의 코드는 처음엔 다운로드되지 않아 초기 로딩이 빨라집니다.
//   주의: lazy 컴포넌트는 반드시 <Suspense>로 감싸야 합니다(로딩 중 보여줄 화면이 필요하기 때문).

// 공개 페이지 — 로그인 없이 누구나 볼 수 있는 화면들
const Home = lazy(() => import('../pages/Home'));
const Curriculum = lazy(() => import('../pages/Curriculum'));
const Schedule = lazy(() => import('../pages/Schedule'));
const Competition = lazy(() => import('../pages/Competition'));
const CompetitionPreEval = lazy(() => import('../pages/CompetitionPreEval'));
const CompetitionEvalSummary = lazy(() => import('../pages/CompetitionEvalSummary'));
const CompetitionEvalRanking = lazy(() => import('../pages/CompetitionEvalRanking'));
const CompetitionResultEval = lazy(() => import('../pages/CompetitionResultEval'));
const CompetitionResultSummary = lazy(() => import('../pages/CompetitionResultSummary'));
const CompetitionResultRanking = lazy(() => import('../pages/CompetitionResultRanking'));
const Resources = lazy(() => import('../pages/Resources'));
const Instructor = lazy(() => import('../pages/Instructor'));
const Classroom = lazy(() => import('../pages/Classroom'));
const Learning = lazy(() => import('../pages/Learning'));
const Assessment = lazy(() => import('../pages/Assessment'));
const ProjectGuide = lazy(() => import('../pages/ProjectGuide'));
const ProjectBoard = lazy(() => import('../pages/ProjectBoard'));
const ProjectVote = lazy(() => import('../pages/ProjectVote'));
const ProjectChecklist = lazy(() => import('../pages/ProjectChecklist'));
const ProjectTimeline = lazy(() => import('../pages/ProjectTimeline'));
const ProjectPadlets = lazy(() => import('../pages/ProjectPadlets'));
const ProjectSubmit = lazy(() => import('../pages/ProjectSubmit'));
// 개인별 PBL활동 — 기본정보·단계 워크시트(자동 채점·DB 저장)·평가(강사)·루브릭
const PblInfo = lazy(() => import('../pages/pbl/PblInfo'));
const PblStage = lazy(() => import('../pages/pbl/PblStage'));
const PblEval = lazy(() => import('../pages/pbl/PblEval'));
const PblRubric = lazy(() => import('../pages/pbl/PblRubric'));
const NotFound = lazy(() => import('../pages/NotFound')); // 어떤 경로에도 안 맞을 때 보여줄 404 페이지

// Auth 페이지 — 로그인/회원가입/비밀번호 찾기/마이페이지 등 "인증" 관련 화면
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const MyPage = lazy(() => import('../pages/MyPage'));

// 학생 전용 페이지 — 로그인한 사용자(학생)만 접근 가능
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Materials = lazy(() => import('../pages/Materials'));
const Assignments = lazy(() => import('../pages/Assignments'));
const AssignmentDetail = lazy(() => import('../pages/AssignmentDetail'));
const Teams = lazy(() => import('../pages/Teams'));
const Projects = lazy(() => import('../pages/Projects'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));
const QnA = lazy(() => import('../pages/QnA'));
const Announcements = lazy(() => import('../pages/Announcements'));
const AnnouncementDetail = lazy(() => import('../pages/AnnouncementDetail'));
const AppGallery = lazy(() => import('../pages/apps/AppGallery'));

// 관리자 페이지 — 관리자 권한이 있어야만 접근 가능
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('../pages/admin/AdminStudents'));
const AdminRoster = lazy(() => import('../pages/admin/AdminRoster'));
const AdminMaterials = lazy(() => import('../pages/admin/AdminMaterials'));
const AdminAssignments = lazy(() => import('../pages/admin/AdminAssignments'));
const AdminAttendance = lazy(() => import('../pages/admin/AdminAttendance'));
const AdminGrades = lazy(() => import('../pages/admin/AdminGrades'));
const AdminPblScores = lazy(() => import('../pages/admin/AdminPblScores'));
const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements'));
const AdminTeams = lazy(() => import('../pages/admin/AdminTeams'));
const AdminProjectEval = lazy(() => import('../pages/admin/AdminProjectEval'));
const About = lazy(() => import('../pages/About'));

// Loading — lazy 청크 로딩 중 보여줄 스피너(Suspense fallback).
//   - 이 함수는 "화면 한 조각을 반환하는" 작은 컴포넌트입니다.
//   - 반환 타입 (): ReactElement → "인자 없이 호출되고, React 화면 요소를 돌려준다"는 의미.
//   - 부수효과(side effect) 없음: 단순히 가운데 정렬된 빈 박스 안에 스피너 하나만 그립니다.
//   - style의 minHeight: '60vh' → 화면 높이(viewport height)의 60%만큼 세로 공간을 확보해
//     로딩 중 레이아웃이 위로 쏠리지 않게 합니다(vh = viewport height의 1%).
const Loading = (): ReactElement => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="loading-spinner"></div>
  </div>
);

// PublicLayout — Navbar/Footer 사이에 라우트별 페이지를 렌더하는 레이아웃.
//   - 매개변수: 없음.
//   - 반환: 전체 화면 구조(JSX). 위에서 아래로 Navbar → main(페이지) → Footer 순서.
const PublicLayout = (): ReactElement => {
  return (
    // <>...</> 는 "Fragment(프래그먼트)" — 불필요한 <div> 없이 여러 요소를 묶어서 반환할 때 씁니다.
    // (React 컴포넌트는 최상위 요소를 하나만 반환할 수 있어서, 여러 개를 묶을 포장지가 필요해요.)
    <>
      <Navbar /> {/* 항상 화면 맨 위에 고정으로 보이는 메뉴 바 */}
      <main>
        {/* Suspense: 아래 lazy 페이지를 내려받는 동안 fallback(Loading 스피너)을 대신 보여줌.
            로딩이 끝나면 자동으로 실제 페이지로 바뀝니다. */}
        <Suspense fallback={<Loading />}>
          {/* Routes: 현재 브라우저 주소와 비교해 "가장 잘 맞는" Route 하나만 골라 렌더합니다. */}
          <Routes>
            {/* 공개 페이지 — 로그인 불필요.
                각 Route는 path(주소)와 element(보여줄 화면)를 짝지어 줍니다.
                예: 주소가 "/" 이면 <Home /> 화면을 렌더. */}
            <Route path="/" element={<Home />} />
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/competition" element={<Competition />} />
            {/* 경진대회 하위 — 사전평가(로그인 필요), 결과평가(공개 예정) */}
            <Route path="/competition/pre-eval" element={<AuthGuard><CompetitionPreEval /></AuthGuard>} />
            <Route path="/competition/eval-summary" element={<AuthGuard><CompetitionEvalSummary /></AuthGuard>} />
            <Route path="/competition/eval-ranking" element={<AuthGuard><CompetitionEvalRanking /></AuthGuard>} />
            <Route path="/competition/result" element={<AuthGuard><CompetitionResultEval /></AuthGuard>} />
            <Route path="/competition/result-summary" element={<AuthGuard><CompetitionResultSummary /></AuthGuard>} />
            <Route path="/competition/result-ranking" element={<AuthGuard><CompetitionResultRanking /></AuthGuard>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/instructor" element={<Instructor />} />
            <Route path="/classroom" element={<Classroom />} />
            {/* :phase 처럼 콜론(:)이 붙은 부분은 "URL 파라미터"입니다.
                예: /learning/intro 로 오면 phase = "intro" 라는 값으로 페이지에 전달됩니다.
                즉 하나의 Route로 여러 주소(/learning/아무거나)를 처리할 수 있어요. */}
            <Route path="/learning/:phase" element={<Learning />} />
            {/* 같은 <Assessment /> 화면을 두 가지 주소로 연결.
                /assessment (파라미터 없음) 과 /assessment/특정타입 모두 같은 페이지에서 처리합니다. */}
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/assessment/:type" element={<Assessment />} />
            {/* 참고·예시(아이디어 예시·구현 예시) — 좌측 사이드바 없이 일반 페이지로 둔다. */}
            <Route path="/project-guide" element={<ProjectGuide />} />
            <Route path="/project-guide/:id" element={<ProjectGuide />} />
            <Route path="/projects/apps" element={<AuthGuard><AppGallery /></AuthGuard>} />
            {/* 팀 활동 — 좌측 사이드바(ProjectLayout)를 공통 적용.
                path 없는 레이아웃 라우트로, 하위 라우트가 ProjectLayout의 <Outlet/> 자리에 렌더된다.
                각 하위는 기존처럼 AuthGuard로 개별 보호한다. */}
            <Route element={<ProjectLayout />}>
              <Route path="/project-vote" element={<AuthGuard><ProjectVote /></AuthGuard>} />
              <Route path="/project-schedule" element={<AuthGuard><ProjectTimeline /></AuthGuard>} />
              <Route path="/project-checklist" element={<AuthGuard><ProjectChecklist /></AuthGuard>} />
              <Route path="/project-board" element={<AuthGuard><ProjectBoard /></AuthGuard>} />
              <Route path="/project-padlets" element={<AuthGuard><ProjectPadlets /></AuthGuard>} />
              <Route path="/project-submit" element={<AuthGuard><ProjectSubmit /></AuthGuard>} />
            </Route>
            {/* 구 경로 → 신 경로 리다이렉트(/project-teams → /project-vote) */}
            <Route path="/project-teams" element={<Navigate to="/project-vote" replace />} />

            {/* 개인별 PBL활동 — 로그인 사용자가 단계별로 작성하면 자동 채점되어 DB에 저장되고,
                관리자(/pbl/eval)는 개인별 점수·피드백을 확인/입력할 수 있다.
                주의: 더 구체적인 경로(info·rubric·eval)를 먼저 두고, 마지막에 /pbl/:stage(단계 와일드카드)를 둔다. */}
            <Route path="/pbl" element={<Navigate to="/pbl/info" replace />} />
            <Route path="/pbl/info" element={<AuthGuard><PblInfo /></AuthGuard>} />
            <Route path="/pbl/rubric" element={<PblRubric />} />
            <Route path="/pbl/eval" element={<AdminGuard><PblEval /></AdminGuard>} />
            <Route path="/pbl/:stage" element={<AuthGuard><PblStage /></AuthGuard>} />

            {/* Auth — site.features.auth가 켜진 경우에만 등록.
                {조건 && <JSX />} 패턴: 조건이 true일 때만 뒤의 JSX를 렌더하고, false면 아무것도 안 그립니다.
                (자바스크립트의 && 단축 평가: 앞이 거짓이면 뒤를 평가하지 않음 → 라우트 자체가 등록되지 않음)
                → 인증 기능이 꺼진 사이트에서는 /login, /register 등 경로가 아예 존재하지 않게 됩니다.
                여기서 <>...</> Fragment로 여러 Route를 한 덩어리로 묶어 조건부로 넣었습니다. */}
            {site.features.auth && (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/* 마이페이지는 본인만 봐야 하므로 AuthGuard로 보호 */}
                <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />
              </>
            )}

            {/* 학생 전용 (로그인 필요) — 모두 AuthGuard로 보호.
                아래 모든 라우트는 로그인하지 않으면 페이지 대신 로그인 화면 등으로 돌려보내집니다. */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/materials" element={<AuthGuard><Materials /></AuthGuard>} />
            <Route path="/assignments" element={<AuthGuard><Assignments /></AuthGuard>} />
            {/* :id 파라미터로 "어떤 과제"인지 구분. 예: /assignments/5 → 5번 과제 상세 */}
            <Route path="/assignments/:id" element={<AuthGuard><AssignmentDetail /></AuthGuard>} />
            <Route path="/teams" element={<AuthGuard><Teams /></AuthGuard>} />
            <Route path="/projects" element={<AuthGuard><Projects /></AuthGuard>} />
            {/* /projects/apps(팀 앱 갤러리)는 위 ProjectLayout 그룹에서 처리한다.
                React Router v6는 정적 경로를 동적(:id)보다 우선 매칭하므로 'apps'가 :id로 잡히지 않는다. */}
            <Route path="/projects/:id" element={<AuthGuard><ProjectDetail /></AuthGuard>} />
            <Route path="/qna" element={<AuthGuard><QnA /></AuthGuard>} />
            <Route path="/announcements" element={<AuthGuard><Announcements /></AuthGuard>} />
            <Route path="/announcements/:id" element={<AuthGuard><AnnouncementDetail /></AuthGuard>} />

            {/* 관리자 — 모두 AdminGuard로 보호.
                AdminGuard는 AuthGuard보다 한 단계 더 엄격: "로그인 + 관리자 권한"까지 확인합니다.
                (참고: 진짜 보안은 화면뿐 아니라 서버/DB 쪽에서도 막아야 합니다. 예: Supabase의 RLS(행 수준 보안)로
                 "관리자만 이 데이터를 읽고 쓸 수 있다"는 규칙을 DB에 직접 거는 방식. 화면 Guard만으로는 충분하지 않아요.) */}
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/students" element={<AdminGuard><AdminStudents /></AdminGuard>} />
            <Route path="/admin/roster" element={<AdminGuard><AdminRoster /></AdminGuard>} />
            <Route path="/admin/materials" element={<AdminGuard><AdminMaterials /></AdminGuard>} />
            <Route path="/admin/assignments" element={<AdminGuard><AdminAssignments /></AdminGuard>} />
            <Route path="/admin/attendance" element={<AdminGuard><AdminAttendance /></AdminGuard>} />
            <Route path="/admin/grades" element={<AdminGuard><AdminGrades /></AdminGuard>} />
            <Route path="/admin/pbl-scores" element={<AdminGuard><AdminPblScores /></AdminGuard>} />
            <Route path="/admin/announcements" element={<AdminGuard><AdminAnnouncements /></AdminGuard>} />
            <Route path="/admin/teams" element={<AdminGuard><AdminTeams /></AdminGuard>} />
            <Route path="/admin/projects/pre-eval" element={<AdminGuard><AdminProjectEval mode="pre" /></AdminGuard>} />
            <Route path="/admin/projects/result-eval" element={<AdminGuard><AdminProjectEval mode="result" /></AdminGuard>} />
            {/* 구 경로 호환: /admin/projects → 사전평가 집계표로 */}
            <Route path="/admin/projects" element={<AdminGuard><AdminProjectEval mode="pre" /></AdminGuard>} />

            {/* 404 */}
            <Route path="/about" element={<About />} />

            {/* 와일드카드 — 위 어떤 경로에도 안 맞으면 404.
                path="*" 의 별표(*)는 "그 외 모든 주소"를 뜻합니다.
                주의: 이 catch-all 라우트는 반드시 맨 아래에 둬야 합니다. 위에 두면 모든 주소를 가로채
                실제 페이지가 영영 안 나올 수 있어요(Routes는 위에서부터 가장 잘 맞는 걸 고름). */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer /> {/* 항상 화면 맨 아래에 고정으로 보이는 바닥글 */}
    </>
  );
};

// default export: 다른 파일에서 `import PublicLayout from '...'` 처럼 이름을 자유롭게 붙여 가져올 수 있게 내보냄.
// (한 파일에 default는 하나만 둘 수 있습니다.)
export default PublicLayout;
