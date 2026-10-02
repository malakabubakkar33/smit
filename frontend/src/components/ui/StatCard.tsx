import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'purple' | 'emerald' | 'amber';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'blue',
  badge,
}) => {
  const iconBgs = {
    blue: 'bg-primary-50 text-primary-600 border border-primary-100',
    purple: 'bg-secondary-50 text-secondary-600 border border-secondary-100',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 flex flex-col justify-between hover:shadow-soft-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBgs[accentColor]}`}>
          {icon}
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-extrabold text-navy-900 mt-1 tracking-tight">{value}</h4>
        {subtitle && <p className="text-xs text-navy-600 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
