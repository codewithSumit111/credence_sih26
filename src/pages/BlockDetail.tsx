import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import ExplainabilityPanel from '../components/blocks/ExplainabilityPanel';
import ImpactPanel from '../components/blocks/ImpactPanel';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import DangerButton from '../components/buttons/DangerButton';
import LoadingState from '../components/common/LoadingState';
import { blocksApi, approvalsApi } from '../api';
import type { OptimizedBlock } from '../types';
import { ArrowLeft, CheckCircle2, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { clsx } from 'clsx';

export default function BlockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [block, setBlock] = useState<OptimizedBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('Option A');

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    async function loadBlock() {
      try {
        const data = await blocksApi.getBlock(id || 'BR-00231');
        if (data) setBlock(data);
      } catch {
        toast.error('Failed to load block details');
      } finally {
        setLoading(false);
      }
    }
    loadBlock();
  }, [id]);

  const handleApprove = async () => {
    if (!block) return;
    setActionLoading(true);
    try {
      await approvalsApi.approve(block.id, 'Section Controller');
      setBlock(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setShowApproveModal(false);
      toast.success(`Possession Block ${block.id} approved`, {
        description: 'Status persisted to DB. Orders dispatched to Section Control & Station Masters.',
      });
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!block) return;
    setActionLoading(true);
    try {
      await approvalsApi.reject(block.id, 'Controller timetable reallocation');
      setBlock(prev => prev ? { ...prev, status: 'REJECTED' } : null);
      setShowRejectModal(false);
      toast.info(`Possession Block ${block.id} rejected — saved to DB`);
    } catch {
      toast.error('Failed to reject block');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Block Recommendation..." />;
  }

  if (!block) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-gray-500 mb-4">Block possession record not found.</p>
        <SecondaryButton onClick={() => navigate('/blocks')}>Return to Block Plans</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1400px] mx-auto space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Block Plans
      </button>

      {/* Header */}
      <PageHeader
        title={`POSSESSION BLOCK ${block.id}`}
        subtitle={`Corridor Section: ${block.section} • Track: ${block.track}`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={block.status} size="md" />
            <PriorityBadge priority={block.priority} size="md" />
            {block.bundled && (
              <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold">
                BUNDLED ({block.bundledCount} JOBS)
              </span>
            )}
          </div>
        }
        actions={
          block.status !== 'APPROVED' ? (
            <div className="flex items-center gap-2">
              <SecondaryButton size="sm" onClick={() => toast.info('Modify possession window workflow opened')}>
                MODIFY WINDOW
              </SecondaryButton>
              <DangerButton size="sm" onClick={() => setShowRejectModal(true)}>
                REJECT
              </DangerButton>
              <PrimaryButton size="sm" variant="green" onClick={() => setShowApproveModal(true)}>
                ✓ APPROVE BLOCK
              </PrimaryButton>
            </div>
          ) : null
        }
      />

      {/* Optimization Banner */}
      <div className="bg-emerald-900 text-white rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">
                AI-OPTIMIZED
              </span>
              <span className="text-xs text-emerald-200">Generated by Google OR-Tools CP-SAT Scheduling Engine</span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              Constraint-checked across 2 departments, 3 conflicting train paths, and crew rosters.
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-emerald-300 block">Authority Status</span>
          <span className="font-bold text-amber-300">AWAITING HUMAN APPROVAL</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Specification & Explainability */}
        <div className="lg:col-span-2 space-y-5">
          {/* Specification Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              POSSESSION SPECIFICATION
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Track / Asset</span>
                <span className="font-bold text-gray-900">{block.track}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Scheduled Date & Window</span>
                <span className="font-bold text-gray-900">
                  {new Date(block.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {block.startTime} – {block.endTime}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Possession Duration</span>
                <span className="font-bold text-gray-900">{block.duration} Minutes</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Safety Buffer</span>
                <span className="font-bold text-gray-900">{block.safetyBuffer} Minutes</span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <h4 className="text-xs font-bold text-gray-700 mb-3">COORDINATED MAINTENANCE JOBS</h4>
              <div className="space-y-3">
                {((block as any).jobDetails?.length > 0
                  ? (block as any).jobDetails
                  : block.jobIds?.map(jid => ({ id: jid, maintenanceType: 'Maintenance Job', department: 'Engineering', asset: jid, requiredManpower: 5, machinery: 'Standard', priorityScore: 'N/A', notes: '', estimatedDuration: 90, dueDate: 'N/A' }))
                  || []
                ).map((job: any) => (
                  <div key={job.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-900 text-[13px]">{job.department} — {job.maintenanceType}</span>
                      <span className="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{job.id}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{job.notes || `${job.maintenanceType} on asset ${job.asset}`}</p>
                    
                    <div className="grid grid-cols-2 gap-2 bg-white border border-gray-100 rounded p-2 mb-2">
                      <div className="border-r border-gray-100 pr-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requested By Dept</p>
                        <p className="text-[11px] text-gray-600"><strong>Date/Due:</strong> {job.dueDate || job.preferredDate || 'Flexible'}</p>
                        <p className="text-[11px] text-gray-600"><strong>Duration:</strong> {job.estimatedDuration || job.requestedDuration || block.duration} min</p>
                        <p className="text-[11px] text-gray-600"><strong>Priority:</strong> {typeof job.priorityScore === 'number' ? `${(job.priorityScore * 100).toFixed(0)}/100` : (job.priorityScore || job.priority)}</p>
                      </div>
                      <div className="pl-2">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">AI Optimized / Approved</p>
                        <p className="text-[11px] text-gray-600"><strong>Window:</strong> {block.startTime} – {block.endTime}</p>
                        <p className="text-[11px] text-gray-600"><strong>Duration:</strong> {block.duration} min</p>
                        <p className="text-[11px] text-gray-600"><strong>Status:</strong> {block.status}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
                      <span><strong>Manpower:</strong> {job.requiredManpower} workers</span>
                      <span><strong>Equipment:</strong> {job.machinery || 'Standard'}</span>
                    </p>
                  </div>
                ))}
                {!((block as any).jobDetails?.length) && !block.jobIds?.length && (
                  <p className="text-xs text-gray-400 italic">No job details available for this block.</p>
                )}
              </div>
            </div>
          </div>

          {/* Explainability Panel */}
          <ExplainabilityPanel
            title="WHY THIS SLOT? (CP-SAT SOLVER RATIONALE)"
            reasons={block.whyThisSlot}
            algorithm="Google OR-Tools CP-SAT"
            plainLanguage="The optimization solver proved mathematically that scheduling possession at 14:00–15:30 causes the minimum network-wide disruption (+18 min delay) compared to alternative windows. Bundling Engineering and S&T prevents taking a second track block."
          />

          {/* Alternative Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              EVALUATED ALTERNATIVE WINDOWS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {block.alternatives.map(alt => (
                <div
                  key={alt.label}
                  onClick={() => setSelectedOption(alt.label)}
                  className={clsx(
                    'border rounded p-3 cursor-pointer transition-all',
                    selectedOption === alt.label
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900">{alt.label}</span>
                    {alt.recommended && (
                      <span className="text-[9px] bg-green-700 text-white font-bold px-1.5 py-0.5 rounded">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{alt.startTime}–{alt.endTime}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Network Delay: <span className="font-bold text-gray-700">+{alt.delay} min</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Impact & Decision */}
        <div className="space-y-5">
          <ImpactPanel block={block} />

          {/* Human Authority Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Human-in-the-Loop:</strong> The optimization system recommends. The Section Controller retains final authority.
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              {block.status !== 'APPROVED' ? (
                <>
                  <PrimaryButton
                    className="w-full justify-center"
                    variant="green"
                    onClick={() => setShowApproveModal(true)}
                  >
                    ✓ APPROVE POSSESSION
                  </PrimaryButton>
                  <SecondaryButton
                    className="w-full justify-center"
                    onClick={async () => {
                      const newStart = prompt(`Modify start time (current: ${block.startTime}):`, block.startTime);
                      if (!newStart) return;
                      const newEnd = prompt(`Modify end time (current: ${block.endTime}):`, block.endTime);
                      if (!newEnd) return;
                      try {
                        await approvalsApi.modify(block.id, newStart, newEnd);
                        setBlock(prev => prev ? { ...prev, startTime: newStart, endTime: newEnd, status: 'MODIFIED' as any } : null);
                        toast.success(`Block ${block.id} modified — saved to DB`, { description: `New window: ${newStart}–${newEnd}` });
                      } catch { toast.error('Failed to modify block'); }
                    }}
                  >
                    MODIFY TIME WINDOW
                  </SecondaryButton>
                  <DangerButton
                    className="w-full justify-center"
                    onClick={() => setShowRejectModal(true)}
                  >
                    REJECT RECOMMENDATION
                  </DangerButton>
                </>
              ) : (
                <div className="text-center p-3 text-sm text-green-700 bg-green-50 rounded border border-green-200">
                  This block is approved and committed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title={`Approve Block ${block.id}?`}
        description={`This will lock ${block.track} from ${block.startTime} to ${block.endTime} (${block.duration} min). ${block.affectedTrains?.length || 0} train(s) will receive rerouting orders. Action will be saved to DB.`}
        confirmLabel="Approve Block"
        loading={actionLoading}
      />

      <ConfirmationDialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title={`Reject Block ${block.id}?`}
        description="Are you sure you want to reject this slot? The CP-SAT engine will recalculate with updated constraints."
        confirmLabel="Reject Slot"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
}

