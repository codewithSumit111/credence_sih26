import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import SecondaryButton from '../components/buttons/SecondaryButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import LoadingState from '../components/common/LoadingState';
import { trainsApi } from '../api';
import type { Train } from '../types';
import { ArrowLeft, GitBranch, Clock, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TrainDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrain() {
      try {
        const data = await trainsApi.getTrain(id || '12123');
        if (data) setTrain(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrain();
  }, [id]);

  if (loading) return <LoadingState message="Loading Train Operations File..." />;
  if (!train) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-gray-500 mb-4">Train not found.</p>
        <SecondaryButton onClick={() => navigate('/trains')}>Back to Trains</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
      </button>

      <PageHeader
        title={`TRAIN ${train.number} — ${train.name}`}
        subtitle={`Type: ${train.type} • Current Section: ${train.currentSection}`}
        badge={<StatusBadge status={train.currentStatus} size="md" />}
        actions={
          train.reroutingEligible ? (
            <PrimaryButton
              size="sm"
              icon={<GitBranch className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/rerouting`)}
            >
              Open Rerouting Console
            </PrimaryButton>
          ) : null
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block mb-1">SCHEDULED TIME</span>
          <p className="text-sm font-bold text-gray-900">Arr: {train.scheduledArrival} • Dep: {train.scheduledDeparture}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block mb-1">OPERATIONAL DELAY</span>
          <p className={`text-sm font-bold ${train.delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {train.delay > 0 ? `+${train.delay} Minutes` : 'On Time'}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block mb-1">REROUTING ELIGIBILITY</span>
          <p className="text-sm font-bold text-blue-700">
            {train.reroutingEligible ? '✓ Eligible for Dynamic Reroute' : 'Locked to Primary Route'}
          </p>
        </div>
      </div>

      {/* Routes specification */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          CORRIDOR ROUTE & OCCUPATION PROFILE
        </h3>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Original Timetabled Route</p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded text-xs flex-wrap">
            {train.originalRoute.map((seg, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-800">{seg.from}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-mono text-blue-700 font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">{seg.track}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                {i === train.originalRoute.length - 1 && (
                  <span className="font-semibold text-gray-800">{seg.to}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {train.proposedRoute && (
          <div>
            <p className="text-xs font-semibold text-blue-800 mb-1.5">A* Proposed Feasible Route</p>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs flex-wrap">
              {train.proposedRoute.map((seg, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="font-semibold text-blue-900">{seg.from}</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  <span className="font-mono text-blue-700 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-300">{seg.track}</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  {i === train.proposedRoute!.length - 1 && (
                    <span className="font-semibold text-blue-900">{seg.to}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

