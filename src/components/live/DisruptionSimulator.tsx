import { useState } from 'react';
import { Play, AlertOctagon, Zap } from 'lucide-react';
import type { LiveEvent } from '../../types';

interface DisruptionSimulatorProps {
  onInject: (event: LiveEvent) => void;
}

export default function DisruptionSimulator({ onInject }: DisruptionSimulatorProps) {
  const [type, setType] = useState('failure');
  const [track, setTrack] = useState('TR-DR-TNA-UP');
  
  const handleInject = () => {
    const newEvent: LiveEvent = {
      id: `EV-${Math.floor(Math.random() * 10000)}`,
      type: type === 'failure' ? 'TRACK_FAILURE' : 'BLOCK_OVERRUN',
      title: type === 'failure' ? 'Track Failure Detected' : 'Block Overrun',
      description: type === 'failure' ? `Sudden track failure reported on ${track}.` : `Maintenance on ${track} exceeded planned window.`,
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      location: track,
      status: 'OPEN',
      affectedTrains: type === 'failure' ? ['12123', '11008'] : ['22145'],
      affectedBlocks: type === 'failure' ? ['CB-0BB0E9'] : ['CB-0BB0E9'],
      systemImpact: {
        trainsAffected: type === 'failure' ? 2 : 1,
        blocksOverrunning: type === 'failure' ? 0 : 1,
        routeRecalculations: type === 'failure' ? 2 : 1,
        safetyViolations: 0,
      },
      timeline: [
        { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), description: type === 'failure' ? 'Track failure reported by locomotive pilot.' : 'Field crew reported delay in completion.', isAlert: true }
      ]
    };
    onInject(newEvent);
  };

  return (
    <div className="irctc-card bg-red-50/50 border-red-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertOctagon className="w-5 h-5 text-red-600" />
        <h3 className="text-[14px] font-bold text-red-900 uppercase tracking-wide">Report Live Event</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Event Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full text-[12px] p-2 border rounded border-red-200">
            <option value="failure">Track Failure</option>
            <option value="overrun">Block Overrun</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Location</label>
          <select value={track} onChange={e => setTrack(e.target.value)} className="w-full text-[12px] p-2 border rounded border-red-200">
            <option value="TR-DR-TNA-UP">TR-DR-TNA-UP</option>
            <option value="TR-KSRA-IGP-UP">TR-KSRA-IGP-UP</option>
            <option value="TR-ATG-THS-UP">TR-ATG-THS-UP</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={handleInject}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] rounded-lg transition-colors shadow-sm"
      >
        <AlertOctagon className="w-4 h-4" />
        Report Disruption
      </button>
    </div>
  );
}
