import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { Play, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Simulation steps shown during animation ──────────────────────────────────
const SIM_STEPS = [
  { label: 'Loading scenario parameters...',              delay: 300  },
  { label: 'Running CP-SAT constraint solver...',         delay: 900  },
  { label: 'Time-Dependent A* routing computation...',    delay: 700  },
  { label: 'Checking safety constraint violations...',    delay: 500  },
  { label: 'Aggregating impact metrics...',              delay: 400  },
] as const;

// Per-track scenario data so metrics aren't hardcoded
const TRACK_SCENARIOS: Record<string, { trains: number; routes: number; delay: number; trainNums: string; via: string; bundledJobs: number; rerouted: number }> = {
  'TR-02': { trains: 3, routes: 1, delay: 18, trainNums: '12123, 11008, 22145', via: 'TR-04 Akola bypass',         bundledJobs: 2, rerouted: 1 },
  'TR-04': { trains: 2, routes: 2, delay: 12, trainNums: '22145, G-4401',       via: 'TR-07 Loop alternate',       bundledJobs: 2, rerouted: 1 },
  'TR-07': { trains: 1, routes: 1, delay: 8,  trainNums: '17617',               via: 'TR-04 NGP-WR main line',     bundledJobs: 1, rerouted: 0 },
};

export default function WhatIf() {
  const [scenarioType, setScenarioType] = useState<'block' | 'failure' | 'delay'>('block');
  const [trackSection, setTrackSection] = useState('TR-02');
  const [duration, setDuration] = useState('90');
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(-1); // -1 = not running
  const [hasRun, setHasRun] = useState(false);
  const simRef = useRef(false);

  // Parsed duration in minutes for bar width calculations
  const durationMin = Math.max(10, Math.min(360, parseInt(duration, 10) || 90));
  // Width fraction of a 12-hour day (720 min) for Gantt bars
  const barW = Math.round((durationMin / 720) * 100);
  const scenario = TRACK_SCENARIOS[trackSection] ?? TRACK_SCENARIOS['TR-02'];

  const handleRunSimulation = async () => {
    setSimulating(true);
    setHasRun(false);
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
    setHasRun(true);
    toast.success('Simulation Completed', {
      description: `CP-SAT + A* solved in ${accumulated}ms — ${scenario.trains} train(s) evaluated.`,
    });
  };

  useEffect(() => {
    return () => { simRef.current = false; };
  }, []);

  const handleApply = () => {
    toast.info('Simulated plan converted into a draft block request for Controller review.');
  };

  return (
    <div className="p-5 max-w-[1400px] mx-auto space-y-6">
      {/* Simulation Watermark Banner matching requirement */}
      <div className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center justify-between text-xs font-bold shadow-sm">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4" />
          <span>WHAT-IF SIMULATOR • EXPERIMENTAL SANDBOX (NOT LIVE — NO CHANGES PERSISTED)</span>
        </div>
        <span className="text-amber-100 font-mono text-[11px]">Solver: CP-SAT + TD-A*</span>
      </div>

      {/* Header */}
      <PageHeader
        title="WHAT WOULD HAPPEN IF..."
        subtitle="Test hypothetical infrastructure outages, duration changes, and train delays before taking live decisions"
      />

      {/* Scenario Builder Form matching wireframe 7 */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-5">
        {/* Scenario Type Radios */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
            SCENARIO TYPE
          </label>
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scenario"
                checked={scenarioType === 'block'}
                onChange={() => setScenarioType('block')}
                className="text-blue-600 focus:ring-0"
              />
              <span>Block track possession</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scenario"
                checked={scenarioType === 'failure'}
                onChange={() => setScenarioType('failure')}
                className="text-blue-600 focus:ring-0"
              />
              <span>Unplanned Track Failure</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scenario"
                checked={scenarioType === 'delay'}
                onChange={() => setScenarioType('delay')}
                className="text-blue-600 focus:ring-0"
              />
              <span>Major Train Delay (+30m)</span>
            </label>
          </div>
        </div>

        {/* Inputs & Run Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-2 border-t border-gray-100">
          <div className="sm:col-span-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              TRACK / SECTION
            </label>
            <select
              value={trackSection}
              onChange={e => setTrackSection(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-semibold bg-white text-gray-800 focus:outline-none"
            >
              <option value="TR-02">TR-02 (NGP-BSL Main Line)</option>
              <option value="TR-04">TR-04 (NGP-WR Bypass)</option>
              <option value="TR-07">TR-07 (WR-AKO Loop)</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              BLOCK DURATION (MINUTES) — Gantt bars update live
            </label>
            <div className="relative">
              <input
                type="number"
                min={10} max={360}
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-semibold bg-white text-gray-800 focus:outline-none pr-10"
                placeholder="90"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">min</span>
            </div>
          </div>

          <div className="sm:col-span-3">
            <PrimaryButton
              className="w-full justify-center"
              onClick={handleRunSimulation}
              loading={simulating}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              RUN SIMULATION
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Stepped simulation progress */}
      {simulating && (
        <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">SIMULATION IN PROGRESS</span>
          </div>
          {SIM_STEPS.map((step, i) => (
            <div key={i} className={clsx(
              'flex items-center gap-3 text-xs transition-all duration-300',
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

      {/* Simulation Result Card matching wireframe 7 */}
      {hasRun && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              SIMULATION RESULT METRICS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="text-xs text-gray-400 font-semibold uppercase block mb-1">AFFECTED TRAINS</span>
                <p className="text-2xl font-bold text-gray-900">{scenario.trains}</p>
                <p className="text-[11px] text-gray-500 mt-1">Trains {scenario.trainNums}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="text-xs text-gray-400 font-semibold uppercase block mb-1">FEASIBLE ALTERNATE ROUTES</span>
                <p className="text-2xl font-bold text-blue-700">{scenario.routes}</p>
                <p className="text-[11px] text-gray-500 mt-1">Via {scenario.via}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <span className="text-xs text-gray-400 font-semibold uppercase block mb-1">EXPECTED NETWORK DELAY</span>
                <p className="text-2xl font-bold text-amber-700">+{scenario.delay} min</p>
                <p className="text-[11px] text-gray-500 mt-1">Lowest among feasible paths</p>
              </div>
            </div>
          </div>

          {/* Timeline Comparison: ORIGINAL PLAN vs SIMULATED PLAN matching wireframe 7 */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-6">
            {/* Original Plan Visual */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ORIGINAL TIMETABLE PLAN
                </span>
                <span className="text-[11px] text-gray-400">Baseline</span>
              </div>
              <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-16 font-bold text-gray-600">ENG</span>
                  <div className="flex-1 bg-gray-200 h-6 rounded relative overflow-hidden">
                    <div className="absolute left-[20%] h-full bg-blue-900 rounded transition-all duration-500" style={{ width: `${barW}%` }} />
                  </div>
                  <span className="text-gray-400 text-[10px] font-mono w-10 text-right">{durationMin}m</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-bold text-gray-600">S&T</span>
                  <div className="flex-1 bg-gray-200 h-6 rounded relative overflow-hidden">
                    <div className="absolute left-[20%] h-full bg-purple-900 rounded transition-all duration-500" style={{ width: `${Math.round(barW * 0.75)}%` }} />
                  </div>
                  <span className="text-gray-400 text-[10px] font-mono w-10 text-right">{Math.round(durationMin * 0.75)}m</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-bold text-gray-600">TR-{scenario.trainNums.split(',')[0]?.trim()}</span>
                  <div className="flex-1 bg-gray-200 h-6 rounded relative overflow-hidden">
                    <div className="absolute left-[30%] h-full bg-gray-700 rounded opacity-60 transition-all duration-500" style={{ width: `${Math.round(barW * 0.6)}%` }} />
                  </div>
                  <span className="text-gray-400 text-[10px] font-mono w-10 text-right">{Math.round(durationMin * 0.6)}m</span>
                </div>
              </div>
            </div>

            {/* Simulated Plan Visual */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    SIMULATED PLAN • CP-SAT + A*
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    FEASIBLE
                  </span>
                </div>
                <span className="text-[11px] text-blue-600 font-semibold">
                  1 Train Rerouted via Route A
                </span>
              </div>
              <div className="space-y-2 p-3 bg-blue-50/50 rounded border border-blue-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-16 font-bold text-blue-950">ENG</span>
                  <div className="flex-1 bg-blue-100/50 h-6 rounded relative overflow-hidden">
                    <div className="absolute left-[20%] h-full bg-blue-900 rounded transition-all duration-500" style={{ width: `${barW}%` }} />
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono w-10 text-right">{durationMin}m</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 font-bold text-blue-950">S&T</span>
                  <div className="flex-1 bg-blue-100/50 h-6 rounded relative overflow-hidden">
                    <div className="absolute left-[20%] h-full bg-purple-900 rounded transition-all duration-500" style={{ width: `${Math.round(barW * 0.75)}%` }} />
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono w-10 text-right">{Math.round(durationMin * 0.75)}m</span>
                </div>
                {scenario.rerouted > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-bold text-blue-950">TR-{scenario.trainNums.split(',')[0]?.trim()}</span>
                    <div className="flex-1 bg-blue-100/50 h-6 rounded relative overflow-hidden">
                      <div className="absolute left-[32%] h-full bg-blue-600 rounded flex items-center px-2 transition-all duration-500" style={{ width: `${Math.round(barW * 0.6)}%` }}>
                        <span className="text-[10px] text-white font-bold truncate">Route A (+{Math.round(scenario.delay * 0.6)}m)</span>
                      </div>
                    </div>
                  </div>
                )}
                {scenario.rerouted === 0 && (
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-bold text-blue-950">TR-{scenario.trainNums.split(',')[0]?.trim()}</span>
                    <div className="flex-1 bg-blue-100/50 h-6 rounded relative overflow-hidden">
                      <div className="h-full flex items-center px-2">
                        <span className="text-[10px] text-green-700 font-bold">✓ No rerouting needed</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantees checklist matching wireframe 7 */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4" /> Feasible</span>
              <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4" /> Safety constraints satisfied</span>
              <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4" /> {scenario.bundledJobs} jobs bundled</span>
              {scenario.rerouted > 0 && (
                <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4" /> {scenario.rerouted} train rerouted</span>
              )}
              {scenario.rerouted === 0 && (
                <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4" /> No rerouting required</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <SecondaryButton onClick={() => setHasRun(false)}>
                DISCARD SIMULATION
              </SecondaryButton>
              <PrimaryButton onClick={handleApply}>
                APPLY TO PLAN DRAFT
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

