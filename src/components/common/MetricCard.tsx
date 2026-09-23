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
  warning?: boolean;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MetricCard({
  label, value, sub, trend, trendValue,
  highlight, danger, warning, icon, className, onClick
}: Props) {
  return (
    <div
      className={clsx(
        'irctc-card flex items-start gap-4 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-irctc-md',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon area */}
      {icon && (
        <div className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          highlight ? 'bg-blue-50 text-irctc-blue'
          : danger   ? 'bg-red-50 text-red-600'
          : warning  ? 'bg-orange-50 text-irctc-orange'
          : 'bg-gray-50 text-gray-500'
        )}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="irctc-label mb-1.5 truncate">{label}</p>
        <p className={clsx(
          'text-[28px] font-bold leading-none',
          highlight ? 'text-irctc-blue'
          : danger   ? 'text-red-600'
          : warning  ? 'text-irctc-orange'
          : 'text-irctc-navy'
        )}>
          {value}
        </p>
        {sub && (
          <p className="text-[12px] text-irctc-muted mt-1.5 leading-snug">{sub}</p>
        )}
        {trendValue && (
          <div className={clsx(
            'mt-2 flex items-center gap-1 text-[12px] font-semibold',
            trend === 'up'   ? 'text-green-600'
            : trend === 'down' ? 'text-red-600'
            : 'text-irctc-muted'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
