import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { LoadingScreen } from '../../components/ui/LoadingScreen.js';

export const PublicCourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isTeacher } = useAuth();
  const { info } = useToast();

  useEffect(() => {
    if (!courseId) {
      navigate('/courses', { replace: true });
      return;
    }

    if (isAuthenticated) {
      // Direct authenticated user to their portal
      const targetPortal = isTeacher
        ? `/teacher/courses/${courseId}`
        : `/student/courses/${courseId}`;
      navigate(targetPortal, { replace: true });
    } else {
      // Prompt unauthenticated visitor to login to access in portal
      info(
        'Please sign in to your student account to access full course lessons in your portal.',
        'Student Portal Required'
      );
      navigate('/login', { replace: true });
    }
  }, [courseId, isAuthenticated, isTeacher, navigate, info]);

  return <LoadingScreen />;
};
