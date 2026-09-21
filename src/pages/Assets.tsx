import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, Activity, Wrench, AlertOctagon } from 'lucide-react';
import { jobsApi } from '../api';
import type { MaintenanceJob } from '../types';
import StatusBadge from '../components/common/StatusBadge';

export default function Assets() {
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getJobs().then(data => {
      setJobs(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Aggregate assets from jobs
  const assetsMap = new Map<string, any>();
  jobs.forEach(job => {
    const aid = job.asset || `AST-${Math.floor(Math.random()*1000)}`;
    if (!assetsMap.has(aid)) {
      assetsMap.set(aid, {
        id: aid,
        type: job.department === 'Engineering' ? 'Track' : job.department === 'S&T' ? 'Signal' : 'Traction',
        corridor: job.track || 'NGP-BSL',
        criticality: job.criticality || Math.floor(Math.random() * 40) + 60,
        defects: 0,
        status: 'Healthy',
        upcomingMaintenance: [],
        overdueMaintenance: [],
        risk: 'LOW'
      });
    }
    const asset = assetsMap.get(aid);
    asset.defects += 1;
    if (job.overdueDays > 0) {
      asset.overdueMaintenance.push(job);
      asset.status = 'Critical';
      asset.risk = 'HIGH';
    } else {
      asset.upcomingMaintenance.push(job);
      if (asset.risk !== 'HIGH') {
         asset.status = 'Warning';
         asset.risk = 'MEDIUM';
      }
    }
  });

  const assets = Array.from(assetsMap.values());

  const kpis = [
    { label: 'Overall Availability', value: '96.8%', sub: 'Fleet & Infrastructure', color: 'text-green-600', icon: TrendingUp, bg: 'bg-green-50 text-green-700' },
    { label: 'Assets at Risk', value: assets.filter(a => a.risk === 'HIGH').length.toString(), sub: 'Immediate attention needed', color: 'text-red-600', icon: AlertOctagon, bg: 'bg-red-50 text-red-700' },
    { label: 'Pending Maintenance', value: jobs.filter(j => j.status === 'PENDING').length.toString(), sub: 'Jobs in pipeline', color: 'text-orange-500', icon: Wrench, bg: 'bg-orange-50 text-orange-600' },
    { label: 'Network Health', value: 'Nominal', sub: 'No critical corridor failures', color: 'text-blue-600', icon: Activity, bg: 'bg-blue-50 text-blue-700' }
  ];

  if (loading) {
     return <div className="p-10 text-center text-gray-500">Loading asset telemetry...</div>;
  }

  return (
    <div className="h-full overflow-auto bg-[#F8FAFC]">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Asset Monitoring</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">Real-time health, defects, and maintenance requirements</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Asset Telemetry Live
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', kpi.bg)}>
                 <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <p className={clsx('text-2xl font-black mt-0.5', kpi.color)}>{kpi.value}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Asset Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
           <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">Monitored Assets</h3>
              <span className="text-[11px] text-gray-500">{assets.length} assets tracking</span>
           </div>
           
           <table className="w-full text-left text-[12px]">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                    <th className="py-3 px-5 font-bold">ASSET ID</th>
                    <th className="py-3 px-5 font-bold">TYPE & CORRIDOR</th>
                    <th className="py-3 px-5 font-bold">CRITICALITY</th>
                    <th className="py-3 px-5 font-bold">DEFECTS</th>
                    <th className="py-3 px-5 font-bold">STATUS</th>
                    <th className="py-3 px-5 font-bold text-right">MAINTENANCE</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                       <td className="py-4 px-5">
                          <span className="font-mono font-bold text-blue-900">{asset.id}</span>
                       </td>
                       <td className="py-4 px-5">
                          <p className="font-bold text-gray-800">{asset.type}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{asset.corridor}</p>
                       </td>
                       <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                             <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                   className={clsx('h-full', asset.criticality > 80 ? 'bg-red-500' : asset.criticality > 50 ? 'bg-orange-500' : 'bg-green-500')} 
                                   style={{ width: `${asset.criticality}%`}}
                                />
                             </div>
                             <span className="font-mono text-gray-600">{asset.criticality}%</span>
                          </div>
                       </td>
                       <td className="py-4 px-5">
                          <span className={clsx(
                             'font-bold px-2 py-1 rounded text-[10px]',
                             asset.defects > 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                          )}>{asset.defects} Open</span>
                       </td>
                       <td className="py-4 px-5">
                          <span className={clsx(
                             'flex items-center gap-1.5 font-bold text-[11px]',
                             asset.status === 'Healthy' ? 'text-green-600' : asset.status === 'Warning' ? 'text-orange-500' : 'text-red-600'
                          )}>
                             {asset.status === 'Healthy' ? <CheckCircle2 className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4" />}
                             {asset.status}
                          </span>
                       </td>
                       <td className="py-4 px-5 text-right">
                          {asset.overdueMaintenance.length > 0 ? (
                             <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
                                {asset.overdueMaintenance.length} Overdue
                             </span>
                          ) : asset.upcomingMaintenance.length > 0 ? (
                             <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
                                {asset.upcomingMaintenance.length} Upcoming
                             </span>
                          ) : (
                             <span className="text-[10px] text-gray-400">None</span>
                          )}
                       </td>
                    </tr>
                 ))}
                 {assets.length === 0 && (
                    <tr>
                       <td colSpan={6} className="py-10 text-center text-gray-400">No asset data available.</td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
