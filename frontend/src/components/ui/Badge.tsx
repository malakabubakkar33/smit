import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate' | 'primary' | 'secondary' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
}) => {
  const variants = {
    blue: 'bg-primary-50 text-primary-700 border-primary-200/60',
    primary: 'bg-primary-50 text-primary-700 border-primary-200/60',
    purple: 'bg-secondary-50 text-secondary-700 border-secondary-200/60',
    secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md border',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg border',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
