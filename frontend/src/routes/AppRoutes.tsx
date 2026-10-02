import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.js';
import { useAuth } from '../context/AuthContext.js';

// Layouts
import { PublicLayout } from '../components/layout/PublicLayout.js';
import { StudentLayout } from '../components/layout/StudentLayout.js';
import { TeacherLayout } from '../components/layout/TeacherLayout.js';

// Public Pages (SMIT Web Class)
import { HomePage } from '../pages/public/HomePage.js';
import { CoursesPage } from '../pages/public/CoursesPage.js';
import { PublicCourseDetailsPage } from '../pages/public/PublicCourseDetailsPage.js';
import { FeaturesPage } from '../pages/public/FeaturesPage.js';
import { StudentsPage } from '../pages/public/StudentsPage.js';
import { AboutPage } from '../pages/public/AboutPage.js';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage.js';
import { SignupPage } from '../pages/auth/SignupPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard.js';
import { StudentCoursesPage } from '../pages/student/StudentCoursesPage.js';
import { CourseDetailsPage } from '../pages/student/CourseDetailsPage.js';
import { VideoLessonPage } from '../pages/student/VideoLessonPage.js';
import { StudentAssignmentsPage } from '../pages/student/StudentAssignmentsPage.js';
import { StudentAssignmentDetailPage } from '../pages/student/StudentAssignmentDetailPage.js';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage.js';
import { StudentNotificationsPage } from '../pages/student/StudentNotificationsPage.js';
import { StudentProfilePage } from '../pages/student/StudentProfilePage.js';
import { StudentSettingsPage } from '../pages/student/StudentSettingsPage.js';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard.js';
import { TeacherCoursesPage } from '../pages/teacher/TeacherCoursesPage.js';
import { TeacherCourseDetailsPage } from '../pages/teacher/TeacherCourseDetailsPage.js';
import { TeacherAssignmentsPage } from '../pages/teacher/TeacherAssignmentsPage.js';
import { TeacherStudentsPage } from '../pages/teacher/TeacherStudentsPage.js';
import { TeacherAttendancePage } from '../pages/teacher/TeacherAttendancePage.js';
import { TeacherAnalyticsPage } from '../pages/teacher/TeacherAnalyticsPage.js';
import { TeacherProfilePage } from '../pages/teacher/TeacherProfilePage.js';
import { TeacherSettingsPage } from '../pages/teacher/TeacherSettingsPage.js';
import { TeacherSetupPage } from '../pages/teacher/TeacherSetupPage.js';

/**
 * RootRoute: When an authenticated student or teacher visits the site root '/',
 * they are immediately redirected directly into their dedicated portal dashboard.
 * Unauthenticated guests continue to see the public HomePage.
 */
const RootRoute: React.FC = () => {
  const { isAuthenticated, user, isTeacher, isLoading } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <HomePage />;
};

/**
 * AuthGuestRoute: If already logged in, redirect away from login/signup directly into dashboard.
 */
const AuthGuestRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, user, isTeacher } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Common PublicLayout (Navbar + Content + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<PublicCourseDetailsPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Standalone Auth Pages */}
      <Route
        path="/login"
        element={
          <AuthGuestRoute>
            <LoginPage />
          </AuthGuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthGuestRoute>
            <SignupPage />
          </AuthGuestRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/teacher/setup" element={<TeacherSetupPage />} />

      {/* Student Portal (Protected for 'student' role only) */}
      <Route element={<ProtectedRoute allowedRole="student" />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/student/lessons/:id" element={<VideoLessonPage />} />
          <Route path="/student/videos/:id" element={<VideoLessonPage />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/assignments/:id" element={<StudentAssignmentDetailPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/settings" element={<StudentSettingsPage />} />
        </Route>
      </Route>

      {/* Teacher / Admin Portal (Protected for 'teacher' role only) */}
      <Route element={<ProtectedRoute allowedRole="teacher" />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          <Route path="/teacher/courses/:id" element={<TeacherCourseDetailsPage />} />
          <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
          <Route path="/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/teacher/analytics" element={<TeacherAnalyticsPage />} />
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />
          <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
