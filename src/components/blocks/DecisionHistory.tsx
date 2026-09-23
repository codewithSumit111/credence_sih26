import React from 'react';
import { Clock, User, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { DecisionHistoryEntry } from '../../types';
import { clsx } from 'clsx';

interface Props {
  history: DecisionHistoryEntry[];
}

export default function DecisionHistory({ history }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-gray-200 p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          DECISION HISTORY
        </p>
        <p className="text-[12px] text-slate-500">
          Audit trail of human and system actions on this block recommendation.
        </p>
      </div>
      
      <div className="p-4">
        <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-2">
          {history.map((entry, idx) => {
            const isSystem = entry.userRole.toLowerCase() === 'system';
            const isApproval = entry.status === 'APPROVED';
            
            return (
              <div key={idx} className="relative pl-6">
                <div className={clsx(
                  "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
                  isApproval ? "bg-green-500" : isSystem ? "bg-blue-400" : "bg-slate-700"
                )}>
                  {isApproval ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono text-gray-400 font-bold">{entry.timestamp}</span>
                  <div className={clsx(
                    "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                    isSystem ? "text-blue-700 bg-blue-50" : "text-slate-700 bg-slate-100"
                  )}>
                    {isSystem ? <Clock className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {entry.userRole}
                  </div>
                </div>
                
                <p className="text-[13px] text-slate-800 font-semibold leading-tight">
                  {entry.action}
                </p>
                
                {entry.modifiedFields && entry.modifiedFields.length > 0 && (
                  <div className="mt-2 space-y-1.5 bg-slate-50 border border-slate-200 rounded p-2">
                    {entry.modifiedFields.map((field, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-500 font-medium">{field.field}:</span>
                        <span className="text-slate-400 line-through">{field.previousValue}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-800 font-bold">{field.newValue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
