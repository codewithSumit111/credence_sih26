import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { overviewApi, approvalsApi } from '../api';
import type { MaintenanceJob, OptimizedBlock, Train } from '../types';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import {
  AlertTriangle, Shield, Layers, TrendingUp, CheckCircle2, Link as LinkIcon, Radio, AlertOctagon, ChevronRight
} from 'lucide-react';
import DynamicNetworkMap from '../components/network/DynamicNetworkMap';

// Import the background image
import bgImage from '../assets/background_image.png';

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

function CorridorCommandView({ delayedTrains, pendingBlock }: {
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Corridor Command View</h3>
            <p className="text-xs text-gray-500">NGP–BSL Corridor · Live Operational Network</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          MONITORING ACTIVE
        </div>
      </div>

      <div className="flex gap-4 text-xs font-semibold text-gray-600 mb-6 justify-end px-2">
         <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> On Time</div>
         <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Delayed</div>
         <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Rerouted</div>
         <div className="flex items-center gap-2 ml-4">
           <span className="h-0.5 w-4 bg-blue-600" /> Route
           <span className="h-0.5 w-4 bg-blue-300 border-dashed border-b-2" /> Alternate
           <span className="h-0.5 w-4 bg-red-500 border-dashed border-b-2" /> Blocked
         </div>
      </div>

      <div className="mb-2 relative h-[250px] bg-blue-50/30 rounded-xl border border-gray-100 p-2 overflow-hidden">
        <DynamicNetworkMap 
          blockedTracks={pendingBlock ? [pendingBlock.track?.split('-')[1] || 'TR-02'] : []}
          trainPositions={trainPositions}
          onTrainClick={() => {}}
          onBlockClick={() => {}}
        />
        
        {/* Statistics Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-sm">
           <div className="space-y-1.5 text-[11px] font-medium text-gray-600">
              <div className="flex justify-between gap-6"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"/> On Time</div> <span className="font-bold text-gray-900">12</span></div>
              <div className="flex justify-between gap-6"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"/> Delayed</div> <span className="font-bold text-gray-900">2</span></div>
              <div className="flex justify-between gap-6"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"/> Rerouted</div> <span className="font-bold text-gray-900">1</span></div>
              <div className="flex justify-between gap-6"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"/> Blocked</div> <span className="font-bold text-gray-900">0</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function Command() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      const updated = await overviewApi.getDashboardData();
      setData(updated);
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

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

  const kpis = [
    {
      label: 'Asset Availability',
      value: loading ? '—' : `${data?.assetAvailability ?? 96.8}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100 text-green-700',
      sub: 'Pipeline simulation',
    },
    {
      label: 'Active Blocks',
      value: loading ? '—' : `${data?.blocksOptimized ?? 0}`,
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-700',
      sub: `${data?.pendingApprovals ?? 0} awaiting approval`,
    },
    {
      label: 'Trains Affected',
      value: loading ? '—' : String(data?.delayedTrains?.length ?? 0),
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100 text-orange-600',
      sub: 'Delayed by maintenance',
    },
    {
      label: 'Pending Approvals',
      value: loading ? '—' : String(data?.pendingApprovals ?? 0),
      icon: Shield,
      color: 'text-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100 text-red-700',
      sub: 'No pending approvals',
    },
  ];

  return (
    <div className="h-full overflow-auto bg-[#F8FAFC]">
      
      {/* Hero Section */}
      <div className="relative h-[280px] bg-[#0A3D80] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 mix-blend-overlay"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent w-2/3" />
        
        <div className="relative max-w-[1400px] mx-auto px-8 py-14 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A3D80] tracking-tight leading-tight mb-2 drop-shadow-sm">
            Smarter Block Planning.<br />
            <span className="text-[#E85D04]">Higher Asset Availability.</span>
          </h1>
          <p className="text-sm md:text-base text-gray-700 font-medium max-w-lg mt-4 leading-relaxed">
            AI-driven block planning for efficient maintenance, 
            optimized corridor usage and uninterrupted train operations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 -mt-10 relative z-10 pb-12 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', kpi.iconBg)}>
                 <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-500">{kpi.label}</p>
                <p className={clsx('text-2xl font-black mt-0.5', kpi.color)}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Col Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <CorridorCommandView
              delayedTrains={data?.delayedTrains || []}
              pendingBlock={data?.recommendedBlock}
            />

            {/* Attention Required */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <AlertOctagon className="w-4 h-4" />
                 </div>
                 <h3 className="text-sm font-bold text-gray-900">Attention Required</h3>
              </div>
              <div className="space-y-3">
                {attentionItems.map((item, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-center justify-between p-3.5 rounded-lg border',
                      item.level === 'red'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-amber-50 border-amber-100'
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertOctagon className={clsx(
                        'w-4 h-4 flex-shrink-0 mt-0.5',
                        item.level === 'red' ? 'text-red-600' : 'text-amber-600'
                      )} />
                      <div className="min-w-0">
                        <p className={clsx(
                          'text-[13px] font-bold truncate',
                          item.level === 'red' ? 'text-red-900' : 'text-amber-900'
                        )}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-600 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={item.action}
                      className={clsx(
                        'text-[12px] font-bold ml-3 flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded bg-white/50 hover:bg-white',
                        item.level === 'red' ? 'text-red-700 hover:text-red-900 shadow-sm border border-red-200' : 'text-amber-700 hover:text-amber-900 shadow-sm border border-amber-200'
                      )}
                    >
                      {item.actionLabel}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* System Recommendation */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-bold text-gray-900">System Recommendation</h3>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  CP-SAT Optimized
                </span>
              </div>

              <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 mb-5 flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                 <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                   {data?.recommendedBlock
                     ? `Approve ${data.recommendedBlock.id} to complete jobs in a single ${data.recommendedBlock.duration}-minute possession on ${data.recommendedBlock.track}.`
                     : 'All current blocks have been reviewed. No pending approvals.'}
                 </p>
              </div>

              <div className="space-y-2.5 mb-6 pl-2">
                {(data?.recommendedBlock?.whyThisSlot || [
                  'Scheduled during low-traffic window',
                  'Compatible jobs on the same track section',
                  'Safety buffer requirements satisfied',
                  'No resource conflict detected',
                ]).slice(0, 4).map((reason: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px] font-medium text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-6 bg-gray-50/50 px-4 rounded-lg">
                <div className="text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Impact</p>
                  <p className="text-[14px] font-bold text-orange-600 mt-0.5">
                    +{data?.recommendedBlock?.expectedDelay ?? 0} min
                  </p>
                  <p className="text-[10px] text-gray-400">projected delay</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Trains</p>
                  <p className="text-[14px] font-bold text-gray-900 mt-0.5">
                    {data?.delayedTrains?.length ?? 0}
                  </p>
                  <p className="text-[10px] text-gray-400">affected</p>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-500 font-medium">Status</p>
                  <p className="text-[14px] font-bold text-red-600 mt-0.5">
                    {data?.pendingApprovals ? 'Awaiting' : 'None'}
                  </p>
                  <p className="text-[10px] text-gray-400">your approval</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (data?.recommendedBlock) setShowApproveDialog(true);
                  else navigate('/plan?view=blocks');
                }}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 text-[13px] font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all",
                  data?.recommendedBlock 
                    ? "bg-[#E85D04] hover:bg-[#D05303] text-white"
                    : "bg-[#E85D04] hover:bg-[#D05303] text-white opacity-90"
                )}
              >
                {data?.recommendedBlock ? "Review & Approve Block" : "Generate Block Plan"} 
                <span className="text-lg leading-none mb-0.5">→</span>
              </button>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Open Jobs', value: '12', sub: 'Maintenance queue', path: '/plan?view=maintenance', color: 'text-gray-800' },
                { label: 'Recovery Time', value: '18 min', sub: 'Avg this month', path: '/analytics', color: 'text-blue-700' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md transition-all group"
                >
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                  <p className={clsx('text-2xl font-black mt-1', item.color)}>{item.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-1">{item.sub}</p>
                </button>
              ))}
            </div>

            {/* System Integration */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">System Integration</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'TMS', desc: 'Train Movement System', status: 'Connected' },
                  { name: 'SMMS', desc: 'Signal & Telecom Maintenance', status: 'Connected' },
                  { name: 'TDMS', desc: 'Traction Distribution System', status: 'Connected' },
                ].map(sys => (
                  <div key={sys.name} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{sys.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{sys.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] font-bold text-green-700 uppercase">{sys.status}</span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-medium">
                     <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Last Sync
                  </div>
                  <p className="text-[10px] text-gray-800 font-bold">
                     21 Sep 2026, 10:18 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title={data?.recommendedBlock ? `Approve Block ${data.recommendedBlock.id}?` : 'Approve Block?'}
        description={data?.recommendedBlock
          ? `Approving will commit this ${data.recommendedBlock.duration}-minute possession on ${data.recommendedBlock.track} (${data.recommendedBlock.startTime}–${data.recommendedBlock.endTime}).`
          : 'Are you sure you want to approve this block?'}
        confirmLabel="Approve & Commit"
        loading={actionLoading}
      />
    </div>
  );
}
