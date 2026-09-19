import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StatusBadge from '../components/common/StatusBadge';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import DangerButton from '../components/buttons/DangerButton';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingState from '../components/common/LoadingState';
import { executionApi } from '../api';
import type { FieldBlock } from '../types';
import {
  CheckCircle2, Clock, Users, Wrench, AlertTriangle, Home,
  Calendar, AlertOctagon, Square, CheckSquare,
} from 'lucide-react';
import { clsx } from 'clsx';

// Per-job task checklist state
interface TaskCheck {
  jobIdx: number;
  taskIdx: number;
  done: boolean;
}

export default function FieldExecution() {
  const [block, setBlock] = useState<FieldBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'block' | 'report'>('block');

  // Issue reporting modal
  const [issueType, setIssueType] = useState<string | null>(null);
  const [issueNotes, setIssueNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Task checklist
  const [taskChecks, setTaskChecks] = useState<TaskCheck[]>([]);

  useEffect(() => {
    async function loadFieldBlock() {
      try {
        const data = await executionApi.getFieldBlock();
        if (!data || data.blockId === 'N/A') {
          // No approved block yet
          setBlock(null);
          setLoading(false);
          return;
        }
        setBlock(data);
        // Init all tasks as unchecked
        const checks: TaskCheck[] = [];
        data.jobs.forEach((job, jIdx) => {
          job.tasks.forEach((_, tIdx) => checks.push({ jobIdx: jIdx, taskIdx: tIdx, done: false }));
        });
        setTaskChecks(checks);
      } catch {
        toast.error('Failed to load field block');
      } finally {
        setLoading(false);
      }
    }
    loadFieldBlock();
  }, []);

  const toggleTask = (jobIdx: number, taskIdx: number) => {
    setTaskChecks(prev =>
      prev.map(c =>
        c.jobIdx === jobIdx && c.taskIdx === taskIdx ? { ...c, done: !c.done } : c
      )
    );
  };

  const isTaskDone = (jobIdx: number, taskIdx: number) =>
    taskChecks.some(c => c.jobIdx === jobIdx && c.taskIdx === taskIdx && c.done);

  const completedCount = taskChecks.filter(c => c.done).length;
  const totalCount = taskChecks.length;

  const handleUpdateProgress = async (newProgress: number) => {
    if (!block) return;
    try {
      const updated = await executionApi.updateProgress(block.blockId, newProgress);
      setBlock(updated);
      toast.success(`Progress Updated: ${newProgress}%`, {
        description: 'Transmitted to Section Controller console.',
      });
    } catch {
      toast.error('Failed to update progress');
    }
  };

  const handleMarkComplete = async () => {
    if (!block) return;
    setActionLoading(true);
    try {
      const completed = await executionApi.completeBlock(block.blockId);
      setBlock(completed);
      setShowCompleteModal(false);
      toast.success('Possession Block Marked Complete!', {
        description: 'Track cleared and safety isolation lifted. Ready for train movement.',
      });
    } catch {
      toast.error('Failed to complete block');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!block || !issueType) return;
    setActionLoading(true);
    try {
      await executionApi.reportIssue(block.blockId, `${issueType}: ${issueNotes}`);
      toast.error(`Emergency Issue Logged: ${issueType}`, {
        description: 'Section Controller notified. ALNS Re-optimization triggered if needed.',
      });
      setIssueType(null);
      setIssueNotes('');
    } catch {
      toast.error('Failed to report issue');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading active field block from DB..." />;

  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-[16px] font-bold text-gray-800 mb-2">No Active Field Block</h2>
        <p className="text-[13px] text-gray-500 max-w-sm">
          No approved block is currently assigned for field execution. Please approve a block in the <strong>Plan</strong> page first.
        </p>
      </div>
    );
  }

  // ── Tab: HOME ──────────────────────────────────────────────────────────────
  const HomeTab = () => (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">TODAY'S ASSIGNMENTS</h2>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 font-mono text-sm">{block.blockId}</p>
              <p className="text-xs text-gray-500">{block.track} • {block.location}</p>
            </div>
            <StatusBadge status={block.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE'} />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 border-t border-gray-100">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{block.startTime} – {block.endTime}</span>
            <span className="ml-auto font-semibold text-emerald-900">{block.progress}% complete</span>
          </div>
          {/* Mini progress */}
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-900 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${block.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TASK SUMMARY</h2>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Tasks Completed</span>
            <span className="font-bold text-emerald-900">{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-600 h-full rounded-full transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          {completedCount === totalCount && totalCount > 0 && (
            <p className="text-xs text-green-700 font-semibold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All tasks completed!
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TEAM & RESOURCES</h2>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-2 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span><strong>Team:</strong> {block.crew} workers assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-gray-400" />
            <span><strong>Machine:</strong> {block.machinery}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-green-700 font-semibold">Safety isolation active on {block.track}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Tab: BLOCK ─────────────────────────────────────────────────────────────
  const BlockTab = () => (
    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">TODAY'S APPROVED BLOCK</h2>
        <span className="text-[11px] text-gray-400 font-mono">
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Block Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {block.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE'}
          </span>
          {/* ✅ FIX: render block ID next to label */}
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-semibold block">POSSESSION #</span>
            <span className="text-xs font-mono font-bold text-gray-800">{block.blockId}</span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 font-mono">{block.blockId}</h3>
          <p className="text-xs text-gray-600 font-medium mt-0.5">{block.track} • {block.location}</p>
        </div>

        {/* Time timeline */}
        <div className="flex items-center justify-between py-2 border-y border-gray-100 text-sm">
          <div className="flex items-center gap-1.5 font-bold text-gray-900">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{block.startTime}</span>
          </div>
          <div className="flex-1 mx-3 border-t-2 border-dashed border-gray-300 relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-1 text-[10px] text-gray-400">
              90 min
            </span>
          </div>
          <div className="font-bold text-gray-900">{block.endTime}</div>
        </div>

        {/* ✅ FIX: Tappable task checklist */}
        {block.jobs.map((job, jIdx) => (
          <div key={jIdx} className="space-y-1.5 text-xs">
            <span className="font-bold text-gray-800 uppercase tracking-wide">
              {job.department} — {job.description}
            </span>
            <ul className="space-y-1.5 text-gray-600 pl-1">
              {job.tasks.map((task, tIdx) => {
                const done = isTaskDone(jIdx, tIdx);
                return (
                  <li
                    key={tIdx}
                    onClick={() => toggleTask(jIdx, tIdx)}
                    className={clsx(
                      'flex items-start gap-2 cursor-pointer p-1.5 rounded-lg transition-colors',
                      done ? 'bg-green-50' : 'hover:bg-gray-50',
                    )}
                  >
                    {done
                      ? <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      : <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    }
                    <span className={clsx('flex-1', done && 'line-through text-gray-400')}>{task}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Team & Machine */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-700">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span><strong>TEAM:</strong> {block.crew} workers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-gray-400" />
            <span><strong>MACHINE:</strong> {block.machinery}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-gray-500 uppercase tracking-wider">PROGRESS</span>
          <span className="text-emerald-900 font-mono text-sm">{block.progress}%</span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-emerald-900 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${block.progress}%` }}
          />
        </div>

        <div className="flex justify-between gap-1 pt-2">
          {[25, 50, 75, 100].map(pct => (
            <button
              key={pct}
              onClick={() => handleUpdateProgress(pct)}
              className={clsx(
                'flex-1 py-1 rounded text-[11px] font-bold border transition-colors',
                block.progress >= pct
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100',
              )}
            >
              {pct}%
            </button>
          ))}
        </div>

        {block.status !== 'COMPLETED' && (
          <button
            onClick={() => setShowCompleteModal(true)}
            className="w-full mt-3 bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
          >
            MARK WORK COMPLETE
          </button>
        )}
      </div>
    </div>
  );

  // ── Tab: REPORT ────────────────────────────────────────────────────────────
  const ReportTab = () => (
    <div className="p-4 space-y-4">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">REPORT EXCEPTION / ISSUE</h2>

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => setIssueType('BLOCK OVERRUN')}
          className="w-full bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 font-bold py-3 px-4 rounded-xl border border-gray-300 hover:border-red-300 text-xs text-left transition-colors flex items-center justify-between shadow-sm"
        >
          <div>
            <p className="font-bold">BLOCK OVERRUN</p>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">Estimated possession time exceeded</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </button>

        <button
          onClick={() => setIssueType('EQUIPMENT ISSUE')}
          className="w-full bg-white hover:bg-amber-50 text-gray-800 hover:text-amber-700 font-bold py-3 px-4 rounded-xl border border-gray-300 hover:border-amber-300 text-xs text-left transition-colors flex items-center justify-between shadow-sm"
        >
          <div>
            <p className="font-bold">EQUIPMENT ISSUE / BREAKDOWN</p>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">Machine or tool failure on track</p>
          </div>
          <Wrench className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => setIssueType('SAFETY ISSUE')}
          className="w-full bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 font-bold py-3 px-4 rounded-xl border border-gray-300 hover:border-red-300 text-xs text-left transition-colors flex items-center justify-between shadow-sm"
        >
          <div>
            <p className="font-bold">SAFETY ISSUE / TRACK HAZARD</p>
            <p className="text-[10px] text-gray-400 font-normal mt-0.5">Imminent risk to personnel or train</p>
          </div>
          <AlertOctagon className="w-5 h-5 text-red-600" />
        </button>
      </div>

      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-800">
        <p className="font-bold mb-1">Emergency Escalation</p>
        <p className="text-emerald-700">Any reported issue is immediately transmitted to the Section Controller. ALNS re-optimization is triggered automatically for severe overruns.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-gray-300">
      {/* Mobile Top Header */}
      <div className="bg-[#1B6B45] text-white p-4 sticky top-0 z-20 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-wider">RAILWAY FIELD OPS</h1>
            <p className="text-[11px] text-emerald-200">Engineering & S&T • {block.track}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-green-600 text-white font-bold px-2 py-0.5 rounded-full">
              ON TRACK
            </span>
            {/* ✅ Online indicator */}
            <div className="flex items-center gap-1 text-[10px] text-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area — driven by active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home'   && <HomeTab />}
        {activeTab === 'block'  && <BlockTab />}
        {activeTab === 'report' && <ReportTab />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 py-2.5 px-6 flex items-center justify-around text-xs sticky bottom-0 z-20">
        <button
          onClick={() => setActiveTab('home')}
          className={clsx('flex flex-col items-center gap-1', activeTab === 'home' ? 'text-emerald-900 font-bold' : 'text-gray-400')}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('block')}
          className={clsx('flex flex-col items-center gap-1', activeTab === 'block' ? 'text-emerald-900 font-bold' : 'text-gray-400')}
        >
          <Calendar className="w-4 h-4" />
          <span>Block</span>
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={clsx(
            'flex flex-col items-center gap-1 relative',
            activeTab === 'report' ? 'text-emerald-900 font-bold' : 'text-gray-400',
          )}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>

      {/* Complete Modal */}
      <ConfirmationDialog
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleMarkComplete}
        title="Complete Possession Block?"
        description="Verify all personnel, heavy tamping machinery, and tools are cleared from track TR-02."
        confirmLabel="Confirm Track Clearance"
        loading={actionLoading}
      />

      {/* Issue Modal */}
      {issueType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-red-700">REPORT {issueType}</h3>
            <p className="text-xs text-gray-600">Provide details for the Section Controller:</p>
            <textarea
              rows={3}
              value={issueNotes}
              onChange={e => setIssueNotes(e.target.value)}
              placeholder="Describe situation, required extension minutes, or safety obstacle..."
              className="w-full border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2">
              <SecondaryButton size="sm" onClick={() => setIssueType(null)}>Cancel</SecondaryButton>
              <DangerButton size="sm" onClick={handleReportIssue} disabled={actionLoading}>
                Transmit Alert
              </DangerButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
