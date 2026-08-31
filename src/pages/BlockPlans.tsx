import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import DataTable, { type Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import GanttChart from '../components/gantt/GanttChart';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import LoadingState from '../components/common/LoadingState';
import FilterBar from '../components/common/FilterBar';
import { blocksApi, trainsApi } from '../api';
import type { OptimizedBlock, Train, BlockStatus } from '../types';
import { Plus, ArrowRight, Layers, Sparkles } from 'lucide-react';

export default function BlockPlans() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<OptimizedBlock[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('BR-00231');

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, tData] = await Promise.all([
          blocksApi.getBlocks(),
          trainsApi.getTrains(),
        ]);
        setBlocks(bData);
        setTrains(tData);
      } catch {
        toast.error('Failed to load blocks');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    try {
      const optimized = await blocksApi.optimizeWeekly();
      setBlocks(optimized);
      toast.success('CP-SAT Optimization Complete', {
        description: 'Generated 6 feasible maintenance block possession schedules without conflict.',
      });
    } catch {
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const filteredBlocks = blocks.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (deptFilter !== 'ALL' && !b.departments.includes(deptFilter as any)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.track.toLowerCase().includes(q) ||
        b.section.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const columns: Column<OptimizedBlock>[] = [
    {
      key: 'id',
      label: 'Block ID',
      render: row => (
        <span className="font-mono font-bold text-blue-900">{row.id}</span>
      ),
    },
    {
      key: 'section',
      label: 'Section / Track',
      render: row => (
        <div>
          <span className="font-semibold text-gray-900">{row.track}</span>
          <span className="text-gray-400 text-xs block">{row.section}</span>
        </div>
      ),
    },
    {
      key: 'window',
      label: 'Window',
      render: row => (
        <span className="font-medium text-gray-800">
          {row.startTime}–{row.endTime} <span className="text-xs text-gray-400 font-normal">({row.duration}m)</span>
        </span>
      ),
    },
    {
      key: 'departments',
      label: 'Departments',
      render: row => (
        <div className="flex flex-wrap gap-1">
          {row.departments.map(d => (
            <span
              key={d}
              className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium"
            >
              {d}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'jobs',
      label: 'Jobs',
      render: row => (
        <span className="text-xs text-gray-600">
          {row.jobIds.length} Job{row.jobIds.length > 1 ? 's' : ''}
          {row.bundled && <span className="ml-1 text-purple-700 font-bold">(Bundled)</span>}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: row => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'affectedTrains',
      label: 'Affected Trains',
      render: row => (
        <span className="text-xs font-medium text-gray-700">
          {row.affectedTrains.length > 0 ? (
            <span className="text-amber-700 font-semibold">{row.affectedTrains.length} Affected</span>
          ) : (
            <span className="text-green-700">None (Clear)</span>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: row => (
        <button
          onClick={e => {
            e.stopPropagation();
            navigate(`/blocks/${row.id}`);
          }}
          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          View <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Loading Block Plans workspace..." />;
  }

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-5">
      {/* Header */}
      <PageHeader
        title="BLOCK PLANNING WORKSPACE"
        subtitle="Coordinated Infrastructure Possession Management across Engineering, S&T, and Traction"
        actions={
          <div className="flex items-center gap-2">
            <SecondaryButton
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
              onClick={handleRunOptimizer}
              disabled={optimizing}
            >
              {optimizing ? 'Running CP-SAT...' : 'Run CP-SAT Optimizer'}
            </SecondaryButton>
            <PrimaryButton
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/requests/new')}
            >
              New Block Request
            </PrimaryButton>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          onSearch={q => setSearchQuery(q)}
          searchPlaceholder="Search block, track, or section..."
        >
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AI-OPTIMIZED">AI-Optimized</option>
              <option value="APPROVED">Approved</option>
              <option value="PROVISIONAL">Provisional</option>
              <option value="PROPOSED">Proposed</option>
              <option value="DEMANDED">Demanded</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="S&T">S&T</option>
              <option value="Traction">Traction</option>
            </select>
          </div>
        </FilterBar>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-800">{filteredBlocks.length}</span> of {blocks.length} Possession Blocks
        </div>
      </div>

      {/* Master Block Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            MASTER BLOCK SCHEDULE TABLE
          </span>
          <span className="text-[11px] text-gray-500">
            Select any row to highlight on Corridor Gantt
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredBlocks}
          selectedId={selectedBlockId}
          getRowId={row => row.id}
          onRowClick={row => setSelectedBlockId(row.id)}
          emptyMessage="No blocks matching the selected criteria."
        />
      </div>

      {/* Corridor × Time Gantt */}
      <div className="space-y-2">
        <GanttChart
          blocks={filteredBlocks}
          trains={trains}
          selectedBlockId={selectedBlockId}
          onBlockClick={id => setSelectedBlockId(id)}
        />
      </div>

      {/* Selected Block Quick Drawer / Info Card */}
      {selectedBlock && (
        <div className="bg-white border border-gray-200 rounded p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold font-mono">
              {selectedBlock.track.split('-')[1]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">{selectedBlock.id}</span>
                <span className="text-xs text-gray-500">• {selectedBlock.section} ({selectedBlock.track})</span>
                <StatusBadge status={selectedBlock.status} />
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Scheduled Window: <strong>{selectedBlock.startTime}–{selectedBlock.endTime}</strong> ({selectedBlock.duration} min) • Expected Delay: <strong>+{selectedBlock.expectedDelay} min</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SecondaryButton
              size="sm"
              onClick={() => navigate(`/blocks/${selectedBlock.id}`)}
            >
              Inspect Recommendation Details →
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

