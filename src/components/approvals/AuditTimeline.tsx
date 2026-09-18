import { clsx } from 'clsx';
import type { AuditEntry } from '../../types';

interface Props {
  entries: AuditEntry[];
}

export default function AuditTimeline({ entries }: Props) {
  return (
    <div className="relative">
      {entries.map((entry, i) => (
        <div key={i} className="flex gap-3 mb-3">
          <div className="flex flex-col items-center">
            <div className={clsx(
              'w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0',
              entry.type === 'SYSTEM' ? 'bg-blue-400' : 'bg-gray-700'
            )} />
            {i < entries.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 font-mono">{entry.time}</span>
              <span className={clsx(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                entry.type === 'SYSTEM' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
              )}>{entry.actor}</span>
            </div>
            <p className="text-sm text-gray-700 mt-0.5">{entry.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
