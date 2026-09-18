import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { CheckCircle2, ClipboardList, ArrowLeft } from 'lucide-react';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { blocksApi } from '../api';

type Department = 'Engineering' | 'S&T' | 'Traction';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface FormData {
  department: Department;
  maintenanceType: string;
  track: string;
  asset: string;
  preferredDate: string;
  requestedDuration: number;
  preferredWindowStart: string;
  preferredWindowEnd: string;
  requiredManpower: number;
  machinery: string;
  priority: Priority;
  safetyBuffer: boolean;
  dependsOnJob: boolean;
  requiresIsolation: boolean;
  notes: string;
  submittedBy: string;
}

const initialForm: FormData = {
  department: 'Engineering',
  maintenanceType: '',
  track: 'TR-02',
  asset: '',
  preferredDate: new Date().toISOString().split('T')[0],
  requestedDuration: 60,
  preferredWindowStart: '22:00',
  preferredWindowEnd: '04:00',
  requiredManpower: 6,
  machinery: '',
  priority: 'Medium',
  safetyBuffer: true,
  dependsOnJob: false,
  requiresIsolation: false,
  notes: '',
  submittedBy: 'R. Sharma',
};

export default function Requests() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const handleChange = (field: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.maintenanceType || !form.asset) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const result = await blocksApi.submitRequest({
        ...form,
        requestedDuration: Number(form.requestedDuration),
        requiredManpower: Number(form.requiredManpower),
      });
      setSubmittedId(result.id);
      setSubmitted(true);
      toast.success('Block Request Submitted', {
        description: `${result.id} submitted for CP-SAT scheduling. You will be notified when the optimization is ready.`,
      });
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setForm(initialForm);
    setSubmitted(false);
    setSubmittedId('');
  };

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F4F5F7]">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md w-full text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-[18px] font-bold text-gray-900 mb-1">Request Submitted</h2>
          <p className="text-[12px] text-gray-500 mb-3">Your block request has been received.</p>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg mb-4">
            <p className="font-mono font-bold text-emerald-900 text-[16px]">{submittedId}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Pending CP-SAT scheduling</p>
          </div>

          <div className="text-left space-y-1.5 text-[11px] text-gray-600 mb-6">
            {[
              'Request logged and visible to Section Controller',
              'CP-SAT optimizer will evaluate compatibility',
              'Scheduling result will appear in Plan → Blocks',
              'You will be notified when the block is ready',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <SecondaryButton onClick={() => navigate('/plan?view=blocks')}>View in Plan</SecondaryButton>
            <PrimaryButton onClick={handleNewRequest} variant="green">Submit Another</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#F4F5F7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="max-w-[860px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/plan?view=blocks')}
              className="flex items-center gap-1 text-[12px] font-semibold text-gray-600 hover:text-emerald-800 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 px-2.5 py-1.5 rounded-lg transition-colors mr-1"
              title="Return to Plan"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Plan</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">New Block Request</h1>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Submit a maintenance block request for CP-SAT scheduling optimization
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Department + Maintenance Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">Work Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Department *</label>
                <select
                  value={form.department}
                  onChange={e => handleChange('department', e.target.value as Department)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option>Engineering</option>
                  <option>S&T</option>
                  <option>Traction</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Maintenance Type *</label>
                <input
                  type="text"
                  value={form.maintenanceType}
                  onChange={e => handleChange('maintenanceType', e.target.value)}
                  placeholder="e.g., Rail Grinding, Signal Inspection..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Track Section *</label>
                <select
                  value={form.track}
                  onChange={e => handleChange('track', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                >
                  {['TR-01', 'TR-02', 'TR-03', 'TR-04', 'TR-05', 'TR-06', 'TR-07', 'TR-08'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Asset ID *</label>
                <input
                  type="text"
                  value={form.asset}
                  onChange={e => handleChange('asset', e.target.value)}
                  placeholder="e.g., A-TR02-144"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Priority Level</label>
                <div className="flex gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleChange('priority', p)}
                      className={clsx(
                        'flex-1 py-2 rounded-lg border text-[11px] font-semibold transition-colors',
                        form.priority === p
                          ? p === 'Critical' ? 'bg-red-700 text-white border-red-700'
                            : p === 'High' ? 'bg-orange-600 text-white border-orange-600'
                            : p === 'Medium' ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Preferences */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">Scheduling Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Preferred Date</label>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={e => handleChange('preferredDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Window Start</label>
                <input
                  type="time"
                  value={form.preferredWindowStart}
                  onChange={e => handleChange('preferredWindowStart', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Window End</label>
                <input
                  type="time"
                  value={form.preferredWindowEnd}
                  onChange={e => handleChange('preferredWindowEnd', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={form.requestedDuration}
                  onChange={e => handleChange('requestedDuration', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Manpower Required</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={form.requiredManpower}
                  onChange={e => handleChange('requiredManpower', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Machinery/Equipment</label>
                <input
                  type="text"
                  value={form.machinery}
                  onChange={e => handleChange('machinery', e.target.value)}
                  placeholder="e.g., Rail grinder, PLASSER"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white text-gray-800 focus:outline-none focus:border-emerald-500 placeholder-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Safety Requirements */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">Safety Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'safetyBuffer', label: 'Safety Buffer Required', desc: 'Extra time margin around block' },
                { key: 'dependsOnJob', label: 'Depends on Another Job', desc: 'Has prerequisite maintenance' },
                { key: 'requiresIsolation', label: 'Requires Isolation', desc: 'Full electrical/traction isolation' },
              ].map(item => (
                <div
                  key={item.key}
                  onClick={() => handleChange(item.key as keyof FormData, !form[item.key as keyof FormData])}
                  className={clsx(
                    'border rounded-lg p-3 cursor-pointer transition-all',
                    form[item.key as keyof FormData] ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={clsx(
                      'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      form[item.key as keyof FormData] ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                    )}>
                      {form[item.key as keyof FormData] && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-800">{item.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 ml-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Additional Notes</h3>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Any additional requirements, site conditions, or constraints for the CP-SAT scheduler..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-gray-50 text-gray-800 focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-300 resize-none"
            />
          </div>

          {/* Note on CP-SAT */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800">
            <p className="font-semibold mb-1">How scheduling works</p>
            <p>This request will be evaluated by the CP-SAT constraint solver. The optimizer will check for compatible jobs (bundling opportunity), train conflicts, resource availability, and safety constraints before proposing a block window. Section Controller approval is required before activation.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => navigate('/plan?view=blocks')}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" variant="green" loading={submitting}>
              Submit Request for Scheduling
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
