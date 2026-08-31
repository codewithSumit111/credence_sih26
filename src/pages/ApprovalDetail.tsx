import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import AuditTimeline from '../components/approvals/AuditTimeline';
import ExplainabilityPanel from '../components/blocks/ExplainabilityPanel';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import DangerButton from '../components/buttons/DangerButton';
import LoadingState from '../components/common/LoadingState';
import { approvalsApi } from '../api';
import type { ApprovalItem } from '../types';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [approval, setApproval] = useState<ApprovalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    async function loadApproval() {
      try {
        const data = await approvalsApi.getApproval(id || 'APV-001');
        if (data) setApproval(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApproval();
  }, [id]);

  const handleApprove = async () => {
    if (!approval) return;
    setActionLoading(true);
    try {
      await approvalsApi.approve(approval.id);
      setApproval(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setShowApproveModal(false);
      toast.success(`Plan ${approval.planId} Approved Successfully`);
      navigate('/approvals');
    } catch {
      toast.error('Failed to approve plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!approval) return;
    setActionLoading(true);
    try {
      await approvalsApi.reject(approval.id);
      setApproval(prev => prev ? { ...prev, status: 'REJECTED' } : null);
      setShowRejectModal(false);
      toast.info(`Plan ${approval.planId} Rejected`);
      navigate('/approvals');
    } catch {
      toast.error('Failed to reject plan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading Plan Approval Dossier..." />;
  if (!approval) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-gray-500 mb-4">Approval item not found.</p>
        <SecondaryButton onClick={() => navigate('/approvals')}>Back to Approval Queue</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Queue
      </button>

      <PageHeader
        title={`APPROVAL DOSSIER: ${approval.planId}`}
        subtitle={`Possession Block: ${approval.blockId} • Section: ${approval.section} • Requested By: ${approval.requestedBy}`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={approval.status} size="md" />
            <PriorityBadge priority={approval.priority} size="md" />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <DangerButton size="sm" onClick={() => setShowRejectModal(true)}>
              REJECT
            </DangerButton>
            <SecondaryButton size="sm" onClick={() => toast.info('Modify window')}>
              MODIFY
            </SecondaryButton>
            <PrimaryButton size="sm" variant="green" onClick={() => setShowApproveModal(true)}>
              ✓ APPROVE PLAN
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Recommendation Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              OPTIMIZATION RECOMMENDATION
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {approval.recommendation}
            </p>
          </div>

          {/* Explainability */}
          <ExplainabilityPanel
            title="ALGORITHMIC REASONING (CP-SAT)"
            reasons={approval.reasoning}
            algorithm="Google OR-Tools CP-SAT"
          />

          {/* Affected Trains */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              CONFLICTING TRAINS & DISPATCH IMPACT
            </h3>
            <div className="space-y-2">
              {approval.affectedTrains.map(tNum => (
                <div key={tNum} className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">Train {tNum}</span>
                  <span className="text-gray-600">
                    {tNum === '12123' ? 'Rerouted via Route A (+12m)' : 'Hold at signal (+8m)'}
                  </span>
                  <span className="font-mono font-bold text-amber-700">Conflict Handled</span>
                </div>
              ))}
              {approval.affectedTrains.length === 0 && (
                <p className="text-xs text-gray-400">Zero passenger or goods train conflicts detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail sidebar */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            AUDIT TRAIL (CHAIN OF CUSTODY)
          </h3>
          <AuditTimeline entries={approval.auditTrail} />
        </div>
      </div>

      <ConfirmationDialog
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title={`Approve Plan ${approval.planId}?`}
        description="Approving will issue execution authority to field maintenance teams and apply train rerouting orders."
        confirmLabel="Approve & Dispatch"
        loading={actionLoading}
      />

      <ConfirmationDialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title={`Reject Plan ${approval.planId}?`}
        description="Are you sure you want to reject this plan? Department planners will be requested to review."
        confirmLabel="Reject Plan"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
}

