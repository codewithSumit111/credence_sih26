import { useState, useRef } from 'react';
import type { OptimizedBlock, Train } from '../../types';
import { clsx } from 'clsx';
import { 
  ChevronDown, Filter, Maximize2, Plus, 
  Layers, Train as TrainIcon, Focus, Calendar
} from 'lucide-react';

interface Props {
  blocks?: OptimizedBlock[];
  trains?: Train[];
  selectedBlockId?: string;
  onBlockClick?: (blockId: string) => void;
  className?: string;
  initialFocus?: boolean;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export default function GanttChart({
  blocks = [],
  selectedBlockId,
  onBlockClick,
  className,
  initialFocus = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(initialFocus);
  const [viewMode, setViewMode] = useState<'departments' | 'departments_trains'>('departments');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Focus Window: ±3h around 14:30 (11:00 to 18:00)
  // Full Day Window: 06:00 to 24:00 (as shown in the reference screenshot)
  const startHour = isFocused ? 11 : 6;
  const endHour = isFocused ? 18 : 24;
  const totalMinutes = (endHour - startHour) * 60;

  const hourMarkers: number[] = [];
  const step = isFocused ? 1 : 2;
  for (let h = startHour; h <= endHour; h += step) {
    hourMarkers.push(h);
  }

  const getPct = (timeStr: string) => {
    const mins = timeToMinutes(timeStr);
    const offset = mins - startHour * 60;
    return Math.max(0, Math.min(100, (offset / totalMinutes) * 100));
  };

  const getWidthPct = (startStr: string, endStr: string) => {
    const startMins = timeToMinutes(startStr);
    const endMins = timeToMinutes(endStr);
    const duration = endMins - startMins;
    return Math.max(0, (duration / totalMinutes) * 100);
  };

  // Helper to check if a block falls within current time window
  const isVisibleInWindow = (startStr: string, endStr: string) => {
    const s = timeToMinutes(startStr);
    const e = timeToMinutes(endStr);
    const winStart = startHour * 60;
    const winEnd = endHour * 60;
    return e > winStart && s < winEnd;
  };

  return (
    <div className={clsx('bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden', className)}>
      {/* ── Gantt Header Toolbar ────────────────────────────────────────── */}
      <div className="p-3 sm:px-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2.5 bg-white">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-[13px] font-bold text-[#0F2240] tracking-wider uppercase">
            TODAY'S OPTIMIZED BLOCK PLAN
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Focus Window Toggle Button */}
          <button
            onClick={() => setIsFocused(!isFocused)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border shadow-sm',
              isFocused
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            )}
            title={isFocused ? 'Switch to Full Day View' : 'Zoom to ±3h around peak possession window'}
          >
            <Focus className="w-3.5 h-3.5" />
            <span>{isFocused ? 'Full Day View (24h)' : 'Focus Window (±3h)'}</span>
          </button>

          {/* Department View selector */}
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="appearance-none bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-xs px-2.5 py-1.5 pr-7 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="departments">Departments View</option>
              <option value="departments_trains">Departments + Key Trains</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Date Picker Pill */}
          <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Today • 27 Aug 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Filters Button */}
          <button className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filters</span>
          </button>

          {/* Fullscreen Button */}
          <button 
            onClick={() => setIsFocused(!isFocused)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
            title="Toggle zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Timeline Scroll Container ───────────────────────────────────── */}
      <div ref={containerRef} className="overflow-x-auto relative">
        <div className="min-w-[920px] relative pb-8 select-none">
          {/* ── Time Header ─────────────────────────────────────────────── */}
          <div className="flex border-b border-gray-200 bg-gray-50/70 text-[11px] font-mono font-medium text-gray-500">
            <div className="w-[180px] flex-shrink-0 px-4 py-2 border-r border-gray-200 font-sans font-semibold text-[10px] uppercase tracking-wider text-gray-400">
              Department / Resource
            </div>
            <div className="flex-1 relative flex">
              {hourMarkers.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center py-2 border-r border-gray-200 text-gray-500"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* ── Visual Vertical Gridlines Container ─────────────────────── */}
          <div className="absolute left-[180px] right-0 top-[33px] bottom-8 pointer-events-none z-0">
            {hourMarkers.map((hour, idx) => {
              const pct = (idx / (hourMarkers.length - 1)) * 100;
              return (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 w-px bg-gray-100"
                  style={{ left: `${pct}%` }}
                />
              );
            })}

            {/* Current simulated time indicator: 14:37 */}
            {14.6 >= startHour && 14.6 <= endHour && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                style={{
                  left: `${((14.6 - startHour) / (endHour - startHour)) * 100}%`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-[3px] -mt-1 shadow" />
                <span className="absolute bottom-1 -left-5 bg-red-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow z-40">
                  14:37
                </span>
              </div>
            )}

            {/* ── Integrated TR-02 Highlight Container Overlay ───────────── */}
            {isVisibleInWindow('14:00', '15:30') && (
              <div
                className="absolute top-0 bottom-0 bg-blue-50/40 border-x border-dashed border-blue-300 z-10 pointer-events-none"
                style={{
                  left: `${getPct('14:00')}%`,
                  width: `${getWidthPct('14:00', '15:30')}%`,
                }}
              >
                {/* Header Tag for the integrated window */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded shadow pointer-events-auto flex items-center gap-1 z-20 whitespace-nowrap">
                  <span>TR-02</span>
                  <span className="text-blue-200">14:00 - 15:30</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Row 1: Engineering ──────────────────────────────────────── */}
          <div className="flex border-b border-gray-100 hover:bg-slate-50/40 transition-colors relative z-10" style={{ height: 48 }}>
            <div className="w-[180px] flex-shrink-0 flex items-center gap-2 px-4 border-r border-gray-200 bg-white">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-800">Engineering</span>
            </div>
            <div className="flex-1 relative">
              {/* Block BR-00235 (09:30 - 11:30) */}
              {isVisibleInWindow('09:30', '11:30') && (
                <div
                  onClick={() => onBlockClick?.('BR-00235')}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'BR-00235 • 09:30–11:30 • Engineering' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2.5 h-7 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-[1.01]"
                  style={{
                    left: `${getPct('09:30')}%`,
                    width: `${getWidthPct('09:30', '11:30')}%`,
                  }}
                >
                  <span className="px-2 truncate">BR-00235</span>
                </div>
              )}

              {/* TR-02 Component: ENG-1042 (14:00 - 15:30) */}
              {isVisibleInWindow('14:00', '15:30') && (
                <div
                  onClick={() => onBlockClick?.('BR-00231')}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'TR-02 (ENG-1042) • 14:00–15:30 • Engineering Component' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2 h-8 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow ring-2 ring-white ring-offset-1 z-20"
                  style={{
                    left: `${getPct('14:00')}%`,
                    width: `${getWidthPct('14:00', '15:30')}%`,
                  }}
                >
                  <span className="px-2 truncate">ENG-1042</span>
                </div>
              )}

              {/* Block BR-00244 (20:15 - 22:30) */}
              {isVisibleInWindow('20:15', '22:30') && (
                <div
                  onClick={() => onBlockClick?.('BR-00244')}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'BR-00244 • 20:15–22:30 • Engineering' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2.5 h-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-[1.01]"
                  style={{
                    left: `${getPct('20:15')}%`,
                    width: `${getWidthPct('20:15', '22:30')}%`,
                  }}
                >
                  <span className="px-2 truncate">BR-00244</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Row 2: S&T ──────────────────────────────────────────────── */}
          <div className="flex border-b border-gray-100 hover:bg-slate-50/40 transition-colors relative z-10" style={{ height: 48 }}>
            <div className="w-[180px] flex-shrink-0 flex items-center gap-2 px-4 border-r border-gray-200 bg-white">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-800">S&T</span>
            </div>
            <div className="flex-1 relative">
              {/* Morning S&T Block (09:45 - 11:45) */}
              {isVisibleInWindow('09:45', '11:45') && (
                <div
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'SIG-0945 • 09:45–11:45 • Signal Inspection' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2.5 h-7 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-sm"
                  style={{
                    left: `${getPct('09:45')}%`,
                    width: `${getWidthPct('09:45', '11:45')}%`,
                  }}
                >
                  <span className="px-2 truncate">SNT-0945</span>
                </div>
              )}

              {/* TR-02 Component: SNT-2081 (14:00 - 15:30) */}
              {isVisibleInWindow('14:00', '15:30') && (
                <div
                  onClick={() => onBlockClick?.('BR-00231')}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'TR-02 (SNT-2081) • 14:00–15:30 • S&T Component' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2 h-8 rounded bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow ring-2 ring-white ring-offset-1 z-20"
                  style={{
                    left: `${getPct('14:00')}%`,
                    width: `${getWidthPct('14:00', '15:30')}%`,
                  }}
                >
                  <span className="px-2 truncate">SNT-2081</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Row 3: Traction (TRD) ──────────────────────────────────── */}
          <div className="flex border-b border-gray-100 hover:bg-slate-50/40 transition-colors relative z-10" style={{ height: 48 }}>
            <div className="w-[180px] flex-shrink-0 flex items-center gap-2 px-4 border-r border-gray-200 bg-white">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-800">Traction (TRD)</span>
            </div>
            <div className="flex-1 relative">
              {/* Early Morning TRD Block: BR-00241 (07:15 - 09:15) */}
              {isVisibleInWindow('07:15', '09:15') && (
                <div
                  onClick={() => onBlockClick?.('BR-00241')}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'BR-00241 • 07:15–09:15 • Traction (TRD)' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2.5 h-7 rounded bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-sm"
                  style={{
                    left: `${getPct('07:15')}%`,
                    width: `${getWidthPct('07:15', '09:15')}%`,
                  }}
                >
                  <span className="px-2 truncate">BR-00241</span>
                </div>
              )}

              {/* TR-02 Component: TRD-3094 (14:00 - 15:30) */}
              {isVisibleInWindow('14:00', '15:30') && (
                <div
                  onClick={() => onBlockClick?.('BR-00231')}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: 'TR-02 (TRD-3094) • 14:00–15:30 • Traction Component' });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="absolute top-2 h-8 rounded bg-rose-300 hover:bg-rose-400 text-rose-900 text-[10px] font-bold flex items-center justify-center cursor-pointer shadow ring-2 ring-white ring-offset-1 z-20"
                  style={{
                    left: `${getPct('14:00')}%`,
                    width: `${getWidthPct('14:00', '15:30')}%`,
                  }}
                >
                  <span className="px-2 truncate">TRD-3094</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Row 4: Train Impact (4 affected) ───────────────────────── */}
          <div className="flex border-b border-gray-100 bg-slate-50/30 relative z-10" style={{ height: 48 }}>
            <div className="w-[180px] flex-shrink-0 flex items-center gap-2 px-4 border-r border-gray-200 bg-white">
              <TrainIcon className="w-3.5 h-3.5 text-[#0F2240]" />
              <span className="text-xs font-semibold text-gray-800">Train Impact (4 affected)</span>
            </div>
            <div className="flex-1 relative">
              {/* Trains affected badge pointing directly at 14:00–15:30 */}
              {isVisibleInWindow('14:00', '15:30') && (
                <div
                  className="absolute top-2 flex flex-col items-center z-30"
                  style={{
                    left: `${getPct('14:00') + getWidthPct('14:00', '15:30') / 2}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-red-600 mb-0.5" />
                  <div className="bg-red-100 border border-red-300 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                    <span>4 trains affected</span>
                    <span>•</span>
                    <span>+6 min</span>
                  </div>
                </div>
              )}

              {/* Train slot occupation bars */}
              {isVisibleInWindow('12:15', '13:45') && (
                <div
                  className="absolute top-3 h-5 rounded bg-gray-300 opacity-60 text-gray-700 text-[9px] font-mono px-2 flex items-center"
                  style={{
                    left: `${getPct('12:15')}%`,
                    width: `${getWidthPct('12:15', '13:45')}%`,
                  }}
                >
                  12123 (Deccan)
                </div>
              )}

              {isVisibleInWindow('16:00', '17:30') && (
                <div
                  className="absolute top-3 h-5 rounded bg-gray-300 opacity-60 text-gray-700 text-[9px] font-mono px-2 flex items-center"
                  style={{
                    left: `${getPct('16:00')}%`,
                    width: `${getWidthPct('16:00', '17:30')}%`,
                  }}
                >
                  11008 (Sinhagad)
                </div>
              )}
            </div>
          </div>

          {/* Optional Zoom / Action FAB */}
          <div className="absolute right-3 bottom-2 z-20">
            <button
              onClick={() => setIsFocused(!isFocused)}
              className="w-7 h-7 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-600 shadow-sm transition-all hover:shadow"
              title={isFocused ? 'Zoom out to 24h' : 'Zoom in (Focus Window)'}
            >
              <Plus className={clsx('w-4 h-4 transition-transform', isFocused && 'rotate-45')} />
            </button>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#0F2240] text-white text-xs px-2.5 py-1.5 rounded-md shadow-xl pointer-events-none border border-blue-900/40"
          style={{ left: tooltip.x + 16, top: tooltip.y - 30 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
