import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  color?: 'blue' | 'purple' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const colorGradients = {
    blue: 'bg-gradient-to-r from-primary-600 to-blue-400',
    purple: 'bg-gradient-to-r from-secondary-600 to-purple-400',
    emerald: 'bg-gradient-to-r from-emerald-600 to-teal-400',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-navy-700 mb-1.5">
          <span>Progress</span>
          <span className="text-primary-700 font-bold">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} rounded-full transition-all duration-500 ease-out ${colorGradients[color]}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};
