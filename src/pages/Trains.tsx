import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import DataTable, { type Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import FilterBar from '../components/common/FilterBar';
import { trainsApi } from '../api';
import type { Train } from '../types';
import { ArrowRight, GitBranch, Train as TrainIcon } from 'lucide-react';

export default function Trains() {
  const navigate = useNavigate();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadTrains() {
      try {
        const data = await trainsApi.getTrains();
        setTrains(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrains();
  }, []);

  const filteredTrains = trains.filter(t => {
    if (statusFilter !== 'ALL' && t.currentStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.number.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.currentSection.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<Train>[] = [
    {
      key: 'number',
      label: 'Train Number & Name',
      render: row => (
        <div>
          <span className="font-mono font-bold text-gray-900">{row.number}</span>
          <span className="text-xs text-gray-500 block">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: row => (
        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
          {row.type}
        </span>
      ),
    },
    {
      key: 'section',
      label: 'Current Section',
      render: row => <span className="font-medium text-gray-800">{row.currentSection}</span>,
    },
    {
      key: 'schedule',
      label: 'Scheduled Time',
      render: row => (
        <span className="text-xs font-mono text-gray-700">
          Arr: {row.scheduledArrival} | Dep: {row.scheduledDeparture}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Current Status',
      render: row => <StatusBadge status={row.currentStatus} />,
    },
    {
      key: 'conflict',
      label: 'Affected Block',
      render: row => (
        <span className="text-xs">
          {row.affectedBlockId ? (
            <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
              {row.affectedBlockId}
            </span>
          ) : (
            <span className="text-green-700">None (Clear)</span>
          )}
        </span>
      ),
    },
    {
      key: 'delay',
      label: 'Delay',
      render: row => (
        <span className={`font-mono font-bold text-xs ${row.delay > 0 ? 'text-amber-700' : 'text-green-700'}`}>
          {row.delay > 0 ? `+${row.delay}m` : 'On Time'}
        </span>
      ),
    },
    {
      key: 'rerouting',
      label: 'Rerouting Status',
      render: row => <StatusBadge status={row.reroutingStatus} />,
    },
    {
      key: 'action',
      label: 'Action',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-2">
          {row.reroutingEligible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/rerouting?train=${row.number}`);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <GitBranch className="w-3 h-3" /> Reroute
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trains/${row.number}`);
            }}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Details →
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Loading Train Operations & Impact analysis..." />;
  }

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-5">
      <PageHeader
        title="TRAIN OPERATIONS & BLOCK IMPACT WORKSPACE"
        subtitle="Live Timetable, Section Occupation, and Dynamic Rerouting Eligibility"
      />

      <div className="bg-white p-3 rounded border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          onSearch={q => setSearchQuery(q)}
          searchPlaceholder="Search train number or name..."
        >
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs font-semibold border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ON_TIME">On Time</option>
            <option value="DELAYED">Delayed</option>
            <option value="REROUTED">Rerouted</option>
          </select>
        </FilterBar>

        <span className="text-xs text-gray-500">
          Showing <strong>{filteredTrains.length}</strong> active trains on corridor
        </span>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={filteredTrains}
          getRowId={row => row.number}
          onRowClick={row => navigate(`/trains/${row.number}`)}
          emptyMessage="No trains found matching criteria."
        />
      </div>
    </div>
  );
}

