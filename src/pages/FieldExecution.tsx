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
import { CheckCircle2, Clock, Users, Wrench, AlertTriangle, ShieldCheck, Home, Calendar, AlertOctagon } from 'lucide-react';
import { clsx } from 'clsx';

export default function FieldExecution() {
  const [block, setBlock] = useState<FieldBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'block' | 'report'>('block');

  // Issue reporting modal
  const [issueType, setIssueType] = useState<string | null>(null);
  const [issueNotes, setIssueNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    async function loadFieldBlock() {
      try {
        const data = await executionApi.getFieldBlock('BR-00231');
        setBlock(data);
      } catch {
        toast.error('Failed to load field block');
      } finally {
        setLoading(false);
      }
    }
    loadFieldBlock();
  }, []);

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

  if (loading || !block) {
    return <LoadingState message="Loading Field Execution Dossier..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-gray-300">
      {/* Mobile Top Header matching wireframe 9 */}
      <div className="bg-[#0F2240] text-white p-4 sticky top-0 z-20 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-wider">RAILWAY FIELD OPS</h1>
            <p className="text-[11px] text-blue-200">Engineering & S&T • {block.track}</p>
          </div>
          <span className="text-[10px] bg-green-600 text-white font-bold px-2 py-0.5 rounded-full">
            ON TRACK
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            TODAY'S APPROVED BLOCK
          </h2>
          <span className="text-[11px] text-gray-400 font-mono">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Block Card matching wireframe 9 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {block.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE'}
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">POSSESSION #</span>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-mono">{block.blockId}</h3>
            <p className="text-xs text-gray-600 font-medium mt-0.5">{block.track} • {block.location}</p>
          </div>

          {/* Time timeline */}
          <div className="flex items-center justify-between py-2 border-y border-gray-100 text-sm">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{block.startTime}</span>
            </div>
            <div className="flex-1 mx-3 border-t-2 border-dashed border-gray-300 relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-1 text-[10px] text-gray-400">
                90 min
              </span>
            </div>
            <div className="font-bold text-gray-900">{block.endTime}</div>
          </div>

          {/* Jobs & Tasks matching wireframe 9 */}
          {block.jobs.map((job, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <span className="font-bold text-gray-800 uppercase tracking-wide">
                {job.department} — {job.description}
              </span>
              <ul className="space-y-1 text-gray-600 pl-2">
                {job.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Team & Machine matching wireframe 9 */}
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

        {/* Progress Bar matching wireframe 9 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-500 uppercase tracking-wider">PROGRESS</span>
            <span className="text-blue-900 font-mono text-sm">{block.progress}%</span>
          </div>

          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-900 h-full rounded-full transition-all duration-500"
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
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                )}
              >
                {pct}%
              </button>
            ))}
          </div>

          {block.status !== 'COMPLETED' && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="w-full mt-3 bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              MARK WORK COMPLETE
            </button>
          )}
        </div>

        {/* Report Issue Buttons matching wireframe 9 */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            REPORT EXCEPTION / ISSUE
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setIssueType('BLOCK OVERRUN')}
              className="w-full bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 font-bold py-2.5 px-4 rounded-lg border border-gray-300 hover:border-red-300 text-xs text-left transition-colors flex items-center justify-between"
            >
              <span>BLOCK OVERRUN (Estimated Delay)</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => setIssueType('EQUIPMENT ISSUE')}
              className="w-full bg-white hover:bg-amber-50 text-gray-800 hover:text-amber-700 font-bold py-2.5 px-4 rounded-lg border border-gray-300 hover:border-amber-300 text-xs text-left transition-colors flex items-center justify-between"
            >
              <span>EQUIPMENT ISSUE / BREAKDOWN</span>
              <Wrench className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setIssueType('SAFETY ISSUE')}
              className="w-full bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 font-bold py-2.5 px-4 rounded-lg border border-gray-300 hover:border-red-300 text-xs text-left transition-colors flex items-center justify-between"
            >
              <span>SAFETY ISSUE / TRACK HAZARD</span>
              <AlertOctagon className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation matching wireframe 9 */}
      <div className="bg-white border-t border-gray-200 py-2.5 px-6 flex items-center justify-around text-xs sticky bottom-0 z-20">
        <button
          onClick={() => setActiveTab('home')}
          className={clsx('flex flex-col items-center gap-1', activeTab === 'home' ? 'text-blue-900 font-bold' : 'text-gray-400')}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('block')}
          className={clsx('flex flex-col items-center gap-1', activeTab === 'block' ? 'text-blue-900 font-bold' : 'text-gray-400')}
        >
          <Calendar className="w-4 h-4" />
          <span>Block</span>
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={clsx('flex flex-col items-center gap-1', activeTab === 'report' ? 'text-blue-900 font-bold' : 'text-gray-400')}
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

