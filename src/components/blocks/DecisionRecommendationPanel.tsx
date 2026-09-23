import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Train, Shield, Settings2, Info } from 'lucide-react';
import { clsx } from 'clsx';
import type { OptimizedBlock, BlockAlternative, AffectedTrain } from '../../types';

interface Props {
  block: OptimizedBlock;
  alternative?: BlockAlternative;
  onApprove: () => void;
  onModify: () => void;
  onReject: () => void;
}

export default function DecisionRecommendationPanel({ block, alternative, onApprove, onModify, onReject }: Props) {
  const currentPlan = alternative || block;
  const isAlternative = !!alternative;
  
  // Use properties from either the block or the alternative
  const advantages = currentPlan.advantages || [];
  const tradeoffs = currentPlan.tradeoffs || [];
  const reasoning = (currentPlan as any).reasoning || block.whyThisSlot || [];
  const hardConstraints = block.constraintStatus?.hard || [];
  const softConstraints = block.constraintStatus?.soft || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* SITUATION & RECOMMENDATION HEADER */}
      <div className="bg-slate-50 border-b border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              SITUATION
            </p>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
              Requested maintenance block on <span className="font-bold text-slate-900">{block.track}</span> requires {block.duration} min.
              System analyzed {block.jobIds?.length || 1} job(s) and associated train movements.
            </p>
          </div>
          {currentPlan.score && (
            <div className="text-right ml-4 shrink-0 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
              <p className="text-lg font-bold text-blue-700 leading-none">{currentPlan.score}<span className="text-[10px] text-gray-400 font-normal">/100</span></p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
            RECOMMENDATION
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-[14px] text-slate-900 font-semibold">
              {isAlternative 
                ? `Apply alternative: ${(currentPlan as BlockAlternative).label} (${currentPlan.startTime} - ${currentPlan.endTime})` 
                : `Approve proposed block ${block.id} from ${block.startTime} to ${block.endTime}.`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* WHY THIS PLAN */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" /> Why this plan?
          </h4>
          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 space-y-1.5">
            {reasoning.map((r: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-blue-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ADVANTAGES & TRADE-OFFS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Advantages
            </h4>
            <ul className="space-y-1.5">
              {advantages.map((adv: string, i: number) => (
                <li key={i} className="text-[11px] text-emerald-800 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span> {adv}
                </li>
              ))}
              {advantages.length === 0 && <li className="text-[11px] text-emerald-600 italic">None specified</li>}
            </ul>
          </div>
          
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Trade-offs
            </h4>
            <ul className="space-y-1.5">
              {tradeoffs.map((td: string, i: number) => (
                <li key={i} className="text-[11px] text-amber-900 flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">⚠</span> {td}
                </li>
              ))}
              {tradeoffs.length === 0 && <li className="text-[11px] text-amber-600 italic">No significant trade-offs</li>}
            </ul>
          </div>
        </div>

        {/* CONSTRAINTS (Expandable or always visible small) */}
        {(hardConstraints.length > 0 || softConstraints.length > 0) && (
          <div>
             <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> Constraint Satisfaction
            </h4>
            <div className="flex gap-4">
              {hardConstraints.length > 0 && (
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-700 mb-1">Hard Constraints (Met)</p>
                  <ul className="text-[11px] text-slate-500 space-y-0.5">
                    {hardConstraints.map((c: string, i: number) => <li key={i} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {c}</li>)}
                  </ul>
                </div>
              )}
              {softConstraints.length > 0 && (
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-slate-700 mb-1">Soft Objectives</p>
                  <ul className="text-[11px] text-slate-500 space-y-0.5">
                    {softConstraints.map((c: string, i: number) => <li key={i} className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AFFECTED TRAINS */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-slate-400" /> Affected Trains
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {block.affectedTrains && block.affectedTrains.length > 0 ? (
              block.affectedTrains.map((train, idx) => (
                <div key={idx} className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Train className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">🚆 {train.trainNumber}</p>
                      <p className="text-[11px] text-slate-500">
                        {train.action === 'WAIT' ? 'Arrival overlaps block' : 
                         train.action.startsWith('REROUTE') ? 'Alternate route available' : 'Unchanged'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {train.action === 'WAIT' && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        WAIT: +{train.delay} min
                      </span>
                    )}
                    {train.action.startsWith('REROUTE') && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        REROUTE: +{train.delay} min
                      </span>
                    )}
                    {train.action === 'NO_CONFLICT' && (
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                        Unchanged
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[12px] text-slate-500">
                No trains affected by this block.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DECISION ACTION PANEL */}
      <div className="bg-slate-50 border-t border-gray-200 p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
          CONTROLLER ACTION
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            className="flex-1 py-2.5 px-4 bg-white border border-red-200 text-red-700 text-[12px] font-bold rounded-lg hover:bg-red-50 transition-colors flex justify-center items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" /> Reject
          </button>
          
          <button
            onClick={onModify}
            className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 text-[12px] font-bold rounded-lg hover:bg-slate-100 transition-colors flex justify-center items-center gap-2"
          >
            <Settings2 className="w-4 h-4" /> Modify
          </button>
          
          <button
            onClick={onApprove}
            className="flex-2 py-2.5 px-6 bg-[#E85D04] hover:bg-orange-700 text-white text-[13px] font-bold rounded-lg transition-colors flex justify-center items-center shadow-md shadow-orange-500/20"
          >
            ✓ Approve Plan
          </button>
        </div>
      </div>
    </div>
  );
}
