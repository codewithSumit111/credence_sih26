import { clsx } from 'clsx';
import { AlertTriangle, AlertOctagon, Info, ChevronRight } from 'lucide-react';
import type { LiveEvent } from '../../types';

const severityConfig = {
  CRITICAL: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-600 text-white', icon: AlertOctagon, iconColor: 'text-red-600' },
  HIGH: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500 text-white', icon: AlertTriangle, iconColor: 'text-orange-500' },
  MEDIUM: { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-500 text-white', icon: AlertTriangle, iconColor: 'text-amber-500' },
  LOW: { bg: 'bg-gray-50 border-gray-200', badge: 'bg-gray-500 text-white', icon: Info, iconColor: 'text-gray-500' },
};

interface Props {
  event: LiveEvent;
  onClick?: () => void;
  onReoptimize?: () => void;
}

export default function EventCard({ event, onClick, onReoptimize }: Props) {
  const cfg = severityConfig[event.severity];
  const Icon = cfg.icon;

  return (
    <div className={clsx('border rounded p-4 mb-3', cfg.bg)} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', cfg.iconColor)} />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded uppercase', cfg.badge)}>{event.severity}</span>
              <span className="text-sm font-bold text-gray-900">{event.title}</span>
            </div>
            <p className="text-xs text-gray-600">{event.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400 font-mono">
            {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {event.reoptimizationId && (
            <button
              onClick={(e) => { e.stopPropagation(); onReoptimize?.(); }}
              className="text-emerald-600 font-semibold hover:text-emerald-700"
            >
              RE-OPTIMIZE →
            </button>
          )}
          {!event.reoptimizationId && <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}
