import React from 'react';
import { X, Clock, MapPin, Calendar, CheckCircle, Info } from 'lucide-react';
import { OptimizedBlock } from '../../types';
import { clsx } from 'clsx';

interface BlockDetailsPanelProps {
  block: OptimizedBlock;
  onClose: () => void;
  onApprove?: (blockId: string) => void;
}

export default function BlockDetailsPanel({ block, onClose, onApprove }: BlockDetailsPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-irctc-orange bg-orange-50 border-orange-200';
      case 'AI-OPTIMIZED':
      case 'PROPOSED': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'ACTIVE': return 'text-irctc-blue bg-blue-50 border-blue-200';
      case 'COMPLETED': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'APPROVED') return 'FINALIZED';
    if (status === 'AI-OPTIMIZED') return 'PROPOSED';
    return status;
  };

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 z-[500] bg-white border border-irctc-border rounded-xl shadow-irctc-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div>
          <h3 className="font-bold text-[14px] text-irctc-navy">Block {block.id}</h3>
          <span className={clsx('inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase', getStatusColor(block.status))}>
            {getStatusLabel(block.status)}
          </span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-[12px] text-gray-700">
        
        {/* Track & Section */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-irctc-muted uppercase">Location</label>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-irctc-blue mt-0.5" />
            <div>
              <p className="font-bold text-irctc-navy text-[13px]">{block.section}</p>
              <p>Track: {block.track || 'UP/DN Main'}</p>
            </div>
          </div>
        </div>

        {/* Window & Duration */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-irctc-muted uppercase">Block Window</label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-irctc-blue" />
            <div className="flex-1 flex justify-between items-center border bg-gray-50 rounded px-2 py-1.5">
              <span className="font-bold">{block.startTime}</span>
              <span className="h-px w-6 bg-gray-300"></span>
              <span className="font-bold">{block.endTime}</span>
            </div>
          </div>
          <p className="ml-6 mt-1 text-[11px] text-gray-500">Duration: {block.duration} hours</p>
        </div>

        {/* Job Details */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-irctc-muted uppercase">Work Info</label>
          <div className="bg-blue-50/50 border border-blue-100 rounded p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-irctc-navy">Jobs Bundled:</span>
              <span className="font-bold text-irctc-blue">{block.jobIds?.length || 1}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-irctc-navy">Priority:</span>
              <span className={clsx('font-bold', block.priority === 'High' ? 'text-red-600' : 'text-amber-600')}>{block.priority}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-irctc-navy">Departments:</span>
              <span>{block.departments?.join(', ') || 'ENGG'}</span>
            </div>
          </div>
        </div>
        
        {/* Why this slot */}
        {block.whyThisSlot && block.whyThisSlot.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-irctc-muted uppercase flex items-center gap-1">
              <Info className="w-3 h-3" /> System Reasoning
            </label>
            <ul className="space-y-1">
              {block.whyThisSlot.map((reason, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      {(block.status === 'PROPOSED' || block.status === 'AI-OPTIMIZED') && onApprove && (
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => onApprove(block.id)}
            className="w-full irctc-btn irctc-btn-primary justify-center py-2.5 text-[13px]"
          >
            Approve Block
          </button>
        </div>
      )}
    </div>
  );
}
