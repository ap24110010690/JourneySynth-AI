// src/components/MetricCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium font-mono tabular-nums ${
              trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-slate-500 mt-1.5">{subtext}</p>}
    </div>
  );
};
