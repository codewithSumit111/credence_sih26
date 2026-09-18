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
import ExplainabilityPanel from '../components/blocks/ExplainabilityPanel';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { priorityApi, blocksApi, approvalsApi } from '../api';
import type { MaintenanceJob } from '../types';

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
}

const BLOCKS_DATA: BlockItem[] = [
  { id: 'BR-00231', track: 'TR-02', section: 'NGP-BSL', timeWindow: '14:00 – 15:30', startTime: '14:00', endTime: '15:30', duration: '90 min', departments: ['ENG', 'S&T'], jobs: '2 (Bundled)', jobCount: 2, priority: 'HIGH', status: 'AI-OPTIMIZED', affectedTrains: 3 },
  { id: 'BR-00232', track: 'TR-04', section: 'NGP-WR', timeWindow: '16:10 – 17:00', startTime: '16:10', endTime: '17:00', duration: '50 min', departments: ['TRD'], jobs: '1', jobCount: 1, priority: 'MEDIUM', status: 'PROPOSED', affectedTrains: 1 },
  { id: 'BR-00237', track: 'TR-07', section: 'WR-AKO', timeWindow: '19:00 – 19:45', startTime: '19:00', endTime: '19:45', duration: '45 min', departments: ['ENG'], jobs: '1', jobCount: 1, priority: 'LOW', status: 'APPROVED', affectedTrains: 0 },
  { id: 'BR-00235', track: 'TR-04', section: 'NGP-WR', timeWindow: '04:00 – 05:30', startTime: '04:00', endTime: '05:30', duration: '90 min', departments: ['ENG', 'S&T'], jobs: '2 (Bundled)', jobCount: 2, priority: 'MEDIUM', status: 'PROVISIONAL', affectedTrains: 0 },
  { id: 'BR-00241', track: 'TR-07', section: 'WR-AKO', timeWindow: '02:00 – 05:00', startTime: '02:00', endTime: '05:00', duration: '180 min', departments: ['TRD'], jobs: '1', jobCount: 1, priority: 'LOW', status: 'DEMANDED', affectedTrains: 0 },
  { id: 'BR-00244', track: 'TR-01', section: 'NGP-WR', timeWindow: '10:30 – 11:45', startTime: '10:30', endTime: '11:45', duration: '75 min', departments: ['ENG'], jobs: '1', jobCount: 1, priority: 'MEDIUM', status: 'AI-OPTIMIZED', affectedTrains: 1 },
];

const GANTT_HOURS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'];
const OPTIMIZER_STEPS = ['Computing Priority Scores...', 'Checking compatibility & bundling...', 'CP-SAT solver running...', 'Validating feasibility...'];

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
  'AI-OPTIMIZED': 'bg-emerald-500',
  'PROPOSED': 'bg-indigo-400',
  'APPROVED': 'bg-green-600',
  'PROVISIONAL': 'bg-yellow-500',
  'DEMANDED': 'bg-gray-400',
};

// ─── Gantt Component (simplified, focused) ────────────────────────────────────
function BlockGantt({ blocks, selectedId, onSelect }: { blocks: BlockItem[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Block Timeline — Today</h3>
        <span className="text-[10px] text-gray-400">Click a block to open detail</span>
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
function BlockDetailContent({ block, onApprove }: { block: BlockItem; onApprove: () => void }) {
  const [showOptDetails, setShowOptDetails] = useState(false);

  const jobs: Record<string, { dept: string; type: string; asset: string; duration: string }[]> = {
    'BR-00231': [
      { dept: 'Engineering', type: 'Rail Grinding', asset: 'A-TR02-144', duration: '90 min' },
      { dept: 'S&T', type: 'Signal Inspection', asset: 'SIG-TR02-14A', duration: '30 min' },
    ],
    'BR-00232': [{ dept: 'Traction', type: 'OHE Inspection', asset: 'OHE-TR02-K142', duration: '60 min' }],
    'BR-00235': [
      { dept: 'Engineering', type: 'Track Inspection', asset: 'A-TR04-088', duration: '60 min' },
      { dept: 'S&T', type: 'Relay Room Maint.', asset: 'RR-TR04-02', duration: '45 min' },
    ],
  };

  const blockJobs = jobs[block.id] || [{ dept: 'Engineering', type: 'Maintenance Work', asset: `Asset-${block.track}`, duration: block.duration }];

  const reasons = [
    'Compatible maintenance — same track section',
    'Timing compatible with train schedule gaps',
    'Safety buffer requirements satisfied',
    'No resource conflict detected',
    `${block.affectedTrains > 0 ? block.affectedTrains + ' train(s) affected — rerouting options available' : 'No train conflicts detected'}`,
  ];

  const canApprove = block.status === 'AI-OPTIMIZED' || block.status === 'PROPOSED';

  return (
    <div className="space-y-4 text-[12px]">
      {/* Header info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-mono font-bold text-[16px] text-gray-900">{block.id}</h2>
            <StatusBadge status={block.status} size="md" />
          </div>
          <p className="text-gray-500">{block.track} · {block.section}</p>
          <p className="font-mono font-semibold text-gray-700 mt-0.5">{block.timeWindow} · {block.duration}</p>
        </div>
      </div>

      {/* Status */}
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-900 text-[11px] font-medium">
        Status: Awaiting human approval before this possession can be activated.
      </div>

      {/* Jobs */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Jobs Included ({blockJobs.length})</h4>
        <div className="space-y-2">
          {blockJobs.map((job, i) => (
            <div key={i} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={clsx('w-2 h-2 rounded-full', DEPT_COLORS[job.dept.slice(0, 3)] || 'bg-gray-400')} />
                <span className="font-semibold text-gray-800">{job.type}</span>
              </div>
              <p className="text-gray-500 text-[10px] ml-4">{job.dept} · Asset: {job.asset} · Duration: {job.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resources</h4>
        <div className="flex gap-3">
          <div className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
            <Users className="w-3.5 h-3.5 mx-auto text-gray-400 mb-1" />
            <p className="font-bold text-gray-800">11</p>
            <p className="text-[10px] text-gray-400">Workers</p>
          </div>
          <div className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
            <Settings className="w-3.5 h-3.5 mx-auto text-gray-400 mb-1" />
            <p className="font-bold text-gray-800">2</p>
            <p className="text-[10px] text-gray-400">Machines</p>
          </div>
          <div className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
            <Clock className="w-3.5 h-3.5 mx-auto text-gray-400 mb-1" />
            <p className="font-bold text-gray-800">+6 min</p>
            <p className="text-[10px] text-gray-400">Est. delay</p>
          </div>
        </div>
      </div>

      {/* Why this block */}
      <div>
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Why This Block?</h4>
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Details (expandable) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowOptDetails(!showOptDetails)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span>Optimization Details (CP-SAT)</span>
          {showOptDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showOptDetails && (
          <div className="p-3 space-y-1.5 text-[11px] text-gray-600">
            <p className="font-semibold text-gray-700 mb-1.5">Hard Constraints Satisfied:</p>
            {['Track availability verified', 'Safety buffer applied (5 min)', 'Resource availability confirmed', 'No maintenance dependency violations', 'Train conflict minimized'].map((c, i) => (
              <div key={i} className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-500" />{c}</div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {canApprove && (
        <div className="flex gap-2 pt-2">
          <button className="flex-1 text-[12px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg transition-colors">
            Modify
          </button>
          <button className="flex-1 text-[12px] font-semibold border border-red-200 text-red-700 hover:bg-red-50 py-2.5 rounded-lg transition-colors">
            Reject
          </button>
          <button
            onClick={onApprove}
            className="flex-2 text-[12px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-lg transition-colors"
          >
            ✓ Approve Block
          </button>
        </div>
      )}
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
        <p className="text-gray-500 text-[11px]">Asset: {job.asset} · Duration: {job.estimatedDuration} min</p>
        {job.overdueDays > 0 && (
          <p className="text-red-700 text-[11px] font-bold mt-1">⚠ {job.overdueDays} days overdue</p>
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
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why this job */}
      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5">Why This Job?</p>
        <p className="text-emerald-800 leading-relaxed">{job.notes}</p>
      </div>

      {/* Compatible work */}
      {compatibleJob && (
        <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-2">Compatible Work Found</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 p-2 bg-white border border-emerald-200 rounded text-center">
              <p className="font-bold text-gray-800 text-[11px]">{job.id}</p>
              <p className="text-[10px] text-gray-500">{job.department}</p>
            </div>
            <span className="text-emerald-600 font-bold">+</span>
            <div className="flex-1 p-2 bg-white border border-emerald-200 rounded text-center">
              <p className="font-bold text-gray-800 text-[11px]">{compatibleJob.id}</p>
              <p className="text-[10px] text-gray-500">{compatibleJob.dept}</p>
            </div>
          </div>
          <div className="space-y-1 text-[10px] text-emerald-700 mb-2">
            {['Spatial overlap', 'Timing compatible', 'Safety conditions satisfied', 'No resource conflict'].map((r, i) => (
              <div key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />{r}</div>
            ))}
          </div>
          <p className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Compatibility is a candidate only. CP-SAT determines final scheduling.
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
});

export default function Plan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'maintenance' | 'blocks') || 'maintenance';

  const setTab = (tab: 'maintenance' | 'blocks') => {
    setSearchParams({ view: tab });
  };

  // Maintenance state
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedJob, setSelectedJob] = useState<MaintenanceJob | null>(null);

  // Blocks state
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const data = await blocksApi.getBlocks();
        setBlocks(data.map(mapApiBlockToBlockItem));
      } catch (e) {
        setBlocks(BLOCKS_DATA);
      }
    };
    fetchBlocks();
  }, []);

  const [selectedBlock, setSelectedBlock] = useState<BlockItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizerStep, setOptimizerStep] = useState(-1);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    priorityApi.getScores().then(data => {
      setJobs(data);
      if (data.length > 0) setSelectedJob(data[0]);
      setJobsLoading(false);
    }).catch(() => setJobsLoading(false));
  }, []);

  const filteredJobs = jobs.filter(j => deptFilter === 'ALL' || j.department === deptFilter);
  const filteredBlocks = blocks.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.id.toLowerCase().includes(q) || b.track.toLowerCase().includes(q) || b.section.toLowerCase().includes(q);
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
    toast.success('CP-SAT Optimization Complete', { description: 'Generated 6 optimal possession blocks.' });
  };

  const handleApproveBlock = async () => {
    setActionLoading(true);
    try {
      await approvalsApi.approve('APV-001');
      toast.success(`✓ Block ${selectedBlock?.id} Approved`, {
        description: 'Schedule committed. Rerouting orders issued.',
      });
      
      if (selectedBlock) {
        setBlocks(prev => prev.map(b => b.id === selectedBlock.id ? { ...b, status: 'APPROVED' } : b));
      }
      
      setShowApproveDialog(false);
      setSelectedBlock(null);
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadgeColor: Record<string, string> = {
    'AI-OPTIMIZED': 'text-emerald-700 bg-emerald-50 border-emerald-200',
    'PROPOSED': 'text-indigo-700 bg-indigo-50 border-indigo-200',
    'APPROVED': 'text-green-700 bg-green-50 border-green-200',
    'PROVISIONAL': 'text-yellow-700 bg-yellow-50 border-yellow-200',
    'DEMANDED': 'text-gray-600 bg-gray-50 border-gray-200',
  };

  return (
    <div className="h-full overflow-auto bg-[#F4F5F7]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Plan</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">Maintenance scheduling · Block planning · CP-SAT optimization</p>
          </div>
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {(['maintenance', 'blocks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={clsx(
                  'px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all capitalize',
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab === 'maintenance' ? 'Maintenance' : 'Blocks & Gantt'}
              </button>
            ))}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2">
            {activeTab === 'blocks' && (
              <button
                onClick={handleRunOptimizer}
                disabled={optimizing}
                className="flex items-center gap-1.5 text-[12px] font-semibold border border-gray-300 bg-white hover:border-emerald-500 hover:text-emerald-700 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                  {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Settings className="w-3.5 h-3.5" />}
                  {optimizing ? 'Running...' : 'Run CP-SAT'}
                </button>
            )}
            <button
              onClick={() => navigate('/requests')}
              className="flex items-center gap-1.5 text-[12px] font-bold bg-[#1B6B45] hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Optimizer progress */}
      {optimizing && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5">
          <div className="max-w-[1600px] mx-auto flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">CP-SAT Solver Active</span>
            </div>
            {OPTIMIZER_STEPS.map((step, i) => (
              <div key={step} className={clsx(
                'flex items-center gap-1.5 text-[11px]',
                i < optimizerStep ? 'text-emerald-600 font-semibold' : i === optimizerStep ? 'text-emerald-800 font-bold' : 'text-gray-400'
              )}>
                {i < optimizerStep ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current inline-block" />}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto p-5">
        {/* ─── MAINTENANCE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'maintenance' && (
          <div>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Open Jobs', value: '12', sub: 'Awaiting scheduling', icon: Layers, color: 'text-gray-800', bg: 'bg-white border-gray-200' },
                { label: 'Overdue', value: '3', sub: 'High priority escalation', icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
                { label: 'Scheduled', value: '8', sub: 'In active plan', icon: Calendar, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
                { label: 'Completed', value: '126', sub: 'Past 30 days', icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
              ].map(kpi => (
                <div key={kpi.label} className={clsx('border rounded-lg p-3.5', kpi.bg)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                      <p className={clsx('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
                    </div>
                    <kpi.icon className={clsx('w-4 h-4 flex-shrink-0', kpi.color)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] text-gray-500 font-medium">Filter:</span>
              {['ALL', 'Engineering', 'S&T', 'Traction'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={clsx(
                    'px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors',
                    deptFilter === dept
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {dept === 'ALL' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

            {/* Job list */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Priority Queue — Weighted Scoring Engine (MAUT)
                </p>
              </div>
              {jobsLoading ? (
                <div className="p-8 text-center text-gray-400 text-[12px]">Loading priority scores...</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredJobs.map(job => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={clsx(
                          'px-4 py-3 cursor-pointer flex items-center justify-between gap-4 transition-colors',
                          isSelected ? 'bg-emerald-50 border-l-2 border-emerald-600' : 'hover:bg-gray-50 border-l-2 border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="text-right flex-shrink-0 w-10">
                            <span className="text-[10px] text-gray-400 block">Score</span>
                            <span className="font-mono font-bold text-[14px] text-gray-900">{job.priorityScore}</span>
                          </div>
                          <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-[12px] text-gray-900">{job.id}</span>
                              <span className="text-[11px] font-medium text-gray-700">{job.maintenanceType}</span>
                              <span className="font-bold text-[11px] text-emerald-800">· {job.track}</span>
                              {job.overdueDays > 0 && (
                                <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200">
                                  {job.overdueDays}d OVERDUE
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {job.department} · {job.asset} · {job.estimatedDuration} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <PriorityBadge priority={job.priority} />
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5"
                          >
                            Detail <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredJobs.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-[12px]">No jobs found for selected department.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── BLOCKS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            {/* Block KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Blocks', value: '6', sub: 'Today' },
                { label: 'Optimized', value: '4', sub: '67% of total' },
                { label: 'Trains Affected', value: '4', sub: 'Of 32 evaluated' },
                { label: 'Avg Delay', value: '+6 min', sub: '↓57% vs manual' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white border border-gray-200 rounded-lg p-3.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-[10px] text-gray-400">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Gantt */}
            <BlockGantt
              blocks={filteredBlocks}
              selectedId={selectedBlock?.id || ''}
              onSelect={(id) => setSelectedBlock(blocks.find(b => b.id === id) || null)}
            />

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[300px] bg-gray-50 border border-gray-200 rounded px-3 py-1.5 focus-within:border-emerald-500 transition-colors">
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

            {/* Block list */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 text-left">
                    <th className="py-2.5 px-4 font-semibold">BLOCK</th>
                    <th className="py-2.5 px-4 font-semibold">SECTION</th>
                    <th className="py-2.5 px-4 font-semibold">WINDOW</th>
                    <th className="py-2.5 px-4 font-semibold">DEPARTMENT</th>
                    <th className="py-2.5 px-4 font-semibold">STATUS</th>
                    <th className="py-2.5 px-4 font-semibold">IMPACT</th>
                    <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBlocks.map(block => {
                    const isSelected = selectedBlock?.id === block.id;
                    return (
                      <tr
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        className={clsx(
                          'cursor-pointer transition-colors',
                          isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-gray-900">{block.id}</span>
                          <span className="block text-[10px] text-gray-400">{block.jobs}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-gray-700">{block.track}</span>
                          <span className="block text-[10px] text-gray-400">{block.section}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-700">{block.timeWindow}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {block.departments.map(d => (
                              <span key={d} className="text-[9px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{d}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={block.status} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          {block.affectedTrains > 0 ? (
                            <span className="text-amber-700 font-semibold">{block.affectedTrains} train{block.affectedTrains > 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-green-700">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}
                            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800"
                          >
                            Open →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
          <BlockDetailContent
            block={selectedBlock}
            onApprove={() => setShowApproveDialog(true)}
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
