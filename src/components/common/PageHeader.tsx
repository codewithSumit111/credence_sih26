import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, badge, className }: Props) {
  return (
    <div className={clsx('flex items-start justify-between', className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="irctc-page-title">{title}</h1>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        {subtitle && (
          <p className="text-[14px] text-irctc-muted mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4 pt-0.5">
          {actions}
        </div>
      )}
    </div>
  );
}
