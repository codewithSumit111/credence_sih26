import { clsx } from 'clsx';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import type { OptimizedBlock } from '../../types';

interface Props {
  block: OptimizedBlock;
  selected?: boolean;
  onClick?: () => void;
  onView?: () => void;
}

export default function RecommendationCard({ block, selected, onClick, onView }: Props) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'border rounded p-3 cursor-pointer transition-all',
        selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-gray-900">{block.id}</span>
          <span className="text-sm text-gray-500">{block.track}</span>
          <span className="text-sm text-gray-700 font-medium">{block.startTime}–{block.endTime}</span>
          <PriorityBadge priority={block.priority} />
          <StatusBadge status={block.status} />
          {block.bundled && <StatusBadge status="BUNDLED" />}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {block.bundledCount} jobs • {block.departments.length} dept{block.departments.length > 1 ? 's' : ''} • {block.affectedTrains.length} trains affected
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onView?.(); }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            VIEW →
          </button>
        </div>
      </div>
    </div>
  );
}
