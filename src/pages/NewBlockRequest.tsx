import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageHeader from '../components/common/PageHeader';
import FormField from '../components/forms/FormField';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { blocksApi } from '../api';
import type { Department, Priority } from '../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function NewBlockRequest() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State matching Wireframe 3
  const [department, setDepartment] = useState<Department>('Engineering');
  const [maintenanceType, setMaintenanceType] = useState('Track Renewal');
  const [trackSection, setTrackSection] = useState('TR-02');
  const [asset, setAsset] = useState('A-TR02-144');
  const [preferredDate, setPreferredDate] = useState('2026-08-27');
  const [requestedDuration, setRequestedDuration] = useState('90 min');
  const [preferredWindow, setPreferredWindow] = useState('13:00 – 18:00');
  const [requiredManpower, setRequiredManpower] = useState('8');
  const [machinery, setMachinery] = useState('Tamping Machine');
  const [priority, setPriority] = useState<Priority>('High');
  const [safetyBuffer, setSafetyBuffer] = useState(true);
  const [dependsOnJob, setDependsOnJob] = useState(false);
  const [requiresIsolation, setRequiresIsolation] = useState(false);
  const [notes, setNotes] = useState('Replace damaged rail section near KM 142/3. Requires speed restriction clearance post-tamping.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newReq = await blocksApi.createRequest({
        department,
        maintenanceType,
        track: trackSection,
        asset,
        preferredDate,
        requestedDuration: parseInt(requestedDuration) || 90,
        preferredWindowStart: preferredWindow.split('–')[0]?.trim() || '13:00',
        preferredWindowEnd: preferredWindow.split('–')[1]?.trim() || '18:00',
        requiredManpower: parseInt(requiredManpower) || 8,
        machinery,
        priority,
        safetyBuffer,
        dependsOnJob,
        requiresIsolation,
        notes,
        submittedBy: 'A. Joshi (Engineering)',
      });
      setSubmittedId(newReq.id);
      toast.success(`Block Request ${newReq.id} Submitted Successfully`, {
        description: 'Sent to optimization engine for compatibility bundling & CP-SAT scheduling.',
      });
    } catch {
      toast.error('Failed to submit block request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Block Request Submitted</h2>
        <p className="text-xs text-gray-600">
          Request <strong className="font-mono text-emerald-900">{submittedId}</strong> for <strong>{department}</strong> on <strong>{trackSection}</strong> has entered the optimization pipeline.
        </p>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-left text-xs space-y-1.5 text-emerald-900">
          <p className="font-bold">Next Pipeline Steps:</p>
          <p>1. Weighted Priority Scoring calculation</p>
          <p>2. Compatibility detection for bundling with S&T / Traction</p>
          <p>3. Google OR-Tools CP-SAT scheduling</p>
          <p>4. Train conflict & rerouting analysis (Time-Dependent A*)</p>
          <p>5. Presentation to Section Controller for Human Approval</p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <SecondaryButton onClick={() => setSubmittedId(null)}>
            Submit Another Request
          </SecondaryButton>
          <PrimaryButton onClick={() => navigate('/blocks')}>
            View Block Plans Workspace
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1000px] mx-auto space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back
      </button>

      <PageHeader
        title="NEW BLOCK REQUEST"
        subtitle="Create a maintenance request for AI optimization and possession scheduling"
      />

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            REQUEST DETAILS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <FormField label="Department" required>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as Department)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Engineering">Engineering / Track</option>
                <option value="S&T">Signal & Telecommunication (S&T)</option>
                <option value="Traction">Traction Distribution / OHE</option>
              </select>
            </FormField>

            {/* Maintenance Type */}
            <FormField label="Maintenance Type" required>
              <input
                type="text"
                value={maintenanceType}
                onChange={e => setMaintenanceType(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Track Renewal, Rail Grinding, Signal Test"
              />
            </FormField>

            {/* Track / Section */}
            <FormField label="Track / Section" required>
              <input
                type="text"
                value={trackSection}
                onChange={e => setTrackSection(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. TR-02 (NGP-BSL)"
              />
            </FormField>

            {/* Asset */}
            <FormField label="Asset ID">
              <input
                type="text"
                value={asset}
                onChange={e => setAsset(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. A-TR02-144"
              />
            </FormField>

            {/* Preferred Date */}
            <FormField label="Preferred Date" required>
              <input
                type="date"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </FormField>

            {/* Requested Duration */}
            <FormField label="Requested Duration" required>
              <input
                type="text"
                value={requestedDuration}
                onChange={e => setRequestedDuration(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 90 min"
              />
            </FormField>

            {/* Preferred Window */}
            <FormField label="Preferred Window">
              <input
                type="text"
                value={preferredWindow}
                onChange={e => setPreferredWindow(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 13:00 – 18:00"
              />
            </FormField>

            {/* Required Manpower */}
            <FormField label="Required Manpower">
              <input
                type="number"
                value={requiredManpower}
                onChange={e => setRequiredManpower(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 8"
              />
            </FormField>
          </div>

          {/* Machinery */}
          <div className="mt-4">
            <FormField label="Machinery / Heavy Equipment Required">
              <input
                type="text"
                value={machinery}
                onChange={e => setMachinery(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Tamping Machine, Rail Grinder, OHE Tower Wagon"
              />
            </FormField>
          </div>
        </div>

        {/* Priority Radio Buttons matching wireframe */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            PRIORITY
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map(p => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={clsx(
                  'py-2 px-3 text-xs font-bold rounded border text-center transition-all',
                  priority === p
                    ? p === 'Critical' ? 'bg-red-600 text-white border-red-700'
                    : p === 'High' ? 'bg-red-600 text-white border-red-700'
                    : p === 'Medium' ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-gray-700 text-white border-gray-800'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Safety & Dependencies Checkboxes matching wireframe */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                SAFETY & DEPENDENCIES
              </label>
              <div className="space-y-2 text-xs text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyBuffer}
                    onChange={e => setSafetyBuffer(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-0"
                  />
                  <span>Safety buffer required (+15 min minimum)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dependsOnJob}
                    onChange={e => setDependsOnJob(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-0"
                  />
                  <span>Depends on another maintenance job (Sequential)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresIsolation}
                    onChange={e => setRequiresIsolation(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-0"
                  />
                  <span>Requires electrical/track isolation</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <FormField label="Operational Notes / Specifics">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  placeholder="Additional context for Section Controller and Optimization algorithm..."
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <SecondaryButton type="button" onClick={() => navigate(-1)}>
            CANCEL
          </SecondaryButton>
          <PrimaryButton type="submit" loading={submitting}>
            SUBMIT REQUEST
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

