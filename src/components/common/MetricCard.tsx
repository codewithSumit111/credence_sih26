import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  highlight?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function MetricCard({ label, value, sub, trend, trendValue, highlight, danger, icon, className }: Props) {
  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded p-4',
      highlight && 'border-l-4 border-l-blue-600',
      danger && 'border-l-4 border-l-red-500',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1 leading-tight">{label}</p>
          <p className={clsx(
            'text-2xl font-bold leading-none',
            highlight ? 'text-emerald-700' : danger ? 'text-red-600' : 'text-gray-900'
          )}>
            {value}
          </p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {icon && <div className="text-gray-300 flex-shrink-0 ml-2">{icon}</div>}
      </div>
      {trendValue && (
        <div className={clsx(
          'mt-2 flex items-center gap-1 text-xs font-medium',
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
        )}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </div>
      )}
    </div>
  );
}
