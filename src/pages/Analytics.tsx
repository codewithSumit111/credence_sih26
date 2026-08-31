import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Download, TrendingUp, Activity, CheckCircle, Clock } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await analyticsApi.getAnalytics();
        setData(res);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleExport = (format: string) => {
    toast.success(`Exporting Analytics Dossier as ${format}...`, {
      description: 'Management summary generated for Central Railway Division.',
    });
  };

  if (loading || !data) {
    return <LoadingState message="Aggregating Division-wide Operations Telemetry..." />;
  }

  const deptData = [
    { name: 'Engineering', Requested: 90, Used: 72 },
    { name: 'S&T', Requested: 60, Used: 48 },
    { name: 'Traction', Requested: 37, Used: 33 },
  ];

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="MANAGEMENT ANALYTICS & KPI DASHBOARD"
        subtitle="Division Overview • August 2026 • Performance Telemetry & Maintenance Effectiveness"
        actions={
          <div className="flex items-center gap-2">
            <SecondaryButton size="sm" onClick={() => handleExport('PDF')}>
              EXPORT PDF
            </SecondaryButton>
            <SecondaryButton size="sm" onClick={() => handleExport('EXCEL')}>
              EXPORT EXCEL
            </SecondaryButton>
          </div>
        }
      />

      {/* KPI Cards matching wireframe 8 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="ASSET UPTIME"
          value="94.2%"
          trend="up"
          trendValue="+1.8% vs last month"
          highlight={true}
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          label="BLOCK UTILIZATION"
          value="81.6%"
          trend="up"
          trendValue="+5.2% possession efficiency"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          label="AVG RECOVERY TIME"
          value="18 min"
          trend="down"
          trendValue="-6 min disruption resolution"
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          label="JOBS COMPLETED"
          value="126"
          trend="up"
          trendValue="87.3% closure rate"
          icon={<CheckCircle className="w-5 h-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Hours by Department matching wireframe 8 */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              BLOCK HOURS BY DEPARTMENT (REQUESTED VS USED)
            </h3>
            <span className="text-xs text-gray-400">Hours in Aug 2026</span>
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

        {/* Overdue Maintenance Trend matching wireframe 8 */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              OVERDUE MAINTENANCE BACKLOG TREND
            </h3>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              Overdue jobs: 18 → 11 → 6 (Down 66%)
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

      {/* Bottom Table: Disruption Recovery matching wireframe 8 */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          DISRUPTION RECOVERY & ALNS REPAIR PERFORMANCE
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 text-left">
                <th className="py-2.5 font-semibold">INCIDENT CATEGORY</th>
                <th className="py-2.5 font-semibold">EVENTS LOGGED</th>
                <th className="py-2.5 font-semibold">AVERAGE RECOVERY TIME</th>
                <th className="py-2.5 font-semibold text-right">BENCHMARK COMPARISON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.disruptions.map(d => (
                <tr key={d.type} className="hover:bg-gray-50">
                  <td className="py-3 font-semibold text-gray-900">{d.type}</td>
                  <td className="py-3 text-gray-700 font-mono">{d.events} events</td>
                  <td className="py-3 font-mono font-bold text-blue-900">{d.avgRecoveryMin} min</td>
                  <td className="py-3 text-right text-green-700 font-semibold">
                    -32% faster than manual dispatch
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

