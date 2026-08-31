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
      await approvalsApi.approve('APV-001');
      setBlock(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setShowApproveModal(false);
      toast.success(`Possession Block ${block.id} approved by Controller`, {
        description: 'Orders dispatched to Section Control & Station Masters.',
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
      await approvalsApi.reject('APV-001', 'Controller timetable reallocation');
      setBlock(prev => prev ? { ...prev, status: 'REJECTED' } : null);
      setShowRejectModal(false);
      toast.info(`Possession Block ${block.id} rejected`);
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
        }
      />

      {/* Optimization Banner */}
      <div className="bg-blue-900 text-white rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-800 text-blue-200 px-2 py-0.5 rounded">
                AI-OPTIMIZED
              </span>
              <span className="text-xs text-blue-200">Generated by Google OR-Tools CP-SAT Scheduling Engine</span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">
              Constraint-checked across 2 departments, 3 conflicting train paths, and crew rosters.
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-blue-300 block">Authority Status</span>
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
                <span className="text-gray-400 block mb-0.5">Scheduled Window</span>
                <span className="font-bold text-gray-900">{block.startTime} – {block.endTime}</span>
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
              <h4 className="text-xs font-bold text-gray-700 mb-2">COORDINATED MAINTENANCE JOBS</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-900">Engineering / Track — Rail Grinding</span>
                    <span className="font-mono text-gray-500">JOB-1042 • Priority 92/100</span>
                  </div>
                  <p className="text-gray-700">Rail grinding machine deployment at KM 142/3. Requires 90 min track possession.</p>
                  <p className="text-[11px] text-gray-500 mt-1">Manpower: 8 workers • Machinery: Rail Grinding Machine</p>
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-purple-900">S&T (Signals) — Signal Inspection</span>
                    <span className="font-mono text-gray-500">JOB-1043 • Priority 84/100</span>
                  </div>
                  <p className="text-gray-700">Routine signal circuit check and point machine testing on TR-02.</p>
                  <p className="text-[11px] text-gray-500 mt-1">Manpower: 3 workers • Bundled inside Engineering possession window</p>
                </div>
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
              <PrimaryButton
                className="w-full justify-center"
                variant="green"
                onClick={() => setShowApproveModal(true)}
              >
                ✓ APPROVE POSSESSION
              </PrimaryButton>
              <SecondaryButton
                className="w-full justify-center"
                onClick={() => toast.info('Modification interface')}
              >
                MODIFY TIME WINDOW
              </SecondaryButton>
              <DangerButton
                className="w-full justify-center"
                onClick={() => setShowRejectModal(true)}
              >
                REJECT RECOMMENDATION
              </DangerButton>
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
        description="Confirming this possession will lock TR-02 from 14:00 to 15:30. Train rerouting order for Train 12123 via Route A will take effect."
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

