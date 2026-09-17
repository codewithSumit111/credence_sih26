import { AlertTriangle, Clock, Users, Wrench } from 'lucide-react';
import type { OptimizedBlock } from '../../types';

interface Props {
  block: OptimizedBlock;
}

export default function ImpactPanel({ block }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
        OPERATIONAL IMPACT & RESOURCES
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Expected Delay</span>
          </div>
          <p className="text-base font-bold text-gray-900">+{block.expectedDelay} min</p>
        </div>

        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Trains Affected</span>
          </div>
          <p className="text-base font-bold text-gray-900">{block.affectedTrains.length} Trains</p>
        </div>

        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-green-600" />
            <span>Manpower</span>
          </div>
          <p className="text-base font-bold text-gray-900">{block.resources.manpower} Workers</p>
        </div>

        <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
            <span>Resources</span>
          </div>
          <p className="text-xs font-semibold text-green-700">
            {block.resources.available ? '✓ Verified Available' : '⚠ Resource Conflict'}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">AFFECTED TRAINS DETAIL</p>
        <div className="space-y-1.5">
          {block.affectedTrains.map(train => (
            <div key={train.trainNumber} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
              <span className="font-bold text-gray-800">Train {train.trainNumber}</span>
              <span className="text-gray-600">
                {train.action === 'REROUTE_A' && '→ Reroute A via TR-04'}
                {train.action === 'REROUTE_B' && '→ Reroute B'}
                {train.action === 'WAIT' && `→ +${train.delay} min wait on TR-02`}
                {train.action === 'NO_CONFLICT' && '→ No conflict (Cleared)'}
              </span>
              <span className="font-semibold text-gray-700 font-mono">
                {train.delay > 0 ? `+${train.delay}m delay` : '0m delay'}
              </span>
            </div>
          ))}
          {block.affectedTrains.length === 0 && (
            <p className="text-xs text-gray-400 italic">No scheduled trains conflicting in this window.</p>
          )}
        </div>
      </div>
    </div>
  );
}

