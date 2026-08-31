import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, badge, className }: Props) {
  return (
    <div className={`flex items-start justify-between mb-5 ${className ?? ''}`}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>}
    </div>
  );
}
