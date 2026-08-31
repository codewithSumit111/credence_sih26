import { useMemo, useRef, useState } from 'react';
import type { OptimizedBlock, Train } from '../../types';
import { clsx } from 'clsx';

const START_HOUR = 0;
const END_HOUR = 24;
const ROW_HEIGHT = 44;
const TIME_COL_WIDTH = 90;

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#1e40af',
  'S&T': '#7e22ce',
  Traction: '#166534',
};

const BLOCK_STATUS_COLORS: Record<string, string> = {
  'AI-OPTIMIZED': '#2563eb',
  'APPROVED': '#16a34a',
  'ACTIVE': '#15803d',
  'PROPOSED': '#7c3aed',
  'PROVISIONAL': '#d97706',
  'DEMANDED': '#6b7280',
  'COMPLETED': '#9ca3af',
  'REJECTED': '#dc2626',
  'OVERRUN': '#991b1b',
  'MODIFIED': '#ea580c',
};

const TRAIN_COLOR = '#374151';
const TRAIN_REROUTED_COLOR = '#2563eb';

interface GanttRow {
  id: string;
  label: string;
  type: 'department' | 'train';
  department?: string;
}

interface GanttItem {
  id: string;
  rowId: string;
  label: string;
  startTime: string;
  endTime: string;
  status?: string;
  type: 'block' | 'train-occupation';
  onClick?: () => void;
  color?: string;
}

interface Props {
  blocks: OptimizedBlock[];
  trains: Train[];
  selectedBlockId?: string;
  onBlockClick?: (blockId: string) => void;
  className?: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToPct(minutes: number, totalMinutes: number): number {
  return Math.max(0, Math.min(100, (minutes / totalMinutes) * 100));
}

const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const rows: GanttRow[] = [
  { id: 'Engineering', label: 'Engineering', type: 'department', department: 'Engineering' },
  { id: 'S&T', label: 'S&T', type: 'department', department: 'S&T' },
  { id: 'Traction', label: 'Traction', type: 'department', department: 'Traction' },
  { id: 'train-12123', label: 'Train 12123', type: 'train' },
  { id: 'train-11008', label: 'Train 11008', type: 'train' },
  { id: 'train-22145', label: 'Train 22145', type: 'train' },
];

const HOUR_MARKERS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

export default function GanttChart({ blocks, trains, selectedBlockId, onBlockClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const items: GanttItem[] = useMemo(() => {
    const result: GanttItem[] = [];

    blocks.forEach(block => {
      block.departments.forEach(dept => {
        result.push({
          id: `${block.id}-${dept}`,
          rowId: dept,
          label: block.id,
          startTime: block.startTime,
          endTime: block.endTime,
          status: block.status,
          type: 'block',
          onClick: () => onBlockClick?.(block.id),
          color: BLOCK_STATUS_COLORS[block.status] ?? '#2563eb',
        });
      });
    });

    trains.forEach(train => {
      const rowId = `train-${train.number}`;
      const rowExists = rows.some(r => r.id === rowId);
      if (!rowExists) return;

      train.scheduledOccupation.forEach(occ => {
        result.push({
          id: `${train.number}-${occ.track}`,
          rowId,
          label: `${train.number}`,
          startTime: occ.start,
          endTime: occ.end,
          type: 'train-occupation',
          color: train.reroutingStatus === 'ACCEPTED' || train.reroutingStatus === 'PROPOSED'
            ? TRAIN_REROUTED_COLOR
            : TRAIN_COLOR,
        });
      });
    });

    return result;
  }, [blocks, trains, onBlockClick]);

  const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
  const currentPct = minutesToPct((currentHour - START_HOUR) * 60, TOTAL_MINUTES);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">CORRIDOR × TIME GANTT</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-blue-600" /> AI-Optimized</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-green-700" /> Approved</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-purple-700" /> Proposed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-amber-500" /> Provisional</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm inline-block bg-gray-600" /> Train</span>
        </div>
      </div>
      <div ref={containerRef} className="overflow-x-auto">
        <div style={{ minWidth: 900 }}>
          {/* Time header */}
          <div className="flex border-b border-gray-100" style={{ paddingLeft: TIME_COL_WIDTH }}>
            {HOUR_MARKERS.filter((_, i) => i % 2 === 0).map(hour => (
              <div
                key={hour}
                className="text-center text-[10px] text-gray-400 py-1 border-r border-gray-100"
                style={{ flex: 2 }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, rowIndex) => {
            const rowItems = items.filter(item => item.rowId === row.id);
            const isDeptRow = row.type === 'department';
            return (
              <div
                key={row.id}
                className={clsx(
                  'flex border-b border-gray-100',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                )}
                style={{ height: ROW_HEIGHT }}
              >
                {/* Row label */}
                <div
                  className="flex-shrink-0 flex items-center px-3 border-r border-gray-200"
                  style={{ width: TIME_COL_WIDTH }}
                >
                  <div className="flex items-center gap-1.5">
                    {row.department && (
                      <div
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: DEPT_COLORS[row.department] ?? '#666' }}
                      />
                    )}
                    <span className={clsx(
                      'text-xs font-medium truncate',
                      isDeptRow ? 'text-gray-700' : 'text-gray-500'
                    )}>
                      {row.label}
                    </span>
                  </div>
                </div>

                {/* Timeline area */}
                <div className="flex-1 relative">
                  {/* Hour gridlines */}
                  {HOUR_MARKERS.slice(1).map(hour => (
                    <div
                      key={hour}
                      className={clsx(
                        'absolute top-0 bottom-0 w-px',
                        hour % 6 === 0 ? 'bg-gray-200' : 'bg-gray-100'
                      )}
                      style={{ left: `${minutesToPct((hour - START_HOUR) * 60, TOTAL_MINUTES)}%` }}
                    />
                  ))}

                  {/* Current time indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                    style={{ left: `${currentPct}%` }}
                  >
                    <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full" />
                  </div>

                  {/* Block bars */}
                  {rowItems.map(item => {
                    const startMin = timeToMinutes(item.startTime) - START_HOUR * 60;
                    const endMin = timeToMinutes(item.endTime) - START_HOUR * 60;
                    const leftPct = minutesToPct(startMin, TOTAL_MINUTES);
                    const widthPct = minutesToPct(endMin - startMin, TOTAL_MINUTES);
                    const isSelected = selectedBlockId && item.id.startsWith(selectedBlockId);

                    return (
                      <div
                        key={item.id}
                        onClick={item.onClick}
                        onMouseEnter={(e) => {
                          const rect = containerRef.current?.getBoundingClientRect();
                          if (rect) {
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top,
                              text: `${item.label} • ${item.startTime}–${item.endTime}`,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        className={clsx(
                          'absolute top-2 h-6 rounded flex items-center px-1.5 overflow-hidden transition-all',
                          item.onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                          isSelected ? 'ring-2 ring-white ring-offset-1 z-20' : 'z-10'
                        )}
                        style={{
                          left: `${leftPct}%`,
                          width: `${Math.max(widthPct, 0.5)}%`,
                          backgroundColor: item.color ?? '#374151',
                          opacity: item.type === 'train-occupation' ? 0.55 : 1,
                        }}
                      >
                        {widthPct > 4 && (
                          <span className="text-[9px] text-white font-semibold truncate leading-none">{item.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
