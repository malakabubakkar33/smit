import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const redirectPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
        403 - Access Denied
      </h1>
      <p className="text-sm text-navy-600 max-w-md mt-2 leading-relaxed font-normal">
        You do not have permission to view this resource. Student and Teacher routes are strictly protected by role authorization.
      </p>
      <div className="mt-8">
        <Button
          onClick={() => navigate(user ? redirectPath : '/login')}
          variant="primary"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
