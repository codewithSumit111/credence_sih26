import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GanttChart from '../components/gantt/GanttChart';
import RecommendationCard from '../components/blocks/RecommendationCard';
import ExplainabilityPanel from '../components/blocks/ExplainabilityPanel';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import DangerButton from '../components/buttons/DangerButton';
import LoadingState from '../components/common/LoadingState';
import { blocksApi, trainsApi, approvalsApi } from '../api';
import type { OptimizedBlock, Train } from '../types';
import { CheckCircle2, ChevronDown } from 'lucide-react';

export default function Overview() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<OptimizedBlock[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('BR-00231');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Filters
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, tData] = await Promise.all([
          blocksApi.getBlocks(),
          trainsApi.getTrains(),
        ]);
        setBlocks(bData);
        setTrains(tData);
      } catch (err) {
        toast.error('Failed to load operational data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  const handleApprove = async () => {
    if (!selectedBlock) return;
    setActionLoading(true);
    try {
      await approvalsApi.approve('APV-001');
      setBlocks(prev =>
        prev.map(b => b.id === selectedBlock.id ? { ...b, status: 'APPROVED' } : b)
      );
      setShowApproveDialog(false);
      toast.success(`Possession Block ${selectedBlock.id} approved by Control Office`, {
        description: 'Schedule committed and train operational advisories issued.',
      });
    } catch {
      toast.error('Failed to approve block');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBlock) return;
    setActionLoading(true);
    try {
      await approvalsApi.reject('APV-001', 'Traffic density override by Controller');
      setBlocks(prev =>
        prev.map(b => b.id === selectedBlock.id ? { ...b, status: 'REJECTED' } : b)
      );
      setShowRejectDialog(false);
      toast.info(`Possession Block ${selectedBlock.id} rejected`, {
        description: 'Department planner notified for alternative scheduling.',
      });
    } catch {
      toast.error('Failed to reject block');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Control Office situational picture..." />;
  }

  const aiBlocks = blocks.filter(b => b.status === 'AI-OPTIMIZED' || b.status === 'PROPOSED');

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-5">
      {/* Top Filter Bar as in Wireframe */}
      <div className="flex flex-wrap items-center gap-2.5 pb-1">
        <div className="relative">
          <select
            aria-label="Date Selection"
            className="appearance-none bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 pr-7 rounded shadow-sm hover:border-gray-400 focus:outline-none"
            defaultValue="Today"
          >
            <option>Today • 27 Aug 2026</option>
            <option>Tomorrow • 28 Aug 2026</option>
            <option>Next 7 Days (Horizon)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            aria-label="Section Filter"
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="appearance-none bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 pr-7 rounded shadow-sm hover:border-gray-400 focus:outline-none"
          >
            <option value="ALL">Section: All (NGP-BSL, NGP-WR, WR-AKO)</option>
            <option value="NGP-BSL">NGP-BSL (Nagpur–Bhusawal)</option>
            <option value="NGP-WR">NGP-WR (Nagpur–Wardha)</option>
            <option value="WR-AKO">WR-AKO (Wardha–Akola)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            aria-label="Department Filter"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="appearance-none bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 pr-7 rounded shadow-sm hover:border-gray-400 focus:outline-none"
          >
            <option value="ALL">Dept: All Departments</option>
            <option value="Engineering">Engineering / Track</option>
            <option value="S&T">S&T (Signals)</option>
            <option value="Traction">Traction / OHE</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            aria-label="Block Type Filter"
            className="appearance-none bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 pr-7 rounded shadow-sm hover:border-gray-400 focus:outline-none"
            defaultValue="ALL"
          >
            <option value="ALL">Block Type: All Types</option>
            <option value="BUNDLED">Bundled (Multi-Dept)</option>
            <option value="ISOLATED">Single Department</option>
            <option value="EMERGENCY">Emergency Maintenance</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            aria-label="Status Filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-300 text-xs font-semibold px-3 py-1.5 pr-7 rounded shadow-sm hover:border-gray-400 focus:outline-none"
          >
            <option value="ALL">Status: All Statuses</option>
            <option value="AI-OPTIMIZED">AI-Optimized</option>
            <option value="APPROVED">Approved</option>
            <option value="PROPOSED">Proposed</option>
            <option value="ACTIVE">Active</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Main Visual: Corridor × Time Gantt */}
      <GanttChart
        blocks={blocks}
        trains={trains}
        selectedBlockId={selectedBlockId}
        onBlockClick={id => setSelectedBlockId(id)}
      />

      {/* AI-Optimized Blocks List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            AI-OPTIMIZED BLOCKS (OR-Tools CP-SAT Candidates)
          </h3>
          <span className="text-[11px] text-gray-500">
            Click to inspect optimization reasoning & affected trains
          </span>
        </div>
        <div className="space-y-2">
          {aiBlocks.map(block => (
            <RecommendationCard
              key={block.id}
              block={block}
              selected={selectedBlock?.id === block.id}
              onClick={() => setSelectedBlockId(block.id)}
              onView={() => navigate(`/blocks/${block.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Selected Recommendation Details Panel */}
      {selectedBlock && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                SELECTED RECOMMENDATION
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">
                  BLOCK {selectedBlock.track} • {selectedBlock.startTime}–{selectedBlock.endTime}
                </h2>
                <StatusBadge status={selectedBlock.status} />
                <PriorityBadge priority={selectedBlock.priority} />
                {selectedBlock.bundled && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded border border-purple-200">
                    BUNDLED ({selectedBlock.bundledCount} Jobs)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Possession ID: <span className="font-mono font-semibold">{selectedBlock.id}</span> • Section: <span className="font-semibold">{selectedBlock.section}</span> • Duration: <span className="font-semibold">{selectedBlock.duration} min</span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">Optimization Engine</p>
              <p className="text-sm font-bold text-blue-700">Google OR-Tools CP-SAT</p>
              <p className="text-[11px] text-gray-400">Constraint-Satisfaction Scheduling</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
            {/* Column 1: Jobs & Delay */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  INCLUDED MAINTENANCE JOBS
                </p>
                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50/50 rounded border border-blue-100 text-xs">
                    <div className="flex justify-between font-bold text-blue-950 mb-0.5">
                      <span>Engineering / Track</span>
                      <span className="text-blue-700 font-mono">JOB-1042</span>
                    </div>
                    <p className="text-gray-700">Rail grinding at KM 142/3 (90 min possession)</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Asset: A-TR02-144 • Priority: 92/100</p>
                  </div>

                  <div className="p-2.5 bg-purple-50/50 rounded border border-purple-100 text-xs">
                    <div className="flex justify-between font-bold text-purple-950 mb-0.5">
                      <span>S&T (Signals)</span>
                      <span className="text-purple-700 font-mono">JOB-1043</span>
                    </div>
                    <p className="text-gray-700">Signal inspection & track circuit test (30 min)</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Asset: SIG-TR02-14A • Bundled inside window</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-500 block text-[11px]">Expected Total Delay</span>
                  <span className="text-base font-bold text-gray-900">+{selectedBlock.expectedDelay} min</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-500 block text-[11px]">Resources Feasibility</span>
                  <span className="text-xs font-bold text-green-700 block mt-1">✓ Available (11 Crew)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Why This Slot Explainability */}
            <div>
              <ExplainabilityPanel
                title="WHY THIS SLOT?"
                reasons={selectedBlock.whyThisSlot}
                algorithm="CP-SAT Solver (Mathematical Proof of Feasibility)"
                plainLanguage="Possession coincides with the afternoon passenger-train lull. Combining Engineering and S&T work into this single 90-minute window prevents a second separate 60-minute track closure later."
              />
            </div>

            {/* Column 3: Affected Trains & Decision Action */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  AFFECTED TRAINS
                </p>
                <div className="space-y-2">
                  {selectedBlock.affectedTrains.map(train => (
                    <div
                      key={train.trainNumber}
                      className="p-2.5 bg-gray-50 rounded border border-gray-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900">Train {train.trainNumber}</span>
                        <p className="text-[11px] text-gray-600">
                          {train.action === 'REROUTE_A' && '→ Reroute A via TR-04 (A* proposed)'}
                          {train.action === 'WAIT' && `→ +${train.delay} min scheduled wait`}
                          {train.action === 'NO_CONFLICT' && '→ Clear / No Conflict'}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-gray-700">
                        {train.delay > 0 ? `+${train.delay}m` : '0m'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human-in-the-loop Decision Bar */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Authority: <strong>Section Controller</strong> is final approver</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <SecondaryButton
                    size="sm"
                    onClick={() => navigate(`/blocks/${selectedBlock.id}`)}
                  >
                    MODIFY
                  </SecondaryButton>
                  <DangerButton
                    size="sm"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    REJECT
                  </DangerButton>
                  <PrimaryButton
                    size="sm"
                    variant="green"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    ✓ APPROVE
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title={`Approve Maintenance Block ${selectedBlock?.id}?`}
        description={
          <div>
            <p className="mb-2">
              You are approving possession on <strong>{selectedBlock?.track} ({selectedBlock?.section})</strong> from <strong>{selectedBlock?.startTime} to {selectedBlock?.endTime}</strong>.
            </p>
            <p className="text-xs text-gray-500">
              This will lock the maintenance possession into the active railway timetable and transmit train rerouting orders for Train 12123.
            </p>
          </div>
        }
        confirmLabel="Confirm & Issue Order"
        loading={actionLoading}
      />

      <ConfirmationDialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title={`Reject Maintenance Block ${selectedBlock?.id}?`}
        description="Are you sure you want to reject this AI-recommended block? Department planners will be requested to submit alternative time windows."
        confirmLabel="Reject Recommendation"
        isDanger={true}
        loading={actionLoading}
      />
    </div>
  );
}

