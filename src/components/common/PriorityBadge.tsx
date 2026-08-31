import { clsx } from 'clsx';
import type { Priority } from '../../types';

const priorityConfig: Record<Priority, string> = {
  Critical: 'bg-red-600 text-white border-red-700',
  High: 'bg-red-100 text-red-800 border-red-300',
  Medium: 'bg-amber-100 text-amber-800 border-amber-300',
  Low: 'bg-gray-100 text-gray-600 border-gray-300',
};

interface Props {
  priority: Priority;
  className?: string;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, className, size = 'sm' }: Props) {
  return (
    <span className={clsx(
      'inline-flex items-center font-bold border rounded uppercase tracking-wide whitespace-nowrap',
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
      priorityConfig[priority],
      className
    )}>
      {priority}
    </span>
  );
}
