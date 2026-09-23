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
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'APPROVED') return 'IMPOSED'; // To match screenshot terms
    if (status === 'AI-OPTIMIZED') return 'PROPOSED';
    return status;
  };

  // Safe extract array 
  const depts = Array.isArray(block.departments) ? block.departments : ['ENGG (-)'];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Header Info */}
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
        
        {/* Identification */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Identification</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <span className="text-gray-500 font-medium">Department</span>
            <div className="flex flex-wrap gap-1">
              {depts.map((d: string) => (
                <span key={d} className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {d}
                </span>
              ))}
            </div>
            
            <span className="text-gray-500 font-medium">Division</span>
            <span className="font-semibold">CSTM (Demo)</span>
            
            <span className="text-gray-500 font-medium">Sub Section</span>
            <span className="font-semibold">{block.section}</span>
            
            <span className="text-gray-500 font-medium">Line</span>
            <span className="font-semibold">{block.track} / UP</span>
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Location</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <span className="text-gray-500 font-medium">From</span>
            <span className="font-semibold">53.400</span>
            
            <span className="text-gray-500 font-medium">To</span>
            <span className="font-semibold">53.300</span>
          </div>
        </section>

        {/* Block Demanded */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Block Demanded</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <span className="text-gray-500 font-medium">Type</span>
            <span className="font-semibold">{(block as any).type || 'TRACMACHINE'}</span>
            
            <span className="text-gray-500 font-medium">Reason</span>
            <span className="font-semibold">ENGG-TRACK MACHINE WORKING</span>
            
            <span className="text-gray-500 font-medium">Start</span>
            <span className="font-semibold">{block.startTime}</span>
            
            <span className="text-gray-500 font-medium">End</span>
            <span className="font-semibold">{block.endTime}</span>
            
            <span className="text-gray-500 font-medium">Duration</span>
            <span className="font-semibold">{block.duration} hrs</span>
          </div>
        </section>

        {/* Permitted / Imposed */}
        <section>
          <h3 className="text-[10px] font-bold text-irctc-muted uppercase tracking-wider mb-3 border-b border-gray-200 pb-1">Permitted / Imposed</h3>
          <div className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <span className="text-gray-500 font-medium">Actual Start</span>
            <span className="font-semibold">—</span>
            
            <span className="text-gray-500 font-medium">Clear Time</span>
            <span className="font-semibold">—</span>
            
            <span className="text-gray-500 font-medium">Total Duration</span>
            <span className="font-semibold">—</span>
            
            <span className="text-gray-500 font-medium">Organization</span>
            <span className="font-semibold">Railway Board</span>
          </div>
        </section>

      </div>

      {/* Action Buttons if pending approval */}
      {(block.status === 'PROPOSED' || block.status === 'AI-OPTIMIZED') && (
        <div className="bg-white p-4 border-t border-gray-200 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button onClick={onApprove} className="irctc-btn irctc-btn-primary w-full justify-center py-2.5 text-[13px]">
            Approve & Impose Block
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
