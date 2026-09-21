import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import GanttChart from '../components/gantt/GanttChart';
import CorridorMap from '../components/network/CorridorMap';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingState from '../components/common/LoadingState';
import { overviewApi, approvalsApi } from '../api';
import type { MaintenanceJob, OptimizedBlock, Train } from '../types';
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
  recommendedBlock?: OptimizedBlock;
  allBlocks: OptimizedBlock[];
  allTrains: Train[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HORIZONS = ['Today', 'This Week', 'This Month', '52-Week Plan'] as const;

const PRIORITY_JOBS = [
  { rank: 1, id: 'TRD-3094', asset: 'OHE-142-05', dept: 'TRD', risk: '0.90', overdue: '5 d', action: 'Demand Block', actionStyle: 'bg-rose-50 border border-rose-200 text-rose-700', riskColor: 'text-rose-700', overdueColor: 'text-rose-700' },
  { rank: 2, id: 'ENG-1042', asset: 'Rail-142-03', dept: 'ENG', risk: '0.84', overdue: '7 d', action: 'Bundle', actionStyle: 'bg-blue-50 border border-blue-200 text-blue-800', riskColor: 'text-rose-700', overdueColor: 'text-rose-700' },
  { rank: 3, id: 'SNT-2081', asset: 'SIG-142-06', dept: 'S&T', risk: '0.78', overdue: '3 d', action: 'Bundle', actionStyle: 'bg-blue-50 border border-blue-200 text-blue-800', riskColor: 'text-amber-700', overdueColor: 'text-rose-700' },
  { rank: 4, id: 'TRD-3110', asset: 'OHE-143-01', dept: 'TRD', risk: '0.72', overdue: '2 d', action: 'Schedule', actionStyle: 'bg-slate-50 border border-slate-200 text-slate-700', riskColor: 'text-amber-700', overdueColor: 'text-amber-700' },
  { rank: 5, id: 'ENG-1187', asset: 'Track-145-02', dept: 'ENG', risk: '0.68', overdue: '1 d', action: 'Schedule', actionStyle: 'bg-slate-50 border border-slate-200 text-slate-700', riskColor: 'text-slate-600', overdueColor: 'text-amber-700' },
  { rank: 6, id: 'SNT-2201', asset: 'LC-143-04', dept: 'S&T', risk: '0.66', overdue: '4 d', action: 'Review', actionStyle: 'bg-slate-50 border border-slate-200 text-slate-600', riskColor: 'text-slate-600', overdueColor: 'text-rose-700' },
  { rank: 7, id: 'TRD-2991', asset: 'SSP-141-03', dept: 'TRD', risk: '0.61', overdue: '2 d', action: 'Review', actionStyle: 'bg-slate-50 border border-slate-200 text-slate-600', riskColor: 'text-slate-600', overdueColor: 'text-amber-700' },
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

  if (loading) return <LoadingState message="Connecting to Central Railway Operations Feed..." />;
  if (!data) return null;

  const { allBlocks, allTrains } = data;

  return (
    <div className="p-4 sm:p-5 max-w-[1760px] mx-auto space-y-4 bg-[#F8FAFC] min-h-screen">

      {/* ══════════════════════════════════════════════════════════════════════════
          1. DASHBOARD HEADER BANNER (Enterprise Operations Command Strip)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-hidden">
        {/* Top railway green accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1B6B45] via-[#10B981] to-[#0D9488]" />

        {/* Top Header Row: Division Info + Title + Controller Status */}
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 border border-blue-200/90 text-[#1B6B45]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                CENTRAL RAILWAY
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nagpur & Pune Operational Division
              </span>
            </div>
            <h1 className="text-[22px] sm:text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">
              Block Planning Command Center
            </h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1">
              Multi-Department Maintenance Scheduling & Traffic Corridor Synchronization
            </p>
          </div>

          {/* Right Header: Alerts + Live Clock & Controller Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Quick alert pills for controller */}
            <div className="hidden xl:flex items-center gap-2">
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                title="View Critical Disruption Events"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>3 Critical Issues</span>
              </button>
              <button
                onClick={() => navigate('/blocks')}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                title="View Pending Block Approvals"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>2 Approvals Pending</span>
              </button>
            </div>

            {/* Live Clock & Profile Card */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs">
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                  Sun, 27 Aug 2026
                </p>
                <p className="text-[11px] font-mono font-bold text-slate-900 leading-tight">
                  {timeFormatted}
                </p>
              </div>

              {/* Notification Bell with badge */}
              <button
                onClick={() => navigate('/events')}
                className="relative cursor-pointer hover:opacity-80 transition-opacity p-1 text-slate-600 hover:text-slate-900"
                title="1 Urgent Notification"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  1
                </span>
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-[#0A3D80] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
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
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          
          {/* Location Badge */}
          <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/80 text-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#1B6B45] flex-shrink-0" />
            <span className="font-bold text-[#1B6B45]">Pune Division</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium text-[11px]">
              Pune – Lonavala – Karjat – CSMT Mumbai Corridor
            </span>
          </div>

          {/* Planning Horizon Tabs (Center) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shadow-xs">
            {HORIZONS.map((h) => {
              const active = horizon === h;
              return (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={clsx(
                    'px-3.5 py-1 text-xs font-semibold rounded-md transition-all',
                    active
                      ? 'bg-[#0A3D80] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#1B6B45] hover:bg-white'
                  )}
                >
                  {h}
                </button>
              );
            })}
          </div>

          {/* Right Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#1B6B45]" />
              <span>Pune – Mumbai Corridor</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>27 Aug 2026</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. TOP KPI ROW — High-Density Enterprise Metric Telemetry Cards
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Asset Availability */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Asset Availability
            </p>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-[#1B6B45] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[24px] font-extrabold font-mono text-slate-900 leading-tight">
            96.8%
          </p>
          <p className="text-[11px] font-semibold text-blue-700 flex items-center gap-0.5 mt-1">
            <span>↑ +1.2%</span>
            <span className="font-normal text-slate-500 ml-1">vs target 95%</span>
          </p>
        </div>

        {/* KPI 2: Critical Jobs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Critical Defects
            </p>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[24px] font-extrabold font-mono text-slate-900 leading-tight">
            7
          </p>
          <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-0.5 mt-1">
            <span>↑ 2 new</span>
            <span className="font-normal text-slate-500 ml-1">urgent attention</span>
          </p>
        </div>

        {/* KPI 3: Pending Maintenance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Backlog Jobs
            </p>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[24px] font-extrabold font-mono text-slate-900 leading-tight">
            42
          </p>
          <p className="text-[11px] font-semibold text-blue-700 flex items-center gap-0.5 mt-1">
            <span>↓ 18%</span>
            <span className="font-normal text-slate-500 ml-1">down from 51</span>
          </p>
        </div>

        {/* KPI 4: Blocks Optimized */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-teal-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Planned Possessions
            </p>
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[24px] font-extrabold font-mono text-slate-900 leading-tight">
            18
          </p>
          <p className="text-[11px] font-semibold text-teal-700 flex items-center gap-0.5 mt-1">
            <span>↑ 6 scheduled</span>
            <span className="font-normal text-slate-500 ml-1">this cycle</span>
          </p>
        </div>

        {/* KPI 5: Expected Train Delay */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Projected Delay
            </p>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-[#1B6B45] flex items-center justify-center">
              <TrainIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[24px] font-extrabold font-mono text-slate-900 leading-tight">
            37 min
          </p>
          <p className="text-[11px] font-semibold text-blue-700 flex items-center gap-0.5 mt-1">
            <span>↓ 57%</span>
            <span className="font-normal text-slate-500 ml-1">vs uncoordinated</span>
          </p>
        </div>

        {/* KPI 6: Integrated Blocks */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Integrated Bundles
            </p>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-[#1B6B45] flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[24px] font-extrabold font-mono text-slate-900 leading-tight">
            8
          </p>
          <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-0.5 mt-1">
            <span>Multi-Dept</span>
            <span className="font-normal text-slate-500 ml-1">ENG + S&T + TRD</span>
          </p>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. MIDDLE 3-COLUMN ROW
          [Maintenance Priority Queue] | [Recommended Possession Block] | [Optimization Impact Analysis]
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Column 1: MAINTENANCE PRIORITY QUEUE ──────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                  Maintenance Priority Queue
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                7 critical maintenance demands awaiting possession windows
              </p>
            </div>
            <button
              onClick={() => navigate('/priority')}
              className="text-[11px] text-[#1B6B45] hover:text-[#135F3A] font-semibold flex items-center gap-0.5 hover:underline"
            >
              View All Jobs <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-2 px-3 w-7">#</th>
                  <th className="py-2 px-2">Job ID</th>
                  <th className="py-2 px-2">Asset / Location</th>
                  <th className="py-2 px-2">Dept</th>
                  <th className="py-2 px-2">Risk</th>
                  <th className="py-2 px-2">Overdue</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {data?.priorityQueue?.map((j, idx) => {
                  const riskColor = j.priorityScore > 0.8 ? 'text-red-600' : (j.priorityScore > 0.6 ? 'text-amber-600' : 'text-slate-600');
                  const overdueColor = (j.overdueDays && j.overdueDays > 3) ? 'text-red-600' : 'text-amber-600';
                  const actionStyle = j.priorityScore > 0.8 ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700';
                  const actionText = j.priorityScore > 0.8 ? 'Block Today' : 'Bundle';
                  return (
                  <tr 
                    key={j.id} 
                    onClick={() => navigate('/priority')}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-500">{(j as any).rank}</td>
                    <td className="py-2 px-2 font-bold font-mono text-[#1B6B45]">{j.id}</td>
                    <td className="py-2 px-2 text-slate-600 font-medium">{j.asset}</td>
                    <td className="py-2 px-2 font-semibold text-slate-700">{j.department}</td>
                    <td className={clsx('py-2 px-2 font-mono font-bold', riskColor)}>
                      {j.priorityScore.toFixed(2)}
                    </td>
                    <td className={clsx('py-2 px-2 font-semibold', overdueColor)}>
                      {j.overdueDays || 0} d
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={clsx('inline-block text-[10px] font-semibold px-2 py-0.5 rounded', (j as any).actionStyle)}>
                        {(j as any).action}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Column 2: RECOMMENDED POSSESSION BLOCK (TR-02) ────────────────── */}
        <div className="bg-white rounded-xl border border-blue-200/90 shadow-xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1B6B45] flex-shrink-0" />
              <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                Recommended Possession Block
              </h2>
            </div>
            <span className="bg-blue-50 text-[#1B6B45] border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Optimal Window
            </span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
            {/* Block identity */}
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-[19px] font-extrabold text-[#1B6B45] leading-tight">
                  BLOCK TR-02
                </h3>
                <span className="text-[11px] font-medium text-slate-500">
                  Lonavala – Karjat Down Line
                </span>
              </div>
              <p className="text-[13px] text-slate-700 font-semibold mt-1">
                14:00 – 15:30 <span className="font-normal text-slate-500">(90 min possession)</span>
              </p>

              {/* Department tags */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  Engineering
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  S&T (Signal)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  TRD (OHE)
                </span>
              </div>

              {/* Job ID chips */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500 font-medium">Bundled Jobs:</span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  ENG-1042
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  SNT-2081
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  TRD-3094
                </span>
              </div>
            </div>

            {/* Expected Impact List */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Operational Synchronization
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Total track possession</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">90 min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <TrainIcon className="w-3.5 h-3.5 text-[#1B6B45]" />
                  <span>Projected train delay</span>
                </div>
                <span className="font-bold text-blue-700 font-mono">+6 min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Maintenance jobs completed</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">3 jobs</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B6B45]" />
                  <span>Isolated block windows saved</span>
                </div>
                <span className="font-bold text-blue-700 font-mono">2 possessions</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <BarChart3 className="w-3.5 h-3.5 text-[#1B6B45]" />
                  <span>Corridor capacity utilization</span>
                </div>
                <span className="font-bold text-blue-700 font-mono">86%</span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowApproveDialog(true)}
                className="bg-[#0A3D80] hover:bg-[#135F3A] text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Approve Window</span>
              </button>
              <button
                onClick={() => navigate('/blocks/BR-00231')}
                className="border border-[#1B6B45] text-[#1B6B45] hover:bg-blue-50 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Optimization Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 3: OPERATIONAL IMPACT ANALYSIS ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#1B6B45] flex-shrink-0" />
              <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">
                Possession Optimization Analysis
              </h2>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            {/* Side-by-side comparison */}
            <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
              {/* Conventional Practice */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[11px] font-bold text-slate-800">Conventional Practice</p>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5 mb-2">3 separate possessions</p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-1 text-slate-600">
                    <span>Engineering</span>
                    <span className="font-semibold text-slate-800 font-mono">60 min</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-slate-600">
                    <span>S&T</span>
                    <span className="font-semibold text-slate-800 font-mono">45 min</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-slate-600">
                    <span>TRD</span>
                    <span className="font-semibold text-slate-800 font-mono">60 min</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-500">Total Possession</span>
                    <span className="font-bold text-slate-900 font-mono">165 min</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-500">Train Delay</span>
                    <span className="font-bold text-slate-900 font-mono">14 min</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center text-slate-400 font-bold text-base">
                ➔
              </div>

              {/* Synchronized Block */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3">
                <p className="text-[11px] font-bold text-blue-900">Synchronized Block</p>
                <p className="text-[11px] font-semibold text-blue-800 mt-0.5 mb-2">1 integrated window</p>
                <div className="space-y-1 text-[11px] mb-2 text-blue-800">
                  <p className="font-medium text-[11px] text-blue-900 leading-snug">
                    ENG + S&T + TRD Bundled
                  </p>
                  <p className="text-[10px] text-blue-700">Joint Corridor Possession</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-blue-200/80 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-blue-800">Possession</span>
                    <span className="font-bold text-emerald-950 font-mono">105 min</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-blue-800">Train Delay</span>
                    <span className="font-bold text-emerald-950 font-mono">6 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Summary row */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                Operational Gains
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Metric 1 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[16px] font-extrabold font-mono text-[#1B6B45]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>36%</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    possession saved
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5 text-[16px] font-extrabold font-mono text-[#1B6B45]">
                    <ArrowDown className="w-4 h-4" />
                    <span>57%</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    delay reduction
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5 text-[16px] font-extrabold font-mono text-[#1B6B45]">
                    <ArrowDown className="w-4 h-4" />
                    <span>2</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                    closures avoided
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
              <h3 className="text-[12px] font-bold text-[#1B6B45] uppercase tracking-wider">
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
                  <span className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center shadow-xs" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5">Pune</p>
                  <p className="text-[13px] font-black font-mono text-blue-600">96%</p>
                  <p className="text-[10px] font-semibold text-blue-600">Good</p>
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
                  <span className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center shadow-xs" />
                  <p className="text-[10px] font-bold text-slate-700 mt-1.5">Mumbai</p>
                  <p className="text-[13px] font-black font-mono text-blue-600">97%</p>
                  <p className="text-[10px] font-semibold text-blue-600">Good</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                document.getElementById('corridor-gis-map')?.scrollIntoView({ behavior: 'smooth' });
                toast.success('Navigated to Corridor GIS Network Map');
              }}
              className="border border-blue-600 text-blue-700 hover:bg-blue-50 text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              View GIS Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── Column 2: TRAIN IMPACT SUMMARY ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <TrainIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-[12px] font-bold text-[#1B6B45] uppercase tracking-wider">
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
                <h3 className="text-[12px] font-bold text-[#1B6B45] uppercase tracking-wider">
                  DATA INTEGRATION STATUS
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-blue-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
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
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
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
          4b. INTERACTIVE CORRIDOR GIS NETWORK MAP & BLOCK TELEMETRY
      ══════════════════════════════════════════════════════════════════════════ */}
      <div id="corridor-gis-map" className="scroll-mt-4">
        <CorridorMap />
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
        title="Approve Recommended Possession Block TR-02?"
        description="This commits Block TR-02 (14:00–15:30) across Engineering, S&T, and Traction departments. 4 trains will receive speed adjustment and platform holding orders."
        confirmLabel="Confirm & Issue Orders"
        loading={actionLoading}
      />

    </div>
  );
}
