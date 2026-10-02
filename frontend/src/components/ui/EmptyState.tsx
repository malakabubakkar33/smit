import React from 'react';
import { Button } from './Button.js';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 ${className}`}>
      <div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-navy-900 tracking-tight">{title}</h3>
      <p className="text-sm text-navy-500 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
