import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  FileText, Download, X, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'daily_block', label: 'Daily Block Planning Report' },
  { id: 'maintenance', label: 'Maintenance Planning Report' },
  { id: 'train_impact', label: 'Train Impact & Rerouting Report' },
  { id: 'disruption', label: 'Disruption Recovery Report' },
  { id: 'performance', label: 'Management Performance Report' },
  { id: 'corridor', label: 'Section / Corridor Report' },
  // BDMS Report Types
  { id: 'traffic_block_status', label: 'Traffic Block Status' },
  { id: 'rolling_block_program', label: 'Rolling Block Program' },
  { id: 'integrated_blocks', label: 'Integrated Blocks - No Associated Block Demanded' },
  { id: 'approved_not_granted', label: 'Approved but Not Granted' },
  { id: 'extended_blocks', label: 'Extended Blocks' },
  { id: 'spilled_over_burst_blocks', label: 'Spilled Over/Burst Blocks' },
];

export default function ReportGeneratorModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const reportParam = searchParams.get('report_dialog');
  const isOpen = reportParam === 'true';
  const defaultType = searchParams.get('report_type') || 'daily_block';

  const [selectedType, setSelectedType] = useState(defaultType);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(searchParams.get('report_type') || 'daily_block');
      setSuccess(false);
      setIsGenerating(false);
    }
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  const closeDialog = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('report_dialog');
    newParams.delete('report_type');
    setSearchParams(newParams);
  };

  const handleGenerate = (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    setSuccess(false);
    
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setSuccess(true);
      toast.success(`${format.toUpperCase()} Report Generated`, {
        description: `Your ${REPORT_TYPES.find(r => r.id === selectedType)?.label} is ready for download.`,
      });
      
      // Auto close after success
      setTimeout(() => {
        closeDialog();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Generate Report</h2>
              <p className="text-[11px] text-gray-500">Export operational data and analytics</p>
            </div>
          </div>
          <button
            onClick={closeDialog}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Warning Prototype Data */}
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800">
              <span className="font-bold">Prototype Data Notice:</span> The generated reports contain simulated data for demonstration purposes. Do not use as official railway documentation.
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
              Report Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                Date Range
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Today (27 Aug 2026)</option>
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Custom Range...</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                Corridor / Section
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>NGP-BSL (All)</option>
                <option>TR-01 (NGP-WR)</option>
                <option>TR-02 (WR-BD)</option>
                <option>TR-05 (AK-BD)</option>
              </select>
            </div>
          </div>

          {/* Success State Overlay or Generation state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-6 text-blue-700">
              <RefreshCw className="w-6 h-6 animate-spin mb-3" />
              <p className="text-[13px] font-bold">Compiling Report Data...</p>
              <p className="text-[11px] text-blue-600 mt-1">Aggregating VAJRA simulations</p>
            </div>
          )}
          
          {success && (
            <div className="flex flex-col items-center justify-center py-6 text-green-700">
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <p className="text-[14px] font-bold">Report Ready!</p>
              <p className="text-[11px] text-green-600 mt-1">Download starting automatically.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isGenerating && !success && (
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-4 flex gap-3">
            <button
              onClick={() => handleGenerate('pdf')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E85D04] hover:bg-[#D05303] text-white text-[13px] font-bold py-2.5 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export as PDF
            </button>
            <button
              onClick={() => handleGenerate('excel')}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[13px] font-bold py-2.5 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Export as Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
