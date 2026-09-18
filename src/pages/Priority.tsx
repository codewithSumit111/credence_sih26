import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import MetricCard from '../components/common/MetricCard';
import PriorityBadge from '../components/common/PriorityBadge';
import StatusBadge from '../components/common/StatusBadge';
import ExplainabilityPanel from '../components/blocks/ExplainabilityPanel';
import LoadingState from '../components/common/LoadingState';
import { priorityApi, blocksApi } from '../api';
import type { MaintenanceJob, BlockRequest } from '../types';
import { Layers, ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export default function Priority() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [requests, setRequests] = useState<BlockRequest[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('JOB-1042');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [jData, rData] = await Promise.all([
          priorityApi.getScores(),
          blocksApi.getRequests(),
        ]);
        setJobs(jData);
        setRequests(rData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredJobs = jobs.filter(j => {
    if (deptFilter !== 'ALL' && j.department !== deptFilter) return false;
    return true;
  });

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  if (loading) {
    return <LoadingState message="Calculating Weighted Priority Scores..." />;
  }

  const scoreBreakdown = selectedJob ? [
    { label: 'Asset Criticality Weight (30%)', value: selectedJob.criticality, weight: 30 },
    { label: 'Maintenance Urgency (25%)', value: selectedJob.urgency, weight: 25 },
    { label: 'Asset Failure Risk (20%)', value: selectedJob.assetRisk, weight: 20 },
    { label: 'Overdue Deferral Factor (15%)', value: selectedJob.overdueDays > 0 ? 95 : 20, weight: 15 },
    { label: 'Operational Corridor Impact (10%)', value: selectedJob.operationalImpact, weight: 10 },
  ] : [];

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-5">
      {/* Top Header */}
      <PageHeader
        title="MAINTENANCE PRIORITY RANKING"
        subtitle="Transparent Multi-Criteria Weighted Priority Scoring across Engineering, S&T, and Traction"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="ALL">Department: All Departments</option>
              <option value="Engineering">Engineering / Track</option>
              <option value="S&T">Signal & Telecom (S&T)</option>
              <option value="Traction">Traction / OHE</option>
            </select>
          </div>
        }
      />

      {/* KPI Cards matching wireframe 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="OPEN JOBS"
          value="12"
          sub="Awaiting scheduling"
          icon={<Layers className="w-5 h-5" />}
        />
        <MetricCard
          label="SCHEDULED"
          value="8"
          sub="In active possession plan"
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          label="COMPLETED"
          value="126"
          sub="Past 30 days"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <MetricCard
          label="OVERDUE"
          value="3"
          sub="High priority escalation"
          danger={true}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Main 2-Column Area: Priority Queue + Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Priority Queue List matching wireframe 2 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              PRIORITY QUEUE (RANKED BY SCORING ENGINE)
            </h3>
            <span className="text-[11px] text-gray-400">
              Algorithm: Multi-Attribute Utility Theory (MAUT)
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={clsx(
                  'border rounded-lg p-3.5 cursor-pointer transition-all flex items-center justify-between',
                  selectedJob?.id === job.id
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={job.priority} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">{job.id}</span>
                      <span className="text-xs font-medium text-gray-700">
                        {job.maintenanceType} • <span className="font-semibold text-emerald-900">{job.track}</span>
                      </span>
                      {job.overdueDays > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                          {job.overdueDays}d Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {job.department} • Asset: {job.asset} • Section: {job.section} • Duration: {job.estimatedDuration}m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Priority Score</span>
                    <span className="text-lg font-bold text-emerald-900">{job.priorityScore}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJobId(job.id);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center"
                  >
                    VIEW <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* My Requests Table matching bottom of wireframe 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              MY DEPARTMENT BLOCK REQUESTS & POSSESSION STATUS
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 text-left">
                    <th className="py-2">REQUEST ID</th>
                    <th className="py-2">SECTION</th>
                    <th className="py-2">DATE</th>
                    <th className="py-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="py-2 font-mono font-bold text-emerald-900">{req.id}</td>
                      <td className="py-2 text-gray-700 font-semibold">{req.track}</td>
                      <td className="py-2 text-gray-600">{req.preferredDate}</td>
                      <td className="py-2 text-right">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Priority Explainability Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              PRIORITY EXPLANATION & BREAKDOWN
            </h3>
          </div>

          {selectedJob ? (
            <div className="space-y-4">
              <ExplainabilityPanel
                title={`PRIORITY SCORE = ${selectedJob.priorityScore} / 100`}
                score={selectedJob.priorityScore}
                scoreBreakdown={scoreBreakdown}
                reasons={[
                  `Asset ${selectedJob.asset} criticality is evaluated at ${selectedJob.criticality}%`,
                  selectedJob.overdueDays > 0
                    ? `Job is ${selectedJob.overdueDays} days overdue — multiplier applied`
                    : 'Job is within scheduled maintenance horizon',
                  `Current asset failure risk score is ${selectedJob.assetRisk}%`,
                  `Potential train delay if deferred: ${selectedJob.operationalImpact > 60 ? 'Severe' : 'Moderate'}`,
                ]}
                algorithm="Weighted Priority Scoring Engine"
                plainLanguage={selectedJob.notes}
              />

              <div className="bg-white border border-gray-200 rounded-lg p-4 text-xs space-y-3">
                <h4 className="font-bold text-gray-700 uppercase tracking-wide">
                  OPTIMIZATION RECOMMENDATION FOR THIS JOB
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  The CP-SAT scheduling engine has bundled <strong>{selectedJob.id}</strong> with compatible S&T signal inspection on <strong>{selectedJob.track}</strong> to maximize track possession efficiency.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => navigate('/blocks/BR-00231')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    View Bundled Block (BR-00231) →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded">
              Select a job to view scoring breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

