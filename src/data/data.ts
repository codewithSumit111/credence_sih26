import {
  MaintenanceJob,
  OptimizedBlock,
  BlockRequest,
  Train,
  LiveEvent,
  ApprovalItem,
  AnalyticsData,
  ReoptimizationPlan,
  FieldBlock
} from '../types';

export const mockJobs: MaintenanceJob[] = [
  {
    id: '1', department: 'Engineering', maintenanceType: 'REPAIR', asset: 'RAIL_CRACK',
    track: 'T6', section: 'KJT-LNL', dueDate: '2026-09-21', estimatedDuration: 90,
    priorityScore: 90, priority: 'Critical', status: 'SCHEDULED', overdueDays: 14,
    criticality: 90, urgency: 85, assetRisk: 80, operationalImpact: 85,
    requiredManpower: 3, machinery: 'Crane', dependencies: [], notes: ''
  },
  {
    id: '2', department: 'Traction', maintenanceType: 'REPAIR', asset: 'OHE_ABNORMALITY',
    track: 'T6', section: 'KJT-LNL', dueDate: '2026-09-21', estimatedDuration: 60,
    priorityScore: 85, priority: 'High', status: 'SCHEDULED', overdueDays: 5,
    criticality: 92, urgency: 80, assetRisk: 85, operationalImpact: 85,
    requiredManpower: 2, machinery: 'Tower Wagon', dependencies: [], notes: ''
  },
  {
    id: '3', department: 'S&T', maintenanceType: 'INSPECTION', asset: 'SIGNAL_INSPECTION',
    track: 'T6', section: 'KJT-LNL', dueDate: '2026-09-21', estimatedDuration: 30,
    priorityScore: 60, priority: 'Medium', status: 'SCHEDULED', overdueDays: 2,
    criticality: 60, urgency: 55, assetRisk: 50, operationalImpact: 60,
    requiredManpower: 1, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '4', department: 'Engineering', maintenanceType: 'REPAIR', asset: 'TRACK_GEOMETRY',
    track: 'T4', section: 'KYN-KJT', dueDate: '2026-09-22', estimatedDuration: 45,
    priorityScore: 50, priority: 'Medium', status: 'PENDING', overdueDays: 0,
    criticality: 55, urgency: 40, assetRisk: 45, operationalImpact: 55,
    requiredManpower: 2, machinery: 'Tamping Machine', dependencies: [], notes: ''
  },
  {
    id: '5', department: 'Engineering', maintenanceType: 'REPAIR', asset: 'BALLAST_DEGRADATION',
    track: 'T5', section: 'KYN-KJT', dueDate: '2026-09-23', estimatedDuration: 40,
    priorityScore: 40, priority: 'Low', status: 'PENDING', overdueDays: 0,
    criticality: 35, urgency: 30, assetRisk: 30, operationalImpact: 40,
    requiredManpower: 2, machinery: 'BCM', dependencies: [], notes: ''
  },
  {
    id: '6', department: 'Engineering', maintenanceType: 'EMERGENCY_REPAIR', asset: 'RAIL_FRACTURE',
    track: 'T12', section: 'DD-SUR', dueDate: '2026-09-21', estimatedDuration: 120,
    priorityScore: 98, priority: 'Critical', status: 'COMPLETED', overdueDays: 0,
    criticality: 98, urgency: 98, assetRisk: 95, operationalImpact: 90,
    requiredManpower: 4, machinery: 'Welding Equip', dependencies: [], notes: ''
  },
  {
    id: '7', department: 'Traction', maintenanceType: 'INSPECTION', asset: 'INSULATOR_WEAR',
    track: 'T8', section: 'LNL-PUNE', dueDate: '2026-09-22', estimatedDuration: 50,
    priorityScore: 45, priority: 'Low', status: 'PENDING', overdueDays: 3,
    criticality: 50, urgency: 45, assetRisk: 45, operationalImpact: 55,
    requiredManpower: 2, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '8', department: 'S&T', maintenanceType: 'INSPECTION', asset: 'RELAY_TEST',
    track: 'T8', section: 'LNL-PUNE', dueDate: '2026-09-24', estimatedDuration: 30,
    priorityScore: 25, priority: 'Low', status: 'PENDING', overdueDays: 0,
    criticality: 30, urgency: 25, assetRisk: 25, operationalImpact: 65,
    requiredManpower: 1, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '9', department: 'Engineering', maintenanceType: 'INSPECTION', asset: 'TRACK_INSPECTION',
    track: 'T10', section: 'PUNE-DD', dueDate: '2026-09-22', estimatedDuration: 40,
    priorityScore: 35, priority: 'Low', status: 'PENDING', overdueDays: 1,
    criticality: 35, urgency: 30, assetRisk: 30, operationalImpact: 60,
    requiredManpower: 2, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '10', department: 'Traction', maintenanceType: 'REPAIR', asset: 'OHE_TENSION_LOW',
    track: 'T10', section: 'PUNE-DD', dueDate: '2026-09-22', estimatedDuration: 55,
    priorityScore: 70, priority: 'High', status: 'SCHEDULED', overdueDays: 7,
    criticality: 70, urgency: 60, assetRisk: 65, operationalImpact: 45,
    requiredManpower: 2, machinery: 'Tower Wagon', dependencies: [], notes: ''
  },
  {
    id: '11', department: 'Traction', maintenanceType: 'REPAIR', asset: 'OHE_SAG',
    track: 'T3', section: 'KYN-PNVL', dueDate: '2026-09-23', estimatedDuration: 45,
    priorityScore: 40, priority: 'Medium', status: 'PENDING', overdueDays: 4,
    criticality: 45, urgency: 40, assetRisk: 40, operationalImpact: 50,
    requiredManpower: 2, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '12', department: 'Engineering', maintenanceType: 'INSPECTION', asset: 'RAIL_WEAR',
    track: 'T3', section: 'KYN-PNVL', dueDate: '2026-09-24', estimatedDuration: 30,
    priorityScore: 25, priority: 'Low', status: 'PENDING', overdueDays: 0,
    criticality: 30, urgency: 25, assetRisk: 25, operationalImpact: 65,
    requiredManpower: 1, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '13', department: 'Engineering', maintenanceType: 'REPAIR', asset: 'JOINT_WEAR',
    track: 'T1', section: 'CSTM-KYN', dueDate: '2026-09-22', estimatedDuration: 60,
    priorityScore: 42, priority: 'Medium', status: 'PENDING', overdueDays: 6,
    criticality: 50, urgency: 42, assetRisk: 42, operationalImpact: 50,
    requiredManpower: 2, machinery: '', dependencies: [], notes: ''
  },
  {
    id: '14', department: 'S&T', maintenanceType: 'REPAIR', asset: 'POINT_MACHINE_FAULT',
    track: 'T7', section: 'KJT-LNL', dueDate: '2026-09-21', estimatedDuration: 50,
    priorityScore: 55, priority: 'High', status: 'PENDING', overdueDays: 9,
    criticality: 65, urgency: 60, assetRisk: 55, operationalImpact: 40,
    requiredManpower: 2, machinery: '', dependencies: [], notes: 'Awaiting next KJT–LNL window; earliest feasible 24 Sep.'
  },
  {
    id: '15', department: 'Engineering', maintenanceType: 'REPAIR', asset: 'FISH_PLATE_LOOSE',
    track: 'T8', section: 'LNL-PUNE', dueDate: '2026-09-25', estimatedDuration: 25,
    priorityScore: 15, priority: 'Low', status: 'OVERDUE', overdueDays: 0,
    criticality: 20, urgency: 15, assetRisk: 15, operationalImpact: 75,
    requiredManpower: 1, machinery: '', dependencies: [], notes: ''
  }
];

export const mockBlocks: OptimizedBlock[] = [
  {
    id: 'BLK-001', track: 'T6', section: 'KJT-LNL', startTime: '22:30', endTime: '01:30',
    duration: 180, departments: ['Engineering', 'S&T', 'Traction'], jobIds: ['1', '2', '3'],
    priority: 'Critical', status: 'APPROVED', 
    affectedTrains: [
      { trainNumber: '12627', action: 'REROUTE_A', delay: 18, reroutingStatus: 'ACCEPTED' },
      { trainNumber: 'GDS4471', action: 'REROUTE_B', delay: 12, reroutingStatus: 'PROPOSED' },
      { trainNumber: '12124', action: 'WAIT', delay: 45, reroutingStatus: 'NOT_REQUIRED' }
    ],
    expectedDelay: 45, safetyBuffer: 15, resources: { manpower: 6, machinery: ['Crane', 'Tower Wagon'], available: true },
    optimizationSource: 'CP-SAT', bundled: true, bundledCount: 3, 
    whyThisSlot: ["High-priority TRD/ENG defects", "Signal work sequenced after isolation", "Corridor window available", "Lower train impact than the alternate window"],
    alternatives: [], createdAt: '2026-09-20', assetBenefit: 'High', operationalImpact: 'Low'
  },
  {
    id: 'BLK-002', track: 'T12', section: 'DD-SUR', startTime: '20:00', endTime: '22:20',
    duration: 140, departments: ['Engineering'], jobIds: ['6'],
    priority: 'Critical', status: 'COMPLETED', 
    affectedTrains: [
      { trainNumber: '16339', action: 'WAIT', delay: 5, reroutingStatus: 'NOT_REQUIRED' }
    ],
    expectedDelay: 5, safetyBuffer: 10, resources: { manpower: 4, machinery: ['Welding Equip'], available: true },
    optimizationSource: 'MANUAL', bundled: false, bundledCount: 1, 
    whyThisSlot: ["Emergency rail fracture", "No feasible deferral", "Track already at reduced capacity"],
    alternatives: [], createdAt: '2026-09-21', assetBenefit: 'High', operationalImpact: 'Low'
  },
  {
    id: 'BLK-003', track: 'T10', section: 'PUNE-DD', startTime: '22:00', endTime: '23:10',
    duration: 70, departments: ['Traction'], jobIds: ['10'],
    priority: 'High', status: 'PROPOSED', 
    affectedTrains: [],
    expectedDelay: 0, safetyBuffer: 10, resources: { manpower: 2, machinery: ['Tower Wagon'], available: true },
    optimizationSource: 'CP-SAT', bundled: false, bundledCount: 1, 
    whyThisSlot: ["OHE tension repair overdue 7 days", "No scheduled train conflict this window"],
    alternatives: [], createdAt: '2026-09-21', assetBenefit: 'Medium', operationalImpact: 'Low'
  }
];

export const mockTrains: Train[] = [
  {
    number: '12124', name: 'Pragati Express', type: 'Express', currentSection: 'CSTM',
    scheduledArrival: '02:30', scheduledDeparture: '22:40', currentStatus: 'ON_TIME',
    delay: 45, reroutingStatus: 'NOT_REQUIRED', originalRoute: [], currentRoute: [],
    scheduledOccupation: [], reroutingEligible: true
  },
  {
    number: '11007', name: 'Deccan Express', type: 'Express', currentSection: 'PUNE',
    scheduledArrival: '03:40', scheduledDeparture: '23:50', currentStatus: 'ON_TIME',
    delay: 0, reroutingStatus: 'NOT_REQUIRED', originalRoute: [], currentRoute: [],
    scheduledOccupation: [], reroutingEligible: true
  },
  {
    number: '16339', name: 'Solapur Passenger', type: 'Passenger', currentSection: 'DD',
    scheduledArrival: '01:30', scheduledDeparture: '22:00', currentStatus: 'DELAYED',
    delay: 5, reroutingStatus: 'NOT_REQUIRED', originalRoute: [], currentRoute: [],
    scheduledOccupation: [], reroutingEligible: true
  },
  {
    number: 'GDS4471', name: 'Goods Freight', type: 'Goods', currentSection: 'PNVL',
    scheduledArrival: '04:35', scheduledDeparture: '21:30', currentStatus: 'REROUTED',
    delay: 12, reroutingStatus: 'PROPOSED', originalRoute: [], currentRoute: [],
    scheduledOccupation: [], reroutingEligible: true
  },
  {
    number: '12627', name: 'Konark Express', type: 'Express', currentSection: 'KYN',
    scheduledArrival: '05:25', scheduledDeparture: '23:20', currentStatus: 'REROUTED',
    delay: 18, reroutingStatus: 'ACCEPTED', originalRoute: [], currentRoute: [],
    scheduledOccupation: [], reroutingEligible: true
  },
  {
    number: '51567', name: 'Panvel Local', type: 'Passenger', currentSection: 'KYN',
    scheduledArrival: '23:50', scheduledDeparture: '23:05', currentStatus: 'ON_TIME',
    delay: 0, reroutingStatus: 'NOT_REQUIRED', originalRoute: [], currentRoute: [],
    scheduledOccupation: [], reroutingEligible: false
  }
];

export const mockBlockRequests: BlockRequest[] = [];
for (let i = 0; i < 12; i++) {
  mockBlockRequests.push({
    id: `BR-0030${i}`,
    department: 'Engineering',
    maintenanceType: 'REPAIR',
    track: 'T1',
    asset: 'RAIL',
    preferredDate: '2026-09-25',
    requestedDuration: 120,
    preferredWindowStart: '22:00',
    preferredWindowEnd: '02:00',
    requiredManpower: 4,
    machinery: '',
    priority: 'Medium',
    safetyBuffer: true,
    dependsOnJob: false,
    requiresIsolation: false,
    notes: '',
    submittedBy: 'JE/ENG',
    submittedAt: '2026-09-20',
    status: i < 5 ? 'APPROVED' : (i === 10 ? 'REJECTED' : (i === 11 ? 'MODIFIED' : 'DEMANDED')),
    jobIds: []
  });
}

export const mockEvents: LiveEvent[] = [
  {
    id: 'EV-1', type: 'TRACK_FAILURE', severity: 'CRITICAL', title: 'Rail Fracture',
    description: 'Emergency rail fracture on DD-SUR', location: 'T12', timestamp: '20:00',
    status: 'OPEN', affectedTrains: ['16339'], affectedBlocks: ['BLK-002'],
    systemImpact: { trainsAffected: 1, blocksOverrunning: 0, routeRecalculations: 0, safetyViolations: 0 },
    timeline: []
  }
];

export const mockApprovals: ApprovalItem[] = [
  {
    id: 'AP-1', planId: 'PLAN-1', blockId: 'BLK-003', section: 'PUNE-DD', departments: ['Traction'],
    priority: 'High', affectedTrains: [], impact: 'Low', requestedBy: 'System', status: 'PENDING',
    createdAt: '2026-09-21', auditTrail: [], recommendation: 'Approve', reasoning: [], alternatives: []
  }
];

export const mockFieldBlock: FieldBlock = {
  blockId: 'BLK-002', track: 'T12', location: 'DD-SUR', startTime: '20:00', endTime: '22:20',
  status: 'COMPLETED', progress: 100, jobs: [], crew: 4, machinery: 'Welding Equip', safetyBuffer: 10,
  actualStart: '20:00', actualEnd: '22:28'
};

export const mockAnalytics: AnalyticsData = {
  assetUptime: 96.8, blockUtilization: 95, avgRecoveryTime: 25, jobsCompleted: 45,
  overdueJobs: 8, requestedBlockHours: 120, usedBlockHours: 115, departmentBlockHours: [],
  uptimeTrend: [], overdueTrend: [], blockUtilizationTrend: [], disruptions: [], maintenanceCompletion: 90
};

export const mockReoptimization: ReoptimizationPlan = {
  id: 'REOPT-1', triggeredBy: 'EV-1', eventId: 'EV-1', disruptionDescription: 'Fracture',
  disruptionLocation: 'T12', estimatedRestorationMin: 120, status: 'READY',
  previousPlan: [], recoveredPlan: [], changesMade: [], impact: { additionalDelay: 0, blocksChanged: 0, trainsRerouted: 0, safetyViolations: 0, maintenanceDelayed: 0 },
  algorithm: 'ALNS', createdAt: '2026-09-21'
};
