import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import LoadingState from '../components/common/LoadingState';
import { eventsApi } from '../api';
import type { LiveEvent } from '../types';
import { ArrowLeft, AlertOctagon, RefreshCw, Zap } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await eventsApi.getEvent(id || 'EVT-001');
        if (data) setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  if (loading) return <LoadingState message="Loading Incident Record..." />;
  if (!event) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-gray-500 mb-4">Event not found.</p>
        <SecondaryButton onClick={() => navigate('/events')}>Back to Events</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Live Events
      </button>

      <PageHeader
        title={`INCIDENT FILE: ${event.title}`}
        subtitle={`Location: ${event.location} • Logged at: ${new Date(event.timestamp).toLocaleTimeString()}`}
        badge={<StatusBadge status={event.severity} size="md" />}
        actions={
          event.reoptimizationId ? (
            <PrimaryButton
              size="sm"
              icon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
              onClick={() => navigate(`/reoptimization/${event.reoptimizationId}`)}
            >
              Open ALNS Re-Optimization Plan
            </PrimaryButton>
          ) : null
        }
      />

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">INCIDENT OVERVIEW</h3>
        <p className="text-sm text-gray-800 leading-relaxed font-medium">{event.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">Affected Track Possession</span>
            <span className="font-mono font-bold text-gray-900">{event.affectedBlocks.join(', ')}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Conflicting Trains</span>
            <span className="font-mono font-bold text-gray-900">{event.affectedTrains.join(', ')}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Estimated Restoration</span>
            <span className="font-bold text-red-600">{event.estimatedResolution || 'Pending Assessment'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

