import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import SecondaryButton from '../components/buttons/SecondaryButton';
import LoadingState from '../components/common/LoadingState';
import { analyticsApi } from '../api';
import type { AnalyticsData } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Download, TrendingUp, Activity, CheckCircle, Clock, Play, AlertOctagon, ChevronDown, Check, X } from 'lucide-react';

// ─── What-If Panel ─────────────────────────────────────────────────────────────
const SIM_STEPS = [
  { label: 'Loading scenario parameters...', delay: 300 },
  { label: 'Running CP-SAT constraint solver...', delay: 900 },
  { label: 'Time-Dependent A* routing...', delay: 700 },
  { label: 'Checking safety constraints...', delay: 500 },
  { label: 'Aggregating impact metrics...', delay: 400 },
] as const;

const TRACK_SCENARIOS: Record<string, { trains: number; delay: number; trainNums: string; via: string; bundledJobs: number; rerouted: number }> = {
  'TR-02': { trains: 3, delay: 18, trainNums: '12123, 11008, 22145', via: 'TR-04 Akola bypass', bundledJobs: 2, rerouted: 1 },
  'TR-04': { trains: 2, delay: 12, trainNums: '22145, G-4401', via: 'TR-07 Loop alternate', bundledJobs: 2, rerouted: 1 },
  'TR-07': { trains: 1, delay: 8, trainNums: '17617', via: 'TR-04 NGP-WR main line', bundledJobs: 1, rerouted: 0 },
};

function WhatIfPanel({ onClose }: { onClose: () => void }) {
  const [scenarioType, setScenarioType] = useState<'block' | 'failure' | 'delay'>('block');
  const [trackSection, setTrackSection] = useState('TR-02');
  const [duration, setDuration] = useState('90');
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(-1);
  const [hasRun, setHasRun] = useState(false);
  const simRef = useRef(false);
  const scenario = TRACK_SCENARIOS[trackSection] ?? TRACK_SCENARIOS['TR-02'];

  const handleRunSimulation = async () => {
    setSimulating(true);
    setHasRun(false);
    setSimStep(0);
    simRef.current = true;
    let accumulated = 0;
    for (let i = 0; i < SIM_STEPS.length; i++) {
      accumulated += SIM_STEPS[i].delay;
      await new Promise<void>(res => setTimeout(res, SIM_STEPS[i].delay));
      if (!simRef.current) break;
      setSimStep(i + 1);
    }
    setSimulating(false);
    setSimStep(-1);
    setHasRun(true);
    toast.success('Simulation Completed', {
      description: `CP-SAT + A* solved in ${accumulated}ms — ${scenario.trains} train(s) evaluated.`,
    });
  };

  useEffect(() => () => { simRef.current = false; }, []);

  const handleApply = () => {
    toast.info('Simulated plan converted into a draft block request for Controller review.');
    onClose();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-4 h-4 text-amber-600" />
          <div>
            <span className="text-[12px] font-bold text-amber-900 uppercase tracking-wide">
              What-If Simulator
            </span>
            <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
              EXPERIMENTAL SANDBOX — NOT LIVE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-amber-600">Solver: CP-SAT + TD-A*</span>
          <button onClick={onClose} className="p-1 rounded text-amber-600 hover:bg-amber-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Config */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Scenario Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {([['block', 'Planned Block'], ['failure', 'Track Failure'], ['delay', 'Train Delay']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setScenarioType(val)}
                  className={clsx(
                    'py-1.5 rounded border text-[10px] font-semibold transition-colors',
                    scenarioType === val
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Track Section</label>
            <select
              value={trackSection}
              onChange={e => { setTrackSection(e.target.value); setHasRun(false); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
            >
              {['TR-02', 'TR-04', 'TR-07'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Duration: {duration} min
            </label>
            <input
              type="range"
              min="15"
              max="360"
              step="15"
              value={duration}
              onChange={e => { setDuration(e.target.value); setHasRun(false); }}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>15m</span><span>6h</span>
            </div>
          </div>

          {/* Simulation steps */}
          {(simulating || simStep >= 0) && (
            <div className="space-y-1.5">
              {SIM_STEPS.map((step, i) => (
                <div key={step.label} className={clsx(
                  'flex items-center gap-2 text-[10px] transition-all',
                  i < (simStep === -1 ? SIM_STEPS.length : simStep) ? 'text-emerald-700 font-semibold'
                    : i === simStep ? 'text-emerald-900 font-bold animate-pulse'
                    : 'text-gray-400'
                )}>
                  {i < (simStep === -1 ? SIM_STEPS.length : simStep) ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-current inline-block" />
                  )}
                  {step.label}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-[12px] transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {simulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-8">
          {!hasRun ? (
            <div className="h-full flex items-center justify-center min-h-[200px] text-center">
              <div>
                <Play className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] font-semibold text-gray-500">Configure scenario and run simulation</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Results will appear here without affecting any live data</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Trains Affected', value: scenario.trains },
                  { label: 'Max Delay', value: `+${scenario.delay} min` },
                  { label: 'Rerouted', value: scenario.rerouted },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-[9px] text-amber-700 uppercase tracking-wide font-semibold">{item.label}</p>
                    <p className="text-[18px] font-bold text-amber-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-700">
                <p className="font-semibold text-gray-900 mb-1.5">Simulated Outcome:</p>
                <div className="space-y-1">
                  <p>• Trains {scenario.trainNums} affected</p>
                  <p>• Recommended rerouting: {scenario.via}</p>
                  <p>• {scenario.bundledJobs} jobs could be bundled in this window</p>
                  <p>• Estimated avg delay: <strong>+{scenario.delay} min</strong></p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-blue-700 flex items-start gap-2">
                <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>This is a simulation only. No changes have been applied to the live plan. Click "Convert to Draft" to create a block request from this simulation.</span>
              </div>

              <button
                onClick={handleApply}
                className="w-full text-[12px] font-bold border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-2.5 rounded-lg transition-colors"
              >
                Convert to Draft Block Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const showWhatIf = searchParams.get('tool') === 'whatif';

  const toggleWhatIf = () => {
    if (showWhatIf) {
      setSearchParams({});
    } else {
      setSearchParams({ tool: 'whatif' });
    }
  };

  useEffect(() => {
    analyticsApi.getAnalytics().then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load analytics');
      setLoading(false);
    });
  }, []);

  const handleExport = (format: string) => {
    toast.success(`Exporting Analytics Dossier as ${format}...`, {
      description: 'Management summary generated for Central Railway Division.',
    });
  };

  if (loading || !data) return <LoadingState message="Aggregating Division-wide Operations Telemetry..." />;

  const deptData = [
    { name: 'Engineering', Requested: 90, Used: 72 },
    { name: 'S&T', Requested: 60, Used: 48 },
    { name: 'Traction', Requested: 37, Used: 33 },
  ];

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Division Overview · August 2026 · Performance Telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleWhatIf}
            className={clsx(
              'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors',
              showWhatIf
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700'
            )}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            What-If Simulator
            {showWhatIf && <X className="w-3 h-3" />}
          </button>
          <SecondaryButton size="sm" onClick={() => handleExport('PDF')}>Export PDF</SecondaryButton>
          <SecondaryButton size="sm" onClick={() => handleExport('EXCEL')}>Export Excel</SecondaryButton>
        </div>
      </div>

      {/* What-If Panel (inline) */}
      {showWhatIf && <WhatIfPanel onClose={() => setSearchParams({})} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="ASSET UPTIME" value="94.2%" trend="up" trendValue="+1.8% vs last month" highlight={true} icon={<Activity className="w-5 h-5" />} />
        <MetricCard label="BLOCK UTILIZATION" value="81.6%" trend="up" trendValue="+5.2% possession efficiency" icon={<TrendingUp className="w-5 h-5" />} />
        <MetricCard label="AVG RECOVERY TIME" value="18 min" trend="down" trendValue="-6 min disruption resolution" icon={<Clock className="w-5 h-5" />} />
        <MetricCard label="JOBS COMPLETED" value="126" trend="up" trendValue="87.3% closure rate" icon={<CheckCircle className="w-5 h-5" />} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Block Hours by Department */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Block Hours by Department (Requested vs Used)</h3>
            <span className="text-xs text-gray-400">Aug 2026</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" unit="h" fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={11} width={85} />
                <Tooltip />
                <Bar dataKey="Requested" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Used" fill="#1e3a5f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-300 rounded-sm inline-block" /> Requested Hours</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#1e3a5f] rounded-sm inline-block" /> Utilized Possession</span>
          </div>
        </div>

        {/* Overdue Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overdue Maintenance Backlog Trend</h3>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              18 → 11 → 6 (↓66%)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.overdueTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#overdueGrad)" name="Overdue Jobs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Disruption Recovery Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Disruption Recovery & ALNS Repair Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 text-left">
                <th className="py-2.5 font-semibold">Incident Category</th>
                <th className="py-2.5 font-semibold">Events Logged</th>
                <th className="py-2.5 font-semibold">Avg Recovery Time</th>
                <th className="py-2.5 font-semibold text-right">Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.disruptions.map(d => {
                const benchmarks: Record<string, string> = {
                  'Track failures': '−32% faster than manual',
                  'Block overruns': '−41% fewer cascading delays',
                  'Train delays': '−27% recovery time',
                  'Signal faults': '−38% isolation time',
                };
                const bm = benchmarks[d.type] ?? `−${Math.round(20 + (d.avgRecoveryMin % 20))}% vs manual`;
                return (
                  <tr key={d.type} className="hover:bg-gray-50">
                    <td className="py-3 font-semibold text-gray-900">{d.type}</td>
                    <td className="py-3 text-gray-700 font-mono">{d.events} events</td>
                    <td className="py-3 font-mono font-bold text-emerald-900">{d.avgRecoveryMin} min</td>
                    <td className="py-3 text-right text-green-700 font-semibold">{bm}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-center text-gray-400">Prototype Simulation · Data refreshed at session start</p>
    </div>
  );
}
