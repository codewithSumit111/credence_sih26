import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="text-gray-300 mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
