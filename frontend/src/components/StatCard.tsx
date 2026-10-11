import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  subtitle?: string;
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'group-hover:border-emerald-500/40',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'group-hover:border-amber-500/40',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    glow: 'group-hover:border-blue-500/40',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    glow: 'group-hover:border-purple-500/40',
  },
  red: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    glow: 'group-hover:border-rose-500/40',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'emerald',
  subtitle,
}) => {
  const colorStyles = colorMap[color] || colorMap.emerald;

  return (
    <div
      className={`group relative bg-slate-800/90 border border-slate-700/70 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-0.5 ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400 tracking-wide">{title}</span>
        <div
          className={`p-2.5 rounded-lg border ${colorStyles.bg} ${colorStyles.border} ${colorStyles.text} transition-transform group-hover:scale-110`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
      </div>

      {(trendValue || subtitle) && (
        <div className="mt-3 flex items-center text-xs space-x-1.5">
          {trendValue && (
            <span
              className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
                trend === 'up'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : trend === 'down'
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-slate-400 bg-slate-700/50'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-slate-400 font-normal">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
