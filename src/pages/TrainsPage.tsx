import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  GitBranch, ArrowRight, Clock, CheckCircle2, MapPin
} from 'lucide-react';
import Drawer from '../components/common/Drawer';
import StatusBadge from '../components/common/StatusBadge';
import FilterBar from '../components/common/FilterBar';
import LoadingState from '../components/common/LoadingState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { trainsApi } from '../api';
import type { Train } from '../types';

// ─── Route options for rerouting ──────────────────────────────────────────────
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
    description: 'Time-Dependent A* computed path. Lowest delay option.',
  },
];

// ─── Train Impact Drawer ──────────────────────────────────────────────────────
function TrainImpactDrawer({
  train,
  onAcceptReroute,
  onKeepWaiting,
  loading,
}: {
  train: Train;
  onAcceptReroute: () => void;
  onKeepWaiting: () => void;
  loading: boolean;
}) {
  const isAffected = train.affectedBlockId != null;

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
            {train.originalRoute.map((seg, i) => (
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
            Options — Time-Dependent A*
          </h4>
          <div className="space-y-2">
            {routeOptions.map(option => (
              <div
                key={option.label}
                className={clsx(
                  'border rounded-lg p-3',
                  option.recommended ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('text-[11px] font-bold uppercase', option.recommended ? 'text-emerald-800' : 'text-gray-600')}>
                    {option.label}
                  </span>
                  {option.recommended && (
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">RECOMMENDED</span>
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
                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                {r}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-mono bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
              Engine: Time-Dependent A*
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
            className="flex-1 text-[12px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg transition-colors disabled:opacity-50"
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

// ─── Trains Page ──────────────────────────────────────────────────────────────
export default function Trains() {
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'ALL');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  useEffect(() => {
    trainsApi.getTrains().then(data => {
      setTrains(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load train data');
      setLoading(false);
    });
  }, []);

  const filteredTrains = trains.filter(t => {
    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'AFFECTED' && t.affectedBlockId)
      || (statusFilter === 'DELAYED' && t.currentStatus === 'DELAYED')
      || (statusFilter === 'ON_TIME' && t.currentStatus === 'ON_TIME')
      || (statusFilter === 'REROUTED' && t.currentStatus === 'REROUTED')
      || t.currentStatus === statusFilter;
    if (!matchesStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.number.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.currentSection.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAcceptReroute = async () => {
    if (!selectedTrain) return;
    setActionLoading(true);
    try {
      const updated = await trainsApi.acceptReroute(selectedTrain.number);
      setTrains(prev => prev.map(t => t.number === updated.number ? updated : t));
      setSelectedTrain(updated);
      toast.success(`Rerouting approved for Train ${selectedTrain.number}`, {
        description: `New route via TR-04 committed to control system.`,
      });
      setShowApproveDialog(false);
    } catch {
      toast.error('Failed to approve reroute');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKeepWaiting = () => {
    toast.info(`Train ${selectedTrain?.number} — waiting strategy confirmed`, {
      description: 'Train will hold at signal before blocked section.',
    });
    setSelectedTrain(null);
  };

  const affectedCount = trains.filter(t => t.affectedBlockId).length;
  const delayedCount = trains.filter(t => t.currentStatus === 'DELAYED').length;
  const reroutedCount = trains.filter(t => t.currentStatus === 'REROUTED').length;

  if (loading) return <LoadingState message="Loading train operations data..." />;

  return (
    <div className="h-full overflow-auto bg-[#F4F5F7]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Trains</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">Operations, impact analysis, and rerouting decisions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Time-Dependent A* Active
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Active', value: trains.length.toString(), sub: 'On corridor', color: 'text-gray-800', bg: 'bg-white border-gray-200' },
            { label: 'Affected', value: affectedCount.toString(), sub: 'By active blocks', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
            { label: 'Delayed', value: delayedCount.toString(), sub: 'Requires attention', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
            { label: 'Rerouted', value: reroutedCount.toString(), sub: 'Alternate routes active', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          ].map(kpi => (
            <div key={kpi.label} className={clsx('border rounded-lg p-3.5', kpi.bg)}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className={clsx('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-3">
          <FilterBar
            onSearch={q => setSearchQuery(q)}
            searchPlaceholder="Search train number or name..."
          >
            <div className="flex items-center gap-1.5">
              {[
                { value: 'ALL', label: 'All' },
                { value: 'AFFECTED', label: 'Affected' },
                { value: 'DELAYED', label: 'Delayed' },
                { value: 'ON_TIME', label: 'On Time' },
                { value: 'REROUTED', label: 'Rerouted' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={clsx(
                    'px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors',
                    statusFilter === f.value
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </FilterBar>
          <span className="text-[11px] text-gray-400 ml-auto">
            {filteredTrains.length} trains
          </span>
        </div>

        {/* Train table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 text-left">
                <th className="py-2.5 px-4 font-semibold">TRAIN</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold">SECTION</th>
                <th className="py-2.5 px-4 font-semibold">IMPACT</th>
                <th className="py-2.5 px-4 font-semibold">DELAY</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTrains.map(train => {
                const isSelected = selectedTrain?.number === train.number;
                const isAffected = !!train.affectedBlockId;
                return (
                  <tr
                    key={train.number}
                    onClick={() => setSelectedTrain(train)}
                    className={clsx(
                      'cursor-pointer transition-colors',
                      isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900">{train.number}</span>
                      <span className="block text-[10px] text-gray-500">{train.name}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={train.currentStatus} /></td>
                    <td className="py-3 px-4 font-medium text-gray-700">{train.currentSection}</td>
                    <td className="py-3 px-4">
                      {isAffected ? (
                        <span className="font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px]">
                          {train.affectedBlockId}
                        </span>
                      ) : (
                        <span className="text-green-700 font-medium">Clear</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={clsx(
                        'font-mono font-bold',
                        train.delay > 0 ? 'text-amber-700' : 'text-green-700'
                      )}>
                        {train.delay > 0 ? `+${train.delay} min` : 'On Time'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isAffected ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTrain(train); }}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 ml-auto"
                        >
                          <GitBranch className="w-3 h-3" /> Reroute
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTrain(train); }}
                          className="text-[11px] font-semibold text-gray-500 hover:text-gray-700"
                        >
                          Detail →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredTrains.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No trains match the selected filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train Impact + Rerouting Drawer */}
      <Drawer
        open={selectedTrain !== null}
        onClose={() => setSelectedTrain(null)}
        title={selectedTrain ? `Train ${selectedTrain.number}` : ''}
        subtitle={selectedTrain?.name || ''}
        width="md"
      >
        {selectedTrain && (
          <TrainImpactDrawer
            train={selectedTrain}
            onAcceptReroute={() => setShowApproveDialog(true)}
            onKeepWaiting={handleKeepWaiting}
            loading={actionLoading}
          />
        )}
      </Drawer>

      {/* Approval dialog */}
      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleAcceptReroute}
        title={`Accept Reroute for Train ${selectedTrain?.number}?`}
        description={`Train ${selectedTrain?.number} (${selectedTrain?.name}) will be redirected via TR-04 Akola bypass. This adds approximately 12 minutes to the journey. Controllers will be notified. Human approval is required.`}
        confirmLabel="Accept Reroute"
        loading={actionLoading}
      />
    </div>
  );
}
