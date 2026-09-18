import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { overviewApi, approvalsApi } from '../api';
import type { MaintenanceJob, OptimizedBlock, Train } from '../types';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import {
  AlertTriangle, AlertOctagon, Clock, CheckCircle2,
  ChevronRight, Radio, TrendingUp, Shield, Layers
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  assetAvailability: number;
  criticalJobCount: number;
  pendingMaintenance: number;
  blocksOptimized: number;
  expectedTrainDelay: number;
  integratedBlockCount: number;
  priorityQueue: MaintenanceJob[];
  recommendedBlock: OptimizedBlock;
  allBlocks: OptimizedBlock[];
  allTrains: Train[];
}

import DynamicNetworkMap from '../components/network/DynamicNetworkMap';

// ─── Corridor command visualization ──────────────────────────────────────────
function CorridorCommandView({ onViewBlock, onViewImpact }: { onViewBlock: () => void; onViewImpact: () => void }) {
  const trainPositions = [
    { trainNumber: '12123', trackId: 'TR-01', position: 0.8, status: 'DELAYED' as const },
    { trainNumber: '11008', trackId: 'TR-02', position: 0.1, status: 'DELAYED' as const },
    { trainNumber: '22145', trackId: 'TR-05', position: 0.5, status: 'ON_TIME' as const },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Corridor Command View</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">NGP–BSL Corridor · Live Operational Network</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          MONITORING ACTIVE
        </div>
      </div>

      <div className="mb-5">
        <DynamicNetworkMap 
          blockedTracks={['TR-02']}
          trainPositions={trainPositions}
          onTrainClick={onViewImpact}
          onBlockClick={onViewBlock}
        />
      </div>

      {/* Active block legend */}
      <div className="flex items-start gap-4 p-3 bg-red-50 border border-red-100 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-3 bg-red-200 rounded-sm" />
            <span className="font-mono text-[11px] font-bold text-red-800">BR-00231</span>
            <span className="text-[10px] text-gray-500 font-mono">14:00 – 15:30</span>
            <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded border border-red-200">
              AWAITING APPROVAL
            </span>
          </div>
          <p className="text-[11px] text-gray-600">
            Engineering + S&T · TR-02 · <strong>2 trains affected</strong> · projected +6 min delay
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onViewImpact}
            className="text-[11px] font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 bg-white px-2.5 py-1 rounded transition-colors"
          >
            View Impact
          </button>
          <button
            onClick={onViewBlock}
            className="text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded transition-colors"
          >
            Review Block →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Command Page ─────────────────────────────────────────────────────────────
export default function Command() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    overviewApi.getDashboardData().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load command data');
      setLoading(false);
    });
  }, []);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approvalsApi.approve('APV-001');
      toast.success('✓ Block BR-00231 Approved', {
        description: 'Schedule committed. Rerouting orders issued for 2 affected trains.',
      });
      setShowApproveDialog(false);
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  const timeFormatted = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  const dateFormatted = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  const kpis = [
    {
      label: 'Asset Availability',
      value: loading ? '—' : `${data?.assetAvailability ?? 94}%`,
      icon: TrendingUp,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      sub: 'Prototype simulation',
    },
    {
      label: 'Active Blocks',
      value: loading ? '—' : `${data?.blocksOptimized ?? 3}`,
      icon: Layers,
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      sub: '1 awaiting approval',
    },
    {
      label: 'Trains Affected',
      value: loading ? '—' : '2',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      sub: 'By active block BR-00231',
    },
    {
      label: 'Pending Approvals',
      value: '1',
      icon: Shield,
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      sub: 'BR-00231 requires action',
    },
  ];

  const attentionItems = [
    {
      level: 'red' as const,
      title: 'JOB-1042 — Rail Grinding overdue',
      detail: 'TR-02 · Engineering · 14 days overdue · Priority 92',
      action: () => navigate('/plan?view=maintenance'),
      actionLabel: 'Review',
    },
    {
      level: 'amber' as const,
      title: 'BR-00231 awaiting approval',
      detail: 'TR-02 · 14:00–15:30 · 3 jobs bundled · CP-SAT optimized',
      action: () => navigate('/plan?view=blocks'),
      actionLabel: 'Review Block',
    },
    {
      level: 'amber' as const,
      title: '2 trains pending rerouting decision',
      detail: '12123 · 11008 · Affected by TR-02 possession',
      action: () => navigate('/trains'),
      actionLabel: 'View Trains',
    },
  ];

  return (
    <div className="h-full overflow-auto bg-[#F4F5F7]">
      {/* Command Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">KAVACH</h1>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Railway Block Intelligence
              </span>
            </div>
            <p className="text-[12px] text-gray-500 font-medium">
              Central Railway · Nagpur Division · <span className="font-semibold text-gray-700">Section Controller</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-mono font-bold text-gray-900">{timeFormatted}</p>
            <p className="text-[11px] text-gray-500">{dateFormatted}</p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto p-5 space-y-5">

        {/* 4 KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={clsx('bg-white border rounded-lg p-4', kpi.bg)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className={clsx('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
                <kpi.icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', kpi.color)} />
              </div>
            </div>
          ))}
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left — Corridor + Attention */}
          <div className="lg:col-span-7 space-y-4">
            <CorridorCommandView
              onViewBlock={() => navigate('/plan?view=blocks')}
              onViewImpact={() => navigate('/trains')}
            />

            {/* Attention Required */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                Attention Required
              </h3>
              <div className="space-y-2">
                {attentionItems.map((item, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-center justify-between p-3 rounded-lg border',
                      item.level === 'red'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-amber-50 border-amber-100'
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <AlertOctagon className={clsx(
                        'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                        item.level === 'red' ? 'text-red-600' : 'text-amber-600'
                      )} />
                      <div className="min-w-0">
                        <p className={clsx(
                          'text-[12px] font-semibold truncate',
                          item.level === 'red' ? 'text-red-900' : 'text-amber-900'
                        )}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={item.action}
                      className={clsx(
                        'text-[11px] font-bold ml-3 flex-shrink-0 flex items-center gap-0.5',
                        item.level === 'red' ? 'text-red-700 hover:text-red-900' : 'text-amber-700 hover:text-amber-900'
                      )}
                    >
                      {item.actionLabel}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Recommendation + System Status */}
          <div className="lg:col-span-5 space-y-4">
            {/* System Recommendation */}
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  System Recommendation
                </h3>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                  CP-SAT Optimized
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
                <p className="text-[12.5px] text-emerald-900 font-medium leading-relaxed">
                  Approve <strong>BR-00231</strong> to complete two compatible maintenance jobs — Rail Grinding (Engineering) and Signal Inspection (S&T) — in a single 90-minute possession on TR-02.
                </p>
              </div>

              <div className="space-y-1.5 mb-4">
                {[
                  'Shared possession reduces repeated track disruption',
                  'Both jobs are spatially compatible on TR-02',
                  'Timing window satisfies safety buffer requirements',
                  'No resource conflict detected',
                ].map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <div className="flex-1 p-2 bg-gray-50 rounded text-center">
                  <p className="text-[10px] text-gray-400">Impact</p>
                  <p className="text-[12px] font-bold text-amber-700">+6 min</p>
                  <p className="text-[10px] text-gray-400">projected delay</p>
                </div>
                <div className="flex-1 p-2 bg-gray-50 rounded text-center">
                  <p className="text-[10px] text-gray-400">Trains</p>
                  <p className="text-[12px] font-bold text-gray-800">2</p>
                  <p className="text-[10px] text-gray-400">affected</p>
                </div>
                <div className="flex-1 p-2 bg-gray-50 rounded text-center">
                  <p className="text-[10px] text-gray-400">Status</p>
                  <p className="text-[12px] font-bold text-red-700">Awaiting</p>
                  <p className="text-[10px] text-gray-400">your approval</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate('/plan?view=blocks')}
                  className="flex-1 text-[12px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-colors"
                >
                  Review Details
                </button>
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="flex-1 text-[12px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg transition-colors"
                >
                  ✓ Approve Block
                </button>
              </div>
            </div>

            {/* System Integration — compact */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                System Integration
              </h3>
              <div className="space-y-1.5">
                {[
                  { name: 'TMS', status: 'Connected', time: '2 min ago', live: false },
                  { name: 'SMMS', status: 'Connected', time: '3 min ago', live: false },
                  { name: 'TDMS', status: 'Connected', time: '2 min ago', live: false },
                  { name: 'BDMS', status: 'Connected', time: '1 min ago', live: false },
                  { name: 'COA', status: 'Live', time: '30 sec ago', live: true },
                ].map(src => (
                  <div key={src.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        src.live ? 'bg-green-500 animate-pulse' : 'bg-emerald-400'
                      )} />
                      <span className="font-semibold text-gray-700 w-10">{src.name}</span>
                      <span className={clsx(
                        'font-medium',
                        src.live ? 'text-green-700' : 'text-emerald-700'
                      )}>{src.status}</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">{src.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-amber-600 mt-3 font-medium border-t border-gray-100 pt-2">
                ⚠ Prototype simulation — not a live railway feed
              </p>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Open Jobs', value: '12', sub: 'Maintenance queue', path: '/plan?view=maintenance', color: 'text-gray-800' },
                { label: 'Recovery Time', value: '18 min', sub: 'Avg this month', path: '/analytics', color: 'text-emerald-700' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors group"
                >
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                  <p className={clsx('text-lg font-bold', item.color)}>{item.value}</p>
                  <p className="text-[10px] text-gray-400">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Dialog */}
      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Block BR-00231?"
        description="Approving will commit this 90-minute possession on TR-02 (14:00–15:30). Rerouting orders will be issued to 2 affected trains. This action requires Section Controller authorization."
        confirmLabel="Approve & Commit"
        loading={actionLoading}
      />
    </div>
  );
}
