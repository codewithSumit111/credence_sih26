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
  pendingApprovals: number;
  approvedBlocks: number;
  expectedTrainDelay: number;
  integratedBlockCount: number;
  priorityQueue: MaintenanceJob[];
  recommendedBlock?: OptimizedBlock;
  allBlocks: OptimizedBlock[];
  allTrains: Train[];
  overdueJobs: MaintenanceJob[];
  delayedTrains: Train[];
}

import DynamicNetworkMap from '../components/network/DynamicNetworkMap';

// ─── Corridor command visualization ──────────────────────────────────────────
function CorridorCommandView({ onViewBlock, onViewImpact, delayedTrains, pendingBlock }: {
  onViewBlock: () => void;
  onViewImpact: () => void;
  delayedTrains: any[];
  pendingBlock: any;
}) {
  const trainPositions = delayedTrains.slice(0, 3).map((t, i) => ({
    trainNumber: t.number || t.id,
    trackId: `TR-0${i + 1}`,
    position: 0.2 + i * 0.3,
    status: (t.currentStatus === 'DELAYED' ? 'DELAYED' : 'ON_TIME') as 'DELAYED' | 'ON_TIME',
  }));

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
          blockedTracks={pendingBlock ? [pendingBlock.track?.split('-')[1] || 'TR-02'] : []}
          trainPositions={trainPositions}
          onTrainClick={onViewImpact}
          onBlockClick={onViewBlock}
        />
      </div>

      {/* Active block legend */}
      {pendingBlock && (
        <div className="flex items-start gap-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-3 bg-red-200 rounded-sm" />
              <span className="font-mono text-[11px] font-bold text-red-800">{pendingBlock.id}</span>
              <span className="text-[10px] text-gray-500 font-mono">{pendingBlock.startTime}–{pendingBlock.endTime}</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded border border-red-200">
                AWAITING APPROVAL
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              {pendingBlock.departments?.join(' + ')} · {pendingBlock.track} · <strong>{delayedTrains.length} train(s) affected</strong>
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
      )}
      {!pendingBlock && (
        <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center">
          <p className="text-[11px] text-green-700 font-semibold">✓ All blocks approved — No pending possessions</p>
        </div>
      )}
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
    if (!data?.recommendedBlock) return;
    setActionLoading(true);
    try {
      await approvalsApi.approve(data.recommendedBlock.id, 'Section Controller');
      toast.success(`✓ Block ${data.recommendedBlock.id} Approved`, {
        description: 'Schedule committed to DB. Rerouting orders issued.',
      });
      setShowApproveDialog(false);
      // Reload data
      const updated = await overviewApi.getDashboardData();
      setData(updated);
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
      sub: 'Pipeline simulation',
    },
    {
      label: 'Active Blocks',
      value: loading ? '—' : `${data?.blocksOptimized ?? 0}`,
      icon: Layers,
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      sub: `${data?.pendingApprovals ?? 0} awaiting approval`,
    },
    {
      label: 'Trains Affected',
      value: loading ? '—' : String(data?.delayedTrains?.length ?? 0),
      icon: AlertTriangle,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      sub: 'Delayed by maintenance',
    },
    {
      label: 'Pending Approvals',
      value: loading ? '—' : String(data?.pendingApprovals ?? 0),
      icon: Shield,
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      sub: data?.recommendedBlock ? `${data.recommendedBlock.id} requires action` : 'No pending approvals',
    },
  ];

  const overdueJobs = data?.overdueJobs || [];
  const attentionItems = [
    ...(overdueJobs.slice(0, 1).map(j => ({
      level: 'red' as const,
      title: `${j.id} — ${j.maintenanceType} overdue`,
      detail: `${j.track} · ${j.department} · ${j.overdueDays} days overdue · Priority ${j.priorityScore}`,
      action: () => navigate('/plan?view=maintenance'),
      actionLabel: 'Review',
    }))),
    ...(data?.recommendedBlock ? [{
      level: 'amber' as const,
      title: `${data.recommendedBlock.id} awaiting approval`,
      detail: `${data.recommendedBlock.track} · ${data.recommendedBlock.startTime}–${data.recommendedBlock.endTime} · ${data.recommendedBlock.jobIds?.length || 1} job(s) · CP-SAT optimized`,
      action: () => navigate('/plan?view=blocks'),
      actionLabel: 'Review Block',
    }] : []),
    ...(data?.delayedTrains && data.delayedTrains.length > 0 ? [{
      level: 'amber' as const,
      title: `${data.delayedTrains.length} train(s) delayed`,
      detail: data.delayedTrains.slice(0, 3).map(t => t.number).join(' · ') + ' · Affected by maintenance blocks',
      action: () => navigate('/trains'),
      actionLabel: 'View Trains',
    }] : []),
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
              delayedTrains={data?.delayedTrains || []}
              pendingBlock={data?.recommendedBlock}
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
                  {data?.recommendedBlock
                    ? <>Approve <strong>{data.recommendedBlock.id}</strong> to complete {data.recommendedBlock.jobIds?.length || 1} maintenance job(s) in a single {data.recommendedBlock.duration}-minute possession on {data.recommendedBlock.track}.</>
                    : 'All current blocks have been reviewed. No pending approvals.'}
                </p>
              </div>

              <div className="space-y-1.5 mb-4">
                {(data?.recommendedBlock?.whyThisSlot || [
                  'Scheduled during low-traffic window',
                  'Compatible jobs on the same track section',
                  'Safety buffer requirements satisfied',
                  'No resource conflict detected',
                ]).slice(0, 4).map((reason: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <div className="flex-1 p-2 bg-gray-50 rounded text-center">
                  <p className="text-[10px] text-gray-400">Impact</p>
                  <p className="text-[12px] font-bold text-amber-700">+{data?.recommendedBlock?.expectedDelay ?? 0} min</p>
                  <p className="text-[10px] text-gray-400">projected delay</p>
                </div>
                <div className="flex-1 p-2 bg-gray-50 rounded text-center">
                  <p className="text-[10px] text-gray-400">Trains</p>
                  <p className="text-[12px] font-bold text-gray-800">{data?.delayedTrains?.length ?? 0}</p>
                  <p className="text-[10px] text-gray-400">affected</p>
                </div>
                <div className="flex-1 p-2 bg-gray-50 rounded text-center">
                  <p className="text-[10px] text-gray-400">Status</p>
                  <p className="text-[12px] font-bold text-red-700">{data?.pendingApprovals ? 'Awaiting' : 'None'}</p>
                  <p className="text-[10px] text-gray-400">your approval</p>
                </div>
              </div>

              {data?.recommendedBlock && (
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
              )}
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
                ⚠ Pipeline data — not a live railway operational feed
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
        title={data?.recommendedBlock ? `Approve Block ${data.recommendedBlock.id}?` : 'Approve Block?'}
        description={data?.recommendedBlock
          ? `Approving will commit this ${data.recommendedBlock.duration}-minute possession on ${data.recommendedBlock.track} (${data.recommendedBlock.startTime}–${data.recommendedBlock.endTime}). Rerouting orders will be issued to ${data.delayedTrains?.length || 0} affected train(s). This action requires Section Controller authorization.`
          : 'Are you sure you want to approve this block?'}
        confirmLabel="Approve & Commit"
        loading={actionLoading}
      />
    </div>
  );
}
