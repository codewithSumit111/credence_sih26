import { clsx } from 'clsx';
import type { BlockStatus, EventSeverity, ApprovalStatus } from '../../types';

type AnyStatus = BlockStatus | EventSeverity | ApprovalStatus | 'ON_TIME' | 'DELAYED' | 'REROUTED' | 'STOPPED' | 'BUNDLED' | string;

const statusConfig: Record<string, { label: string; className: string }> = {
  'DEMANDED': { label: 'DEMANDED', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  'PROVISIONAL': { label: 'PROVISIONAL', className: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
  'AI-OPTIMIZED': { label: 'AI-OPTIMIZED', className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  'PROPOSED': { label: 'PROPOSED', className: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
  'APPROVED': { label: 'APPROVED', className: 'bg-green-50 text-green-800 border-green-300' },
  'ACTIVE': { label: 'ACTIVE', className: 'bg-green-100 text-green-900 border-green-400' },
  'COMPLETED': { label: 'COMPLETED', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  'REJECTED': { label: 'REJECTED', className: 'bg-red-50 text-red-800 border-red-300' },
  'MODIFIED': { label: 'MODIFIED', className: 'bg-orange-50 text-orange-800 border-orange-300' },
  'OVERRUN': { label: 'OVERRUN', className: 'bg-red-100 text-red-900 border-red-400' },
  'PENDING': { label: 'PENDING', className: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
  'CRITICAL': { label: 'CRITICAL', className: 'bg-red-600 text-white border-red-700' },
  'HIGH': { label: 'HIGH', className: 'bg-red-100 text-red-800 border-red-300' },
  'MEDIUM': { label: 'MEDIUM', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  'LOW': { label: 'LOW', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  'ON_TIME': { label: 'ON TIME', className: 'bg-green-50 text-green-800 border-green-300' },
  'DELAYED': { label: 'DELAYED', className: 'bg-red-50 text-red-800 border-red-300' },
  'REROUTED': { label: 'REROUTED', className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  'STOPPED': { label: 'STOPPED', className: 'bg-red-100 text-red-900 border-red-400' },
  'BUNDLED': { label: 'BUNDLED', className: 'bg-purple-50 text-purple-800 border-purple-300' },
  'OPEN': { label: 'OPEN', className: 'bg-red-50 text-red-800 border-red-300' },
  'ACKNOWLEDGED': { label: 'ACKNOWLEDGED', className: 'bg-amber-50 text-amber-800 border-amber-300' },
  'RESOLVING': { label: 'RESOLVING', className: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  'RESOLVED': { label: 'RESOLVED', className: 'bg-green-50 text-green-800 border-green-300' },
  'NOT_REQUIRED': { label: 'NOT REQUIRED', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  'CONFLICT_DETECTED': { label: 'CONFLICT', className: 'bg-red-50 text-red-800 border-red-300' },
  'ROUTE_CALCULATING': { label: 'CALCULATING', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  'ACCEPTED': { label: 'ACCEPTED', className: 'bg-green-50 text-green-800 border-green-300' },
  'OVERDUE': { label: 'OVERDUE', className: 'bg-red-100 text-red-800 border-red-300' },
  'SCHEDULED': { label: 'SCHEDULED', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  'IN_PROGRESS': { label: 'IN PROGRESS', className: 'bg-green-50 text-green-800 border-green-300' },
};

interface Props {
  status: AnyStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className }: Props) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
  return (
    <span className={clsx(
      'inline-flex items-center font-semibold border rounded whitespace-nowrap',
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
