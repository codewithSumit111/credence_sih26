import { useState } from 'react';
import { Play, AlertOctagon, Zap } from 'lucide-react';
import type { LiveEvent } from '../../types';

interface DisruptionSimulatorProps {
  onInject: (event: LiveEvent) => void;
}

export default function DisruptionSimulator({ onInject }: DisruptionSimulatorProps) {
  const [type, setType] = useState('failure');
  const [track, setTrack] = useState('TR-02');
  
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
      affectedBlocks: type === 'failure' ? ['BR-00231', 'BR-00232'] : ['BR-00100'],
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
    <div className="irctc-card bg-amber-50/50 border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-600" />
        <h3 className="text-[14px] font-bold text-amber-900 uppercase tracking-wide">Inject Disruption</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Scenario Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full text-[12px] p-2 border rounded border-amber-200">
            <option value="failure">Track Failure</option>
            <option value="overrun">Block Overrun</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Location</label>
          <select value={track} onChange={e => setTrack(e.target.value)} className="w-full text-[12px] p-2 border rounded border-amber-200">
            <option value="TR-02">TR-02</option>
            <option value="TR-04">TR-04</option>
            <option value="TR-07">TR-07</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={handleInject}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[12px] rounded-lg transition-colors shadow-sm"
      >
        <Play className="w-4 h-4" />
        Inject Live Event
      </button>
    </div>
  );
}
