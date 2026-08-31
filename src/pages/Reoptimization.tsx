import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import DangerButton from '../components/buttons/DangerButton';
import LoadingState from '../components/common/LoadingState';
import { reoptimizationApi } from '../api';
import type { ReoptimizationPlan } from '../types';
import { CheckCircle2, Lock, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

export default function Reoptimization() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<ReoptimizationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const data = await reoptimizationApi.getReoptimization(id || 'REOPT-001');
        setPlan(data);
      } catch {
        toast.error('Failed to load re-optimization plan');
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [id]);

  const handleApprove = async () => {
    if (!plan) return;
    setActionLoading(true);
    try {
      await reoptimizationApi.approve(plan.id);
      setPlan(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setShowApproveModal(false);
      toast.success('ALNS Dynamic Schedule Recovery Plan Approved', {
        description: 'New possession timestamps and train dispatch orders committed to live system.',
      });
      navigate('/overview');
    } catch {
      toast.error('Failed to approve plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!plan) return;
    setActionLoading(true);
    try {
      await reoptimizationApi.reject(plan.id);
      setShowRejectModal(false);
      toast.info('Re-optimized recovery plan rejected by Controller');
      navigate('/events');
    } catch {
      toast.error('Failed to reject plan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Calculating ALNS Disruption Repair..." />;
  }

  if (!plan) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-gray-500 mb-4">Re-optimization plan not found.</p>
        <SecondaryButton onClick={() => navigate('/events')}>Return to Live Events</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1400px] mx-auto space-y-6">
      {/* Header matching wireframe 6 */}
      <PageHeader
        title="DISRUPTION DETECTED & ALNS SCHEDULE RECOVERY"
        subtitle="Adaptive Large Neighborhood Search (ALNS) schedule repair with Time-Dependent A* train rerouting"
        badge={
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            TRACK TR-02 UNAVAILABLE (90 MIN)
          </span>
        }
      />

      {/* Concept Callout: Frozen vs Repaired */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>ALNS Guarantees:</strong> Past & currently active possession blocks are <strong>FROZEN</strong>. Only future downstream possessions and affected train slots are dynamically repaired.
          </span>
        </div>
        <span className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
          Engine: ALNS + TD-A*
        </span>
      </div>

      {/* Split Comparison Cards: CURRENT PLAN vs AI RE-OPTIMIZED matching wireframe 6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CURRENT PLAN */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              CURRENT SCHEDULE (PRE-DISRUPTION)
            </h3>
            <span className="text-[11px] text-gray-400">Baseline Timetable</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-gray-50 rounded border border-gray-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 font-mono">BR-00231</span>
                <span className="text-gray-500">14:00–15:30</span>
              </div>
              <p className="text-gray-600">Possession on TR-02 (Engineering + S&T)</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded border border-gray-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 font-mono">BR-00232</span>
                <span className="text-gray-500">16:10–17:00</span>
              </div>
              <p className="text-gray-600">Possession on TR-04 (Traction OHE)</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded border border-gray-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 font-mono">Train 12123</span>
                <span className="text-gray-500">Original Route</span>
              </div>
              <p className="text-gray-600">Direct via TR-02 (Conflict with outage)</p>
            </div>
          </div>
        </div>

        {/* AI RE-OPTIMIZED PLAN */}
        <div className="bg-white border-2 border-blue-500 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                AI RE-OPTIMIZED (RECOVERED PLAN)
              </h3>
              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                RECOMMENDED
              </span>
            </div>
            <span className="text-[11px] text-blue-600 font-semibold">Zero Safety Violations</span>
          </div>

          <div className="space-y-3">
            {/* Frozen completed block */}
            <div className="p-3.5 bg-gray-100/70 rounded border border-gray-300 text-xs opacity-75">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700 font-mono flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-500" />
                  BR-00231
                </span>
                <span className="text-gray-600 font-mono">14:00–15:30</span>
              </div>
              <p className="text-gray-500 text-[11px]">
                [FROZEN] Completed possession preserved — no disruption
              </p>
            </div>

            {/* Repaired shifted block */}
            <div className="p-3.5 bg-amber-50 rounded border border-amber-300 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-900 font-mono">BR-00232</span>
                <span className="text-amber-900 font-bold font-mono">16:30–17:20 ↺ (+20m shift)</span>
              </div>
              <p className="text-amber-800">
                Shifted downstream by 20 min to accommodate emergency inspection
              </p>
            </div>

            {/* Rerouted train */}
            <div className="p-3.5 bg-blue-50 rounded border border-blue-300 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-900 font-mono">Train 12123</span>
                <span className="text-blue-900 font-bold font-mono">Route A (+12 min delay)</span>
              </div>
              <p className="text-blue-800">
                Rerouted via TR-04 bypass (Time-Dependent A* computed path)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Changes Made & Impact matching wireframe 6 */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Changes Made - 7 cols */}
          <div className="md:col-span-7">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              CHANGES MADE BY ALNS ENGINE
            </h4>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Completed operations on TR-02 frozen & protected from modification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Remaining block BR-00232 shifted by 20 min</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Train 12123 rerouted via Route A (Time-Dependent A*)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Train 11008 assigned waiting strategy at ST-B</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>No safety constraints violated across entire corridor</span>
              </div>
            </div>
          </div>

          {/* Impact Metrics - 5 cols */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l md:pl-6 border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              SCHEDULE REPAIR IMPACT
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded">
                <span className="text-gray-400 block text-[11px]">Additional Delay</span>
                <span className="text-base font-bold text-gray-900">+{plan.impact.additionalDelay} min</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded">
                <span className="text-gray-400 block text-[11px]">Blocks Changed</span>
                <span className="text-base font-bold text-gray-900">{plan.impact.blocksChanged}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded">
                <span className="text-gray-400 block text-[11px]">Trains Rerouted</span>
                <span className="text-base font-bold text-gray-900">{plan.impact.trainsRerouted}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded">
                <span className="text-gray-400 block text-[11px]">Safety Violations</span>
                <span className="text-base font-bold text-green-700">0 (Safe)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Human Decision Bar matching wireframe 6 */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
          <DangerButton size="sm" onClick={() => setShowRejectModal(true)}>
            REJECT
          </DangerButton>
          <SecondaryButton size="sm" onClick={() => toast.info('Detailed timetable diff view')}>
            REVIEW CHANGES
          </SecondaryButton>
          <PrimaryButton size="sm" variant="green" onClick={() => setShowApproveModal(true)}>
            ✓ APPROVE RECOVERED PLAN
          </PrimaryButton>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationDialog
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Re-optimized Schedule Recovery Plan?"
        description="Approving this recovered plan will commit shifted block BR-00232 and authorize Train 12123 dispatch via Route A. All train controllers will be notified immediately."
        confirmLabel="Approve & Commit Plan"
        loading={actionLoading}
      />

      <ConfirmationDialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Re-optimized Plan?"
        description="Rejecting this plan will require manual conflict resolution by the Section Controller."
        confirmLabel="Reject Plan"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
}

