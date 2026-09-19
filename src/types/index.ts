// ============================================================
// CORE DOMAIN TYPES — Central Railway Maintenance Intelligence
// ============================================================

export type Department = 'Engineering' | 'S&T' | 'Traction';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TrainType = 'Express' | 'Passenger' | 'Goods' | 'EMU';

// Block lifecycle states
export type BlockStatus =
  | 'DEMANDED'
  | 'PROVISIONAL'
  | 'AI-OPTIMIZED'
  | 'PROPOSED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'MODIFIED'
  | 'OVERRUN';

// Plan approval states
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED';

// Rerouting states
export type ReroutingStatus =
  | 'NOT_REQUIRED'
  | 'CONFLICT_DETECTED'
  | 'ROUTE_CALCULATING'
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'REJECTED';

// Event states
export type EventStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVING' | 'RESOLVED';
export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EventType = 'TRACK_FAILURE' | 'BLOCK_OVERRUN' | 'TRAIN_DELAY' | 'OHE_FAILURE' | 'SIGNAL_FAULT';

// ============================================================
// MAINTENANCE JOB (actual work to be performed)
// ============================================================
export interface MaintenanceJob {
  id: string;
  department: Department;
  maintenanceType: string;
  asset: string;
  track: string;
  section: string;
  dueDate: string;
  estimatedDuration: number; // minutes
  priorityScore: number; // 0-100 (Weighted Priority Scoring)
  priority: Priority;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  overdueDays: number;
  criticality: number; // 0-100
  urgency: number;
  assetRisk: number;
  operationalImpact: number;
  requiredManpower: number;
  machinery: string;
  dependencies: string[];
  notes: string;
}

// ============================================================
// BLOCK REQUEST (department request for infrastructure access)
// ============================================================
export interface BlockRequest {
  id: string;
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
  submittedAt: string;
  status: BlockStatus;
  jobIds: string[];
}

// ============================================================
// OPTIMIZED BLOCK (final coordinated possession by optimization)
// ============================================================
export interface OptimizedBlock {
  id: string;
  track: string;
  section: string;
  startTime: string; // HH:MM
  endTime: string;
  duration: number; // minutes
  departments: Department[];
  jobIds: string[];
  priority: Priority;
  status: BlockStatus;
  affectedTrains: AffectedTrain[];
  expectedDelay: number; // minutes
  safetyBuffer: number; // minutes
  resources: BlockResources;
  optimizationSource: 'CP-SAT' | 'MANUAL' | 'ALNS';
  bundled: boolean;
  bundledCount: number;
  whyThisSlot: string[];
  alternatives: BlockAlternative[];
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  assetBenefit: 'High' | 'Medium' | 'Low';
  operationalImpact: 'High' | 'Medium' | 'Low';
}

export interface AffectedTrain {
  trainNumber: string;
  action: 'REROUTE_A' | 'REROUTE_B' | 'WAIT' | 'NO_CONFLICT';
  delay: number;
  reroutingStatus: ReroutingStatus;
}

export interface BlockResources {
  manpower: number;
  machinery: string[];
  available: boolean;
}

export interface BlockAlternative {
  label: string;
  startTime: string;
  endTime: string;
  delay: number;
  recommended: boolean;
}

// ============================================================
// TRAIN
// ============================================================
export interface Train {
  id?: string;
  number: string;
  name: string;
  type: TrainType;
  currentSection: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  currentStatus: 'ON_TIME' | 'DELAYED' | 'REROUTED' | 'STOPPED' | 'CANCELLED';
  affectedBlockId?: string;
  delay: number;
  reroutingStatus: ReroutingStatus;
  originalRoute: RouteSegment[];
  currentRoute: RouteSegment[];
  proposedRoute?: RouteSegment[];
  scheduledOccupation: TimeWindow[];
  reroutingEligible: boolean;
}

export interface RouteSegment {
  from: string;
  to: string;
  track: string;
  duration: number;
}

export interface TimeWindow {
  track: string;
  start: string;
  end: string;
}

// ============================================================
// LIVE EVENT
// ============================================================
export interface LiveEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: EventStatus;
  affectedTrains: string[];
  affectedBlocks: string[];
  estimatedResolution?: string;
  reoptimizationId?: string;
  timeline: EventTimelineEntry[];
  systemImpact: SystemImpact;
}

export interface EventTimelineEntry {
  time: string;
  description: string;
  isAlert?: boolean;
}

export interface SystemImpact {
  trainsAffected: number;
  blocksOverrunning: number;
  routeRecalculations: number;
  safetyViolations: number;
}

// ============================================================
// APPROVAL
// ============================================================
export interface ApprovalItem {
  id: string;
  planId: string;
  blockId: string;
  section: string;
  departments: Department[];
  priority: Priority;
  affectedTrains: string[];
  impact: string;
  requestedBy: string;
  status: ApprovalStatus;
  createdAt: string;
  auditTrail: AuditEntry[];
  recommendation: string;
  reasoning: string[];
  alternatives: BlockAlternative[];
}

export interface AuditEntry {
  time: string;
  action: string;
  actor: string;
  type: 'SYSTEM' | 'USER';
}

// ============================================================
// ANALYTICS
// ============================================================
export interface AnalyticsData {
  assetUptime: number;
  blockUtilization: number;
  avgRecoveryTime: number;
  jobsCompleted: number;
  overdueJobs: number;
  requestedBlockHours: number;
  usedBlockHours: number;
  departmentBlockHours: DeptBlockHours[];
  uptimeTrend: TrendPoint[];
  overdueTrend: TrendPoint[];
  blockUtilizationTrend: TrendPoint[];
  disruptions: DisruptionRecord[];
  maintenanceCompletion: number;
}

export interface DeptBlockHours {
  department: Department;
  hours: number;
  requested: number;
  used: number;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface DisruptionRecord {
  type: string;
  events: number;
  avgRecoveryMin: number;
}

// ============================================================
// REOPTIMIZATION (ALNS + Time-Dependent A*)
// ============================================================
export interface ReoptimizationPlan {
  id: string;
  triggeredBy: string;
  eventId: string;
  disruptionDescription: string;
  disruptionLocation: string;
  estimatedRestorationMin: number;
  status: 'CALCULATING' | 'READY' | 'APPROVED' | 'REJECTED';
  previousPlan: PlanSnapshot[];
  recoveredPlan: PlanSnapshot[];
  changesMade: string[];
  impact: ReoptimizationImpact;
  algorithm: string;
  createdAt: string;
}

export interface PlanSnapshot {
  id: string;
  type: 'BLOCK' | 'TRAIN';
  label: string;
  original: string;
  updated?: string;
  frozen: boolean;
  changed: boolean;
}

export interface ReoptimizationImpact {
  additionalDelay: number;
  blocksChanged: number;
  trainsRerouted: number;
  safetyViolations: number;
  maintenanceDelayed: number;
}

// ============================================================
// FIELD EXECUTION
// ============================================================
export interface FieldBlock {
  blockId: string;
  track: string;
  location: string;
  startTime: string;
  endTime: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  jobs: FieldJob[];
  crew: number;
  machinery: string;
  safetyBuffer: number;
  actualStart?: string;
  actualEnd?: string;
}

export interface FieldJob {
  department: Department;
  description: string;
  tasks: string[];
}
