import React from 'react';
import { OptimizedBlock } from '../../types';
import { clsx } from 'clsx';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface TrackBlockDetailsProps {
  block: OptimizedBlock;
  onApprove?: () => void;
  onReject?: () => void;
  onModify?: () => void;
}

export default function TrackBlockDetails({ block, onApprove, onReject, onModify }: TrackBlockDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IMPOSED':
      case 'APPROVED': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'AI-OPTIMIZED':
      case 'PROPOSED': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ACTIVE': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'COMPLETED': return 'text-green-700 bg-green-50 border-green-200';
      case 'MODIFIED': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'AI-OPTIMIZED') return 'PROPOSED';
    return status;
  };

  const depts = Array.isArray(block.departments) ? block.departments : ['ENGG (-)'];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Header */}
      <div className="bg-white p-5 border-b border-gray-200">
        <p className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-1">COA Block ID</p>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-irctc-navy">{block.id}</h2>
          <span className={clsx('px-3 py-1 text-[11px] font-bold rounded uppercase border', getStatusColor(block.status))}>
            ● {getStatusLabel(block.status)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-[12px] text-gray-800">
        
        {/* BLOCK SUMMARY */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Block Summary</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <span className="text-gray-500 font-medium">Department</span>
            <div className="flex flex-wrap gap-1">
              {depts.map((d: string) => (
                <span key={d} className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {d}
                </span>
              ))}
            </div>
            
            <span className="text-gray-500 font-medium">Section</span>
            <span className="font-semibold">{block.section}</span>
            
            <span className="text-gray-500 font-medium">Track / Line</span>
            <span className="font-semibold">{block.track}</span>
            
            <span className="text-gray-500 font-medium">Proposed Window</span>
            <span className="font-semibold">{block.startTime} — {block.endTime}</span>
            
            <span className="text-gray-500 font-medium">Duration</span>
            <span className="font-semibold">{block.duration} minutes</span>

            <span className="text-gray-500 font-medium">Current Status</span>
            <span className="font-semibold capitalize">{getStatusLabel(block.status).toLowerCase()}</span>
          </div>
        </section>

        {/* WHY THIS BLOCK? */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Why This Block?</h3>
          <div className="bg-white p-3 rounded border border-gray-200 space-y-2 text-[12px]">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Selected for the <strong>{block.startTime}–{block.endTime}</strong> window because the required maintenance duration is <strong>{block.duration} minutes</strong> and this represents an available feasible window.</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Resolves <strong>{block.jobIds?.length || 1} pending maintenance requirement(s)</strong> {block.bundled ? 'grouped together on the same section to reduce repeated track possessions.' : 'on this track section.'}</span>
            </p>
            {(block.whyThisSlot || []).slice(0, 2).map((reason, i) => (
              <p key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </p>
            ))}
          </div>
        </section>

        {/* IMPACT / RESULT */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Impact / Result</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <span className="text-gray-500 font-medium">Trains Affected</span>
            <span className="font-semibold flex items-center gap-1.5">
              {block.expectedDelay > 0 ? (
                <><AlertTriangle className="w-3.5 h-3.5 text-irctc-orange" /> {Math.ceil(block.expectedDelay / 15)} train(s)</>
              ) : (
                'None (Zero Impact)'
              )}
            </span>
            
            <span className="text-gray-500 font-medium">Estimated Delay</span>
            <span className="font-semibold text-irctc-orange">+{block.expectedDelay} min total</span>
            
            <span className="text-gray-500 font-medium">Section Impact</span>
            <span className="font-semibold">{block.section} operation restricted</span>
          </div>
        </section>
        
        {/* DECISION / STATUS */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Decision / Status</h3>
          <div className="p-3 rounded bg-gray-50 border border-gray-200">
            <p className="font-medium text-gray-800">
              {block.status === 'APPROVED' ? '✓ Authorized by Section Controller. Rerouting active.' :
               block.status === 'MODIFIED' ? '↻ Modified by Section Controller. Active.' :
               block.status === 'COMPLETED' ? '✓ Maintenance completed and logged.' :
               'Awaiting Section Controller review.'}
            </p>
          </div>
        </section>

      </div>

      {/* Action Buttons if pending approval */}
      {(block.status === 'PROPOSED' || block.status === 'AI-OPTIMIZED') && (
        <div className="bg-white p-4 border-t border-gray-200 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button onClick={onApprove} className="irctc-btn irctc-btn-primary w-full justify-center py-2.5 text-[13px]">
            Approve & Commit Block
          </button>
          <div className="flex gap-3">
            <button onClick={onModify} className="irctc-btn irctc-btn-outline flex-1 justify-center py-2 text-[12px]">
              Modify
            </button>
            <button onClick={onReject} className="irctc-btn irctc-btn-outline flex-1 justify-center py-2 text-[12px] text-red-600 hover:bg-red-50 hover:border-red-200">
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
