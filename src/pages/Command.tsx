import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { overviewApi, approvalsApi } from '../api';
import type { MaintenanceJob, OptimizedBlock, Train } from '../types';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import {
  AlertTriangle, Shield, Layers, TrendingUp, CheckCircle2,
  Link as LinkIcon, Radio, AlertOctagon, ChevronRight,
  ArrowRight, MapPin, Clock, FileText
} from 'lucide-react';
import RailwayNetworkMap from '../components/network/RailwayNetworkMap';

// Use existing background image as hero
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
  allTrains: any[];
  overdueJobs: MaintenanceJob[];
  delayedTrains: any[];
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
  const pendingRequests = data?.priorityQueue.filter(j => j.status === 'PENDING') || [];
  const activeBlocks = data?.allBlocks.filter(b => b.status === 'AI-OPTIMIZED' || b.status === 'PROPOSED') || [];
  
  const attentionItems = [
    // 1. What needs my attention? (High-priority maintenance requirements)
    ...(overdueJobs.slice(0, 1).map(j => ({
      level: 'red' as const,
      category: 'Needs Attention',
      title: `${j.id} — ${j.maintenanceType} overdue`,
      detail: `${j.track} · ${j.department} · ${j.overdueDays} days overdue · Priority ${j.priorityScore}`,
      action: () => navigate('/requests'),
      actionLabel: 'Review',
    }))),
    ...(pendingRequests.slice(0, 1).map(j => ({
      level: 'red' as const,
      category: 'Needs Attention',
      title: `${j.id} — Pending Request`,
      detail: `${j.track} · ${j.department} · High Priority`,
      action: () => navigate('/requests'),
      actionLabel: 'Review Request',
    }))),
    // 2. What is currently being planned? (Current planning status)
    ...(activeBlocks.slice(0, 1).map(b => ({
      level: 'blue' as const,
      category: 'Currently Planning',
      title: `${b.id} — Optimization Complete`,
      detail: `${b.track} · ${b.duration} min window · System optimized`,
      action: () => navigate('/plan?view=blocks'),
      actionLabel: 'View Plan',
    }))),
    // 3. What operational impact exists?
    ...(data?.delayedTrains && data.delayedTrains.length > 0 ? [{
      level: 'amber' as const,
      category: 'Operational Impact',
      title: `${data.delayedTrains.length} train(s) delayed`,
      detail: data.delayedTrains.slice(0, 3).map((t: any) => t.trainNumber || t.number || '').join(' · ') + ' · Affected by maintenance blocks',
      action: () => navigate('/trains'),
      actionLabel: 'View Trains',
    }] : []),
    // 4. What requires my decision?
    ...(data?.recommendedBlock ? [{
      level: 'amber' as const,
      category: 'Requires Decision',
      title: `${data.recommendedBlock.id} awaiting approval`,
      detail: `${data.recommendedBlock.track} · ${data.recommendedBlock.startTime}–${data.recommendedBlock.endTime} · ${data.recommendedBlock.jobIds?.length || 1} job(s)`,
      action: () => navigate('/plan?view=blocks'),
      actionLabel: 'Review Block',
    }] : []),
  ];

  const kpis = [
    {
      label: 'Asset Availability',
      value: loading ? '—' : `${data?.assetAvailability ?? 96.8}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      iconBg: 'bg-green-50 text-green-600',
      sub: 'Pipeline simulation',
      type: 'highlight' as const,
    },
    {
      label: 'Active Blocks',
      value: loading ? '—' : `${data?.blocksOptimized ?? 0}`,
      icon: Layers,
      color: 'text-irctc-blue',
      iconBg: 'bg-blue-50 text-irctc-blue',
      sub: `${data?.pendingApprovals ?? 0} awaiting approval`,
      type: 'highlight' as const,
    },
    {
      label: 'Trains Affected',
      value: loading ? '—' : String(data?.delayedTrains?.length ?? 0),
      icon: AlertTriangle,
      color: 'text-irctc-orange',
      iconBg: 'bg-orange-50 text-irctc-orange',
      sub: 'Delayed by maintenance',
      type: 'warning' as const,
    },
    {
      label: 'Pending Approvals',
      value: loading ? '—' : String(data?.pendingApprovals ?? 0),
      icon: Shield,
      color: 'text-red-600',
      iconBg: 'bg-red-50 text-red-600',
      sub: 'No pending approvals',
      type: 'danger' as const,
    },
  ];



  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="irctc-page">

      {/* ══ HERO SECTION ══════════════════════════════════════════════════ */}
      <div
        className="irctc-hero relative overflow-hidden"
        style={{ minHeight: '460px' }}
      >
        {/* Hero background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Left gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.80) 40%, rgba(255,255,255,0.30) 65%, transparent 100%)',
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to top, #F0F0F0 0%, transparent 100%)' }}
        />

        {/* Hero content */}
        <div className="relative max-w-[1400px] mx-auto px-8 py-16 h-full flex flex-col justify-center">
          {/* Headline */}
          <p className="text-[13px] font-bold text-irctc-blue uppercase tracking-widest mb-3">
            Indian Railways · AI-Powered Block Planning
          </p>
          <h1 className="text-[42px] md:text-[52px] font-extrabold leading-tight tracking-tight mb-4 max-w-xl">
            <span className="text-irctc-navy">Smarter Block Planning.</span>
            <br />
            <span className="text-irctc-orange">Higher Asset Availability.</span>
          </h1>
          <p className="text-[15px] text-gray-700 font-medium max-w-md leading-relaxed">
            AI-driven planning for coordinated maintenance,{' '}
            optimized corridor usage and reliable train operations.
          </p>
        </div>
      </div>

      {/* ══ OPERATIONAL SUMMARY (overlaps hero) ════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-8 -mt-6 relative z-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white/95 backdrop-blur-sm border border-irctc-border rounded-2xl shadow-irctc-xl p-6 flex items-center gap-4 hover:shadow-irctc-md transition-shadow">
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', kpi.iconBg)}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="irctc-label mb-1">{kpi.label}</p>
                <p className={clsx('text-[28px] font-bold leading-none', kpi.color)}>{kpi.value}</p>
                <p className="text-[12px] text-irctc-muted mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-8 mt-8 pb-12 space-y-6">

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <RailwayNetworkMap
              blocks={data?.allBlocks || []}
              onApproveBlock={() => setShowApproveDialog(true)}
            />

            {/* Attention Required — IRCTC alert-list style */}
            <div className="irctc-card">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="irctc-card-title flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-irctc-orange" />
                  Attention Required
                </h3>
              </div>
              {attentionItems.length === 0 ? (
                <div className="flex items-center gap-3 py-4 text-[14px] text-irctc-muted">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  No critical items requiring immediate attention.
                </div>
              ) : (
                <div className="space-y-3">
                  {attentionItems.map((item, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'flex items-center justify-between p-4 rounded-xl border',
                        item.level === 'red' ? 'bg-red-50 border-red-100' :
                        item.level === 'amber' ? 'bg-amber-50 border-amber-100' :
                        'bg-blue-50 border-blue-100'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={clsx(
                          'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2',
                          item.level === 'red' ? 'bg-red-600' : 
                          item.level === 'amber' ? 'bg-amber-500' : 
                          'bg-blue-500'
                        )} />
                        <div className="min-w-0">
                          <p className={clsx(
                            'text-[10px] font-bold uppercase tracking-wider mb-0.5',
                            item.level === 'red' ? 'text-red-700' : 
                            item.level === 'amber' ? 'text-amber-700' : 
                            'text-blue-700'
                          )}>
                            {item.category}
                          </p>
                          <p className={clsx(
                            'text-[14px] font-bold leading-snug',
                            item.level === 'red' ? 'text-red-900' : 
                            item.level === 'amber' ? 'text-amber-900' : 
                            'text-blue-900'
                          )}>
                            {item.title}
                          </p>
                          <p className="text-[12px] text-gray-600 mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                      <button
                        onClick={item.action}
                        className={clsx(
                          'text-[12px] font-bold ml-4 flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border hover:shadow-sm transition-all',
                          item.level === 'red' ? 'text-red-700 border-red-200 hover:border-red-300' :
                          item.level === 'amber' ? 'text-amber-700 border-amber-200 hover:border-amber-300' :
                          'text-blue-700 border-blue-200 hover:border-blue-300'
                        )}
                      >
                        {item.actionLabel}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* System Recommendation */}
            <div className="irctc-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="irctc-card-title">System Recommendation</h3>
                <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  System Optimized
                </span>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                  {data?.recommendedBlock
                    ? `Approve ${data.recommendedBlock.id} to complete jobs in a single ${data.recommendedBlock.duration}-minute possession on ${data.recommendedBlock.track}.`
                    : 'All current blocks have been reviewed. No pending approvals.'}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {(data?.recommendedBlock?.whyThisSlot || [
                  'Scheduled during low-traffic window',
                  'Compatible jobs on the same track section',
                  'Safety buffer requirements satisfied',
                  'No resource conflict detected',
                ]).slice(0, 4).map((reason: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-irctc-text">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>

              {/* Impact metrics */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-irctc-border">
                  <p className="irctc-label mb-1">Impact</p>
                  <p className="text-[18px] font-bold text-irctc-orange">
                    +{data?.recommendedBlock?.expectedDelay ?? 0} min
                  </p>
                  <p className="text-[11px] text-irctc-muted">projected delay</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-irctc-border">
                  <p className="irctc-label mb-1">Trains</p>
                  <p className="text-[18px] font-bold text-irctc-navy">
                    {data?.delayedTrains?.length ?? 0}
                  </p>
                  <p className="text-[11px] text-irctc-muted">affected</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-irctc-border">
                  <p className="irctc-label mb-1">Status</p>
                  <p className="text-[18px] font-bold text-red-600">
                    {data?.pendingApprovals ? 'Awaiting' : 'None'}
                  </p>
                  <p className="text-[11px] text-irctc-muted">your approval</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (data?.recommendedBlock) setShowApproveDialog(true);
                  else navigate('/plan?view=blocks');
                }}
                className="irctc-btn irctc-btn-primary w-full justify-center text-[14px] font-bold py-3"
              >
                {data?.recommendedBlock ? 'Review & Approve Block' : 'Generate Block Plan'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Open Jobs', value: String(data?.pendingMaintenance || 0), sub: 'Maintenance queue', path: '/requests' },
                { label: 'Critical Jobs', value: String(data?.criticalJobCount || 0), sub: 'High priority', path: '/requests' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="irctc-card text-left hover:shadow-irctc-md hover:border-irctc-blue/30 transition-all group cursor-pointer"
                >
                  <p className="irctc-label mb-2">{item.label}</p>
                  <p className="text-[24px] font-bold text-irctc-navy group-hover:text-irctc-blue transition-colors">{item.value}</p>
                  <p className="text-[12px] text-irctc-muted mt-1">{item.sub}</p>
                </button>
              ))}
            </div>

            {/* System Integration */}
            <div className="irctc-card">
              <h3 className="irctc-card-title flex items-center gap-2 mb-5">
                <LinkIcon className="w-4 h-4 text-irctc-blue" />
                System Integration
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'TMS', desc: 'Train Movement System', status: 'Connected' },
                  { name: 'SMMS', desc: 'Signal & Telecom Maintenance', status: 'Connected' },
                  { name: 'TDMS', desc: 'Traction Distribution System', status: 'Connected' },
                ].map(sys => (
                  <div key={sys.name} className="flex justify-between items-center border-b border-irctc-border-light last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-[14px] font-bold text-irctc-navy">{sys.name}</p>
                      <p className="text-[12px] text-irctc-muted mt-0.5">{sys.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[11px] font-bold text-green-700 uppercase">{sys.status}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-irctc-muted text-[12px] font-medium">
                    <Radio className="w-3.5 h-3.5 text-irctc-blue animate-pulse" />Last Sync
                  </div>
                  <p className="text-[12px] text-irctc-navy font-bold">21 Sep 2026, 10:18 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
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
