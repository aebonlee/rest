import { lazy, Suspense, type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';
import AdminGuard from '../components/AdminGuard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import site from '../config/site';

// 공개 페이지
const Home = lazy(() => import('../pages/Home'));
const Curriculum = lazy(() => import('../pages/Curriculum'));
const Schedule = lazy(() => import('../pages/Schedule'));
const Competition = lazy(() => import('../pages/Competition'));
const Resources = lazy(() => import('../pages/Resources'));
const Instructor = lazy(() => import('../pages/Instructor'));
const Classroom = lazy(() => import('../pages/Classroom'));
const Learning = lazy(() => import('../pages/Learning'));
const Assessment = lazy(() => import('../pages/Assessment'));
const ProjectGuide = lazy(() => import('../pages/ProjectGuide'));
const ProjectBoard = lazy(() => import('../pages/ProjectBoard'));
const ProjectVote = lazy(() => import('../pages/ProjectVote'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Auth 페이지
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const MyPage = lazy(() => import('../pages/MyPage'));

// 학생 전용 페이지
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

// 관리자 페이지
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('../pages/admin/AdminStudents'));
const AdminRoster = lazy(() => import('../pages/admin/AdminRoster'));
const AdminMaterials = lazy(() => import('../pages/admin/AdminMaterials'));
const AdminAssignments = lazy(() => import('../pages/admin/AdminAssignments'));
const AdminAttendance = lazy(() => import('../pages/admin/AdminAttendance'));
const AdminGrades = lazy(() => import('../pages/admin/AdminGrades'));
const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements'));
const AdminTeams = lazy(() => import('../pages/admin/AdminTeams'));
const AdminProjects = lazy(() => import('../pages/admin/AdminProjects'));
const About = lazy(() => import('../pages/About'));

const Loading = (): ReactElement => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="loading-spinner"></div>
  </div>
);

const PublicLayout = (): ReactElement => {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* 공개 페이지 */}
            <Route path="/" element={<Home />} />
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/competition" element={<Competition />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/instructor" element={<Instructor />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/learning/:phase" element={<Learning />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/assessment/:type" element={<Assessment />} />
            <Route path="/project-guide" element={<ProjectGuide />} />
            <Route path="/project-guide/:id" element={<ProjectGuide />} />
            <Route path="/project-vote" element={<AuthGuard><ProjectVote /></AuthGuard>} />
            <Route path="/project-teams" element={<Navigate to="/project-vote" replace />} />
            <Route path="/project-board" element={<AuthGuard><ProjectBoard /></AuthGuard>} />

            {/* Auth */}
            {site.features.auth && (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />
              </>
            )}

            {/* 학생 전용 (로그인 필요) */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/materials" element={<AuthGuard><Materials /></AuthGuard>} />
            <Route path="/assignments" element={<AuthGuard><Assignments /></AuthGuard>} />
            <Route path="/assignments/:id" element={<AuthGuard><AssignmentDetail /></AuthGuard>} />
            <Route path="/teams" element={<AuthGuard><Teams /></AuthGuard>} />
            <Route path="/projects" element={<AuthGuard><Projects /></AuthGuard>} />
            <Route path="/projects/apps" element={<AuthGuard><AppGallery /></AuthGuard>} />
            <Route path="/projects/:id" element={<AuthGuard><ProjectDetail /></AuthGuard>} />
            <Route path="/qna" element={<AuthGuard><QnA /></AuthGuard>} />
            <Route path="/announcements" element={<AuthGuard><Announcements /></AuthGuard>} />
            <Route path="/announcements/:id" element={<AuthGuard><AnnouncementDetail /></AuthGuard>} />

            {/* 관리자 */}
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/students" element={<AdminGuard><AdminStudents /></AdminGuard>} />
            <Route path="/admin/roster" element={<AdminGuard><AdminRoster /></AdminGuard>} />
            <Route path="/admin/materials" element={<AdminGuard><AdminMaterials /></AdminGuard>} />
            <Route path="/admin/assignments" element={<AdminGuard><AdminAssignments /></AdminGuard>} />
            <Route path="/admin/attendance" element={<AdminGuard><AdminAttendance /></AdminGuard>} />
            <Route path="/admin/grades" element={<AdminGuard><AdminGrades /></AdminGuard>} />
            <Route path="/admin/announcements" element={<AdminGuard><AdminAnnouncements /></AdminGuard>} />
            <Route path="/admin/teams" element={<AdminGuard><AdminTeams /></AdminGuard>} />
            <Route path="/admin/projects" element={<AdminGuard><AdminProjects /></AdminGuard>} />

            {/* 404 */}
            <Route path="/about" element={<About />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
