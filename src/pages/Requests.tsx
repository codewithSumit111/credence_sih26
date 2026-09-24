import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { 
  ClipboardList, Plus, Search, MapPin, X, Filter, Eye, CheckCircle2
} from 'lucide-react';
import { blocksApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { BlockRequest, Department, Priority } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import PrimaryButton from '../components/buttons/PrimaryButton';

export default function Requests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<BlockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department: (user?.role === 'SECTION_CONTROLLER' ? 'ENG' : (user?.department_id === 2 ? 'S&T' : user?.department_id === 3 ? 'TRD' : 'ENG')) as Department,
    maintenanceType: '',
    track: 'TR-DR-TNA-UP',
    preferredDate: '',
    preferredWindowStart: '10:00',
    preferredWindowEnd: '12:00',
    requestedDuration: 120,
    priority: 'MEDIUM' as Priority,
    notes: '',
  });
  
  const isController = user?.role === 'SECTION_CONTROLLER';

  const fetchRequests = async () => {
    try {
      const data = await blocksApi.getRequests();
      setRequests(data);
    } catch (e) {
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!(req.id.toLowerCase().includes(q) || req.track.toLowerCase().includes(q) || req.department.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.maintenanceType || !formData.preferredDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const newReq = await blocksApi.createRequest({
        ...formData,
        submittedBy: user?.user_id || 'Unknown',
      });
      toast.success('Maintenance request submitted successfully');
      setShowModal(false);
      setRequests(prev => [newReq, ...prev]);
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncludeInPlanning = (id: string) => {
    toast.success(`Request ${id} included in active planning queue.`, {
      description: 'The optimization engine will consider this request in the next run.'
    });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'PROPOSED' as any } : r));
  };

  return (
    <div className="irctc-page relative">
      {/* Header */}
      <div className="bg-white border-b border-irctc-border px-7 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="irctc-page-title">Maintenance Requests</h1>
              <p className="text-[14px] text-irctc-muted mt-0.5">
                {isController ? 'Review incoming departmental block requests' : 'Manage your departmental block requests'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <PrimaryButton onClick={() => setShowModal(true)} variant="blue">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-7 py-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pending</p>
            <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'DEMANDED').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">High Priority</p>
            <p className="text-2xl font-bold text-red-600">{requests.filter(r => r.priority === 'High' || r.priority === 'Critical').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">In Planning</p>
            <p className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'PROPOSED' || r.status === 'AI-OPTIMIZED').length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Approved Blocks</p>
            <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'APPROVED').length}</p>
          </div>
        </div>

        {/* Professional Operational Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-gray-700">Incoming Requirements Queue</h3>
            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtered: {filteredRequests.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Request ID</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Section/Asset</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold">Requested Window</th>
                  <th className="px-5 py-3 font-semibold">Planning Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Loading requests...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400 flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> No pending requests found.</td></tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-3">
                        <span className="font-mono font-bold text-blue-900">{req.id}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{req.maintenanceType}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-gray-700">{req.department}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono font-semibold text-gray-800">{req.track}</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">{req.asset}</span>
                      </td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-gray-700 font-medium">{req.preferredDate}</span>
                        <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                          {req.preferredWindowStart} - {req.preferredWindowEnd} ({req.requestedDuration}m)
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={req.status as any} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View on Network"
                            onClick={() => navigate(`/plan?view=blocks&search=${req.track}`)}
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          {req.status === 'DEMANDED' && isController && (
                            <button 
                              onClick={() => handleIncludeInPlanning(req.id)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              Include in Planning
                            </button>
                          )}
                          {req.status !== 'DEMANDED' && isController && (
                            <button 
                              onClick={() => navigate('/plan')}
                              className="px-3 py-1.5 bg-white text-gray-600 text-[11px] font-bold rounded hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                              Open Plan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="text-[16px] font-bold text-irctc-navy">Create Maintenance Request</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                
                {/* Department */}
                <div className="irctc-form-group">
                  <label className="irctc-input-label">Department</label>
                  <select 
                    className="irctc-select"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    disabled={!isController}
                  >
                    <option value="ENG">Engineering</option>
                    <option value="TRD">Traction (TRD)</option>
                    <option value="S&T">Signaling (S&T)</option>
                  </select>
                </div>

                {/* Maintenance Type */}
                <div className="irctc-form-group">
                  <label className="irctc-input-label">Request Type / Reason *</label>
                  <input 
                    type="text" 
                    className="irctc-input"
                    value={formData.maintenanceType}
                    onChange={e => setFormData({ ...formData, maintenanceType: e.target.value })}
                    placeholder="e.g. TRACMACHINE, OHE MAINTENANCE"
                    required
                  />
                </div>

                {/* Section & Track */}
                <div className="irctc-form-group">
                  <label className="irctc-input-label">Track / Line</label>
                  <input 
                    type="text" 
                    className="irctc-input"
                    value={formData.track}
                    onChange={e => setFormData({ ...formData, track: e.target.value })}
                    placeholder="e.g. TR-DR-TNA-UP"
                    required
                  />
                </div>

                <div className="irctc-form-group">
                  <label className="irctc-input-label">Requested Date *</label>
                  <input 
                    type="date" 
                    className="irctc-input"
                    value={formData.preferredDate}
                    onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                    required
                  />
                </div>

                <div className="irctc-form-group">
                  <label className="irctc-input-label">Requested Window Start</label>
                  <input 
                    type="time" 
                    className="irctc-input"
                    value={formData.preferredWindowStart}
                    onChange={e => setFormData({ ...formData, preferredWindowStart: e.target.value })}
                  />
                </div>

                <div className="irctc-form-group">
                  <label className="irctc-input-label">Requested Window End</label>
                  <input 
                    type="time" 
                    className="irctc-input"
                    value={formData.preferredWindowEnd}
                    onChange={e => setFormData({ ...formData, preferredWindowEnd: e.target.value })}
                  />
                </div>

                <div className="irctc-form-group">
                  <label className="irctc-input-label">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    className="irctc-input"
                    value={formData.requestedDuration}
                    onChange={e => setFormData({ ...formData, requestedDuration: Number(e.target.value) })}
                    min={15}
                    step={15}
                    required
                  />
                </div>

                <div className="irctc-form-group">
                  <label className="irctc-input-label">Priority</label>
                  <select 
                    className="irctc-select"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                <div className="irctc-form-group col-span-2">
                  <label className="irctc-input-label">Notes</label>
                  <textarea 
                    className="irctc-input"
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional context or dependencies..."
                  />
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="irctc-btn irctc-btn-primary px-6 py-2.5 text-[13px] justify-center min-w-[120px]">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
