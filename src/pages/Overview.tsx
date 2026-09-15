import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import GanttChart from '../components/gantt/GanttChart';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingState from '../components/common/LoadingState';
import { overviewApi, approvalsApi } from '../api';
import type { MaintenanceJob, OptimizedBlock, Train } from '../types';
import trainBannerImg from '../assets/train_banner.jpg';
import {
  AlertTriangle, Wrench, Calendar, Train as TrainIcon, Link2,
  ChevronRight, ArrowRight, CheckCircle2,
  Database, MapPin, Clock, Users, Zap,
  Sparkles, Info, Check, ArrowDown, ChevronDown, Bell,
  BarChart3, Activity, AlertOctagon, CheckSquare, Radio
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const HORIZONS = ['Today', 'This Week', 'This Month', '52-Week Plan'] as const;

const PRIORITY_JOBS = [
  { rank: 1, id: 'TRD-3094', asset: 'OHE-142-05', dept: 'TRD', risk: '0.90', overdue: '5 d', action: 'Block Today', actionStyle: 'bg-red-500 hover:bg-red-600 text-white', riskColor: 'text-red-600', overdueColor: 'text-red-600' },
  { rank: 2, id: 'ENG-1042', asset: 'Rail-142-03', dept: 'ENG', risk: '0.84', overdue: '7 d', action: 'Bundle', actionStyle: 'bg-orange-100 hover:bg-orange-200 text-orange-700', riskColor: 'text-red-600', overdueColor: 'text-red-600' },
  { rank: 3, id: 'SNT-2081', asset: 'SIG-142-06', dept: 'S&T', risk: '0.78', overdue: '3 d', action: 'Bundle', actionStyle: 'bg-orange-100 hover:bg-orange-200 text-orange-700', riskColor: 'text-red-600', overdueColor: 'text-red-600' },
  { rank: 4, id: 'TRD-3110', asset: 'OHE-143-01', dept: 'TRD', risk: '0.72', overdue: '2 d', action: 'Schedule', actionStyle: 'bg-amber-100 hover:bg-amber-200 text-amber-800', riskColor: 'text-amber-600', overdueColor: 'text-amber-600' },
  { rank: 5, id: 'ENG-1187', asset: 'Track-145-02', dept: 'ENG', risk: '0.68', overdue: '1 d', action: 'Schedule', actionStyle: 'bg-amber-100 hover:bg-amber-200 text-amber-800', riskColor: 'text-amber-600', overdueColor: 'text-amber-600' },
  { rank: 6, id: 'SNT-2201', asset: 'LC-143-04', dept: 'S&T', risk: '0.66', overdue: '4 d', action: 'Review', actionStyle: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200', riskColor: 'text-slate-600', overdueColor: 'text-red-600' },
  { rank: 7, id: 'TRD-2991', asset: 'SSP-141-03', dept: 'TRD', risk: '0.61', overdue: '2 d', action: 'Review', actionStyle: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200', riskColor: 'text-slate-600', overdueColor: 'text-amber-600' },
];

const DATA_SOURCES = [
  { name: 'TMS', status: 'Connected', lastSync: '2 min ago', records: '428', isLive: false },
  { name: 'SMMS', status: 'Connected', lastSync: '3 min ago', records: '312', isLive: false },
  { name: 'TDMS', status: 'Connected', lastSync: '2 min ago', records: '276', isLive: false },
  { name: 'BDMS', status: 'Connected', lastSync: '1 min ago', records: '184', isLive: false },
  { name: 'COA', status: 'Live', lastSync: '30 sec ago', records: '—', isLive: true },
  { name: 'Timetable', status: 'Updated', lastSync: 'Today', records: '1,248', isLive: false, isAmber: true },
  { name: 'Goods Forecast', status: 'Updated', lastSync: '20 min ago', records: '856', isLive: false, isAmber: true },
];

export default function Overview() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>('Today');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  useEffect(() => {
    overviewApi.getDashboardData().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    });
  }, []);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approvalsApi.approve('APV-001');
      toast.success('✓ Block TR-02 Approved Successfully', {
        description: 'Schedule committed. Train rerouting orders issued for 4 affected trains.',
      });
      setShowApproveDialog(false);
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading AI Block Planning Command Center..." />;
  if (!data) return null;

  const { allBlocks, allTrains } = data;

  return (
    <div className="p-4 sm:p-5 max-w-[1760px] mx-auto space-y-4 bg-[#F8FAFC] min-h-screen">

      {/* ══════════════════════════════════════════════════════════════════════════
          1. DASHBOARD HEADER BANNER (Single Unified Command Center Header)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-r from-[#EBF3FC] via-[#EDF4FC] to-[#F1F6FD] border border-blue-100/80 rounded-2xl p-5 shadow-sm overflow-hidden">
        
        {/* Background Train Banner Graphic (Vande Bharat on Western Ghats) */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-full md:w-[62%] pointer-events-none opacity-25 md:opacity-90 mix-blend-multiply"
          style={{
            backgroundImage: `url(${trainBannerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,1) 100%)',
          }}
        />

        {/* Top Header Row: Title & Subtitle + Date, Live Alerts & Avatar */}
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-black text-[#0B2144] tracking-tight leading-none">
              AI BLOCK PLANNING COMMAND CENTER
            </h1>
            <p className="text-[13px] text-blue-900/70 font-semibold mt-1.5">
              Maximize Asset Availability for Train Operations
            </p>
          </div>

          {/* Right Header: Slogan + Quick Alerts + Date/Time & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Tagline text matching screenshot */}
            <div className="hidden 2xl:block text-right pr-1">
              <span className="text-[13px] font-serif italic text-blue-950 font-medium tracking-wide drop-shadow-sm opacity-85">
                Connecting Bharat • Enabling Tomorrow
              </span>
            </div>

            {/* Quick alert pills for controller */}
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-1.5 bg-red-50/90 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs transition-colors"
                title="View Critical Disruption Events"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                <span>3 Critical Issues</span>
              </button>
              <button
                onClick={() => navigate('/approvals')}
                className="flex items-center gap-1.5 bg-amber-50/90 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs transition-colors"
                title="View Pending Block Approvals"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>2 Approvals Pending</span>
              </button>
            </div>

            {/* Live Clock & Profile Card */}
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-white/70 px-3.5 py-1.5 rounded-xl shadow-xs">
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                  Sun, 27 Aug 2026
                </p>
                <p className="text-[11px] font-mono font-bold text-blue-950 leading-tight">
                  {timeFormatted}
                </p>
              </div>

              {/* Notification Bell with red badge 1 */}
              <button
                onClick={() => navigate('/events')}
                className="relative cursor-pointer hover:opacity-80 transition-opacity p-1 text-slate-700 hover:text-blue-900"
                title="1 Urgent Notification"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute 0 top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  1
                </span>
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
                <div className="w-7 h-7 rounded-full bg-[#0F2240] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  RS
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <p className="text-[11px] font-bold text-slate-900">R. Sharma</p>
                  <p className="text-[9px] text-slate-500 font-medium">Section Controller</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-bar: Location Pill + Horizon Tabs + Dropdowns */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-blue-200/50">
          
          {/* Location Badge */}
          <div className="flex items-center gap-2 bg-white/80 border border-blue-200/70 text-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-[#0F2240]">Pune Division</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium text-[11px]">
              Pune – Lonavala – Karjat – Mumbai (Central Railway)
            </span>
          </div>

          {/* Planning Horizon Tabs (Center) */}
          <div className="flex items-center bg-white/70 p-0.5 rounded-lg border border-blue-200/70 shadow-xs">
            {HORIZONS.map((h) => {
              const active = horizon === h;
              return (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={clsx(
                    'px-3.5 py-1 text-xs font-semibold rounded-md transition-all',
                    active
                      ? 'bg-[#0F2240] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F2240] hover:bg-white/50'
                  )}
                >
                  {h}
                </button>
              );
            })}
          </div>

          {/* Right Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Pune – Mumbai Corridor</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>27 Aug 2026</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. TOP KPI ROW — 6 Rounded Metric Cards with Circular Icon Badges
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Asset Availability */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Asset Availability
            </p>
            <p className="text-[22px] font-black font-mono text-[#0F2240] leading-tight">
              96.8%
            </p>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              ↑ +1.2% <span className="font-normal text-slate-500">from last week</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Critical Jobs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-[#EF4444] flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Critical Jobs
            </p>
            <p className="text-[22px] font-black font-mono text-[#0F2240] leading-tight">
              7
            </p>
            <p className="text-[10px] font-bold text-red-600 flex items-center gap-0.5 mt-0.5">
              ↑ 2 <span className="font-normal text-slate-500">new</span>
            </p>
          </div>
        </div>

        {/* KPI 3: Pending Maintenance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Maintenance
            </p>
            <p className="text-[22px] font-black font-mono text-[#0F2240] leading-tight">
              42
            </p>
            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 mt-0.5">
              ↓ 18% <span className="font-normal text-slate-500">from last week</span>
            </p>
          </div>
        </div>

        {/* KPI 4: Blocks Optimized */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Blocks Optimized
            </p>
            <p className="text-[22px] font-black font-mono text-[#0F2240] leading-tight">
              18
            </p>
            <p className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 mt-0.5">
              ↑ 6 <span className="font-normal text-slate-500">vs. previous period</span>
            </p>
          </div>
        </div>

        {/* KPI 5: Expected Train Delay */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <TrainIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expected Train Delay
            </p>
            <p className="text-[22px] font-black font-mono text-[#0F2240] leading-tight">
              37 min
            </p>
            <p className="text-[10px] font-bold text-purple-600 flex items-center gap-0.5 mt-0.5">
              ↓ 57% <span className="font-normal text-slate-500">vs. current plan</span>
            </p>
          </div>
        </div>

        {/* KPI 6: Integrated Blocks */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-full bg-[#06B6D4] flex items-center justify-center flex-shrink-0 shadow-sm text-white">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Integrated Blocks
            </p>
            <p className="text-[22px] font-black font-mono text-[#0F2240] leading-tight">
              8
            </p>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5">
              (Multi-department)
            </p>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. MIDDLE 3-COLUMN ROW
          [AI Priority Queue] | [AI Recommended Block] | [AI Optimization Impact]
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Column 1: AI PRIORITY QUEUE ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <h2 className="text-[13px] font-bold text-red-600 uppercase tracking-wider">
                  AI PRIORITY QUEUE
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                7 Critical Maintenance Jobs Require Attention
              </p>
            </div>
            <button
              onClick={() => navigate('/priority')}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 hover:underline"
            >
              View All Jobs <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2 px-3 w-7">#</th>
                  <th className="py-2 px-2">Job ID</th>
                  <th className="py-2 px-2">Asset / Location</th>
                  <th className="py-2 px-2">Dept</th>
                  <th className="py-2 px-2">Risk</th>
                  <th className="py-2 px-2">Overdue</th>
                  <th className="py-2 px-3 text-center">AI Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {PRIORITY_JOBS.map((j) => (
                  <tr 
                    key={j.id} 
                    onClick={() => navigate('/priority')}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-500">{j.rank}</td>
                    <td className="py-2 px-2 font-bold font-mono text-[#0F2240]">{j.id}</td>
                    <td className="py-2 px-2 text-slate-600 font-medium">{j.asset}</td>
                    <td className="py-2 px-2 font-semibold text-slate-700">{j.dept}</td>
                    <td className={clsx('py-2 px-2 font-mono font-bold', j.riskColor)}>
                      {j.risk}
                    </td>
                    <td className={clsx('py-2 px-2 font-semibold', j.overdueColor)}>
                      {j.overdue}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={clsx('inline-block text-[10px] font-bold px-2.5 py-0.5 rounded shadow-xs', j.actionStyle)}>
                        {j.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Column 2: AI RECOMMENDED BLOCK (TR-02) ───────────────────────── */}
        <div className="bg-white rounded-xl border border-blue-200/90 shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <h2 className="text-[13px] font-bold text-blue-700 uppercase tracking-wider">
                AI RECOMMENDED BLOCK
              </h2>
            </div>
            <span className="bg-[#10B981] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Recommended
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
            {/* Block identity */}
            <div>
              <h3 className="text-[20px] font-black text-[#0F2240] leading-tight">
                BLOCK TR-02
              </h3>
              <p className="text-[13px] text-slate-600 font-semibold mt-0.5">
                14:00 – 15:30 <span className="font-normal text-slate-500">(1h 30m)</span>
              </p>

              {/* Department tags inline */}
              <div className="flex items-center gap-1.5 text-xs font-bold mt-1.5">
                <span className="text-blue-600">Engineering</span>
                <span className="text-slate-400 font-normal">+</span>
                <span className="text-emerald-600">S&T</span>
                <span className="text-slate-400 font-normal">+</span>
                <span className="text-amber-600">TRD</span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium mt-1">
                3 jobs consolidated
              </p>

              {/* Job ID chips */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                  ENG-1042
                </span>
                <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                  SNT-2081
                </span>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                  TRD-3094
                </span>
              </div>
            </div>

            {/* Expected Impact List */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Expected Impact
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Asset downtime</span>
                </div>
                <span className="font-bold text-slate-900">90 min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <TrainIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Train delay</span>
                </div>
                <span className="font-bold text-emerald-600">+6 min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Jobs completed</span>
                </div>
                <span className="font-bold text-slate-900">3</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Separate blocks avoided</span>
                </div>
                <span className="font-bold text-emerald-600">2</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resource utilization</span>
                </div>
                <span className="font-bold text-emerald-600">86%</span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowApproveDialog(true)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Approve Plan</span>
              </button>
              <button
                onClick={() => navigate('/blocks/BR-00231')}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>View AI Reasoning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 3: AI OPTIMIZATION IMPACT ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <h2 className="text-[13px] font-bold text-blue-700 uppercase tracking-wider">
                AI OPTIMIZATION IMPACT
              </h2>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            {/* Side-by-side comparison */}
            <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
              {/* Current Railway Plan */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
                <p className="text-[11px] font-bold text-slate-700">Current Railway Plan</p>
                <p className="text-[11px] font-semibold text-slate-900 mt-1 mb-2">3 separate blocks</p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Engineering</span>
                    <span className="font-semibold text-slate-800">60 min</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>S&T</span>
                    <span className="font-semibold text-slate-800">45 min</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TRD</span>
                    <span className="font-semibold text-slate-800">60 min</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total possession</span>
                    <span className="font-bold text-slate-900">165 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Train impact</span>
                    <span className="font-bold text-slate-900">14 min</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-400 font-bold text-base">
                ➔
              </div>

              {/* AI Optimized Plan */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
                <p className="text-[11px] font-bold text-emerald-800">AI Optimized Plan</p>
                <p className="text-[11px] font-bold text-emerald-700 mt-1 mb-2">1 integrated block</p>
                <p className="text-[11px] font-medium text-emerald-900 mb-6">
                  Engineering + S&T + TRD
                </p>
                <div className="pt-2 border-t border-emerald-200/80 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Possession</span>
                    <span className="font-bold text-emerald-950">105 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Train impact</span>
                    <span className="font-bold text-emerald-950">6 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Summary row */}
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                Improvement
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Metric 1 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[16px] font-extrabold font-mono text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>36%</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    possession time
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5 text-[16px] font-extrabold font-mono text-emerald-600">
                    <ArrowDown className="w-4 h-4" />
                    <span>57%</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    estimated train delay
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5 text-[16px] font-extrabold font-mono text-emerald-600">
                    <ArrowDown className="w-4 h-4" />
                    <span>2</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    separate blocks avoided
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. BOTTOM 3-COLUMN ROW
          [Corridor Health] | [Train Impact Summary] | [Data Integration Status]
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Column 1: CORRIDOR HEALTH ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-[12px] font-bold text-[#0F2240] uppercase tracking-wider">
                CORRIDOR HEALTH
              </h3>
              <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                (Pune – Lonavala – Karjat – Mumbai)
              </span>
            </div>

            {/* Western Ghats Landscape & Track Visualization */}
            <div className="relative mt-5 pt-4 pb-2">
              {/* Silhouette of Ghats mountain ridge */}
              <svg className="absolute left-0 right-0 top-0 w-full h-12 text-slate-200/50 opacity-60 z-0 pointer-events-none" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path d="M0,45 Q50,20 90,38 T190,15 T290,32 T400,20 L400,60 L0,60 Z" fill="currentColor" />
              </svg>

              {/* Connected track line */}
              <div className="relative z-10 flex items-center justify-between px-6">
                <div className="absolute left-9 right-9 top-2.5 h-0.5 bg-slate-300 z-0" />

                {/* Pune */}
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setSelectedStation('Pune')}>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center shadow-xs" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5">Pune</p>
                  <p className="text-[13px] font-black font-mono text-emerald-600">96%</p>
                  <p className="text-[10px] font-semibold text-emerald-600">Good</p>
                </div>

                {/* Lonavala */}
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setSelectedStation('Lonavala')}>
                  <span className="w-5 h-5 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-200 flex items-center justify-center shadow-xs" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5">Lonavala</p>
                  <p className="text-[13px] font-black font-mono text-red-600">82%</p>
                  <p className="text-[10px] font-semibold text-red-600">Attention</p>
                </div>

                {/* Karjat */}
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setSelectedStation('Karjat')}>
                  <span className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-200 flex items-center justify-center shadow-xs" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5">Karjat</p>
                  <p className="text-[13px] font-black font-mono text-amber-600">91%</p>
                  <p className="text-[10px] font-semibold text-amber-600">Moderate</p>
                </div>

                {/* Mumbai */}
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setSelectedStation('Mumbai')}>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center shadow-xs" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5">Mumbai</p>
                  <p className="text-[13px] font-black font-mono text-emerald-600">97%</p>
                  <p className="text-[10px] font-semibold text-emerald-600">Good</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => toast.info('Corridor GIS Map View is being loaded...')}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              View on Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── Column 2: TRAIN IMPACT SUMMARY ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <TrainIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-[12px] font-bold text-[#0F2240] uppercase tracking-wider">
                TRAIN IMPACT SUMMARY
              </h3>
            </div>

            {/* 3 Metric counters */}
            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div>
                <p className="text-[26px] font-black font-mono text-slate-900 leading-none">
                  20
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Trains Evaluated
                </p>
              </div>

              <div>
                <p className="text-[26px] font-black font-mono text-red-600 leading-none">
                  4
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Trains Affected
                </p>
              </div>

              <div>
                <p className="text-[26px] font-black font-mono text-slate-900 leading-none">
                  6 min
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Total Delay
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('/trains')}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 text-[11px] font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              View Affected Trains <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Column 3: DATA INTEGRATION STATUS ─────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <h3 className="text-[12px] font-bold text-[#0F2240] uppercase tracking-wider">
                  DATA INTEGRATION STATUS
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Last synced: 2 min ago
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-semibold text-slate-400 uppercase">
                    <th className="py-1">Source</th>
                    <th className="py-1">Status</th>
                    <th className="py-1 text-center">Last Sync</th>
                    <th className="py-1 text-right">Records (Today)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {DATA_SOURCES.map((src) => (
                    <tr key={src.name} className="py-1 hover:bg-slate-50/50">
                      <td className="py-1 font-bold text-slate-800">{src.name}</td>
                      <td className="py-1">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          <span>{src.status}</span>
                        </span>
                      </td>
                      <td className="py-1 text-center text-slate-500">{src.lastSync}</td>
                      <td className="py-1 text-right font-mono text-slate-700">{src.records}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. TODAY'S OPTIMIZED BLOCK PLAN (GANTT WITH FOCUS WINDOW)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div>
        <GanttChart
          blocks={allBlocks}
          trains={allTrains}
          selectedBlockId="BR-00231"
          onBlockClick={(id) => navigate(`/blocks/${id}`)}
        />
      </div>

      {/* Approval Confirmation Dialog */}
      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve AI Recommended Block TR-02?"
        description="This commits Block TR-02 (14:00–15:30) across Engineering, S&T, and Traction departments. 4 trains will receive speed adjustment and platform holding orders."
        confirmLabel="Confirm & Issue Orders"
        loading={actionLoading}
      />

    </div>
  );
}
