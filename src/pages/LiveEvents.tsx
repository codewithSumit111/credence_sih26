import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import EventCard from '../components/events/EventCard';
import LoadingState from '../components/common/LoadingState';
import { eventsApi } from '../api';
import type { LiveEvent } from '../types';
import { ShieldCheck, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export default function LiveEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('EVT-001');
  const [loading, setLoading] = useState(true);
  const [triggeringReopt, setTriggeringReopt] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await eventsApi.getEvents();
        setEvents(data);
      } catch {
        toast.error('Failed to load live events');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  const handleReoptimize = async (eventId: string) => {
    setTriggeringReopt(true);
    try {
      const plan = await eventsApi.triggerReoptimize(eventId);
      toast.success('ALNS Schedule Repair Complete', {
        description: 'Dynamic repair preserved completed work and generated updated train dispatch plan.',
      });
      navigate(`/reoptimization/${plan.id}`);
    } catch {
      toast.error('Failed to run ALNS re-optimization');
    } finally {
      setTriggeringReopt(false);
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to Live Event & Telemetry Stream..." />;
  }

  return (
    <div className="p-5 max-w-[1400px] mx-auto space-y-6">
      {/* Header matching wireframe 5 */}
      <PageHeader
        title="LIVE EVENTS & DISRUPTION MONITORING"
        subtitle="Real-time incident detection, train impact propagation, and adaptive schedule repair"
        badge={
          <div className="flex items-center gap-1.5 bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            MONITORING ACTIVE
          </div>
        }
      />

      {/* Main Event Cards List matching wireframe 5 */}
      <div className="space-y-3">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => setSelectedEventId(event.id)}
            onReoptimize={() => handleReoptimize(event.id)}
          />
        ))}
      </div>

      {/* Bottom Section: Timeline & System Impact matching wireframe 5 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Timeline - 7 cols */}
          <div className="md:col-span-7">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              EVENT TIMELINE (CORRIDOR CHRONOLOGY)
            </h3>
            
            <div className="relative space-y-4">
              {selectedEvent?.timeline.map((entry, index) => (
                <div key={index} className="flex items-start gap-4 text-xs">
                  <span className="font-mono font-bold text-gray-500 w-12 flex-shrink-0">
                    {entry.time}
                  </span>
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      'w-3 h-3 rounded-full mt-0.5 flex-shrink-0',
                      entry.isAlert ? 'bg-red-600 ring-4 ring-red-100' : 'bg-emerald-600'
                    )} />
                    {index < selectedEvent.timeline.length - 1 && (
                      <div className="w-px h-6 bg-gray-200 my-0.5" />
                    )}
                  </div>
                  <span className={clsx(
                    'font-medium pt-0.5',
                    entry.isAlert ? 'text-red-700 font-bold' : 'text-gray-800'
                  )}>
                    {entry.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Impact - 5 cols */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l md:pl-8 border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              SYSTEM IMPACT ASSESSMENT
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-red-50/70 border border-red-200 rounded">
                <span className="font-semibold text-red-900">Trains Affected</span>
                <span className="font-bold text-red-700 text-sm">
                  • {selectedEvent?.systemImpact.trainsAffected} Trains Affected
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded">
                <span className="font-semibold text-amber-900">Block Possession Overrun</span>
                <span className="font-bold text-amber-700 text-sm">
                  • {selectedEvent?.systemImpact.blocksOverrunning} Overrunning
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded">
                <span className="font-semibold text-emerald-900">Route Recalculation Required</span>
                <span className="font-bold text-emerald-700 text-sm">
                  • {selectedEvent?.systemImpact.routeRecalculations} Recalculation
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50/70 border border-green-200 rounded">
                <span className="font-semibold text-green-900">Safety Violations</span>
                <span className="font-bold text-green-700 text-sm">
                  • {selectedEvent?.systemImpact.safetyViolations} Violations (Protected)
                </span>
              </div>
            </div>

            {/* Direct Re-optimization Action */}
            <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Trigger Dynamic ALNS Schedule Repair</span>
              </div>
              <p className="text-gray-600">
                Repair remaining possessions without invalidating already completed work on track.
              </p>
              <button
                onClick={() => handleReoptimize(selectedEvent?.id || 'EVT-001')}
                disabled={triggeringReopt}
                className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-2"
              >
                {triggeringReopt ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'LAUNCH ALNS + A* RE-OPTIMIZATION →'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

