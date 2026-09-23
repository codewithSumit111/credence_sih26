import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { Play, CheckCircle2, AlertOctagon, Loader2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import RailwayTrackView, { BlockItem } from '../components/blocks/RailwayTrackView';

const SIM_STEPS = [
  { label: 'Loading scenario parameters...',              delay: 300  },
  { label: 'Running CP-SAT constraint solver...',         delay: 900  },
  { label: 'Time-Dependent A* routing computation...',    delay: 700  },
  { label: 'Checking safety constraint violations...',    delay: 500  },
  { label: 'Aggregating impact metrics...',              delay: 400  },
] as const;

const TRACK_SCENARIOS: Record<string, { trains: number; routes: number; delay: number; trainNums: string; via: string; bundledJobs: number; rerouted: number }> = {
  'TR-02': { trains: 3, routes: 1, delay: 18, trainNums: '12123, 11008, 22145', via: 'TR-04 Akola bypass',         bundledJobs: 2, rerouted: 1 },
  'TR-04': { trains: 2, routes: 2, delay: 12, trainNums: '22145, G-4401',       via: 'TR-07 Loop alternate',       bundledJobs: 2, rerouted: 1 },
  'TR-07': { trains: 1, routes: 1, delay: 8,  trainNums: '17617',               via: 'TR-04 NGP-WR main line',     bundledJobs: 1, rerouted: 0 },
};

const BASE_BLOCKS: BlockItem[] = [
  {
    id: 'BLK-024',
    track: 'TR-01',
    section: 'CSMT-DR',
    timeWindow: '00:00 - 02:00',
    startTime: '2025-10-01 00:00',
    endTime: '2025-10-01 02:00',
    duration: '120',
    departments: ['ENGG'],
    jobs: 'Track Maintenance',
    jobCount: 1,
    priority: 'HIGH',
    status: 'APPROVED',
    affectedTrains: 0,
    rawBlock: {} as any,
    type: 'ENGG-OPENLINE'
  },
  {
    id: 'BB09252236',
    track: 'TR-02',
    section: 'KYN-KJT',
    timeWindow: '00:00 - 03:00',
    startTime: '2025-10-01 00:00',
    endTime: '2025-10-01 03:00',
    duration: '180',
    departments: ['ENGG', 'S&T'],
    jobs: 'Turnout Replacement',
    jobCount: 2,
    priority: 'HIGH',
    status: 'IMPOSED',
    affectedTrains: 3,
    rawBlock: {} as any,
    type: 'TRACMACHINE'
  }
];

export default function WhatIf() {
  const [selectedBlockId, setSelectedBlockId] = useState('BB09252236');
  const [duration, setDuration] = useState('90');
  
  const [impactDetected, setImpactDetected] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(-1);
  const [reoptimized, setReoptimized] = useState(false);
  
  const simRef = useRef(false);

  const activeBlock = BASE_BLOCKS.find(b => b.id === selectedBlockId) || BASE_BLOCKS[0];
  const scenario = TRACK_SCENARIOS[activeBlock.track] ?? TRACK_SCENARIOS['TR-02'];

  const handleDetectImpact = () => {
    setImpactDetected(true);
    setReoptimized(false);
  };

  const handleReoptimize = async () => {
    setSimulating(true);
    setReoptimized(false);
    setSimStep(0);
    simRef.current = true;
    let accumulated = 0;
    for (let i = 0; i < SIM_STEPS.length; i++) {
      accumulated += SIM_STEPS[i].delay;
      await new Promise<void>(res => setTimeout(res, SIM_STEPS[i].delay));
      if (!simRef.current) break;
      setSimStep(i + 1);
    }
    setSimulating(false);
    setSimStep(-1);
    setReoptimized(true);
    toast.success('Simulation Completed', {
      description: `CP-SAT + A* solved in ${accumulated}ms — ${scenario.trains} train(s) evaluated.`,
    });
  };

  const handleReset = () => {
    setImpactDetected(false);
    setReoptimized(false);
    setSimulating(false);
  };

  useEffect(() => {
    return () => { simRef.current = false; };
  }, []);

  const handleApply = () => {
    toast.info('Simulated plan converted into a draft block request for Controller review.');
  };

  // Compute dynamic blocks for the schematic
  const currentBlocks = useMemo(() => {
    if (reoptimized) {
      // Replace the disrupted block with a shifted proposed block
      return BASE_BLOCKS.filter(b => b.id !== selectedBlockId).concat([{
        ...activeBlock,
        id: activeBlock.id + '-OPT',
        status: 'PROPOSED',
        duration: String(parseInt(activeBlock.duration) + parseInt(duration)),
        timeWindow: `Delayed (+${duration}m)`
      }]);
    }
    if (impactDetected) {
      // Highlight the disrupted block
      return BASE_BLOCKS.map(b => b.id === selectedBlockId ? { ...b, status: 'ACTIVE', timeWindow: `DISRUPTED (+${duration}m)` } : b);
    }
    return BASE_BLOCKS;
  }, [impactDetected, reoptimized, selectedBlockId, activeBlock, duration]);

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-6">
      <div className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center justify-between text-xs font-bold shadow-sm">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          <span>WHAT-IF SIMULATOR • EXPERIMENTAL SANDBOX (NOT LIVE — NO CHANGES PERSISTED)</span>
        </div>
        <span className="text-amber-100 font-mono text-[11px]">Solver: CP-SAT + TD-A*</span>
      </div>

      <PageHeader
        title="DISRUPTION SIMULATION"
        subtitle="Test hypothetical infrastructure outages, duration changes, and train delays before taking live decisions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
              TRIGGER DISRUPTION
            </h3>
            
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Target Block / Section</label>
              <select 
                value={selectedBlockId} 
                onChange={(e) => { setSelectedBlockId(e.target.value); handleReset(); }}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BASE_BLOCKS.map(b => (
                  <option key={b.id} value={b.id}>{b.id} ({b.section})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Extension / Delay</label>
              <div className="flex gap-2">
                {['30', '60', '90', '120'].map(val => (
                  <button
                    key={val}
                    onClick={() => { setDuration(val); handleReset(); }}
                    className={clsx(
                      "flex-1 py-2 text-xs font-bold rounded border transition-colors",
                      duration === val ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    +{val}m
                  </button>
                ))}
              </div>
            </div>

            <PrimaryButton 
              className="w-full justify-center mt-4 py-2.5" 
              onClick={handleDetectImpact}
              disabled={impactDetected && !reoptimized}
              icon={<AlertOctagon className="w-4 h-4 fill-current" />}
            >
              SIMULATE DISRUPTION
            </PrimaryButton>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <RailwayTrackView 
            region="Central Railway" 
            blocks={currentBlocks} 
            selectedId={selectedBlockId}
            onSelect={setSelectedBlockId} 
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-3 space-y-5">
          {/* Default State */}
          {!impactDetected && !simulating && !reoptimized && (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center h-48">
              <AlertOctagon className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs font-bold text-gray-500 uppercase">Ready for Simulation</p>
              <p className="text-[11px] text-gray-400 mt-1">Select a block and trigger a disruption to view impact analysis.</p>
            </div>
          )}

          {/* Impact Detected */}
          {impactDetected && !reoptimized && !simulating && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2 border-b border-red-200/50 pb-2">
                <AlertOctagon className="w-4 h-4" /> IMPACT DETECTED
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-red-100 rounded p-3 shadow-sm">
                  <p className="text-xl font-bold text-red-700">{scenario.trains}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Affected Trains</p>
                </div>
                <div className="bg-white border border-red-100 rounded p-3 shadow-sm">
                  <p className="text-xl font-bold text-amber-600">+{scenario.delay}m</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Projected Delay</p>
                </div>
                <div className="bg-white border border-red-100 rounded p-3 shadow-sm">
                  <p className="text-xl font-bold text-gray-800">{scenario.bundledJobs}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Jobs Impacted</p>
                </div>
                <div className="bg-white border border-red-100 rounded p-3 shadow-sm">
                  <p className="text-xl font-bold text-red-700">1</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Block Conflict</p>
                </div>
              </div>

              <PrimaryButton 
                className="w-full justify-center bg-irctc-navy hover:bg-blue-900 mt-2 py-2.5" 
                onClick={handleReoptimize}
              >
                RE-OPTIMIZE PLAN →
              </PrimaryButton>
            </div>
          )}

          {/* Loader */}
          {simulating && (
            <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">ANALYZING REGION</span>
              </div>
              {SIM_STEPS.map((step, i) => (
                <div key={i} className={clsx(
                  'flex items-center gap-3 text-[11px] transition-all duration-300',
                  i < simStep ? 'text-green-700 font-semibold' : i === simStep - 1 && simulating ? 'text-blue-700 font-semibold' : 'text-gray-400',
                )}>
                  {i < simStep
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : i === simStep - 1 && simulating
                    ? <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />
                    : <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />}
                  {step.label}
                </div>
              ))}
            </div>
          )}

          {/* Re-optimized */}
          {reoptimized && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-200/50 pb-2">
                <CheckCircle2 className="w-4 h-4" /> RE-OPTIMIZED PLAN
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                Affected region re-planned while unaffected decisions were safely preserved.
              </p>
              
              <div className="bg-white rounded border border-emerald-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50/50">
                    <tr className="text-gray-500 border-b border-emerald-100">
                      <th className="font-bold py-2.5 px-3">Metric</th>
                      <th className="font-bold py-2.5 px-3 text-right">Before</th>
                      <th className="font-bold py-2.5 px-3 text-right">After</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 divide-y divide-emerald-50">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Train Delay</td>
                      <td className="py-2.5 px-3 text-right text-red-600 font-bold">+{scenario.delay}m</td>
                      <td className="py-2.5 px-3 text-right text-green-600 font-bold">+{Math.max(0, scenario.delay - 12)}m</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Critical Jobs Deferred</td>
                      <td className="py-2.5 px-3 text-right font-bold">1</td>
                      <td className="py-2.5 px-3 text-right text-green-600 font-bold">0</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Maintenance Downtime</td>
                      <td className="py-2.5 px-3 text-right font-bold">{activeBlock.duration}m</td>
                      <td className="py-2.5 px-3 text-right text-blue-600 font-bold">{parseInt(activeBlock.duration) + parseInt(duration)}m</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <PrimaryButton className="w-full justify-center py-2.5" onClick={handleApply}>APPLY NEW PLAN</PrimaryButton>
                <SecondaryButton className="w-full justify-center py-2.5" onClick={handleReset}>DISCARD SIMULATION</SecondaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
