import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';
import {
  X, AlertTriangle, CheckCircle2, Clock, ArrowRight, MapPin,
  GitBranch, Shield, Info, Train as TrainIcon, AlertOctagon, Star, History,
  Activity, Navigation, Users, StopCircle, ArrowDownCircle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import ConfirmationDialog from '../common/ConfirmationDialog';
import TrainRouteMap from './TrainRouteMap';
import { trainsApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import type { EnrichedTrain } from '../../types';
import { toast } from 'sonner';

function fmtDate(d: string): string {
  try { return format(parseISO(d), 'd MMM yyyy'); } catch { return d; }
}
function fmtTime(d: string): string {
  try { return format(parseISO(d), 'HH:mm'); } catch { return d; }
}
function delayLabel(min: number): string {
  if (min === 0) return 'On Time';
  if (min < 60) return `+${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `+${h}h ${m}m` : `+${h}h`;
}

interface Props {
  train: EnrichedTrain;
  onClose: () => void;
  onTrainUpdated: (train: EnrichedTrain) => void;
}

export default function TrainDetailDrawer({ train: initialTrain, onClose, onTrainUpdated }: Props) {
  const { user } = useAuth();
  const [train, setTrain] = useState<EnrichedTrain>(initialTrain);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setTrain(initialTrain);
    trainsApi.getRerouteHistory(initialTrain.trainNumber).then(setHistory);
  }, [initialTrain]);

  const canApprove = train.status === 'REROUTE_SUGGESTED' && train.proposedRoute && train.proposedRoute.length > 0;
  const isApproved = train.status === 'REROUTE_APPROVED' || train.status === 'REROUTED';
  const isDisrupted = !!(train.affectedSection || train.disruptionReason);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      await trainsApi.approveReroute(
        train.trainNumber,
        user?.name || 'Section Controller',
        user?.user_id
      );
      const updated: EnrichedTrain = {
        ...train,
        status: 'REROUTE_APPROVED',
        rerouteStatus: 'APPROVED',
        approvedBy: user?.name || 'Section Controller',
        approvedAt: new Date().toISOString(),
        approvedRoute: train.proposedRoute,
      };
      setTrain(updated);
      onTrainUpdated(updated);
      toast.success(`Reroute approved for ${train.trainNumber}`);
      setShowApproveDialog(false);
    } catch {
      toast.error('Failed to approve reroute.');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      await trainsApi.rejectReroute(
        train.trainNumber,
        user?.name || 'Section Controller',
        'Controller rejected the AI recommendation',
        user?.user_id
      );
      const updated: EnrichedTrain = {
        ...train,
        status: 'DISRUPTED_NOT_REROUTED',
        rerouteStatus: 'REJECTED',
      };
      setTrain(updated);
      onTrainUpdated(updated);
      toast.info(`Reroute rejected for ${train.trainNumber}`);
      setShowRejectDialog(false);
    } catch {
      toast.error('Failed to process rejection.');
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full bg-[#f8fafc] z-50 flex flex-col shadow-2xl w-full max-w-[640px] overflow-hidden">
        
        {/* HEADER */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-2xl font-bold text-gray-900 tracking-tight">{train.trainNumber}</span>
              <StatusBadge status={train.status} size="md" />
              {train.delayMinutes > 0 && (
                <span className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                  {delayLabel(train.delayMinutes)} Delay
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700">{train.trainName} • <span className="font-normal text-gray-500">{train.trainType}</span></p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Section</p>
              <p className="text-sm font-semibold text-gray-800">{train.sourceStation} – {train.destinationStation}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Current Location</p>
              <p className="text-sm font-mono font-semibold text-blue-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {train.affectedSection || train.sourceStationCode}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Schedule</p>
              <p className="text-xs font-mono text-gray-600">
                Dep: {train.scheduledDeparture} <ArrowRight className="w-3 h-3 inline mx-0.5 text-gray-300" /> Arr: {train.scheduledArrival}
              </p>
            </div>
            {isDisrupted && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-red-500 mb-1">Delay Reason</p>
                <p className="text-xs font-semibold text-red-700 leading-tight">
                  {train.disruptionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. WHAT HAPPENED? (Timeline) */}
          {train.timeline && train.timeline.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> What Happened?
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-5">
                  {train.timeline.map((evt, i) => (
                    <div key={i} className="relative pl-6">
                      <div className={clsx(
                        "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white",
                        evt.status === 'done' ? "bg-green-500" :
                        evt.status === 'active' ? "bg-blue-500 animate-pulse" :
                        "bg-gray-300"
                      )} />
                      <p className="text-[10px] font-mono font-bold text-gray-400 mb-0.5">{evt.time}</p>
                      <p className={clsx("text-sm font-semibold", evt.status === 'active' ? "text-blue-800" : "text-gray-700")}>
                        {evt.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 2. ROUTE INTELLIGENCE MAP */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Route Intelligence
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-[320px] relative">
              <TrainRouteMap train={train} className="w-full h-full" />
            </div>
          </section>

          {/* 3. WHY REROUTED? */}
          {train.aiRecommendation && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Why this route?
              </h3>
              <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5">
                <p className="text-sm text-blue-900 font-medium mb-3">
                  AI avoided the blocked section and selected an alternate path with available capacity to prevent a train conflict.
                </p>
                <div className="space-y-2">
                  {train.aiRecommendation.reasoning.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-blue-800 leading-snug">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4. IMPACT ANALYSIS */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Impact Analysis
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Delay</p>
                <p className="text-xl font-bold text-red-600">{delayLabel(train.delayMinutes)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Route Deviation</p>
                <p className="text-xl font-bold text-gray-800">
                  +{train.operationalImpact?.additionalDistance || 0} km
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Expected Add. Travel</p>
                <p className="text-xl font-bold text-amber-600">
                  +{train.operationalImpact?.additionalTime || train.delayMinutes} min
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Conflicts Avoided</p>
                <p className="text-xl font-bold text-green-600">3</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <StopCircle className="w-4 h-4" /> Without Rerouting
                </p>
                <ul className="text-xs text-red-900 space-y-1.5 ml-1">
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"/> Section conflict</li>
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"/> Additional waiting</li>
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"/> Cascading delays</li>
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"/> Platform congestion</li>
                </ul>
              </div>
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4" /> With Rerouting
                </p>
                <ul className="text-xs text-green-900 space-y-1.5 ml-1">
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> Conflict avoided</li>
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> Train continues movement</li>
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> Delay contained</li>
                  <li className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> Downstream impact reduced</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. AI RECOMMENDATION & APPROVAL WORKFLOW */}
          {canApprove && train.aiRecommendation && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-irctc-blue mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> AI Recommendation
              </h3>
              
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 text-white shadow-md mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider mb-1">Recommended Action</p>
                    <p className="text-lg font-bold">Reroute via {train.aiRecommendation.recommendedRoute.split('→')[1] || 'Alternate Section'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider mb-1">AI Confidence</p>
                    <p className="text-2xl font-bold">{Math.round(train.aiRecommendation.confidence * 100)}%</p>
                  </div>
                </div>
                
                <p className="text-sm text-blue-100 font-medium leading-relaxed mb-4">
                  {train.disruptionReason ? train.disruptionReason.split('.')[0] : "Original section is unavailable."} 
                  {' '}Alternate section provides sufficient capacity and minimizes additional delay.
                </p>

                <div className="bg-black/10 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider mb-2">Expected Outcome</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-300"/> Avoid conflict</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-300"/> Reduce downstream delay</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-300"/> Maintain movement</div>
                  </div>
                </div>
              </div>

              {/* Approval Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-green-500 rounded-xl p-5 shadow-sm flex flex-col">
                  <h4 className="font-bold text-green-700 text-sm mb-2">APPROVE REROUTE</h4>
                  <p className="text-xs text-gray-600 mb-4 flex-1">
                    Train will use alternate route.
                    <br/><br/>
                    <strong>Expected impact:</strong>
                    <br/>• +{train.aiRecommendation.estimatedDelay} min additional travel
                    <br/>• Conflict avoided
                    <br/>• Downstream delay contained
                  </p>
                  <button
                    onClick={() => setShowApproveDialog(true)}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    Approve Reroute
                  </button>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
                  <h4 className="font-bold text-gray-700 text-sm mb-2">DO NOT REROUTE</h4>
                  <p className="text-xs text-gray-600 mb-4 flex-1">
                    If original route is retained, train will wait for affected section.
                    <br/><br/>
                    <strong>Expected impact:</strong>
                    <br/>• Estimated waiting: +135 min
                    <br/>• Increased downstream delay
                    <br/>• Potential conflict with following trains
                  </p>
                  <button
                    onClick={() => setShowRejectDialog(true)}
                    className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                  >
                    Keep Original Route
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 6. WHY NOT THIS OPTION? */}
          {train.notReroutedReason && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Alternative Reasoning
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-1">Why not keep the original route?</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    The original section is currently blocked or speed restricted. Keeping the existing route would require the train to wait or proceed slowly, increasing its estimated delay by 135 minutes.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 mb-1">Why not alternate route B?</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Alternate route B is available but currently has higher traffic density and would increase downstream congestion.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 7. DECISION COMPARISON */}
          {canApprove && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" /> Decision Comparison
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase">
                      <th className="py-2.5 px-4 font-semibold w-1/3">Metric</th>
                      <th className="py-2.5 px-4 font-bold text-green-700">Approve Reroute</th>
                      <th className="py-2.5 px-4 font-bold text-gray-600">Keep Original</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-700">Travel time</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-600">+45 min</td>
                      <td className="py-2.5 px-4 font-semibold text-red-600">+135 min</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-700">Conflict risk</td>
                      <td className="py-2.5 px-4 font-semibold text-green-600">Low</td>
                      <td className="py-2.5 px-4 font-semibold text-red-600">High</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-700">Section status</td>
                      <td className="py-2.5 px-4 font-semibold text-green-600">Available</td>
                      <td className="py-2.5 px-4 font-semibold text-red-600">Blocked</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-700">Downstream impact</td>
                      <td className="py-2.5 px-4 font-semibold text-green-600">Contained</td>
                      <td className="py-2.5 px-4 font-semibold text-red-600">Increased</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-700">Train movement</td>
                      <td className="py-2.5 px-4 font-semibold text-green-600">Continues</td>
                      <td className="py-2.5 px-4 font-semibold text-red-600">Waiting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 8. AUDIT TRAIL */}
          {history.length > 0 && (
            <section className="pb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Decision & Audit Trail
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-4 text-xs">
                    <span className="font-mono font-bold text-gray-400 flex-shrink-0">{fmtTime(h.approved_at)}</span>
                    <span className="text-gray-700">
                      Controller <strong>{h.approved_by}</strong> {h.decision === 'APPROVED' ? 'approved reroute' : 'rejected reroute'}. Route updated and train released to {h.decision === 'APPROVED' ? 'alternate' : 'original'} section.
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isApproved && history.length === 0 && (
            <section className="pb-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-800 text-sm mb-1">Reroute Approved</h4>
                  <p className="text-xs text-green-900">
                    Approved by {train.approvedBy} at {fmtTime(train.approvedAt || '')}. Train is continuing on alternate route.
                  </p>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      <ConfirmationDialog
        open={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Confirm Reroute Approval"
        description="Are you sure you want to approve this alternate route? The train's schedule and path will be updated immediately across the network."
        confirmLabel="Approve Reroute"
        loading={approveLoading}
      />

      <ConfirmationDialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title="Keep Original Route"
        description="This train will be kept on its original route. Be aware this may incur significant waiting time until the section clears."
        confirmLabel="Confirm"
        loading={rejectLoading}
      />
    </>
  );
}
