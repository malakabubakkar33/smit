import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-primary-600 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-navy-600 max-w-md mt-2 leading-relaxed font-normal">
        The classroom lesson, page, or document you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8">
        <Button
          onClick={() => navigate('/')}
          variant="primary"
          size="md"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};
