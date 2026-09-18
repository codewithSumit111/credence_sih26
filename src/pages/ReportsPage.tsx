import { useState } from 'react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  FileText, Download, FileSpreadsheet, Calendar, Search, CheckCircle2,
  Clock, Eye, RefreshCw, ChevronRight, ShieldCheck,
  TrendingUp, AlertTriangle, Printer, Sparkles, X, Check,
  Sliders, ArrowUpRight, BarChart3, Radio
} from 'lucide-react';

// ─── Dummy File Generator ───────────────────────────────────────────────────────
function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Report Archive Items ───────────────────────────────────────────────────────
interface ArchiveReport {
  id: string;
  title: string;
  category: 'block' | 'train' | 'disruption' | 'performance' | 'safety';
  categoryLabel: string;
  date: string;
  corridor: string;
  author: string;
  size: string;
  formats: ('pdf' | 'excel' | 'csv')[];
  status: 'VERIFIED' | 'READY' | 'ARCHIVED';
  summary: string;
}

const INITIAL_ARCHIVE: ArchiveReport[] = [
  {
    id: 'REP-1045',
    title: 'Daily Integrated Block Operations Dossier',
    category: 'block',
    categoryLabel: 'Daily Block Plan',
    date: '27 Aug 2026, 08:30 AM',
    corridor: 'NGP–BSL Main Line (TR-01 to TR-08)',
    author: 'System Auto (CP-SAT)',
    size: '2.4 MB',
    formats: ['pdf', 'excel', 'csv'],
    status: 'VERIFIED',
    summary: 'Complete breakdown of 4 approved integrated possessions, 3 bundled jobs, 260 min total possession window.'
  },
  {
    id: 'REP-1044',
    title: 'Train Punctuality & Cascading Delay Audit',
    category: 'train',
    categoryLabel: 'Train Impact',
    date: '26 Aug 2026, 14:15 PM',
    corridor: 'Nagpur Division High-Density Network',
    author: 'R. Sharma (Section Controller)',
    size: '1.8 MB',
    formats: ['pdf', 'excel'],
    status: 'VERIFIED',
    summary: 'Time-Dependent A* rerouting log for Trains 12123, 11008, 22145. Net passenger delay contained under 18 min.'
  },
  {
    id: 'REP-1043',
    title: 'ALNS Disruption Recovery & Track Clearance Log',
    category: 'disruption',
    categoryLabel: 'Disruption Recovery',
    date: '26 Aug 2026, 09:10 AM',
    corridor: 'Badnera–Akola Junction (TR-02)',
    author: 'System Auto (ALNS Engine)',
    size: '3.1 MB',
    formats: ['pdf', 'excel', 'csv'],
    status: 'READY',
    summary: 'Emergency rail crack incident resolution log. Corridor recovery achieved in 18 min vs 38 min manual benchmark.'
  },
  {
    id: 'REP-1042',
    title: 'Corridor Asset Availability & Uptime Telemetry',
    category: 'performance',
    categoryLabel: 'Asset Performance',
    date: '25 Aug 2026, 18:00 PM',
    corridor: 'Nagpur Division Central Zone',
    author: 'Divisional Safety Cell',
    size: '4.2 MB',
    formats: ['pdf', 'excel'],
    status: 'ARCHIVED',
    summary: 'Monthly asset uptime index (94.2%), block utilization rate (81.6%), and engineering possession efficiency metrics.'
  },
  {
    id: 'REP-1041',
    title: 'Temporary Speed Restriction (TSR) Compliance Review',
    category: 'safety',
    categoryLabel: 'Safety & TSR',
    date: '24 Aug 2026, 11:45 AM',
    corridor: 'Wardha–Nagpur Quadruple Section',
    author: 'Chief Safety Officer (CR)',
    size: '1.5 MB',
    formats: ['pdf', 'excel'],
    status: 'VERIFIED',
    summary: 'Verification of 4 TSR liftings post tamping and deep screening. Speed loss index reduced by 14%.'
  },
  {
    id: 'REP-1040',
    title: 'OHE & Traction Power Block Synchronization Report',
    category: 'block',
    categoryLabel: 'Daily Block Plan',
    date: '23 Aug 2026, 16:20 PM',
    corridor: 'Nagpur–Wardha Up Line',
    author: 'TRD Department',
    size: '1.9 MB',
    formats: ['pdf', 'excel'],
    status: 'ARCHIVED',
    summary: 'Joint power block synchronization between Traction Distribution and Civil Engineering gang.'
  }
];

// ─── Standard Report Presets ────────────────────────────────────────────────────
const REPORT_PRESETS = [
  {
    id: 'daily_block',
    title: 'Daily Integrated Block Plan',
    desc: 'Approved maintenance possessions, TR-01 to TR-08 windows, bundled jobs & engineering gang allocations.',
    category: 'Operational Plan',
    icon: FileText,
    color: 'emerald',
    defaultFormat: 'pdf'
  },
  {
    id: 'train_impact',
    title: 'Train Impact & Delay Audit',
    desc: 'Cascading delay analysis, TD-A* rerouting outcomes, passenger vs freight detention ledger.',
    category: 'Punctuality',
    icon: Clock,
    color: 'blue',
    defaultFormat: 'excel'
  },
  {
    id: 'disruption',
    title: 'Disruption & Recovery Log',
    desc: 'Unscheduled incident resolution, ALNS repair iterations vs manual benchmarks & clearance timeline.',
    category: 'Incident Log',
    icon: AlertTriangle,
    color: 'amber',
    defaultFormat: 'pdf'
  },
  {
    id: 'corridor',
    title: 'Corridor Asset Uptime Dossier',
    desc: 'Division asset uptime (94.2%), possession efficiency (81.6%), and TSR lifting compliance records.',
    category: 'Asset Availability',
    icon: TrendingUp,
    color: 'purple',
    defaultFormat: 'excel'
  }
];

export default function ReportsPage() {
  const [archive, setArchive] = useState<ArchiveReport[]>(INITIAL_ARCHIVE);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Generator State
  const [selectedPreset, setSelectedPreset] = useState('daily_block');
  const [corridorScope, setCorridorScope] = useState('NGP-BSL');
  const [dateRange, setDateRange] = useState('today');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeDelays, setIncludeDelays] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Preview Modal State
  const [previewReport, setPreviewReport] = useState<ArchiveReport | null>(null);

  // Filtered Archive
  const filteredArchive = archive.filter(rep => {
    const matchesCategory = activeCategory === 'all' || rep.category === activeCategory;
    const matchesQuery = !searchQuery || 
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.corridor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Handle Instant Preset Generation
  const handleQuickDownload = (presetId: string, format: 'pdf' | 'excel') => {
    const preset = REPORT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    toast.info(`Preparing ${preset.title}...`, {
      description: `Generating high-resolution ${format.toUpperCase()} document.`
    });

    setTimeout(() => {
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const content = `CENTRAL RAILWAY - NAGPUR DIVISION\nREPORT: ${preset.title}\nDATE: 27 AUG 2026\nFORMAT: ${format.toUpperCase()}\n\n-- SECTION METRICS --\nAsset Uptime: 94.2%\nPossession Efficiency: 81.6%\nApproved Blocks: 4\nAverage Recovery Time: 18 min\nStatus: VERIFIED BY OPERATIONAL CONTROLLER\n`;
      triggerDownload(`${preset.id}_${Date.now()}.${ext}`, content, 'text/plain');

      toast.success(`${format.toUpperCase()} Download Started`, {
        description: `${preset.title} has been exported to your downloads.`
      });
    }, 600);
  };

  // Handle Custom Generator Submit
  const handleGenerateCustom = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const preset = REPORT_PRESETS.find(p => p.id === selectedPreset);
      const newId = `REP-${Math.floor(1046 + Math.random() * 50)}`;
      const title = preset ? preset.title : 'Custom Railway Block Report';
      
      // Add to archive
      const newReport: ArchiveReport = {
        id: newId,
        title: `${title} (${corridorScope})`,
        category: (preset?.id === 'train_impact' ? 'train' : preset?.id === 'disruption' ? 'disruption' : preset?.id === 'corridor' ? 'performance' : 'block'),
        categoryLabel: preset?.category || 'Custom Plan',
        date: 'Just now (Today, 27 Aug)',
        corridor: corridorScope === 'NGP-BSL' ? 'NGP–BSL Main Line Corridor' : corridorScope === 'WR-BD' ? 'Wardha–Badnera Section' : 'Nagpur Division All Yards',
        author: 'R. Sharma (Active Session)',
        size: exportFormat === 'pdf' ? '2.1 MB' : exportFormat === 'excel' ? '3.4 MB' : '820 KB',
        formats: [exportFormat, 'pdf'],
        status: 'VERIFIED',
        summary: `Custom generated report for ${corridorScope} scope with AI solver explanations ${includeExplanations ? 'included' : 'omitted'}.`
      };

      setArchive(prev => [newReport, ...prev]);

      // Download file
      const content = `INDIAN RAILWAYS - CENTRAL RAILWAY\nDIVISION OPERATIONAL REPORT\nID: ${newId}\nTITLE: ${title}\nCORRIDOR: ${newReport.corridor}\nDATE: 27 AUG 2026\nFORMAT: ${exportFormat.toUpperCase()}\nSOLVER: CP-SAT + TIME-DEPENDENT A*\nSTATUS: APPROVED\n`;
      const ext = exportFormat === 'pdf' ? 'pdf' : exportFormat === 'excel' ? 'xlsx' : 'csv';
      triggerDownload(`${newId}_${selectedPreset}.${ext}`, content, 'text/plain');

      toast.success('Report Generated & Downloaded!', {
        description: `${newId}: ${title} exported as ${exportFormat.toUpperCase()} and added to archive.`
      });
    }, 1200);
  };

  return (
    <div className="h-full overflow-auto bg-[#F4F5F7]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Reports & Documentation Center</h1>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                Division Central
              </span>
            </div>
            <p className="text-[12px] text-gray-500">
              Generate official railway block plans, punctuality audits, disruption logs, and telemetry dossiers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-bold text-gray-700">Nagpur Division (CR)</p>
              <p className="text-[10px] text-gray-400">NGP–BSL Corridor · 27 Aug 2026</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto p-6 space-y-6">

        {/* ── SECTION 1: Standard Operational Reports (Click to Get) ────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">
                Instant Operational Reports
              </h2>
              <p className="text-[11px] text-gray-500">One-click exports calibrated for DRM, Section Controllers, and Safety Officers</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              4 Core Templates Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_PRESETS.map(preset => {
              const Icon = preset.icon;
              return (
                <div
                  key={preset.id}
                  className="bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {preset.category}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-emerald-50 text-gray-600 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-emerald-800 transition-colors mb-1.5">
                      {preset.title}
                    </h3>
                    <p className="text-[11.5px] text-gray-500 leading-relaxed line-clamp-3 mb-4">
                      {preset.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => handleQuickDownload(preset.id, 'pdf')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold py-2 rounded-lg transition-colors shadow-xs"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleQuickDownload(preset.id, 'excel')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 text-[11px] font-bold py-2 rounded-lg transition-colors"
                      title="Download Excel Spreadsheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: Interactive Report Generator ─────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">Custom Report Generator</h3>
                <p className="text-[11px] text-gray-500">Configure parameters, scope, format, and include telemetry logs</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
              Solver: CP-SAT 9.8 · A* TD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Report Template */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                1. Report Template
              </label>
              <select
                value={selectedPreset}
                onChange={e => setSelectedPreset(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-[12px] font-medium text-gray-800 outline-hidden"
              >
                <option value="daily_block">Daily Integrated Block Plan</option>
                <option value="train_impact">Train Impact & Rerouting Audit</option>
                <option value="disruption">Disruption & Recovery Incident Log</option>
                <option value="corridor">Corridor Asset Availability Dossier</option>
              </select>
            </div>

            {/* 2. Corridor Scope */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                2. Target Corridor Scope
              </label>
              <select
                value={corridorScope}
                onChange={e => setCorridorScope(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-[12px] font-medium text-gray-800 outline-hidden"
              >
                <option value="NGP-BSL">NGP–BSL Main Line (All 8 Tracks)</option>
                <option value="WR-BD">Wardha–Badnera Section</option>
                <option value="NGP-YARD">Nagpur Junction Yard Area</option>
                <option value="ALL-DIV">All Nagpur Division Corridors</option>
              </select>
            </div>

            {/* 3. Date / Window */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                3. Date / Time Window
              </label>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-[12px] font-medium text-gray-800 outline-hidden"
              >
                <option value="today">Today (27 Aug 2026 - Operational)</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days (Consolidated)</option>
                <option value="mtd">Month-to-Date (August 2026)</option>
              </select>
            </div>

            {/* 4. Format Selection */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                4. Output Format
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['pdf', 'excel', 'csv'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={clsx(
                      'py-2 text-[11px] font-bold rounded-lg border transition-all text-center uppercase',
                      exportFormat === fmt
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options & Action Row */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5 flex-wrap text-[12px] text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeExplanations}
                  onChange={e => setIncludeExplanations(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium">Include AI Solver Decision Explanations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDelays}
                  onChange={e => setIncludeDelays(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium">Include Train-by-Train Impact Ledger</span>
              </label>
            </div>

            <button
              onClick={handleGenerateCustom}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-[#1B6B45] hover:bg-emerald-800 active:scale-98 text-white font-bold text-[12.5px] px-5 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Dossier...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate & Download Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── SECTION 3: Reports Archive (Shifted from Analytics) ───────────── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Archive Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">
                  Reports Archive
                </h2>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filteredArchive.length} Records
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Previously generated divisional reports, audits, and operational archives
              </p>
            </div>

            {/* Search and Category Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search archive..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white w-52 transition-all"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'block', label: 'Blocks' },
                  { id: 'train', label: 'Trains' },
                  { id: 'disruption', label: 'Disruptions' },
                  { id: 'performance', label: 'Performance' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={clsx(
                      'px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors',
                      activeCategory === cat.id
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Archive List */}
          <div className="divide-y divide-gray-100">
            {filteredArchive.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-[13px] font-semibold">No archived reports match your search criteria</p>
              </div>
            ) : (
              filteredArchive.map(report => (
                <div
                  key={report.id}
                  className="p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between flex-wrap gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-[280px]">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {report.id}
                        </span>
                        <h4 className="text-[13px] font-bold text-gray-900">{report.title}</h4>
                        <span className={clsx(
                          'text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase',
                          report.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        )}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{report.summary}</p>
                      <div className="flex items-center gap-3 text-[10.5px] text-gray-400 mt-1.5">
                        <span>Generated: {report.date}</span>
                        <span>•</span>
                        <span>Corridor: {report.corridor}</span>
                        <span>•</span>
                        <span>By: {report.author}</span>
                        <span>•</span>
                        <span className="font-medium text-gray-500">{report.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="flex items-center gap-1 text-[11.5px] font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      title="Preview Report"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      Preview
                    </button>

                    <button
                      onClick={() => {
                        triggerDownload(`${report.id}_dossier.txt`, `INDIAN RAILWAYS\n${report.title}\nID: ${report.id}\n${report.summary}`, 'text/plain');
                        toast.success(`Downloaded ${report.id} (Text)`);
                      }}
                      className="p-1.5 bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-lg transition-colors"
                      title="Download Text"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        triggerDownload(`${report.id}_data.csv`, `ID,Title,Corridor,Date,Status\n${report.id},"${report.title}","${report.corridor}","${report.date}",${report.status}`, 'text/csv');
                        toast.success(`Downloaded ${report.id} (Spreadsheet)`);
                      }}
                      className="p-1.5 bg-white hover:bg-green-50 text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-300 rounded-lg transition-colors"
                      title="Download Excel / CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── PREVIEW MODAL ─────────────────────────────────────────────────── */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                  Official Railway Document Preview
                </span>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-gray-800">
              {/* Official Header */}
              <div className="text-center pb-5 border-b-2 border-gray-800">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
                  Government of India · Ministry of Railways
                </div>
                <h2 className="text-[18px] font-black text-gray-900 uppercase mt-1">
                  Central Railway · Nagpur Division Operations
                </h2>
                <div className="text-[12px] font-semibold text-emerald-800 mt-1 uppercase tracking-wide">
                  {previewReport.title}
                </div>
                <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 mt-2">
                  <span>Ref: <strong className="text-gray-900 font-mono">{previewReport.id}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-gray-900">{previewReport.date}</strong></span>
                  <span>•</span>
                  <span>Corridor: <strong className="text-gray-900">{previewReport.corridor}</strong></span>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4">
                <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
                  Executive Summary
                </h4>
                <p className="text-[12px] text-emerald-950 leading-relaxed font-medium">
                  {previewReport.summary} All constraints evaluated via CP-SAT and validated by Divisional Section Controllers.
                </p>
              </div>

              {/* Table of Simulated Block Possessions */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Possession & Corridor Window Summary
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11.5px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="py-2.5 px-3 text-left font-bold">Track Section</th>
                        <th className="py-2.5 px-3 text-left font-bold">Window</th>
                        <th className="py-2.5 px-3 text-left font-bold">Duration</th>
                        <th className="py-2.5 px-3 text-left font-bold">Depts</th>
                        <th className="py-2.5 px-3 text-right font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">TR-02 (WR-BD)</td>
                        <td className="py-2.5 px-3 text-gray-700">10:00 - 11:30</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">90 min</td>
                        <td className="py-2.5 px-3 text-gray-600">ENG + S&T (Bundled)</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">APPROVED</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">TR-04 (Akola Byp)</td>
                        <td className="py-2.5 px-3 text-gray-700">12:30 - 13:45</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">75 min</td>
                        <td className="py-2.5 px-3 text-gray-600">Traction (TRD)</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">APPROVED</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">TR-07 (Loop Alternate)</td>
                        <td className="py-2.5 px-3 text-gray-700">15:00 - 16:35</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">95 min</td>
                        <td className="py-2.5 px-3 text-gray-600">ENG (Tamping)</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">APPROVED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Signatures */}
              <div className="pt-6 border-t border-gray-200 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-[11px] font-bold text-gray-900">R. Sharma</div>
                  <div className="text-[10px] text-gray-500">Section Controller (CR)</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-900">A. K. Verma</div>
                  <div className="text-[10px] text-gray-500">Sr. Divisional Operations Mgr</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-900">Kavach-CR AI 2.0</div>
                  <div className="text-[10px] text-emerald-700 font-bold">CP-SAT Solver Verified</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                {previewReport.id} • {previewReport.size}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerDownload(`${previewReport.id}_dossier.txt`, `INDIAN RAILWAYS\n${previewReport.title}\nID: ${previewReport.id}\n${previewReport.summary}`, 'text/plain');
                    toast.success(`Downloaded ${previewReport.id} (Text)`);
                  }}
                  className="flex items-center gap-1.5 bg-[#1B6B45] hover:bg-emerald-800 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-[12px] font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
