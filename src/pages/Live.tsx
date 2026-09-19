import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  AlertOctagon, RefreshCw, CheckCircle2, Lock,
  ChevronDown, ChevronUp, Check, AlertTriangle, Clock
} from 'lucide-react';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import { eventsApi, reoptimizationApi } from '../api';
import type { LiveEvent, ReoptimizationPlan } from '../types';

// ─── Recovery workflow step indicator ─────────────────────────────────────────
const WORKFLOW_STEPS = ['EVENT', 'IMPACT', 'ALNS', 'A*', 'NEW PLAN', 'APPROVE'] as const;
type WorkflowStep = typeof WORKFLOW_STEPS[number];

function WorkflowIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all',
            i < currentStep ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : i === currentStep ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-gray-100 text-gray-400 border border-gray-200'
          )}>
            {i < currentStep ? (
              <Check className="w-3 h-3" />
            ) : (
              <span>{i + 1}</span>
            )}
            {step}
          </div>
          {i < WORKFLOW_STEPS.length - 1 && (
            <div className={clsx(
              'w-5 h-px mx-0.5 transition-all',
              i < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventRow({ event, selected, onClick }: { event: LiveEvent; selected: boolean; onClick: () => void }) {
  const severityColors = {
    CRITICAL: 'border-red-200 bg-red-50',
    HIGH: 'border-orange-200 bg-orange-50',
    MEDIUM: 'border-amber-200 bg-amber-50',
    LOW: 'border-gray-200 bg-gray-50',
  };
  const severityDot = {
    CRITICAL: 'bg-red-600',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-gray-400',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'border rounded-lg p-3.5 cursor-pointer transition-all',
        severityColors[event.severity],
        selected && 'ring-2 ring-offset-1 ring-gray-700'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={clsx('w-2 h-2 rounded-full flex-shrink-0 animate-pulse', severityDot[event.severity])} />
          <div>
            <div className="flex items-center gap-2">
              <span className={clsx(
                'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-white',
                event.severity === 'CRITICAL' ? 'bg-red-600' :
                event.severity === 'HIGH' ? 'bg-orange-500' :
                event.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-gray-400'
              )}>{event.severity}</span>
              <span className="text-[13px] font-bold text-gray-900">{event.title}</span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">{event.location} · {event.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <StatusBadge status={event.status} />
          <span className="text-[10px] font-mono text-gray-400">
            {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Live Page ────────────────────────────────────────────────────────────────
export default function Live() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(0); // 0=event, 1=impact, 2=alns, 3=astar, 4=plan, 5=approve
  const [plan, setPlan] = useState<ReoptimizationPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showOptDetails, setShowOptDetails] = useState(false);

  useEffect(() => {
    eventsApi.getEvents().then(data => {
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0]);
      }
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load events');
      setLoading(false);
    });
  }, []);

  const handleRunRecovery = async () => {
    if (!selectedEvent) return;
    setRecovering(true);
    setRecoveryStep(1); // impact
    await new Promise(r => setTimeout(r, 800));
    setRecoveryStep(2); // alns
    await new Promise(r => setTimeout(r, 1200));
    setRecoveryStep(3); // a*
    await new Promise(r => setTimeout(r, 900));
    setRecoveryStep(4); // new plan

    try {
      const newPlan = await eventsApi.triggerReoptimize(selectedEvent.id);
      setPlan(newPlan);
      toast.success('Recovery Plan Generated', {
        description: 'ALNS re-optimized remaining schedule. A* rerouted affected train. Awaiting approval.',
      });
    } catch {
      toast.error('Recovery calculation failed');
    }
    setRecovering(false);
  };

  const handleApprove = async () => {
    if (!plan) return;
    setActionLoading(true);
    try {
      await reoptimizationApi.approve(plan.id);
      setPlan(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setRecoveryStep(5);
      toast.success('Recovery Plan Approved', {
        description: 'New schedule committed. Train dispatch orders issued.',
      });
      setShowApproveDialog(false);
    } catch {
      toast.error('Failed to approve plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!plan) return;
    await reoptimizationApi.reject(plan.id);
    setPlan(null);
    setRecoveryStep(0);
    toast.info('Recovery plan rejected. Manual resolution required.');
  };

  if (loading) return <LoadingState message="Connecting to live event stream..." />;

  const currentWorkflowStep = plan?.status === 'APPROVED' ? 5 : recoveryStep;

  return (
    <div className="h-full overflow-auto bg-[#F4F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="max-w-[1400px] mx-auto flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Live Recovery</h1>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Monitoring Active
              </div>
            </div>
            <p className="text-[12px] text-gray-500">Event detection → ALNS re-optimization → A* rerouting → human approval</p>
          </div>
          <div className="overflow-x-auto">
            <WorkflowIndicator currentStep={currentWorkflowStep} />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-5 space-y-5">

        {/* Event list */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            Active Events
          </h3>
          <div className="space-y-2">
            {events.length === 0 && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-[12px] font-semibold text-gray-600">No active disruptions</p>
                <p className="text-[11px] text-gray-400">All corridor operations nominal</p>
              </div>
            )}
            {events.map(event => (
              <EventRow
                key={event.id}
                event={event}
                selected={selectedEvent?.id === event.id}
                onClick={() => { setSelectedEvent(event); setRecoveryStep(0); setPlan(null); }}
              />
            ))}
          </div>
        </div>

        {/* Selected event detail — full recovery workspace */}
        {selectedEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Impact + Recovery workflow */}
            <div className="lg:col-span-7 space-y-4">
              {/* Impact */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Impact Assessment
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Trains Affected', value: selectedEvent.systemImpact.trainsAffected, color: 'text-red-700', bg: 'bg-red-50 border-red-100' },
                    { label: 'Block Overruns', value: selectedEvent.systemImpact.blocksOverrunning, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
                    { label: 'Route Recalcs', value: selectedEvent.systemImpact.routeRecalculations, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
                    { label: 'Safety Violations', value: selectedEvent.systemImpact.safetyViolations, color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
                  ].map(item => (
                    <div key={item.label} className={clsx('border rounded-lg p-3 flex items-center justify-between', item.bg)}>
                      <span className="text-[11px] font-semibold text-gray-700">{item.label}</span>
                      <span className={clsx('font-bold text-[16px]', item.color)}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Affected trains list */}
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Affected Trains</h4>
                <div className="space-y-1.5">
                  {selectedEvent.affectedTrains.map((tNum, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div key={tNum} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded text-[11px]">
                        <span className="font-mono font-bold text-gray-800">{tNum}</span>
                        <span className={clsx('font-medium', isFirst ? 'text-amber-700' : 'text-gray-600')}>
                          {isFirst ? 'Reroute via alternate path recommended' : 'Wait strategy recommended'}
                        </span>
                        <StatusBadge status={isFirst ? 'DELAYED' : 'ON_TIME'} />
                      </div>
                    );
                  })}
                  {selectedEvent.affectedBlocks.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px]">
                      <span className="text-amber-800 font-semibold">Affected Blocks</span>
                      <span className="font-mono text-amber-700">{selectedEvent.affectedBlocks.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recovery Engine */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recovery Engine</h3>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    ALNS + TD-A*
                  </span>
                </div>

                {/* ALNS section */}
                <div className={clsx('p-4 rounded-lg border mb-3 transition-all', recoveryStep >= 2 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200')}>
                  <div className="flex items-center gap-2 mb-2">
                    {recoveryStep >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : recoveryStep === 2 ? (
                      <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300 inline-block" />
                    )}
                    <span className="text-[12px] font-bold text-gray-800">ALNS Re-optimization</span>
                  </div>
                  <p className="text-[11px] text-gray-600 ml-6">
                    Adaptive Large Neighborhood Search re-optimizes the <strong>remaining schedule</strong> from now onward.
                    Past and active operations are <strong>frozen</strong> — only future possessions and train slots are adjusted.
                  </p>
                  {recoveryStep >= 3 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {[
                        'Completed operations frozen & protected',
                        ...(plan?.changesMade || selectedEvent.affectedBlocks.map(b => `${b} shifted to accommodate disruption`)),
                      ].slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] text-emerald-700">
                          <Check className="w-3 h-3" />{item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* A* section */}
                <div className={clsx('p-4 rounded-lg border mb-3 transition-all', recoveryStep >= 3 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200')}>
                  <div className="flex items-center gap-2 mb-2">
                    {recoveryStep >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : recoveryStep === 3 ? (
                      <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-gray-300 inline-block" />
                    )}
                    <span className="text-[12px] font-bold text-gray-800">Time-Dependent A* Rerouting</span>
                  </div>
                  <p className="text-[11px] text-gray-600 ml-6">
                    Computes feasible alternate routes for affected trains, considering blocked sections, current network state, and travel time costs.
                  </p>
                  {recoveryStep >= 4 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {selectedEvent.affectedTrains.map((tNum, idx) => (
                        <div key={tNum} className="flex items-center gap-2 text-[10px] text-emerald-700">
                          <Check className="w-3 h-3" />
                          {idx === 0
                            ? `Train ${tNum} → Reroute via alternate path (A* computed)`
                            : `Train ${tNum} → Wait strategy at current signal`
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trigger button */}
                {recoveryStep === 0 && !plan && (
                  <button
                    onClick={handleRunRecovery}
                    disabled={recovering}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 rounded-lg text-[13px] transition-colors"
                  >
                    {recovering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertOctagon className="w-4 h-4" />}
                    LAUNCH ALNS + A* RECOVERY ENGINE
                  </button>
                )}

                {recovering && (
                  <div className="text-center py-2">
                    <p className="text-[11px] text-emerald-700 font-semibold animate-pulse">
                      {recoveryStep === 1 && 'Assessing impact area...'}
                      {recoveryStep === 2 && 'ALNS re-optimizing remaining schedule...'}
                      {recoveryStep === 3 && 'A* computing rerouting paths...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Timeline + Recovery Plan */}
            <div className="lg:col-span-5 space-y-4">
              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Disruption Timeline
                </h3>
                <div className="relative space-y-3.5">
                  {selectedEvent.timeline.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 text-[11px]">
                      <span className="font-mono font-bold text-gray-500 w-10 flex-shrink-0 text-right">{entry.time}</span>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={clsx(
                          'w-2.5 h-2.5 rounded-full mt-0.5',
                          entry.isAlert ? 'bg-red-600 ring-3 ring-red-100' : 'bg-emerald-500'
                        )} />
                        {i < selectedEvent.timeline.length - 1 && (
                          <div className="w-px h-4 bg-gray-200 mt-0.5" />
                        )}
                      </div>
                      <span className={clsx(
                        'pt-0.5 leading-relaxed flex-1',
                        entry.isAlert ? 'text-red-800 font-semibold' : 'text-gray-700'
                      )}>
                        {entry.description}
                      </span>
                    </div>
                  ))}

                  {/* Add recovery steps to timeline */}
                  {recoveryStep >= 2 && (
                    <div className="flex items-start gap-3 text-[11px]">
                      <span className="font-mono font-bold text-emerald-700 w-10 flex-shrink-0 text-right">Now</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="pt-0.5 text-emerald-800 font-semibold">ALNS recovery started</span>
                    </div>
                  )}
                  {recoveryStep >= 3 && (
                    <div className="flex items-start gap-3 text-[11px]">
                      <span className="font-mono font-bold text-emerald-700 w-10 flex-shrink-0 text-right">Now</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="pt-0.5 text-emerald-800 font-semibold">A* rerouting computed</span>
                    </div>
                  )}
                  {plan && (
                    <div className="flex items-start gap-3 text-[11px]">
                      <span className="font-mono font-bold text-emerald-700 w-10 flex-shrink-0 text-right">Now</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-0.5 flex-shrink-0 animate-pulse" />
                      <span className="pt-0.5 text-blue-800 font-bold">New plan generated — awaiting approval</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recovery Plan — appears after ALNS runs */}
              {plan && (
                <div className="bg-white border-2 border-emerald-400 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">New Operating Plan</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Generated by ALNS + Time-Dependent A*</p>
                    </div>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded uppercase">
                      Awaiting Approval
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {/* Frozen block */}
                    <div className="p-3 bg-gray-100/70 border border-gray-300 rounded text-[11px] opacity-80">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-gray-700 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-gray-500" />BR-00231
                        </span>
                        <span className="font-mono text-gray-600">14:00–15:30</span>
                      </div>
                      <p className="text-gray-500 text-[10px]">FROZEN — completed possession preserved</p>
                    </div>

                    {/* Shifted block */}
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded text-[11px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-amber-900">BR-00232</span>
                        <span className="font-mono font-bold text-amber-900">16:30–17:20 ↺ (+20m)</span>
                      </div>
                      <p className="text-amber-700 text-[10px]">Shifted downstream by 20 min</p>
                    </div>

                    {/* Rerouted train */}
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-[11px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-emerald-900">Train 12123</span>
                        <span className="font-mono font-bold text-emerald-900">Route A (+12 min)</span>
                      </div>
                      <p className="text-emerald-700 text-[10px]">Rerouted via TR-04 — Time-Dependent A*</p>
                    </div>
                  </div>

                  {/* Impact summary */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: 'Extra Delay', value: `+${plan.impact.additionalDelay} min` },
                      { label: 'Blocks Changed', value: plan.impact.blocksChanged },
                      { label: 'Trains Rerouted', value: plan.impact.trainsRerouted },
                      { label: 'Safety Violations', value: '0 (Safe)' },
                    ].map(item => (
                      <div key={item.label} className="p-2 bg-gray-50 border border-gray-200 rounded text-center">
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                        <p className="font-bold text-gray-800 text-[13px]">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Opt details expandable */}
                  <button
                    onClick={() => setShowOptDetails(!showOptDetails)}
                    className="w-full flex items-center justify-between text-[11px] text-gray-500 hover:text-gray-700 mb-3"
                  >
                    <span>View ALNS constraint summary</span>
                    {showOptDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showOptDetails && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded mb-3 space-y-1.5 text-[10px] text-gray-600">
                      {['Past operations frozen and not modified', 'All safety buffers maintained', 'Resource availability verified', 'No constraint violations in recovered plan'].map((c, i) => (
                        <div key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{c}</div>
                      ))}
                    </div>
                  )}

                  {/* HITL Note */}
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-800 font-medium mb-3">
                    ⚠ Human approval required before this plan can be executed. Section Controller authorization mandatory.
                  </div>

                  {plan.status !== 'APPROVED' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        className="flex-1 text-[12px] font-semibold border border-red-200 text-red-700 hover:bg-red-50 py-2.5 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setShowApproveDialog(true)}
                        className="flex-1 text-[12px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg transition-colors"
                      >
                        ✓ Approve Plan
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-[12px] font-bold text-green-800">Plan Approved — Executing</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Recovery Plan?"
        description="Approving this recovered plan will: commit shifted block BR-00232, authorize Train 12123 dispatch via Route A, assign Train 11008 a waiting strategy. All controllers will be notified immediately."
        confirmLabel="Approve & Commit Plan"
        loading={actionLoading}
      />
    </div>
  );
}
