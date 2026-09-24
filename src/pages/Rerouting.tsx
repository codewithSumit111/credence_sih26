import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import RailwayNetwork from '../components/network/RailwayNetwork';
import RouteComparison from '../components/trains/RouteComparison';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import { trainsApi } from '../api';
import type { Train } from '../types';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function Rerouting() {
  const navigate = useNavigate();
  const { trainId } = useParams<{ trainId: string }>();
  const [trains, setTrains] = useState<any[]>([]);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>(trainId || '12123');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadTrains() {
      try {
        const data = await trainsApi.getTrains();
        setTrains(data);
      } catch {
        toast.error('Failed to load train operations data');
      } finally {
        setLoading(false);
      }
    }
    loadTrains();
  }, []);

  const selectedTrain = trains.find((t: any) => t.trainNumber === selectedTrainNumber || t.number === selectedTrainNumber) || trains[0];

  const handleAcceptReroute = async () => {
    if (!selectedTrain) return;
    setActionLoading(true);
    try {
      const updated = await trainsApi.acceptReroute(selectedTrain.number);
      setTrains(prev => prev.map(t => t.number === updated.number ? updated : t));
      toast.success(`Rerouting Accepted for Train ${selectedTrain.number} (${selectedTrain.name})`, {
        description: 'New route via TR-04 / TR-05 committed to Central Railway Control.',
      });
    } catch {
      toast.error('Failed to accept reroute');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKeepOriginal = () => {
    toast.info(`Retained original route for Train ${selectedTrain?.number}`, {
      description: 'Train will hold at signal before blocked section TR-02.',
    });
  };

  if (loading) {
    return <LoadingState message="Loading Live Network Operations & Rerouting..." />;
  }

  const routeOptions = [
    {
      label: 'WAIT',
      segments: 'Hold at ST-B until TR-02 possession completes',
      delay: 45,
      recommended: false,
    },
    {
      label: 'REROUTE A (Recommended)',
      segments: 'ST-A → TR-01 → TR-04 (Akola bypass) → ST-C',
      delay: 12,
      extraKm: 12,
      recommended: true,
    },
    {
      label: 'REROUTE B',
      segments: 'ST-A → TR-01 → TR-07 loop → ST-C',
      delay: 27,
      extraKm: 7,
      recommended: false,
    },
  ];

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-5">
      {/* Header */}
      <PageHeader
        title="DYNAMIC TRAIN REROUTING & CORRIDOR DISPATCH"
        subtitle="Real-time conflict resolution powered by Time-Dependent A* shortest feasible path engine"
        badge={
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE DISPATCH ENGINE ACTIVE
          </div>
        }
      />

      {/* Main Visual: Schematic Live Corridor Network matching wireframe 4 */}
      <RailwayNetwork
        blockedTrack="TR-02"
        proposedRoute={['TR-01', 'TR-04', 'TR-05']}
        originalRoute={['TR-01', 'TR-02']}
        trainPositions={[
          { trainNumber: '12123', trackId: 'TR-01', position: 0.7 },
          { trainNumber: '11008', trackId: 'TR-01', position: 0.3 },
          { trainNumber: '22145', trackId: 'TR-04', position: 0.5 },
        ]}
      />

      {/* Affected Trains Table matching wireframe 4 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            AFFECTED TRAINS QUEUE (CORRIDOR CONFLICT ANALYSIS)
          </span>
          <span className="text-[11px] text-gray-500">
            Click train row to inspect route alternatives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 text-left bg-gray-50/50">
                <th className="py-2.5 px-4 font-semibold">TRAIN</th>
                <th className="py-2.5 px-4 font-semibold">STATUS</th>
                <th className="py-2.5 px-4 font-semibold">ORIGINAL TRACK</th>
                <th className="py-2.5 px-4 font-semibold">AI ROUTE STRATEGY</th>
                <th className="py-2.5 px-4 font-semibold">EST. DELAY</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trains.map(train => {
                const isSelected = selectedTrain?.number === train.number;
                const isAffected = train.number === '12123' || train.number === '11008';
                return (
                  <tr
                    key={train.number}
                    onClick={() => setSelectedTrainNumber(train.number)}
                    className={clsx(
                      'cursor-pointer transition-colors',
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-gray-50'
                    )}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 font-mono">{train.number}</span>
                      <span className="text-gray-500 text-[11px] block">{train.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={isAffected ? 'DELAYED' : 'ON_TIME'} />
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">TR-02</td>
                    <td className="py-3 px-4">
                      {train.number === '12123' && (
                        <span className="text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">
                          Route A (A* Reroute via TR-04)
                        </span>
                      )}
                      {train.number === '11008' && (
                        <span className="text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
                          Wait 18 min at ST-B
                        </span>
                      )}
                      {train.number === '22145' && (
                        <span className="text-green-800 font-semibold">
                          Original Route (Clear)
                        </span>
                      )}
                      {train.number !== '12123' && train.number !== '11008' && train.number !== '22145' && (
                        <span className="text-gray-600">Original Route</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={clsx(
                        'font-bold font-mono',
                        train.delay > 0 ? 'text-amber-700' : 'text-green-700'
                      )}>
                        {train.delay > 0 ? `+${train.delay} min` : '0 min'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isAffected ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrainNumber(train.number);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          VIEW →
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Train Rerouting Comparison Panel matching wireframe 4 */}
      {selectedTrain && (
        <RouteComparison
          train={selectedTrain}
          options={routeOptions}
          onAcceptReroute={handleAcceptReroute}
          onKeepOriginal={handleKeepOriginal}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

