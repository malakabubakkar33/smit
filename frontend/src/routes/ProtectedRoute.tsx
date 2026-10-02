import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LoadingScreen } from '../components/ui/LoadingScreen.js';
import { StudentDroppedPage } from '../pages/student/StudentDroppedPage.js';

export interface ProtectedRouteProps {
  allowedRole?: 'student' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if student account has been dropped/expelled
  if (user.role === 'student' && user.isDropped) {
    return <StudentDroppedPage />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
