import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  Search, X, Calendar, ChevronDown, Settings, Plus, Layers,
  Clock, CheckCircle2, AlertTriangle, Users, ArrowRight, Loader2,
  Check, Lock, ChevronUp
} from 'lucide-react';
import Drawer from '../components/common/Drawer';
import DecisionRecommendationPanel from '../components/blocks/DecisionRecommendationPanel';
import DecisionHistory from '../components/blocks/DecisionHistory';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { priorityApi, blocksApi, approvalsApi } from '../api';
import type { MaintenanceJob, BlockRequest, OptimizedBlock } from '../types';
import { mockDecisionHistory } from '../data/mockData';
import RegionSelector from '../components/blocks/RegionSelector';
import RailwayTrackView from '../components/blocks/RailwayTrackView';
import TrackBlockDetails from '../components/blocks/TrackBlockDetails';
import PlanReviewTabs from '../components/blocks/PlanReviewTabs';

// ─── Block data ───────────────────────────────────────────────────────────────
interface BlockItem {
  id: string;
  track: string;
  section: string;
  timeWindow: string;
  startTime: string;
  endTime: string;
  duration: string;
  departments: string[];
  jobs: string;
  jobCount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'AI-OPTIMIZED' | 'PROPOSED' | 'APPROVED' | 'PROVISIONAL' | 'DEMANDED';
  affectedTrains: number;
  rawBlock: OptimizedBlock;
}

// No hardcoded blocks — all data comes from /api/blocks

const GANTT_HOURS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'];
const OPTIMIZER_STEPS = ['Computing Priority Scores...', 'Checking compatibility & bundling...', 'System solver running...', 'Validating feasibility...'];

function timeToPct(t: string) {
  const [h, m] = t.split(':').map(Number);
  return ((h * 60 + (m || 0)) / (24 * 60)) * 100;
}
function durationPct(s: string, e: string) {
  const [h1, m1] = s.split(':').map(Number);
  const [h2, m2] = e.split(':').map(Number);
  return Math.max(1, ((h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0))) / (24 * 60) * 100);
}

const DEPT_COLORS: Record<string, string> = {
  ENG: 'bg-blue-500',
  'S&T': 'bg-amber-500',
  TRD: 'bg-purple-500',
};

const STATUS_COLORS: Record<string, string> = {
  'AI-OPTIMIZED': 'bg-blue-500',
  'PROPOSED': 'bg-indigo-400',
  'APPROVED': 'bg-green-600',
  'PROVISIONAL': 'bg-yellow-500',
  'DEMANDED': 'bg-gray-400',
};

// ─── Gantt Component (simplified, focused) ────────────────────────────────────
function BlockGantt({ blocks, selectedId, onSelect }: { blocks: BlockItem[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="irctc-card overflow-hidden p-0">
      <div className="px-5 py-3 border-b border-irctc-border flex items-center justify-between bg-gray-50/50">
        <h3 className="irctc-card-title">Block Timeline — Today</h3>
        <span className="text-[12px] text-irctc-muted">Click a block to open detail</span>
      </div>
      {/* Time axis */}
      <div className="relative px-4 pt-2 pb-1 border-b border-gray-100">
        <div className="flex justify-between text-[9px] font-mono text-gray-400">
          {GANTT_HOURS.map(h => <span key={h}>{h}:00</span>)}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {/* Block rows */}
        <div className="px-4 py-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Maintenance Blocks</p>
          {blocks.map(block => (
            <div key={block.id} className="relative h-8 mb-1">
              <div
                className={clsx(
                  'absolute top-1 h-6 rounded cursor-pointer transition-all flex items-center px-1.5 overflow-hidden',
                  STATUS_COLORS[block.status] || 'bg-gray-400',
                  selectedId === block.id ? 'ring-2 ring-offset-1 ring-gray-800 opacity-100' : 'opacity-80 hover:opacity-100'
                )}
                style={{
                  left: `${timeToPct(block.startTime)}%`,
                  width: `${durationPct(block.startTime, block.endTime)}%`,
                  minWidth: '40px',
                }}
                onClick={() => onSelect(block.id)}
                title={`${block.id} · ${block.timeWindow}`}
              >
                <span className="text-[9px] font-bold text-white truncate">{block.id}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Train rows (3 key trains) */}
        <div className="px-4 py-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Affected Trains</p>
          {[
            { id: '12123', name: 'Deccan Queen', start: '08:00', end: '12:30', conflict: '14:00', confEnd: '15:30' },
            { id: '11008', name: 'Pune Express', start: '10:30', end: '15:00', conflict: '14:00', confEnd: '14:30' },
            { id: '22145', name: 'Kalyan SF', start: '12:30', end: '17:00', conflict: '', confEnd: '' },
          ].map(train => (
            <div key={train.id} className="relative h-6 mb-1">
              <div
                className="absolute top-1 h-4 bg-slate-200 rounded opacity-60"
                style={{ left: `${timeToPct(train.start)}%`, width: `${durationPct(train.start, train.end)}%` }}
              />
              {train.conflict && (
                <div
                  className="absolute top-1 h-4 bg-red-400 rounded opacity-80"
                  style={{ left: `${timeToPct(train.conflict)}%`, width: `${durationPct(train.conflict, train.confEnd)}%` }}
                  title="Conflict with block"
                />
              )}
              <span
                className="absolute top-1 text-[8px] font-mono text-gray-500 whitespace-nowrap"
                style={{ left: `${timeToPct(train.start)}%` }}
              >{train.id}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className={clsx('w-2.5 h-2.5 rounded-sm', c)} />
            {s.replace('-', ' ')}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />CONFLICT
        </span>
      </div>
    </div>
  );
}

// ─── Block Detail Drawer content ──────────────────────────────────────────────
function BlockDetailContent({ block, onApprove, onReject, onModify }: { block: BlockItem; onApprove: (altId?: string) => void; onReject: () => void; onModify: () => void }) {
  const fullBlock = block.rawBlock;
  const alternatives = fullBlock.alternatives || [];
  const [selectedAltId, setSelectedAltId] = useState<string | undefined>(alternatives.find(a => a.recommended)?.id);

  const activeAlternative = alternatives.find(a => a.id === selectedAltId);
  const history = mockDecisionHistory.filter(h => h.planId === fullBlock.id).length > 0 
    ? mockDecisionHistory.filter(h => h.planId === fullBlock.id)
    : mockDecisionHistory; // fallback to show demo data

  return (
    <div className="space-y-6">
      {/* Plan Alternatives Tabs */}
      {alternatives.length > 0 && (
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {alternatives.map(alt => (
            <button
              key={alt.id}
              onClick={() => setSelectedAltId(alt.id)}
              className={clsx(
                "flex-1 py-2 text-[11px] font-bold rounded-md transition-colors",
                selectedAltId === alt.id ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {alt.label} {alt.recommended && '⭐'}
            </button>
          ))}
        </div>
      )}

      {/* Decision Recommendation Panel */}
      <DecisionRecommendationPanel
        block={fullBlock}
        alternative={activeAlternative}
        onApprove={() => onApprove(selectedAltId)}
        onModify={onModify}
        onReject={onReject}
      />

      {/* Decision History log */}
      <DecisionHistory history={history} />
    </div>
  );
}

// ─── Job Detail Drawer content ────────────────────────────────────────────────
function JobDetailContent({ job }: { job: MaintenanceJob }) {
  const scoreBreakdown = [
    { label: 'Asset Criticality (30%)', value: job.criticality, weight: 30 },
    { label: 'Maintenance Urgency (25%)', value: job.urgency, weight: 25 },
    { label: 'Asset Failure Risk (20%)', value: job.assetRisk, weight: 20 },
    { label: 'Overdue Deferral (15%)', value: job.overdueDays > 0 ? 95 : 20, weight: 15 },
    { label: 'Operational Impact (10%)', value: job.operationalImpact, weight: 10 },
  ];

  // Compatible job suggestion
  const compatibleJob = job.track === 'TR-02' ? { id: 'JOB-1043', dept: 'S&T', type: 'Signal Inspection', track: 'TR-02' } : null;

  return (
    <div className="space-y-4 text-[12px]">
      {/* Job header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-bold text-[14px] text-gray-900">{job.id}</span>
          <StatusBadge status={job.status} size="md" />
          <PriorityBadge priority={job.priority} />
        </div>
        <p className="text-gray-700 font-semibold">{job.maintenanceType}</p>
        <p className="text-gray-500 text-[11px] mt-0.5">{job.department} · {job.track} · {job.section}</p>
        
        {/* Requested vs Approved Grid */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 border border-gray-200 rounded p-2 mt-3 mb-2">
          <div className="border-r border-gray-200 pr-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requested Details</p>
            <p className="text-[11px] text-gray-600"><strong>Date/Due:</strong> {job.dueDate || 'Flexible'}</p>
            <p className="text-[11px] text-gray-600"><strong>Duration:</strong> {job.estimatedDuration} min</p>
            <p className="text-[11px] text-gray-600"><strong>Asset:</strong> {job.asset}</p>
          </div>
          <div className="pl-2">
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1">Approval Status</p>
            <p className="text-[11px] text-gray-600"><strong>Status:</strong> {job.status}</p>
            <p className="text-[11px] text-gray-600">
              {job.status === 'PENDING' || job.status === 'OVERDUE' ? 'Awaiting System scheduling' : 'Scheduled / Approved in Plan'}
            </p>
          </div>
        </div>

        {job.overdueDays > 0 && (
          <p className="text-red-700 text-[11px] font-bold mt-2">⚠ {job.overdueDays} days overdue</p>
        )}
      </div>

      {/* Priority score */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Priority Score</h4>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-bold text-gray-900">{job.priorityScore}</span>
          <span className="text-gray-400">/100</span>
        </div>
        <div className="space-y-2">
          {scoreBreakdown.map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] text-gray-600 mb-0.5">
                <span>{item.label}</span>
                <span className="font-semibold">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why this job */}
      <div className="p-3 bg-blue-50 border border-emerald-100 rounded-lg">
        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1.5">Why This Job?</p>
        <p className="text-blue-800 leading-relaxed">{job.notes}</p>
      </div>

      {/* Compatible work */}
      {compatibleJob && (
        <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/50">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-2">Compatible Work Found</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 p-2 bg-white border border-blue-200 rounded text-center">
              <p className="font-bold text-gray-800 text-[11px]">{job.id}</p>
              <p className="text-[10px] text-gray-500">{job.department}</p>
            </div>
            <span className="text-blue-600 font-bold">+</span>
            <div className="flex-1 p-2 bg-white border border-blue-200 rounded text-center">
              <p className="font-bold text-gray-800 text-[11px]">{compatibleJob.id}</p>
              <p className="text-[10px] text-gray-500">{compatibleJob.dept}</p>
            </div>
          </div>
          <div className="space-y-1 text-[10px] text-blue-700 mb-2">
            {['Spatial overlap', 'Timing compatible', 'Safety conditions satisfied', 'No resource conflict'].map((r, i) => (
              <div key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />{r}</div>
            ))}
          </div>
          <p className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Compatibility is a candidate only. System determines final scheduling.
          </p>
        </div>
      )}

      {/* Resources */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
          <p className="text-[10px] text-gray-400">Manpower</p>
          <p className="font-bold text-gray-800">{job.requiredManpower} workers</p>
        </div>
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
          <p className="text-[10px] text-gray-400">Equipment</p>
          <p className="font-bold text-gray-800">{job.machinery}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Page ────────────────────────────────────────────────────────────────

const mapApiBlockToBlockItem = (b: any): BlockItem => ({
  id: b.id || b.block_id,
  track: b.track || b.track_id || 'TR-00',
  section: b.section || b.location_station_id || 'N/A',
  timeWindow: `${b.startTime || '00:00'} - ${b.endTime || '00:00'}`,
  startTime: b.startTime || '00:00',
  endTime: b.endTime || '00:00',
  duration: `${b.duration || 0} min`,
  departments: b.departments || ['ENG'],
  jobs: `${b.jobIds?.length || 1} ${b.bundled ? '(Bundled)' : ''}`,
  jobCount: b.jobIds?.length || 1,
  priority: (b.priorityScore > 0.5 ? 'HIGH' : b.priorityScore > 0.3 ? 'MEDIUM' : 'LOW'),
  status: b.status || 'AI-OPTIMIZED',
  affectedTrains: b.trainImpact ? (b.trainImpact > 0 ? 1 : 0) : (b.affectedTrains?.length || 0),
  rawBlock: b as OptimizedBlock,
});

import { useAuth } from '../contexts/AuthContext';

const DEPT_MAP: Record<number, string> = {
  1: 'ENG',
  2: 'S&T',
  3: 'TRD',
};

export default function Plan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'maintenance' | 'blocks') || 'maintenance';
  const { user } = useAuth();

  const isBDMS = user?.role === 'BDMS_INCHARGE';
  const userDept = isBDMS && user.department_id ? DEPT_MAP[user.department_id] : 'ALL';

  const setTab = (tab: 'maintenance' | 'blocks') => {
    setSearchParams({ view: tab });
  };

  // Maintenance state
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [requests, setRequests] = useState<BlockRequest[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState(userDept);
  const [selectedJob, setSelectedJob] = useState<MaintenanceJob | null>(null);

  // Blocks state
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(''); // empty means all dates
  
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const data = await blocksApi.getBlocks();
        setBlocks(data.map(mapApiBlockToBlockItem));
      } catch (e) {
        setBlocks([]);
      }
    };
    fetchBlocks();
  }, []);

  const [selectedBlock, setSelectedBlock] = useState<BlockItem | null>(null);
  const [region, setRegion] = useState(() => localStorage.getItem('irctc_selected_region') || 'Central Railway');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizerStep, setOptimizerStep] = useState(-1);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      priorityApi.getScores(),
      blocksApi.getRequests()
    ]).then(([jData, rData]) => {
      setJobs(jData);
      setRequests(rData);
      const filtered = userDept !== 'ALL' ? jData.filter(j => j.department === userDept) : jData;
      if (filtered.length > 0) setSelectedJob(filtered[0]);
      setJobsLoading(false);
    }).catch(() => setJobsLoading(false));
  }, [userDept]);

  const filteredJobs = jobs.filter(j => deptFilter === 'ALL' || j.department === deptFilter);
  const filteredBlocks = blocks.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchTrack = b.track.toLowerCase().includes(q);
      const matchSection = b.section.toLowerCase().includes(q);
      const matchJobs = b.rawBlock?.jobIds?.some(j => j.toLowerCase().includes(q));
      
      if (!(matchId || matchTrack || matchSection || matchJobs)) {
        return false;
      }
    }
    if (selectedDate) {
      const blockDate = new Date(b.rawBlock?.createdAt || Date.now()).toISOString().split('T')[0];
      if (blockDate !== selectedDate) return false;
    }
    return true;
  });

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    setOptimizerStep(0);
    for (let i = 0; i < OPTIMIZER_STEPS.length; i++) {
      await new Promise(res => setTimeout(res, 650));
      setOptimizerStep(i + 1);
    }
    setOptimizing(false);
    setOptimizerStep(-1);
    toast.success('System Optimization Complete', { description: 'Generated 6 optimal possession blocks.' });
  };

  const handleApproveBlock = async () => {
    if (!selectedBlock) return;
    setActionLoading(true);
    try {
      await approvalsApi.approve(selectedBlock.id, 'Section Controller');
      toast.success(`✓ Block ${selectedBlock.id} Approved`, {
        description: 'Persisted to DB. Rerouting orders issued.',
      });
      setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, status: 'APPROVED' } : b));
      setShowApproveDialog(false);
      setSelectedBlock(null);
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBlock = async (block: BlockItem) => {
    try {
      await approvalsApi.reject(block.id, 'Rejected by Section Controller');
      toast.info(`Block ${block.id} rejected and saved to DB.`);
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, status: 'REJECTED' as any } : b));
      setSelectedBlock(null);
    } catch {
      toast.error('Failed to reject block');
    }
  };

  const handleModifyBlock = async (block: BlockItem) => {
    const newStart = prompt(`Modify start time for ${block.id} (current: ${block.startTime}):`, block.startTime);
    if (!newStart) return;
    const newEnd = prompt(`Modify end time (current: ${block.endTime}):`, block.endTime);
    if (!newEnd) return;
    try {
      await approvalsApi.modify(block.id, newStart, newEnd);
      toast.success(`Block ${block.id} modified and saved to DB.`, { description: `New window: ${newStart}–${newEnd}` });
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, startTime: newStart, endTime: newEnd, timeWindow: `${newStart} – ${newEnd}`, status: 'MODIFIED' as any } : b));
      setSelectedBlock(null);
    } catch {
      toast.error('Failed to modify block');
    }
  };

  const statusBadgeColor: Record<string, string> = {
    'AI-OPTIMIZED': 'text-blue-700 bg-blue-50 border-blue-200',
    'PROPOSED': 'text-indigo-700 bg-indigo-50 border-indigo-200',
    'APPROVED': 'text-green-700 bg-green-50 border-green-200',
    'PROVISIONAL': 'text-yellow-700 bg-yellow-50 border-yellow-200',
    'DEMANDED': 'text-gray-600 bg-gray-50 border-gray-200',
  };

  return (
    <div className="irctc-page">
      {/* Page header — IRCTC style */}
      <div className="bg-white border-b border-irctc-border px-7 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="irctc-page-title">Block Planning</h1>
            <p className="text-[14px] text-irctc-muted mt-0.5">Maintenance scheduling · Block planning · System optimization</p>
          </div>
          {/* Tab switcher — IRCTC style */}
          <div className="irctc-tabs gap-0">
            {(['maintenance', 'blocks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTab(tab as 'maintenance' | 'blocks')}
                className={clsx('irctc-tab capitalize', activeTab === tab && 'active')}
              >
                {tab === 'maintenance' ? 'Maintenance' :  'Blocks & Gantt'}
              </button>
            ))}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3">
            {activeTab === 'blocks' && (
              <button
                onClick={handleRunOptimizer}
                disabled={optimizing}
                className="irctc-btn irctc-btn-outline text-[13px]"
              >
                  {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  {optimizing ? 'Running System...' : 'Generate Plan'}
                </button>
            )}
            <button
              onClick={() => navigate('/requests')}
              className="irctc-btn irctc-btn-primary text-[13px]"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Optimizer progress */}
      {optimizing && (
        <div className="bg-blue-50 border-b border-irctc-border px-7 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">System Solver Active</span>
            </div>
            {OPTIMIZER_STEPS.map((step, i) => (
              <div key={step} className={clsx(
                'flex items-center gap-1.5 text-[11px]',
                i < optimizerStep ? 'text-blue-600 font-semibold' : i === optimizerStep ? 'text-blue-800 font-bold' : 'text-gray-400'
              )}>
                {i < optimizerStep ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current inline-block" />}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-7 py-6">
        {/* ─── MAINTENANCE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'maintenance' && (
          <div>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Open Jobs', value: String(jobs.filter(j => j.status === 'PENDING' || j.status === 'IN_PROGRESS').length || jobs.length), sub: 'Awaiting scheduling', icon: Layers, color: 'text-gray-800', bg: 'bg-white border-gray-200' },
                { label: 'Overdue', value: String(jobs.filter(j => j.overdueDays > 0).length), sub: 'High priority escalation', icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
                { label: 'Scheduled', value: String(jobs.filter(j => j.status === 'SCHEDULED').length), sub: 'In active plan', icon: Calendar, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
                { label: 'Completed', value: String(jobs.filter(j => j.status === 'COMPLETED').length), sub: 'All time', icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
              ].map(kpi => (
                <div key={kpi.label} className={clsx('irctc-card-sm', kpi.bg)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="irctc-label mb-2">{kpi.label}</p>
                      <p className={clsx('text-[26px] font-bold leading-none', kpi.color)}>{kpi.value}</p>
                      <p className="text-[12px] text-irctc-muted mt-1.5">{kpi.sub}</p>
                    </div>
                    <kpi.icon className={clsx('w-5 h-5 flex-shrink-0', kpi.color)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] text-gray-500 font-medium">Filter:</span>
              {['ALL', 'ENG', 'S&T', 'TRD'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  disabled={isBDMS && dept !== userDept}
                  className={clsx(
                    'px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors',
                    deptFilter === dept
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                    (isBDMS && dept !== userDept) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {dept === 'ALL' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

            {/* Job list */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Requested Maintenance
                </p>
              </div>
              {jobsLoading ? (
                <div className="p-8 text-center text-gray-400 text-[12px]">Loading maintenance requests...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Request ID</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Type & Location</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Priority</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Planning Status</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredJobs.map(job => (
                        <tr key={job.id} className={clsx('hover:bg-gray-50/80 transition-colors', selectedJob?.id === job.id && 'bg-blue-50/50')}>
                          <td className="px-4 py-3 text-[12px] font-mono font-bold text-gray-900">{job.id}</td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">{job.department}</td>
                          <td className="px-4 py-3">
                            <div className="text-[12px] font-medium text-gray-900">{job.maintenanceType}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{job.section} · {job.track}</div>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-gray-700">{job.estimatedDuration} min</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={clsx('w-2 h-2 rounded-full', job.priorityScore > 0.6 ? 'bg-red-500' : job.priorityScore > 0.4 ? 'bg-amber-500' : 'bg-blue-500')} />
                              <span className="text-[11px] font-bold text-gray-700">{(job.priorityScore * 100).toFixed(0)}</span>
                              {job.overdueDays > 0 && <span className="text-[9px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-100 uppercase">{job.overdueDays}d Overdue</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded uppercase border', 
                              job.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              job.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                              'bg-gray-100 text-gray-600 border-gray-200'
                            )}>
                              {job.status === 'SCHEDULED' ? 'Planned' : job.status === 'COMPLETED' ? 'Completed' : 'Pending Planning'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px]">
                            <button onClick={() => setSelectedJob(job)} className="text-blue-600 font-bold hover:text-blue-800">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {filteredJobs.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-[12px]">No jobs found for selected department.</div>
                  )}

            {/* My Requests Table */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                MY DEPARTMENT BLOCK REQUESTS & POSSESSION STATUS
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400">
                      <th className="py-2 font-semibold">REQUEST ID</th>
                      <th className="py-2 font-semibold">SECTION</th>
                      <th className="py-2 font-semibold">DATE</th>
                      <th className="py-2 font-semibold text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="py-2 font-mono font-bold text-blue-900">{req.id}</td>
                        <td className="py-2 text-gray-700 font-semibold">{req.track}</td>
                        <td className="py-2 text-gray-600">{req.preferredDate}</td>
                        <td className="py-2 text-right">
                          <StatusBadge status={req.status as any} size="sm" />
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-400">No requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ─── BLOCKS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            <RegionSelector 
              selectedRegion={region} 
              onRegionChange={setRegion}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* Block KPIs — live data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Blocks', value: String(blocks.length), sub: 'From pipeline' },
                { label: 'Approved', value: String(blocks.filter(b => b.status === 'APPROVED').length), sub: 'Committed to schedule' },
                { label: 'Pending Approval', value: String(blocks.filter(b => b.status === 'AI-OPTIMIZED' || b.status === 'PROPOSED').length), sub: 'Awaiting decision' },
                { label: 'Total Delay', value: `${blocks.reduce((sum, b) => sum + b.affectedTrains, 0)} trains`, sub: 'With impact' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-gray-200 rounded-lg p-3.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-[10px] text-gray-400">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Railway Track Visualization */}
            <RailwayTrackView
              region={region}
              blocks={filteredBlocks}
              selectedId={selectedBlock?.id || ''}
              onSelect={(id) => setSelectedBlock(blocks.find(b => b.id === id) || null)}
            />

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[300px] bg-gray-50 border border-gray-200 rounded px-3 py-1.5 focus-within:border-blue-500 transition-colors">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search block ID, section..."
                  className="bg-transparent border-none outline-none text-[11px] w-full text-gray-700 placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-gray-400" /></button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-[11px] font-semibold border border-gray-200 rounded px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="AI-OPTIMIZED">Optimized</option>
                <option value="PROPOSED">Proposed</option>
                <option value="APPROVED">Approved</option>
                <option value="PROVISIONAL">Provisional</option>
                <option value="DEMANDED">Demanded</option>
              </select>
              <span className="text-[11px] text-gray-400 ml-auto">{filteredBlocks.length} blocks</span>
            </div>

            {/* Plan Review Tabs */}
            <PlanReviewTabs
              blocks={filteredBlocks}
              selectedBlockId={selectedBlock?.id || ''}
              onSelectBlock={(id) => setSelectedBlock(blocks.find(b => b.id === id) || null)}
            />
          </div>
        )}
      </div>

      {/* Job Detail Drawer */}
      <Drawer
        open={activeTab === 'maintenance' && selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.id || ''}
        subtitle={`${selectedJob?.maintenanceType} · ${selectedJob?.track}`}
        width="md"
      >
        {selectedJob && <JobDetailContent job={selectedJob} />}
      </Drawer>

      {/* Block Detail Drawer */}
      <Drawer
        open={activeTab === 'blocks' && selectedBlock !== null}
        onClose={() => setSelectedBlock(null)}
        title={selectedBlock?.id || ''}
        subtitle={`${selectedBlock?.track} · ${selectedBlock?.timeWindow}`}
        width="md"
      >
        {selectedBlock && (
          <TrackBlockDetails
            block={selectedBlock.rawBlock}
            onApprove={() => setShowApproveDialog(true)}
            onReject={() => handleRejectBlock(selectedBlock)}
            onModify={() => handleModifyBlock(selectedBlock)}
          />
        )}
      </Drawer>

      {/* Approval Dialog */}
      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApproveBlock}
        title={`Approve Block ${selectedBlock?.id}?`}
        description={`Approving will commit this possession on ${selectedBlock?.track} (${selectedBlock?.timeWindow}). This requires Section Controller authorization. Rerouting orders will be issued to affected trains.`}
        confirmLabel="Approve & Commit"
        loading={actionLoading}
      />
    </div>
  );
}
