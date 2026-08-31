import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import Tabs from '../components/common/Tabs';
import AuditTimeline from '../components/approvals/AuditTimeline';
import LoadingState from '../components/common/LoadingState';
import { approvalsApi } from '../api';
import type { ApprovalItem, ApprovalStatus } from '../types';
import { CheckCircle2, ShieldCheck, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Approvals() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApprovals() {
      try {
        const data = await approvalsApi.getApprovals();
        setApprovals(data);
      } catch {
        toast.error('Failed to load approvals');
      } finally {
        setLoading(false);
      }
    }
    loadApprovals();
  }, []);

  const filteredApprovals = approvals.filter(item => {
    if (activeTab === 'HIGH') return item.priority === 'High' || item.priority === 'Critical';
    if (activeTab === 'CONFLICTS') return item.affectedTrains.length > 0;
    if (activeTab === 'APPROVED') return item.status === 'APPROVED';
    if (activeTab === 'PENDING') return item.status === 'PENDING';
    return true;
  });

  const auditEntries = [
    { time: '14:39', action: 'Controller approved recovered plan for TR-02 disruption', actor: 'Ctrl. R. Sharma', type: 'USER' as const },
    { time: '14:37', action: 'System detected TR-02 failure at KM 142/3', actor: 'System Telemetry', type: 'SYSTEM' as const },
    { time: '14:21', action: 'Planner modified BR-00231 requested window', actor: 'A. Joshi (Eng)', type: 'USER' as const },
    { time: '13:55', action: 'CP-SAT optimization generated 6 candidate possession blocks', actor: 'OR-Tools Engine', type: 'SYSTEM' as const },
  ];

  if (loading) {
    return <LoadingState message="Loading Control Office Approval Queue..." />;
  }

  return (
    <div className="p-5 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="APPROVAL QUEUE & AUDIT REGISTRY"
        subtitle="Central decision gate for Section Controller — every possession approval, rejection, and modification is cryptographically logged"
      />

      {/* Filter Tabs matching wireframe 10 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={clsx(
            'px-4 py-1.5 rounded text-xs font-bold transition-all',
            activeTab === 'ALL'
              ? 'bg-[#0F2240] text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          )}
        >
          ALL ({approvals.length})
        </button>
        <button
          onClick={() => setActiveTab('HIGH')}
          className={clsx(
            'px-4 py-1.5 rounded text-xs font-bold transition-all',
            activeTab === 'HIGH'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          )}
        >
          HIGH PRIORITY
        </button>
        <button
          onClick={() => setActiveTab('CONFLICTS')}
          className={clsx(
            'px-4 py-1.5 rounded text-xs font-bold transition-all',
            activeTab === 'CONFLICTS'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          )}
        >
          TRAIN CONFLICTS
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={clsx(
            'px-4 py-1.5 rounded text-xs font-bold transition-all',
            activeTab === 'PENDING'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          )}
        >
          PENDING DECISION
        </button>
      </div>

      {/* Approval Cards List matching wireframe 10 */}
      <div className="space-y-3">
        {filteredApprovals.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/approvals/${item.id}`)}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <PriorityBadge priority={item.priority} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-gray-900">{item.blockId}</span>
                  <span className="text-xs text-gray-500">• {item.departments.join(' + ')} • Section {item.section}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {item.affectedTrains.length > 0
                    ? `${item.affectedTrains.length} trains affected • ${item.impact}`
                    : 'No train conflicts in scheduled window (Clear corridor)'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono">
                Requested by: {item.requestedBy}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/approvals/${item.id}`);
                }}
                className="text-xs font-bold bg-gray-100 hover:bg-blue-50 text-gray-800 hover:text-blue-700 px-3 py-1.5 rounded transition-colors"
              >
                REVIEW →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Trail Section matching wireframe 10 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            CONTROLLER AUDIT TRAIL & DECISION LOG
          </h3>
          <span className="text-[11px] text-gray-400">
            Immutable Railway Operational Log
          </span>
        </div>

        <AuditTimeline entries={auditEntries} />

        <div className="pt-3 border-t border-gray-100 text-xs text-gray-400 italic">
          Every approval, modification, rejection, and re-optimization is recorded with timestamps and controller identity.
        </div>
      </div>
    </div>
  );
}

