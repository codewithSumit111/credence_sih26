import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import {
  Search, SlidersHorizontal, Train as TrainIcon, GitBranch, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, RefreshCw, Filter, X, MapPin
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import TrainDetailDrawer from '../components/trains/TrainDetailDrawer';
import { trainsApi } from '../api';
import type { EnrichedTrain, TrainOperationalStatus } from '../types';

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmtDate(d: string): string {
  try { return format(parseISO(d), 'd MMM yyyy'); } catch { return d; }
}
function delayLabel(min: number): string {
  if (min === 0) return 'On Time';
  if (min < 60) return `+${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `+${h}h ${m}m` : `+${h}h`;
}

// ─── Route options for rerouting (From Remote) ───────────────────────────────
const routeOptions = [
  {
    label: 'WAIT',
    segments: 'Hold at ST-B until TR-02 possession completes',
    delay: 45,
    recommended: false,
    description: 'Train waits at signal. No additional distance.',
  },
  {
    label: 'REROUTE (Recommended)',
    segments: 'ST-A → TR-01 → TR-04 (Akola bypass) → ST-C',
    delay: 12,
    extraKm: 12,
    recommended: true,
    description: 'Routing Engine computed path. Lowest delay option.',
  },
];
// ─── Status colour dot ────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, string> = {
  NORMAL: 'bg-green-500',
  DELAYED: 'bg-amber-500',
  DISRUPTED_NOT_REROUTED: 'bg-gray-400',
  REROUTE_SUGGESTED: 'bg-blue-500 animate-pulse',
  PENDING_APPROVAL: 'bg-amber-500 animate-pulse',
  REROUTE_APPROVED: 'bg-green-600',
  REROUTED: 'bg-indigo-500',
  CANCELLED: 'bg-red-600',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className={clsx('rounded-lg border p-4', accent)}>
      <p className="irctc-label mb-2">{label}</p>
      <p className="text-[26px] font-bold leading-none">{value}</p>
      <p className="text-[11px] text-gray-500 mt-1.5">{sub}</p>
    </div>
  );
}

// ─── Legacy Train Detail (From Remote) ─────────────────────────────────────────
function LegacyTrainDetail({ train, isAffected, onKeepWaiting, onAcceptReroute, loading }: any) {
  return (
    <div className="space-y-4 text-[12px]">
      {/* Train header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-[16px] text-gray-900">{train.number}</span>
            <StatusBadge status={train.currentStatus} size="md" />
          </div>
          <p className="text-gray-600 font-medium">{train.name}</p>
          <p className="text-gray-500 text-[11px]">{train.type} · {train.currentSection}</p>
        </div>
        {train.delay > 0 && (
          <div className="text-right">
            <span className="text-[22px] font-bold text-amber-700">+{train.delay}</span>
            <span className="text-gray-500 ml-1 text-[12px]">min delay</span>
          </div>
        )}
      </div>

      {/* Cause */}
      {isAffected && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1">Cause</p>
          <p className="text-red-800 font-medium">Track block / maintenance possession on TR-02</p>
          <p className="text-red-600 text-[10px] mt-0.5">Block: {train.affectedBlockId}</p>
        </div>
      )}

      {/* Route display */}
      {isAffected && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Original Route</h4>
          <div className="flex items-center gap-1.5 flex-wrap">
            {train.originalRoute?.map((seg: any, i: number) => (
              <span key={i} className="flex items-center gap-1">
                <span className="font-mono text-[11px] font-medium text-gray-700">{seg.from}</span>
                <ArrowRight className="w-3 h-3 text-gray-300" />
                <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1 rounded">[{seg.track}]</span>
                {i === train.originalRoute.length - 1 && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span className="font-mono text-[11px] font-medium text-gray-700">{seg.to}</span>
                  </>
                )}
              </span>
            ))}
          </div>
          {train.affectedBlockId && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              TR-02 section blocked
            </div>
          )}
        </div>
      )}

      {/* Route Options */}
      {isAffected && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Options — Routing Engine
          </h4>
          <div className="space-y-2">
            {routeOptions.map(option => (
              <div
                key={option.label}
                className={clsx(
                  'border rounded-lg p-3',
                  option.recommended ? 'border-emerald-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('text-[11px] font-bold uppercase', option.recommended ? 'text-blue-800' : 'text-gray-600')}>
                    {option.label}
                  </span>
                  {option.recommended && (
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">RECOMMENDED</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 mb-1.5">{option.segments}</p>
                <div className="flex items-center gap-3">
                  <span className={clsx(
                    'flex items-center gap-1 font-bold text-[12px]',
                    option.delay > 30 ? 'text-red-600' : option.delay > 15 ? 'text-amber-600' : 'text-green-600'
                  )}>
                    <Clock className="w-3 h-3" />
                    +{option.delay} min
                  </span>
                  {option.extraKm && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      +{option.extraKm} km
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why reroute */}
      {isAffected && (
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Why Reroute?</h4>
          <div className="space-y-1.5">
            {[
              'Blocked section excluded from path',
              'Current network state considered',
              'Minimizes total delay vs waiting',
              'No conflicting train on alternate path',
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                {r}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-mono bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
              Engine: Routing Engine
            </span>
          </div>
        </div>
      )}

      {/* Non-affected train message */}
      {!isAffected && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <p className="text-[12px] font-semibold text-green-800">No action required</p>
          <p className="text-[11px] text-green-600 mt-0.5">This train has no conflict with active blocks</p>
        </div>
      )}

      {/* Actions */}
      {isAffected && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={onKeepWaiting}
            className="flex-1 text-[12px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg transition-colors"
          >
            Keep Waiting
          </button>
          <button
            onClick={onAcceptReroute}
            disabled={loading}
            className="flex-1 text-[12px] font-bold bg-[#E85D04] hover:bg-[#D05303] text-white py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : '✓ Accept Reroute'}
          </button>
        </div>
      )}

      {isAffected && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 text-center">
          Human approval required. This action will be logged to the control system.
        </p>
      )}

      {/* Schedule info */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-[10px] text-gray-400">Scheduled Arr.</p>
          <p className="font-mono font-semibold text-gray-700">{train.scheduledArrival}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <p className="text-[10px] text-gray-400">Scheduled Dep.</p>
          <p className="font-mono font-semibold text-gray-700">{train.scheduledDeparture}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Train Row ────────────────────────────────────────────────────────────────
function TrainRow({ train, onClick, isSelected }: { train: EnrichedTrain; onClick: () => void; isSelected: boolean }) {
  const dot = STATUS_DOT[train.status] || 'bg-gray-400';
  const needsAttention = train.status === 'REROUTE_SUGGESTED' || train.status === 'PENDING_APPROVAL';
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'cursor-pointer transition-colors border-b border-gray-50',
        isSelected ? 'bg-blue-50' : needsAttention ? 'hover:bg-amber-50/50' : 'hover:bg-gray-50'
      )}
    >
      {/* TRAIN */}
      <td className="py-3.5 px-4">
        <div className="flex items-start gap-3">
          <div className={clsx('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', dot)} />
          <div>
            <p className="text-[13px] font-bold text-gray-900">{train.trainName}</p>
            <p className="font-mono text-[11px] font-semibold text-gray-500">{train.trainNumber}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              <span className="font-mono">{train.sourceStationCode}</span>
              <ArrowRight className="w-2.5 h-2.5 inline mx-1" />
              <span className="font-mono">{train.destinationStationCode}</span>
            </p>
          </div>
        </div>
      </td>
      {/* STATUS */}
      <td className="py-3.5 px-4">
        <StatusBadge status={train.status} />
      </td>
      {/* SECTION */}
      <td className="py-3.5 px-4">
        <p className="text-[12px] text-gray-700">{train.sourceStationCode} → {train.destinationStationCode}</p>
        <p className="text-[10px] text-gray-400">{train.sourceStation} to {train.destinationStation}</p>
      </td>
      {/* DELAY */}
      <td className="py-3.5 px-4">
        {train.delayMinutes > 0 ? (
          <span className={clsx('font-mono font-bold text-[12px]', train.delayMinutes > 60 ? 'text-red-700' : 'text-amber-700')}>
            {delayLabel(train.delayMinutes)}
          </span>
        ) : (
          <span className="text-[11px] text-green-700 font-semibold">0 min</span>
        )}
      </td>
      {/* IMPACT */}
      <td className="py-3.5 px-4">
        {train.delayMinutes > 60 ? (
          <span className="text-xs font-bold text-red-600">High</span>
        ) : train.delayMinutes > 0 ? (
          <span className="text-xs font-bold text-amber-600">Medium</span>
        ) : (
          <span className="text-xs font-bold text-gray-500">Clear</span>
        )}
        {train.affectedSection && (
          <p className="text-[10px] text-red-600 mt-0.5 font-mono">{train.affectedSection}</p>
        )}
      </td>
      {/* AI ACTION (Replaces original action button/text) */}
      <td className="py-3.5 px-4 text-right">
        {needsAttention ? (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-irctc-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-colors"
          >
            <GitBranch className="w-3 h-3" />
            Reroute Recommended
          </button>
        ) : train.status === 'REROUTE_APPROVED' || train.status === 'REROUTED' ? (
          <span className="text-[11px] font-semibold text-green-700">Reroute Active</span>
        ) : train.delayMinutes > 0 ? (
          <span className="text-[11px] font-semibold text-amber-700">Monitoring</span>
        ) : (
          <span className="text-[11px] font-semibold text-gray-500">No action</span>
        )}
      </td>
    </tr>
  );
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────
const FILTERS: { value: string; label: string; dot?: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'NORMAL', label: 'Normal', dot: 'bg-green-500' },
  { value: 'DELAYED', label: 'Delayed', dot: 'bg-amber-500' },
  { value: 'REROUTE_SUGGESTED', label: 'Reroute Suggested', dot: 'bg-blue-500' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', dot: 'bg-amber-500' },
  { value: 'REROUTE_APPROVED', label: 'Approved', dot: 'bg-green-600' },
  { value: 'REROUTED', label: 'Rerouted', dot: 'bg-indigo-500' },
  { value: 'DISRUPTED_NOT_REROUTED', label: 'Disrupted', dot: 'bg-gray-400' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrainsPage() {
  const [trains, setTrains] = useState<EnrichedTrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedTrain, setSelectedTrain] = useState<EnrichedTrain | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrains = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await trainsApi.getTrains();
      setTrains(data);
    } catch {
      toast.error('Failed to load train data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadTrains(); }, []);

  const trainTypes = useMemo(() => {
    const types = Array.from(new Set(trains.map(t => t.trainType)));
    return types;
  }, [trains]);

  const filteredTrains = useMemo(() => {
    return trains.filter(t => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && t.trainType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.trainNumber.toLowerCase().includes(q) ||
          t.trainName.toLowerCase().includes(q) ||
          t.sourceStation.toLowerCase().includes(q) ||
          t.sourceStationCode.toLowerCase().includes(q) ||
          t.destinationStation.toLowerCase().includes(q) ||
          t.destinationStationCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trains, statusFilter, typeFilter, searchQuery]);

  // KPIs
  const kpis = useMemo(() => ({
    total: trains.length,
    attention: trains.filter(t => t.status === 'REROUTE_SUGGESTED' || t.status === 'PENDING_APPROVAL').length,
    delayed: trains.filter(t => t.delayMinutes > 0).length,
    rerouted: trains.filter(t => t.status === 'REROUTED' || t.status === 'REROUTE_APPROVED').length,
  }), [trains]);

  const handleTrainUpdated = (updated: EnrichedTrain) => {
    setTrains(prev => prev.map(t => t.trainNumber === updated.trainNumber ? updated : t));
    setSelectedTrain(updated);
  };

  if (loading) return <LoadingState message="Loading Train Operations & Rerouting Intelligence..." />;

  return (
    <div className="irctc-page">
      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-irctc-border px-7 py-5">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="irctc-page-title">Train Operations & Rerouting Management</h1>
            <p className="text-[14px] text-irctc-muted mt-0.5">
              24 September 2026 · Central Railway Pune Corridor · [DEMO — Disruptions are simulated]
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-irctc-blue bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-irctc-blue animate-pulse" />
              Routing Engine Active
            </div>
            <button
              onClick={() => loadTrains(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', refreshing && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-7 py-6 space-y-5">

        {/* ── KPI CARDS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total Active" value={kpis.total.toString()} sub="On corridor" accent="bg-white border-gray-200" />
          <KpiCard label="Needs Attention" value={kpis.attention.toString()} sub="Awaiting decision" accent={kpis.attention > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-gray-200'} />
          <KpiCard label="Delayed" value={kpis.delayed.toString()} sub="Running late" accent={kpis.delayed > 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200'} />
          <KpiCard label="Rerouted" value={kpis.rerouted.toString()} sub="Alternate routes active" accent="bg-indigo-50 border-indigo-200 text-indigo-800" />
        </div>

        {/* ── FILTER + SEARCH ───────────────────────────────────── */}
        <div className="irctc-card p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by train number, name, station..."
                className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="text-[12px] font-semibold border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-700 outline-none"
              >
                <option value="ALL">All Types</option>
                {trainTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <span className="text-[11px] text-gray-400 ml-auto">{filteredTrains.length} trains</span>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors',
                  statusFilter === f.value
                    ? 'bg-irctc-blue text-white border-irctc-blue'
                    : 'bg-white text-irctc-muted border-irctc-border hover:border-irctc-blue hover:text-irctc-blue'
                )}
              >
                {f.dot && statusFilter !== f.value && (
                  <span className={clsx('w-1.5 h-1.5 rounded-full', f.dot)} />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TRAIN TABLE ───────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 text-left text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Train</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Delay</th>
                <th className="py-3 px-4">Impact</th>
                <th className="py-3 px-4 text-right">AI Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrains.map(train => (
                <TrainRow
                  key={train.trainNumber}
                  train={train}
                  isSelected={selectedTrain?.trainNumber === train.trainNumber}
                  onClick={() => setSelectedTrain(train)}
                />
              ))}
              {filteredTrains.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <TrainIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No trains match the selected filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── LEGEND ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 px-1">
          <span className="font-semibold text-gray-400">Status:</span>
          {[
            { dot: 'bg-green-500', label: 'Normal' },
            { dot: 'bg-amber-500 animate-pulse', label: 'Pending Approval' },
            { dot: 'bg-blue-500 animate-pulse', label: 'Reroute Suggested' },
            { dot: 'bg-indigo-500', label: 'Rerouted' },
            { dot: 'bg-gray-400', label: 'Not Rerouted' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={clsx('w-2 h-2 rounded-full', item.dot)} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRAIN DETAIL DRAWER ────────────────────────────────── */}
      {selectedTrain && (
        <TrainDetailDrawer
          train={selectedTrain}
          onClose={() => setSelectedTrain(null)}
          onTrainUpdated={handleTrainUpdated}
        />
      )}
    </div>
  );
}
