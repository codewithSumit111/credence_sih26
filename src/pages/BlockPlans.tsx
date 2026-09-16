import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  Calendar, Clock, Train as TrainIcon, Users, CheckCircle2,
  Hourglass, Search, RotateCcw, ChevronDown, Check, X,
  Plus, Settings, Layers, ShieldCheck, FileText, Loader2,
  ChevronUp
} from 'lucide-react';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { blocksApi, approvalsApi } from '../api';

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
  {
    id: 'BR-00231',
    track: 'TR-02',
    section: 'NGP-BSL',
    timeWindow: '14:00 – 15:30',
    startTime: '14:00',
    endTime: '15:30',
    duration: '90 min',
    departments: ['ENG', 'S&T', 'TRD'],
    jobs: '3 (Bundled)',
    jobCount: 3,
    priority: 'HIGH',
    status: 'AI-OPTIMIZED',
    affectedTrains: 3,
  },
  {
    id: 'BR-00232',
    track: 'TR-04',
    section: 'NGP-WR',
    timeWindow: '16:10 – 17:00',
    startTime: '16:10',
    endTime: '17:00',
    duration: '50 min',
    departments: ['TRD'],
    jobs: '1',
    jobCount: 1,
    priority: 'MEDIUM',
    status: 'PROPOSED',
    affectedTrains: 1,
  },
  {
    id: 'BR-00237',
    track: 'TR-07',
    section: 'WR-AKO',
    timeWindow: '19:00 – 19:45',
    startTime: '19:00',
    endTime: '19:45',
    duration: '45 min',
    departments: ['ENG'],
    jobs: '1',
    jobCount: 1,
    priority: 'LOW',
    status: 'APPROVED',
    affectedTrains: 0,
  },
  {
    id: 'BR-00235',
    track: 'TR-04',
    section: 'NGP-WR',
    timeWindow: '04:00 – 05:30',
    startTime: '04:00',
    endTime: '05:30',
    duration: '90 min',
    departments: ['ENG', 'S&T'],
    jobs: '2 (Bundled)',
    jobCount: 2,
    priority: 'MEDIUM',
    status: 'PROVISIONAL',
    affectedTrains: 0,
  },
  {
    id: 'BR-00241',
    track: 'TR-07',
    section: 'WR-AKO',
    timeWindow: '02:00 – 05:00',
    startTime: '02:00',
    endTime: '05:00',
    duration: '180 min',
    departments: ['TRD'],
    jobs: '1',
    jobCount: 1,
    priority: 'LOW',
    status: 'DEMANDED',
    affectedTrains: 0,
  },
  {
    id: 'BR-00244',
    track: 'TR-01',
    section: 'NGP-WR',
    timeWindow: '10:30 – 11:45',
    startTime: '10:30',
    endTime: '11:45',
    duration: '75 min',
    departments: ['ENG'],
    jobs: '1',
    jobCount: 1,
    priority: 'MEDIUM',
    status: 'AI-OPTIMIZED',
    affectedTrains: 1,
  },
];

// 20 Trains on Corridor
const ALL_CORRIDOR_TRAINS = [
  { id: '12123', name: 'Deccan Queen', start: '08:00', end: '12:30', occStart: '', occEnd: '' },
  { id: '11008', name: 'Sinhagad Exp', start: '10:30', end: '15:00', occStart: '13:40', occEnd: '14:30' },
  { id: '22145', name: 'Kalyan SF', start: '12:30', end: '17:00', occStart: '16:00', occEnd: '16:50' },
  { id: '12127', name: 'Intercity Exp', start: '06:15', end: '09:45', occStart: '07:30', occEnd: '08:15' },
  { id: '12128', name: 'Pune CSMT', start: '17:30', end: '21:00', occStart: '18:15', occEnd: '19:00' },
  { id: '12111', name: 'Vidarbha Exp', start: '19:00', end: '23:30', occStart: '20:10', occEnd: '21:00' },
  { id: '12112', name: 'Sewagram Exp', start: '01:00', end: '05:30', occStart: '03:15', occEnd: '04:00' },
  { id: '12859', name: 'Gitanjali Exp', start: '05:45', end: '10:00', occStart: '06:30', occEnd: '07:15' },
  { id: '12860', name: 'Howrah Mail', start: '21:30', end: '02:00', occStart: '22:15', occEnd: '23:00' },
  { id: '11041', name: 'CSMT-PUNE', start: '14:15', end: '18:45', occStart: '15:30', occEnd: '16:15' },
  { id: '11042', name: 'PUNE-CSMT', start: '11:00', end: '15:15', occStart: '12:00', occEnd: '12:45' },
  { id: '22223', name: 'Vande Bharat', start: '06:00', end: '09:15', occStart: '07:00', occEnd: '07:45' },
  { id: '22224', name: 'Vande Bharat Return', start: '18:30', end: '21:45', occStart: '19:15', occEnd: '20:00' },
  { id: '12051', name: 'Jan Shatabdi', start: '05:00', end: '09:30', occStart: '06:00', occEnd: '06:45' },
  { id: '12052', name: 'Madgaon Return', start: '15:00', end: '19:30', occStart: '16:15', occEnd: '17:00' },
  { id: '17411', name: 'Mahalaxmi Exp', start: '20:30', end: '01:00', occStart: '21:15', occEnd: '22:00' },
  { id: '17412', name: 'Kolhapur Exp', start: '07:15', end: '11:45', occStart: '08:00', occEnd: '08:45' },
  { id: '12125', name: 'Pragati Exp', start: '16:30', end: '20:45', occStart: '17:15', occEnd: '18:00' },
  { id: '12126', name: 'Pragati Return', start: '07:45', end: '12:00', occStart: '08:30', occEnd: '09:15' },
  { id: '11007', name: 'Deccan Exp', start: '07:00', end: '11:30', occStart: '08:15', occEnd: '09:00' },
];

const OPTIMIZER_STEPS = [
  'Computing Weighted Priority Scores...',
  'Checking job compatibility & bundling...',
  'CP-SAT constraint solver running...',
  'Validating feasibility & safety margins...',
];

const GANTT_HOURS = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];

function timeToPct(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = 24 * 60;
  return ((h * 60 + (m || 0)) / totalMins) * 100;
}

function durationPct(startStr: string, endStr: string): number {
  const [h1, m1] = startStr.split(':').map(Number);
  const [h2, m2] = endStr.split(':').map(Number);
  const dur = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
  return Math.max(1, (dur / (24 * 60)) * 100);
}

export default function BlockPlans() {
  const navigate = useNavigate();
  const [blocksData, setBlocksData] = useState<BlockItem[]>(BLOCKS_DATA as any); // Fallback initially
  const [selectedId, setSelectedId] = useState<string>('BR-00231');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'trains' | 'reasoning'>('overview');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizerStep, setOptimizerStep] = useState(-1);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAllTrains, setShowAllTrains] = useState(false);

  // Fetch blocks from API
  const loadBlocks = async () => {
    try {
      const blocks = await blocksApi.getBlocks();
      if (blocks && blocks.length > 0) {
        // Map backend block format to BlockItem expected by UI if needed, 
        // or just use directly if the keys match closely enough.
        // For prototype, we ensure it has id, track, section, timeWindow, etc.
        const mapped = blocks.map(b => ({
          id: b.id,
          track: b.track || 'TR-01',
          section: b.section || 'NGP-WR',
          timeWindow: `${b.startTime} - ${b.endTime}`,
          startTime: b.startTime,
          endTime: b.endTime,
          duration: `${b.duration} min`,
          departments: b.departments || ['ENG'],
          jobs: b.jobIds ? (b.jobIds.length > 1 ? `${b.jobIds.length} (Bundled)` : '1') : '1',
          jobCount: b.jobIds ? b.jobIds.length : 1,
          priority: b.priority > 0.5 ? 'HIGH' : (b.priority > 0.3 ? 'MEDIUM' : 'LOW'),
          status: b.status || 'AI-OPTIMIZED',
          affectedTrains: b.trainImpact > 0 ? 1 : 0
        }));
        setBlocksData(mapped as any);
        if (mapped.length > 0) setSelectedId(mapped[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const selectedBlock = blocksData.find((b) => b.id === selectedId) || blocksData[0] || BLOCKS_DATA[0];

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    setOptimizerStep(0);
    try {
      for (let i = 0; i < OPTIMIZER_STEPS.length; i++) {
        await new Promise((res) => setTimeout(res, 600));
        setOptimizerStep(i + 1);
      }
      await blocksApi.optimizeWeekly();
      toast.success('CP-SAT Optimization Complete', {
        description: 'Generated 6 optimal possession blocks with minimal passenger disruption.',
      });
    } catch {
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
      setOptimizerStep(-1);
      // Refresh blocks after optimization
      await loadBlocks();
    }
  };

  const handleApproveBlock = async () => {
    setActionLoading(true);
    try {
      await approvalsApi.approve('APV-001');
      toast.success(`✓ Block ${selectedBlock.id} Approved`, {
        description: 'Schedule committed. Speed restrictions and crew dispatches scheduled.',
      });
      setShowApproveDialog(false);
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDeptFilter('ALL');
    setSectionFilter('ALL');
  };

  const filteredBlocks = blocksData.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (deptFilter !== 'ALL' && !b.departments.includes(deptFilter)) return false;
    if (sectionFilter !== 'ALL' && !b.section.includes(sectionFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.track.toLowerCase().includes(q) ||
        b.section.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayedTrains = showAllTrains ? ALL_CORRIDOR_TRAINS : ALL_CORRIDOR_TRAINS.slice(0, 3);

  return (
    <div className="p-4 sm:p-5 max-w-[1760px] mx-auto space-y-4 bg-[#F8FAFC] min-h-screen">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight leading-tight">
            BLOCK PLANS
          </h1>
          <p className="text-[13px] text-slate-500 font-normal mt-0.5">
            Plan, coordinate and monitor infrastructure possession blocks across Engineering, S&T and Traction
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunOptimizer}
            disabled={optimizing}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:border-blue-600 hover:bg-slate-50 text-slate-700 hover:text-blue-700 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            {optimizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Settings className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{optimizing ? 'Running Solver...' : 'Run CP-SAT Optimizer'}</span>
          </button>

          <button
            onClick={() => navigate('/requests/new')}
            className="flex items-center gap-1.5 bg-[#0F2240] hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Block Request</span>
          </button>
        </div>
      </div>

      {/* Optimizer Progress Toast/Banner */}
      {optimizing && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Google OR-Tools CP-SAT Solver Active
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {OPTIMIZER_STEPS.map((step, idx) => (
              <div
                key={step}
                className={clsx(
                  'flex items-center gap-2 p-2 rounded border text-xs',
                  idx < optimizerStep
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-medium'
                    : idx === optimizerStep
                    ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                    : 'bg-white border-slate-200 text-slate-400'
                )}
              >
                {idx < optimizerStep ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 text-center text-[9px] leading-3">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top 6 KPI Summary Row (Clean, Neutral, High Legibility) ──────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Blocks (Today)
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 leading-tight">
              6
            </p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
              ↑ 2 vs. previous day
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Possession Time
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 leading-tight">
              7h 55m
            </p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
              ↓ 28% vs. previous plan
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
            <TrainIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Trains Affected
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 leading-tight">
              4
            </p>
            <p className="text-[10px] font-normal text-slate-400 mt-0.5">
              (of 32 evaluated)
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Departments Involved
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 leading-tight">
              3
            </p>
            <p className="text-[10px] font-normal text-slate-400 mt-0.5">
              ENG • S&T • TRD
            </p>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Optimized Blocks
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 leading-tight">
              4
            </p>
            <p className="text-[10px] font-normal text-slate-400 mt-0.5">
              67% of total
            </p>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Avg. Delay (Affected)
            </p>
            <p className="text-xl font-bold font-mono text-slate-900 leading-tight">
              +6 min
            </p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
              ↓ 57% vs. previous plan
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters Bar (Clean & Professional) ───────────────────────────────── */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-[380px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:bg-white focus-within:border-blue-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Block ID, section, or keyword..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today • 27 Aug 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-slate-700 shadow-xs cursor-pointer hover:border-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AI-OPTIMIZED">AI-Optimized</option>
              <option value="PROPOSED">Proposed</option>
              <option value="APPROVED">Approved</option>
              <option value="PROVISIONAL">Provisional</option>
              <option value="DEMANDED">Demanded</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Department Dropdown */}
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-slate-700 shadow-xs cursor-pointer hover:border-slate-300 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="ENG">Engineering</option>
              <option value="S&T">S&T</option>
              <option value="TRD">Traction</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Section Dropdown */}
          <div className="relative">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-slate-700 shadow-xs cursor-pointer hover:border-slate-300 focus:outline-none"
            >
              <option value="ALL">All Sections</option>
              <option value="NGP-BSL">NGP-BSL</option>
              <option value="NGP-WR">NGP-WR</option>
              <option value="WR-AKO">WR-AKO</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Content Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">

        {/* ── Left Column (Tables & Gantt): 8 of 12 columns ─────────────────── */}
        <div className="xl:col-span-8 space-y-4">

          {/* Master Table Card: BLOCK SCHEDULE (6) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">
                BLOCK SCHEDULE ({filteredBlocks.length})
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any row or checkbox to inspect in detail
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">BLOCK ID</th>
                    <th className="py-2.5 px-3">SECTION / TRACK</th>
                    <th className="py-2.5 px-3">TIME WINDOW</th>
                    <th className="py-2.5 px-3">DEPARTMENTS</th>
                    <th className="py-2.5 px-3">JOBS</th>
                    <th className="py-2.5 px-3">PRIORITY</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-center">AFFECTED TRAINS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredBlocks.map((block) => {
                    const isSelected = selectedId === block.id;
                    return (
                      <tr
                        key={block.id}
                        onClick={() => setSelectedId(block.id)}
                        className={clsx(
                          'cursor-pointer transition-colors',
                          isSelected ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50/60'
                        )}
                      >
                        {/* Checkbox / selection indicator */}
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedId(block.id)}
                            className={clsx(
                              'w-4 h-4 rounded flex items-center justify-center border transition-all',
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white hover:border-slate-400'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </td>

                        {/* Block ID */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {block.id}
                        </td>

                        {/* Track / Section */}
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{block.track}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{block.section}</p>
                        </td>

                        {/* Time Window */}
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-slate-800">{block.timeWindow}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">({block.duration})</p>
                        </td>

                        {/* Departments (Neutral Gray Chips — NO Rainbow Colors) */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            {block.departments.map((d) => (
                              <span
                                key={d}
                                className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/90 px-1.5 py-0.5 rounded leading-none"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Jobs */}
                        <td className="py-2.5 px-3">
                          <span
                            className={clsx(
                              'text-[11px]',
                              block.jobs.includes('Bundled') ? 'text-slate-800 font-semibold' : 'text-slate-600'
                            )}
                          >
                            {block.jobs}
                          </span>
                        </td>

                        {/* Priority (Refined, Subtle) */}
                        <td className="py-2.5 px-3">
                          <span
                            className={clsx(
                              'text-[10px] font-semibold px-2 py-0.5 rounded border',
                              block.priority === 'HIGH' && 'bg-red-50 text-red-700 border-red-200',
                              block.priority === 'MEDIUM' && 'bg-amber-50 text-amber-700 border-amber-200',
                              block.priority === 'LOW' && 'bg-slate-50 text-slate-600 border-slate-200'
                            )}
                          >
                            {block.priority}
                          </span>
                        </td>

                        {/* Status (Refined, Subtle) */}
                        <td className="py-2.5 px-3">
                          <span
                            className={clsx(
                              'text-[10px] font-semibold px-2 py-0.5 rounded border',
                              block.status === 'AI-OPTIMIZED' && 'bg-blue-50/70 border-blue-200 text-blue-700',
                              block.status === 'PROPOSED' && 'bg-slate-100 border-slate-200 text-slate-700',
                              block.status === 'APPROVED' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
                              block.status === 'PROVISIONAL' && 'bg-amber-50 border-amber-200 text-amber-700',
                              block.status === 'DEMANDED' && 'bg-slate-50 border-slate-200 text-slate-500'
                            )}
                          >
                            {block.status}
                          </span>
                        </td>

                        {/* Affected Trains */}
                        <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-700">
                          {block.affectedTrains}
                        </td>

                        {/* Action Link */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/blocks/${block.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5 hover:underline"
                          >
                            <span>View</span>
                            <span>→</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gantt Timeline Card: CORRIDOR × TIME GANTT */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">
                  CORRIDOR × TIME GANTT
                </h3>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs">
                {/* View Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium">
                  <span>View: Departments + Key Trains</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Legend Badges */}
                <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                    AI-Optimized
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                    Approved
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                    Proposed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                    Provisional
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-200 border border-sky-300" />
                    Train Window
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Gantt Canvas */}
            <div className="overflow-x-auto relative">
              <div className="min-w-[840px] select-none pb-4">
                {/* Time Axis Header */}
                <div className="flex border-b border-slate-200 bg-slate-50/60 text-[10px] font-mono text-slate-500">
                  <div className="w-[140px] flex-shrink-0 px-3 py-1.5 border-r border-slate-200 font-sans font-bold uppercase tracking-wider text-slate-400">
                    Track / Train
                  </div>
                  <div className="flex-1 flex">
                    {GANTT_HOURS.map((h) => (
                      <div key={h} className="flex-1 text-center py-1.5 border-r border-slate-100">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical Gridlines & Red "Now" line */}
                <div className="absolute left-[140px] right-0 top-[28px] bottom-4 pointer-events-none z-0">
                  {GANTT_HOURS.map((h, i) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 w-px bg-slate-100"
                      style={{ left: `${(i / (GANTT_HOURS.length - 1)) * 100}%` }}
                    />
                  ))}

                  {/* Red 'Now' vertical line at ~21:00 */}
                  <div
                    className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-red-500 z-20"
                    style={{ left: '87.5%' }}
                  >
                    <span className="absolute bottom-0 -left-3.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      Now
                    </span>
                  </div>
                </div>

                {/* Gantt Row: Engineering */}
                <div className="flex border-b border-slate-100 h-10 items-center relative z-10 hover:bg-slate-50/40">
                  <div className="w-[140px] flex-shrink-0 px-3 flex items-center gap-2 border-r border-slate-200 bg-white">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Engineering</span>
                  </div>
                  <div className="flex-1 relative h-full">
                    {/* BR-00235 at 04:00-05:30 */}
                    <div
                      onClick={() => setSelectedId('BR-00235')}
                      className="absolute top-1.5 h-7 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ left: `${timeToPct('04:00')}%`, width: `${durationPct('04:00', '05:30')}%` }}
                    >
                      <span className="truncate px-1">BR-00235</span>
                    </div>

                    {/* BR-00231 at 14:00-15:30 */}
                    <div
                      onClick={() => setSelectedId('BR-00231')}
                      className="absolute top-1.5 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs ring-2 ring-white"
                      style={{ left: `${timeToPct('14:00')}%`, width: `${durationPct('14:00', '15:30')}%` }}
                    >
                      <span className="truncate px-1">BR-00231</span>
                    </div>

                    {/* BR-00237 at 19:00-19:45 */}
                    <div
                      onClick={() => setSelectedId('BR-00237')}
                      className="absolute top-1.5 h-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ left: `${timeToPct('19:00')}%`, width: `${durationPct('19:00', '20:15')}%` }}
                    >
                      <span className="truncate px-1">BR-00237</span>
                    </div>
                  </div>
                </div>

                {/* Gantt Row: S&T */}
                <div className="flex border-b border-slate-100 h-10 items-center relative z-10 hover:bg-slate-50/40">
                  <div className="w-[140px] flex-shrink-0 px-3 flex items-center gap-2 border-r border-slate-200 bg-white">
                    <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800">S&T</span>
                  </div>
                  <div className="flex-1 relative h-full">
                    {/* BR-00235 at 04:00-05:30 */}
                    <div
                      onClick={() => setSelectedId('BR-00235')}
                      className="absolute top-1.5 h-7 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ left: `${timeToPct('04:00')}%`, width: `${durationPct('04:00', '05:30')}%` }}
                    >
                      <span className="truncate px-1">BR-00235</span>
                    </div>

                    {/* BR-00231 at 14:00-15:30 */}
                    <div
                      onClick={() => setSelectedId('BR-00231')}
                      className="absolute top-1.5 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs ring-2 ring-white"
                      style={{ left: `${timeToPct('14:00')}%`, width: `${durationPct('14:00', '15:30')}%` }}
                    >
                      <span className="truncate px-1">BR-00231</span>
                    </div>
                  </div>
                </div>

                {/* Gantt Row: Traction (TRD) */}
                <div className="flex border-b border-slate-100 h-10 items-center relative z-10 hover:bg-slate-50/40">
                  <div className="w-[140px] flex-shrink-0 px-3 flex items-center gap-2 border-r border-slate-200 bg-white">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Traction (TRD)</span>
                  </div>
                  <div className="flex-1 relative h-full">
                    {/* BR-00241 at 02:00-05:00 */}
                    <div
                      onClick={() => setSelectedId('BR-00241')}
                      className="absolute top-1.5 h-7 rounded bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ left: `${timeToPct('02:00')}%`, width: `${durationPct('02:00', '05:00')}%` }}
                    >
                      <span className="truncate px-1">BR-00241</span>
                    </div>

                    {/* Proposed Block at 16:10-17:00 */}
                    <div
                      onClick={() => setSelectedId('BR-00232')}
                      className="absolute top-1.5 h-7 rounded bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ left: `${timeToPct('16:10')}%`, width: `${durationPct('16:10', '17:00')}%` }}
                    >
                      <span className="truncate px-1">BR-00232</span>
                    </div>
                  </div>
                </div>

                {/* ── Dynamic Train Rows (Expanded or Collapsed) ───────────────── */}
                {displayedTrains.map((train) => (
                  <div key={train.id} className="flex border-b border-slate-50 h-8 items-center relative z-10 hover:bg-slate-50/50">
                    <div className="w-[140px] flex-shrink-0 px-3 flex items-center gap-2 border-r border-slate-200 bg-white text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                      <span className="text-[11px] font-medium truncate" title={`${train.id} ${train.name}`}>
                        Train {train.id}
                      </span>
                    </div>
                    <div className="flex-1 relative h-full">
                      {/* Scheduled Window */}
                      <div
                        className="absolute top-2 h-3.5 rounded bg-sky-100 border border-sky-300 opacity-75"
                        style={{ left: `${timeToPct(train.start)}%`, width: `${durationPct(train.start, train.end)}%` }}
                        title={`Train ${train.id} ${train.name} (${train.start} - ${train.end})`}
                      />

                      {/* Active Occupation Block (if present) */}
                      {train.occStart && train.occEnd && (
                        <div
                          className="absolute top-1.5 h-4.5 rounded bg-slate-600 text-white text-[9px] font-bold px-1.5 flex items-center shadow-xs"
                          style={{ left: `${timeToPct(train.occStart)}%`, width: `${Math.max(4, durationPct(train.occStart, train.occEnd))}%` }}
                          title={`Block Occupation: ${train.occStart} - ${train.occEnd}`}
                        >
                          <span className="truncate">{train.id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Expand / Collapse Button for Trains */}
                <div className="px-3 pt-2">
                  <button
                    onClick={() => setShowAllTrains(!showAllTrains)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    {showAllTrains ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>− Collapse train schedule (showing all 20 trains)</span>
                      </>
                    ) : (
                      <>
                        <span>+ 17 more trains (click to expand full corridor schedule)</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column (Inspection Detail Panel): 4 of 12 columns ────────── */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between sticky top-4">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold text-slate-900 font-mono leading-none">
                  {selectedBlock.id}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-blue-50/80 border-blue-200 text-blue-700">
                  {selectedBlock.status}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-slate-100 border-slate-200 text-slate-700">
                  {selectedBlock.priority}
                </span>
              </div>

              <button
                onClick={() => setSelectedId('')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                title="Close inspection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <p>
                <span className="text-slate-400">Section:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedBlock.track} ({selectedBlock.section})</span>
              </p>
              <p>
                <span className="text-slate-400">Time:</span>{' '}
                <span className="font-semibold text-slate-800">{selectedBlock.timeWindow}</span>{' '}
                <span className="text-slate-500">({selectedBlock.duration})</span>
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4 mt-4 border-b border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={clsx(
                  'pb-2 transition-colors relative',
                  activeTab === 'overview'
                    ? 'text-blue-700 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={clsx(
                  'pb-2 transition-colors relative',
                  activeTab === 'jobs'
                    ? 'text-blue-700 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                Jobs ({selectedBlock.jobCount})
              </button>
              <button
                onClick={() => setActiveTab('trains')}
                className={clsx(
                  'pb-2 transition-colors relative',
                  activeTab === 'trains'
                    ? 'text-blue-700 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                Affected Trains ({selectedBlock.affectedTrains})
              </button>
              <button
                onClick={() => setActiveTab('reasoning')}
                className={clsx(
                  'pb-2 transition-colors relative',
                  activeTab === 'reasoning'
                    ? 'text-blue-700 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                AI Reasoning
              </button>
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-4 flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Jobs Consolidated</span>
                  </div>
                  <span className="font-bold text-slate-900">{selectedBlock.jobCount}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Departments</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {selectedBlock.departments.join(' + ')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Expected Delay</span>
                  </div>
                  <span className="font-semibold text-emerald-600">+6 min</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resources</span>
                  </div>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    11 Crew Available
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Status</span>
                  </div>
                  <span className="font-medium text-slate-800">
                    {selectedBlock.status === 'AI-OPTIMIZED'
                      ? 'AI-Optimized (Ready for Approval)'
                      : selectedBlock.status}
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-2 text-xs">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Consolidated Maintenance Tasks
                </p>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-0.5">
                  <div className="flex justify-between font-mono font-bold text-slate-800">
                    <span>ENG-1042</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 rounded font-sans">Engineering</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Rail fracture ultrasound testing • Track-142-03</p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-0.5">
                  <div className="flex justify-between font-mono font-bold text-slate-800">
                    <span>SNT-2081</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 rounded font-sans">S&T</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Point machine electronic calibration • SIG-142-06</p>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-0.5">
                  <div className="flex justify-between font-mono font-bold text-slate-800">
                    <span>TRD-3094</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 rounded font-sans">Traction</span>
                  </div>
                  <p className="text-[11px] text-slate-600">OHE 25kV catenary tensioning • OHE-142-05</p>
                </div>
              </div>
            )}

            {activeTab === 'trains' && (
              <div className="space-y-2 text-xs">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Affected Train Operations
                </p>
                <div className="p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-800">12123</span>
                    <span className="text-slate-500 ml-1.5">Deccan Queen</span>
                  </div>
                  <span className="font-semibold text-amber-600">+4 min</span>
                </div>
                <div className="p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-800">11008</span>
                    <span className="text-slate-500 ml-1.5">Sinhagad Express</span>
                  </div>
                  <span className="font-semibold text-amber-600">+2 min</span>
                </div>
                <div className="p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-800">22145</span>
                    <span className="text-slate-500 ml-1.5">Kalyan SF</span>
                  </div>
                  <span className="font-semibold text-emerald-600">0 min (Clear)</span>
                </div>
              </div>
            )}

            {activeTab === 'reasoning' && (
              <div className="space-y-2 text-xs text-slate-700">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  CP-SAT Decision Logic
                </p>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Optimal Slot: 14:00–15:30</p>
                  <p className="text-[11px] text-slate-600">
                    Corridor traffic reaches daily trough (2 trains/hr vs 8 peak). Eliminates need for 2 separate 60-min blocks.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Cross-Department Bundling</p>
                  <p className="text-[11px] text-slate-600">
                    Engineering and OHE crews share physical safety corridor, boosting labor efficiency to 86%.
                  </p>
                </div>
              </div>
            )}

            {/* ── Quick Actions ──────────────────────────────────────────────── */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Quick Actions
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="bg-[#0F2240] hover:bg-slate-800 text-white font-semibold text-xs py-2 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Approve Block</span>
                </button>

                <button
                  onClick={() => toast.info('Opening schedule modification window...')}
                  className="bg-white border border-slate-300 hover:border-blue-600 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-2 rounded-lg transition-colors shadow-xs text-center"
                >
                  Modify
                </button>

                <button
                  onClick={() => toast.error('Block proposal rejected. Re-running solver...')}
                  className="bg-white border border-slate-300 hover:border-red-400 hover:bg-red-50 text-slate-700 hover:text-red-600 font-semibold text-xs py-2 px-2 rounded-lg transition-colors shadow-xs text-center"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* ── IMPACT SUMMARY (2x2 Grid) ──────────────────────────────────── */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3">
                IMPACT SUMMARY
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1 */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <TrainIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-base font-bold font-mono text-slate-900 leading-none">
                      {selectedBlock.affectedTrains}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Trains Affected
                    </p>
                  </div>
                </div>

                {/* 2 */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-base font-bold font-mono text-slate-900 leading-none">
                      +6 min
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Total Delay
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-base font-bold font-mono text-slate-900 leading-none">
                      2
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Separate Blocks Avoided
                    </p>
                  </div>
                </div>

                {/* 4 */}
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold font-mono">%</span>
                  </div>
                  <div>
                    <p className="text-base font-bold font-mono text-slate-900 leading-none">
                      86%
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Resource Utilization
                    </p>
                  </div>
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
        onConfirm={handleApproveBlock}
        title={`Approve Block ${selectedBlock.id}?`}
        description={`This issues track possession authority on ${selectedBlock.track} (${selectedBlock.section}) between ${selectedBlock.timeWindow}. Operations will inform station masters at Wardha & Badnera.`}
        confirmLabel="Confirm & Issue Orders"
        loading={actionLoading}
      />
    </div>
  );
}
