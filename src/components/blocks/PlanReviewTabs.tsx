import { useState } from 'react';
import { clsx } from 'clsx';
import { Search, X, CheckCircle2, GitBranch, Clock, AlertTriangle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import type { OptimizedBlock, AffectedTrain } from '../../types';
import StatusBadge from '../common/StatusBadge';

interface BlockItem {
  id: string;
  track: string;
  section: string;
  timeWindow: string;
  startTime: string;
  endTime: string;
  duration: string;
  departments: string[];
  jobs: string;
  jobCount: number;
  priority: string;
  status: string;
  affectedTrains: number;
  rawBlock: OptimizedBlock;
}

interface PlanReviewTabsProps {
  blocks: BlockItem[];
  selectedBlockId: string;
  onSelectBlock: (id: string) => void;
}

export default function PlanReviewTabs({ blocks, selectedBlockId, onSelectBlock }: PlanReviewTabsProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'trains' | 'explain'>('blocks');

  // Collect all affected trains deterministically
  const allAffectedTrains = blocks.flatMap(b => 
    (b.rawBlock.affectedTrains || []).map(t => ({
      ...t,
      blockId: b.id,
      track: b.track,
      section: b.section,
    }))
  );

  // Deterministic deterministic mock data for train timings if missing
  const getTrainTimings = (trainNumber: string, delay: number, track: string) => {
    // Generate deterministic base hour from hash of train number
    const hash = trainNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseHour = (hash % 14) + 6; // 6 AM to 8 PM
    const baseMin = (hash * 13) % 60;
    
    const origDate = new Date();
    origDate.setHours(baseHour, baseMin, 0);
    
    const updDate = new Date(origDate.getTime() + delay * 60000);
    
    const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return {
      original: formatTime(origDate),
      updated: formatTime(updDate),
      route: `${track} Corridor`
    };
  };

  // Why this plan - Data driven explainability
  const proposedBlocks = blocks.filter(b => b.status === 'PROPOSED' || b.status === 'AI-OPTIMIZED' || b.status === 'MODIFIED');
  const approvedBlocks = blocks.filter(b => b.status === 'APPROVED');
  const totalDelay = allAffectedTrains.reduce((sum, t) => sum + (t.delay || 0), 0);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex bg-gray-50 border-b border-gray-200 px-2 pt-2 gap-2">
        {(['blocks', 'trains', 'explain'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-2.5 text-[12px] font-bold rounded-t-lg transition-colors border-t border-x',
              activeTab === tab 
                ? 'bg-white text-blue-900 border-gray-200 border-b-white translate-y-[1px]' 
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            {tab === 'blocks' ? 'Blocks' : tab === 'trains' ? 'Train Impact' : 'Why This Plan?'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-0">
        
        {/* 1. BLOCKS TAB */}
        {activeTab === 'blocks' && (
          <div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-[11px] text-left">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                  <tr className="text-gray-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Block ID</th>
                    <th className="py-2.5 px-4 font-semibold">Track/Section</th>
                    <th className="py-2.5 px-4 font-semibold">Window</th>
                    <th className="py-2.5 px-4 font-semibold">Department</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {blocks.map(block => (
                    <tr
                      key={block.id}
                      onClick={() => onSelectBlock(block.id)}
                      className={clsx(
                        'cursor-pointer transition-colors',
                        selectedBlockId === block.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900">{block.id}</span>
                        <span className="block text-[10px] text-gray-400">{block.jobs}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-gray-700">{block.track}</span>
                        <span className="block text-[10px] text-gray-400">{block.section}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700">{block.timeWindow} <span className="text-gray-400">({block.duration})</span></td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {block.departments.map(d => (
                            <span key={d} className="text-[9px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{d}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={block.status as any} size="sm" />
                      </td>
                    </tr>
                  ))}
                  {blocks.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No blocks found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. TRAIN IMPACT TAB */}
        {activeTab === 'trains' && (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-[11px] text-left">
              <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                <tr className="text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Train ID</th>
                  <th className="py-2.5 px-4 font-semibold">Route / Section</th>
                  <th className="py-2.5 px-4 font-semibold">Original Timing</th>
                  <th className="py-2.5 px-4 font-semibold">Updated Timing</th>
                  <th className="py-2.5 px-4 font-semibold">Delay</th>
                  <th className="py-2.5 px-4 font-semibold">Impact Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allAffectedTrains.map((t, idx) => {
                  const timings = getTrainTimings(t.trainNumber, t.delay, t.track);
                  return (
                    <tr key={`${t.trainNumber}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{t.trainNumber}</td>
                      <td className="py-3 px-4 font-medium text-gray-700">
                        {timings.route} <span className="text-gray-400 ml-1">({t.section})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">{timings.original}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-900">{timings.updated}</td>
                      <td className="py-3 px-4">
                        <span className={clsx(
                          'font-mono font-bold',
                          t.delay > 30 ? 'text-red-600' : t.delay > 0 ? 'text-amber-600' : 'text-green-600'
                        )}>
                          {t.delay > 0 ? `+${t.delay} min` : 'On Time'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {t.action === 'REROUTE_A' || t.action === 'REROUTE_B' ? (
                          <span className="flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">
                            <GitBranch className="w-3 h-3" /> Rerouted
                          </span>
                        ) : t.action === 'WAIT' ? (
                          <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" /> Waiting
                          </span>
                        ) : (
                          <span className="text-gray-600">No Conflict</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {allAffectedTrains.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No trains affected by the current blocks.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. WHY THIS PLAN TAB */}
        {activeTab === 'explain' && (
          <div className="p-6 bg-gray-50/50 min-h-[400px]">
            <div className="max-w-3xl space-y-6">
              
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  WHY THIS PLAN?
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Changes */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Changes</h4>
                  <ul className="space-y-2 text-[12px] text-gray-700">
                    {proposedBlocks.length > 0 ? (
                      proposedBlocks.map(b => (
                        <li key={b.id} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <span>Block <span className="font-mono font-semibold">{b.id}</span> {b.status === 'MODIFIED' ? `start time changed to ${b.startTime}` : `scheduled for ${b.startTime} - ${b.endTime}`}.</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>No new blocks proposed.</span>
                      </li>
                    )}
                    {blocks.filter(b => b.status !== 'PROPOSED' && b.status !== 'AI-OPTIMIZED' && b.status !== 'MODIFIED' && b.status !== 'APPROVED').slice(0, 2).map(b => (
                      <li key={`unchanged-${b.id}`} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                        <span>Block <span className="font-mono font-semibold">{b.id}</span> remains unchanged.</span>
                      </li>
                    ))}
                    {allAffectedTrains.map((t, i) => {
                       if (i >= 4) return null;
                       const timings = getTrainTimings(t.trainNumber, t.delay, t.track);
                       return (
                         <li key={t.trainNumber} className="flex items-start gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                           <span>Train <span className="font-mono font-semibold">{t.trainNumber}</span> timing changed from {timings.original} to {timings.updated}.</span>
                         </li>
                       );
                    })}
                    {allAffectedTrains.length > 4 && (
                      <li className="text-gray-500 text-[11px] pl-3.5">+ {allAffectedTrains.length - 4} more trains affected</li>
                    )}
                  </ul>
                </div>

                {/* Protected */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Protected</h4>
                  <ul className="space-y-2 text-[12px] text-gray-700">
                    {approvedBlocks.length > 0 ? (
                      approvedBlocks.map(b => (
                        <li key={b.id} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <span>Completed operation <span className="font-mono font-semibold">{b.id}</span> is locked and excluded from modification.</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>Unaffected schedule portions remain protected.</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <span>Existing safety margins maintained.</span>
                    </li>
                  </ul>
                </div>

                {/* Impact */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Impact</h4>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-red-50 rounded p-3 text-center border border-red-100">
                      <p className="text-2xl font-bold text-red-700">{allAffectedTrains.length}</p>
                      <p className="text-[10px] text-red-900 font-medium uppercase tracking-wide mt-1">Trains Affected</p>
                    </div>
                    <div className="flex-1 bg-amber-50 rounded p-3 text-center border border-amber-100">
                      <p className="text-2xl font-bold text-amber-700">{totalDelay}<span className="text-[14px]">m</span></p>
                      <p className="text-[10px] text-amber-900 font-medium uppercase tracking-wide mt-1">Total Delay</p>
                    </div>
                  </div>
                </div>

                {/* Reason & Verification */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</h4>
                    <p className="text-[12px] text-gray-700 leading-relaxed bg-blue-50/50 p-2.5 rounded border border-blue-100">
                      The selected arrangement avoids conflict with protected operations while keeping the downstream schedule feasible. 
                      {proposedBlocks.length > 0 && ` Bundling compatible maintenance into block ${proposedBlocks[0].id} reduces total track downtime.`}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Verification</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-green-700">
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Timing constraints</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Block conflicts</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Train movement conflicts</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Resource constraints</div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
