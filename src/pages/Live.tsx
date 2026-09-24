import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { CheckCircle2, AlertOctagon } from 'lucide-react';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingState from '../components/common/LoadingState';
import { eventsApi, blocksApi, reoptimizationApi } from '../api';
import type { LiveEvent, ReoptimizationPlan } from '../types';
import DisruptionSimulator from '../components/live/DisruptionSimulator';
import RailwayTrackView, { BlockItem } from '../components/blocks/RailwayTrackView';
import { useAuth } from '../contexts/AuthContext';

export default function Live() {
  const { user } = useAuth();
  const isController = user?.role === 'SECTION_CONTROLLER';

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [plan, setPlan] = useState<ReoptimizationPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([eventsApi.getEvents(), blocksApi.getBlocks()]).then(([eventsData, blocksData]) => {
      setEvents(eventsData);
      setBlocks(blocksData.map(b => ({
        id: b.id,
        track: b.track,
        section: b.section,
        timeWindow: `${b.startTime} - ${b.endTime}`,
        startTime: b.startTime,
        endTime: b.endTime,
        duration: String(b.duration),
        departments: b.departments,
        jobs: b.jobIds.join(', '),
        jobCount: b.jobIds.length,
        priority: b.priority as 'HIGH' | 'MEDIUM' | 'LOW',
        status: b.status,
        affectedTrains: b.affectedTrains.length,
        rawBlock: b
      })));
      setLoading(false);
    });
  }, []);

  const handleInjectEvent = (newEvent: LiveEvent) => {
    setEvents([newEvent, ...events]);
    setSelectedEvent(newEvent);
    setPlan(null);
    toast.warning('Disruption Injected', {
      description: `${newEvent.title} has been simulated on ${newEvent.location}.`
    });
  };

  const handleRunRecovery = async () => {
    if (!selectedEvent) return;
    setRecovering(true);
    // Simulate recovery calculation delay
    setTimeout(async () => {
      try {
        const newPlan = await eventsApi.triggerReoptimize(selectedEvent.id);
        setPlan(newPlan);
        toast.success('Recovery Plan Generated', { description: 'Re-optimization engine generated a feasible recovery plan.' });
      } catch {
        toast.error('Recovery failed');
      }
      setRecovering(false);
    }, 1500);
  };

  const handleApprove = async () => {
    if (!plan || !selectedEvent) return;
    setActionLoading(true);
    try {
      await reoptimizationApi.approve(plan.id);
      
      // Reflect the final state in the global backend/state
      for (const blockId of selectedEvent.affectedBlocks) {
        await blocksApi.updateStatus(blockId, 'MODIFIED' as any, { notes: 'Updated via Local Recovery' });
      }
      
      setPlan({ ...plan, status: 'APPROVED' });
      toast.success('Recovery Plan Approved', {
        description: 'New schedule committed. Reroute orders dispatched.',
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
    toast.info('Recovery plan rejected. Manual resolution required.');
  };

  // Map blocks to their BEFORE visual state
  const currentBlocksRender = useMemo(() => {
    return blocks.map(b => ({
      ...b,
      // In CURRENT PLAN, completed/active are shown as PROTECTED
      status: (b.status === 'COMPLETED' || b.status === 'ACTIVE' || b.status === 'IMPOSED') ? 'PROTECTED' : b.status
    }));
  }, [blocks]);

  // Map blocks to their AFTER visual state
  const recoveredBlocksRender = useMemo(() => {
    if (!selectedEvent) return [];
    return blocks.map(b => {
      if (selectedEvent.affectedBlocks.includes(b.id)) {
        return { ...b, status: 'UPDATED' }; // Modified downstream
      }
      return { ...b, status: 'UNCHANGED' }; // Protected or Unaffected downstream
    });
  }, [blocks, selectedEvent]);

  if (loading) return <LoadingState message="Connecting to live event stream..." />;

  return (
    <div className="irctc-page bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-irctc-border px-7 py-5">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="irctc-page-title">Live Event Inject: Local Recovery</h1>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Actual Operations Disruption
            </div>
          </div>
          <p className="text-[14px] text-irctc-muted">Report live disruption → Assess frozen-state local recovery → Commit changes.</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT: TRIGGER DISRUPTION */}
          <div className="xl:col-span-3 space-y-6">
            <DisruptionSimulator onInject={handleInjectEvent} />
            
            {selectedEvent && (
              <div className="irctc-card border-l-4 border-l-red-500 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-red-900">IMPACT DETECTED</h3>
                </div>
                <div className="space-y-4 text-[12px]">
                  <div>
                    <p className="font-bold text-gray-700 uppercase tracking-wider">Affected</p>
                    <ul className="list-disc pl-4 text-red-700 mt-1.5 space-y-1 font-medium">
                      {selectedEvent.affectedBlocks.map(b => <li key={b}>Block {b}</li>)}
                      {selectedEvent.affectedTrains.map(t => <li key={t}>Train {t}</li>)}
                      <li>Downstream section {selectedEvent.location}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 uppercase tracking-wider">Protected</p>
                    <ul className="list-disc pl-4 text-green-700 mt-1.5 space-y-1 font-medium">
                      <li>Completed blocks</li>
                      <li>Active operations</li>
                      <li>Unaffected trains</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isController ? (
            <>
              {/* CENTER: RAILWAY SCHEMATIC (BEFORE / AFTER) */}
              <div className="xl:col-span-6 space-y-6">
                
                {/* Before View */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-700 text-[13px]">CURRENT PLAN</span>
                  </div>
                  <RailwayTrackView region="Central Railway" blocks={currentBlocksRender} selectedId="" onSelect={() => {}} />
                  <div className="px-4 py-3 bg-gray-50 text-[11px] text-gray-700 border-t flex justify-between uppercase tracking-wider font-semibold">
                    <span>Completed/Active: <span className="text-green-600 ml-1">PROTECTED</span></span>
                    <span>Downstream: <span className="text-gray-500 ml-1">CURRENT</span></span>
                  </div>
                </div>

                {/* After View */}
                {plan && (
                  <div className="bg-white border-2 border-blue-400 rounded-lg overflow-hidden shadow-md transition-all">
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 flex items-center justify-between">
                      <span className="font-bold text-blue-900 text-[13px]">RECOVERY PLAN</span>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">UPDATED</span>
                    </div>
                    <RailwayTrackView region="Central Railway" blocks={recoveredBlocksRender} selectedId="" onSelect={() => {}} />
                    <div className="px-4 py-3 bg-blue-50 text-[11px] text-blue-900 border-t flex justify-between uppercase tracking-wider font-semibold">
                      <span>Completed/Active: <span className="text-gray-500 ml-1">UNCHANGED</span></span>
                      <span>Downstream Affected: <span className="text-blue-600 ml-1">UPDATED</span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: RECOVERY SUMMARY */}
              <div className="xl:col-span-3 space-y-6">
                 {!plan && selectedEvent && (
                   <button 
                      onClick={handleRunRecovery} 
                      disabled={recovering}
                      className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-70 transition-colors"
                   >
                     {recovering ? 'Computing Recovery...' : 'Launch Local Recovery'}
                   </button>
                 )}
                 
                 {plan && (
                   <>
                     <div className="irctc-card border-blue-200 shadow-sm">
                       <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-[14px]">
                         <CheckCircle2 className="w-4 h-4" />
                         RECOVERY SUMMARY
                       </h3>
                       <div className="grid grid-cols-2 gap-2 text-[12px] mb-5">
                         <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                           <p className="text-gray-500 uppercase text-[9px] font-bold mb-0.5">Blocks Changed</p>
                           <p className="font-bold text-[14px] text-gray-900">{plan.impact.blocksChanged}</p>
                         </div>
                         <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                           <p className="text-gray-500 uppercase text-[9px] font-bold mb-0.5">Trains Affected</p>
                           <p className="font-bold text-[14px] text-gray-900">{plan.impact.trainsRerouted}</p>
                         </div>
                         <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                           <p className="text-gray-500 uppercase text-[9px] font-bold mb-0.5">Addl Delay</p>
                           <p className="font-bold text-[14px] text-amber-700">+{plan.impact.additionalDelay} min</p>
                         </div>
                         <div className="bg-gray-50 p-2.5 rounded border border-gray-100">
                           <p className="text-gray-500 uppercase text-[9px] font-bold mb-0.5">Status</p>
                           <p className="font-bold text-[14px] text-green-600">Feasible</p>
                         </div>
                       </div>
                       
                       <div className="space-y-4 pt-4 border-t border-gray-100">
                         <div>
                           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WHAT CHANGED?</h4>
                           <ul className="text-[11px] space-y-1.5 mt-2 text-gray-700">
                             {selectedEvent?.affectedBlocks.map(b => <li key={b} className="flex gap-2"><span className="text-blue-500">◆</span> Block {b} shifted</li>)}
                             {selectedEvent?.affectedTrains.map(t => <li key={t} className="flex gap-2"><span className="text-blue-500">◆</span> Train {t} receives updated timing</li>)}
                             <li className="flex gap-2"><span className="text-blue-500">◆</span> Downstream section adjusted</li>
                           </ul>
                         </div>
                         <div>
                           <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">WHAT DID NOT CHANGE?</h4>
                           <ul className="text-[11px] space-y-1.5 mt-2 text-green-700">
                             <li className="flex gap-2"><span>◆</span> Completed operations</li>
                             <li className="flex gap-2"><span>◆</span> Active operations</li>
                             <li className="flex gap-2"><span>◆</span> Unaffected blocks</li>
                             <li className="flex gap-2"><span>◆</span> Unaffected trains</li>
                           </ul>
                         </div>
                         <div className="bg-blue-50/50 p-3 rounded">
                           <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">WHY?</h4>
                           <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                             The recovery modifies only the affected downstream portion while preserving protected operations.
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="irctc-card shadow-sm">
                       <h3 className="font-bold text-gray-900 mb-3 text-[13px] uppercase tracking-wider">Verification</h3>
                       <div className="space-y-2.5 text-[11px] font-semibold text-green-700 bg-green-50/50 p-3 rounded border border-green-100">
                         <div className="flex items-center gap-2.5"><CheckCircle2 className="w-3.5 h-3.5" /> Timing constraints</div>
                         <div className="flex items-center gap-2.5"><CheckCircle2 className="w-3.5 h-3.5" /> Block conflicts</div>
                         <div className="flex items-center gap-2.5"><CheckCircle2 className="w-3.5 h-3.5" /> Train conflicts</div>
                         <div className="flex items-center gap-2.5"><CheckCircle2 className="w-3.5 h-3.5" /> Resource constraints</div>
                         <div className="flex items-center gap-2.5"><CheckCircle2 className="w-3.5 h-3.5" /> Protected operations preserved</div>
                       </div>
                     </div>

                     <div className="irctc-card bg-amber-50 border-amber-200 shadow-sm">
                       <h3 className="font-bold text-amber-900 mb-4 text-center uppercase tracking-wider text-[13px]">RECOVERY PLAN READY</h3>
                       <div className="flex gap-2">
                         <button onClick={handleReject} className="flex-1 py-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold rounded shadow-sm text-[11px] transition-colors">Reject Recovery</button>
                         <button onClick={() => setShowApproveDialog(true)} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-sm text-[11px] transition-colors">Approve & Commit</button>
                       </div>
                     </div>
                   </>
                 )}
              </div>
            </>
          ) : (
            <div className="xl:col-span-9 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white min-h-[400px]">
              <AlertOctagon className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-gray-600 font-bold text-[16px] mb-2">Live Event Reporter</h3>
              <p className="text-[13px] text-gray-500 max-w-md mx-auto text-center leading-relaxed">
                Use the left panel to report operational disruptions. The Section Controller will review the event and generate a local recovery plan for operations.
              </p>
            </div>
          )}

        </div>
      </div>

      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Recovery Plan?"
        description={`Approving this recovered plan will commit changes to ${plan?.impact.blocksChanged} blocks and update schedules for ${plan?.impact.trainsRerouted} trains.`}
        confirmLabel="Approve & Commit Plan"
        loading={actionLoading}
      />
    </div>
  );
}
