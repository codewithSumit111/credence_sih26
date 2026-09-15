import { mockJobs, mockBlocks, mockTrains, mockEvents, mockApprovals, mockAnalytics, mockReoptimization, mockFieldBlock, mockBlockRequests } from '../data/mockData';
import type { MaintenanceJob, OptimizedBlock, Train, LiveEvent, ApprovalItem, AnalyticsData, ReoptimizationPlan, FieldBlock, BlockRequest, BlockStatus, ApprovalStatus } from '../types';

// Simulated async delay — replace with real fetch() when backend is ready
const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// JOBS API — GET/POST /api/v1/jobs
// ============================================================
export const jobsApi = {
  async getJobs(): Promise<MaintenanceJob[]> {
    await delay();
    return [...mockJobs];
  },
  async getJob(id: string): Promise<MaintenanceJob | undefined> {
    await delay(200);
    return mockJobs.find(j => j.id === id);
  },
  async createJob(job: Partial<MaintenanceJob>): Promise<MaintenanceJob> {
    await delay(600);
    const newJob = { ...job, id: `JOB-${Math.floor(Math.random() * 9000) + 1000}` } as MaintenanceJob;
    mockJobs.push(newJob);
    return newJob;
  },
};

// ============================================================
// PRIORITY API — GET /api/v1/priority/scores
// ============================================================
export const priorityApi = {
  async getScores(): Promise<MaintenanceJob[]> {
    await delay(300);
    return [...mockJobs].sort((a, b) => b.priorityScore - a.priorityScore);
  },
};

// ============================================================
// BLOCKS API — GET/POST /api/v1/blocks + optimize
// ============================================================
export const blocksApi = {
  async getBlocks(): Promise<OptimizedBlock[]> {
    await delay();
    return [...mockBlocks];
  },
  async getBlock(id: string): Promise<OptimizedBlock | undefined> {
    await delay(200);
    return mockBlocks.find(b => b.id === id);
  },
  async getRequests(): Promise<BlockRequest[]> {
    await delay(300);
    return [...mockBlockRequests];
  },
  async submitRequest(req: Partial<BlockRequest>): Promise<BlockRequest> {
    await delay(800);
    const newReq = {
      ...req,
      id: `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
      submittedAt: new Date().toISOString(),
      status: 'DEMANDED' as BlockStatus,
    } as BlockRequest;
    mockBlockRequests.push(newReq);
    return newReq;
  },
  // POST /api/v1/optimize/weekly — CP-SAT scheduling
  async optimizeWeekly(): Promise<OptimizedBlock[]> {
    await delay(1500);
    return mockBlocks.filter(b => b.status === 'AI-OPTIMIZED' || b.status === 'PROPOSED');
  },
  // POST /api/v1/optimize/whatif
  async optimizeWhatIf(_params: Record<string, unknown>): Promise<{ originalPlan: OptimizedBlock[]; simulatedPlan: OptimizedBlock[] }> {
    await delay(1200);
    return { originalPlan: mockBlocks, simulatedPlan: mockBlocks };
  },
  // POST /api/v1/compatibility/check — Rule/constraint-based compatibility detection
  async checkCompatibility(_jobIds: string[]): Promise<{ compatible: boolean; reason: string[] }> {
    await delay(600);
    return { compatible: true, reason: ['Same section', 'Compatible time window', 'No resource conflict'] };
  },
  async updateStatus(id: string, status: BlockStatus): Promise<OptimizedBlock> {
    await delay(500);
    const block = mockBlocks.find(b => b.id === id);
    if (!block) throw new Error(`Block ${id} not found`);
    block.status = status;
    return block;
  },
  // PATCH /api/v1/plans/:id/bundle
  async bundleBlocks(blockIds: string[]): Promise<{ bundledBlockId: string }> {
    await delay(1000);
    return { bundledBlockId: `BR-${Math.floor(Math.random() * 90000) + 10000}` };
  },
};

// ============================================================
// TRAINS API — GET /api/v1/trains + POST /api/v1/routes/*
// ============================================================
export const trainsApi = {
  async getTrains(): Promise<Train[]> {
    await delay();
    return [...mockTrains];
  },
  async getTrain(number: string): Promise<Train | undefined> {
    await delay(200);
    return mockTrains.find(t => t.number === number);
  },
  // POST /api/v1/routes/compute — Time-Dependent A* routing
  async computeRoute(_trainNumber: string, _blockId: string): Promise<Train['proposedRoute']> {
    await delay(800);
    const train = mockTrains.find(t => t.number === _trainNumber);
    return train?.proposedRoute;
  },
  // POST /api/v1/routes/reroute
  async acceptReroute(trainNumber: string): Promise<Train> {
    await delay(600);
    const train = mockTrains.find(t => t.number === trainNumber);
    if (!train) throw new Error(`Train ${trainNumber} not found`);
    train.reroutingStatus = 'ACCEPTED';
    train.currentStatus = 'REROUTED';
    if (train.proposedRoute) train.currentRoute = train.proposedRoute;
    return train;
  },
};

// ============================================================
// EVENTS API — GET /api/v1/monitor/events
// ============================================================
export const eventsApi = {
  async getEvents(): Promise<LiveEvent[]> {
    await delay();
    return [...mockEvents];
  },
  async getEvent(id: string): Promise<LiveEvent | undefined> {
    await delay(200);
    return mockEvents.find(e => e.id === id);
  },
  // POST /api/v1/reoptimize/trigger — ALNS re-optimization
  async triggerReoptimize(_eventId: string): Promise<ReoptimizationPlan> {
    await delay(1200);
    return mockReoptimization;
  },
};

// ============================================================
// APPROVALS API — PATCH /api/v1/plans/:id/approve
// ============================================================
export const approvalsApi = {
  async getApprovals(): Promise<ApprovalItem[]> {
    await delay();
    return [...mockApprovals];
  },
  async getApproval(id: string): Promise<ApprovalItem | undefined> {
    await delay(200);
    return mockApprovals.find(a => a.id === id);
  },
  async approve(id: string): Promise<ApprovalItem> {
    await delay(600);
    const apv = mockApprovals.find(a => a.id === id);
    if (!apv) throw new Error(`Approval ${id} not found`);
    apv.status = 'APPROVED' as ApprovalStatus;
    apv.auditTrail.push({
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      action: 'Controller approved the plan',
      actor: 'Ctrl. R. Sharma',
      type: 'USER',
    });
    // Also update the corresponding block
    const block = mockBlocks.find(b => b.id === apv.blockId);
    if (block) block.status = 'APPROVED';
    return apv;
  },
  async reject(id: string, reason?: string): Promise<ApprovalItem> {
    await delay(600);
    const apv = mockApprovals.find(a => a.id === id);
    if (!apv) throw new Error(`Approval ${id} not found`);
    apv.status = 'REJECTED' as ApprovalStatus;
    apv.auditTrail.push({
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      action: `Controller rejected the plan${reason ? ': ' + reason : ''}`,
      actor: 'Ctrl. R. Sharma',
      type: 'USER',
    });
    const block = mockBlocks.find(b => b.id === apv.blockId);
    if (block) block.status = 'REJECTED';
    return apv;
  },
  async modify(id: string): Promise<ApprovalItem> {
    await delay(400);
    const apv = mockApprovals.find(a => a.id === id);
    if (!apv) throw new Error(`Approval ${id} not found`);
    apv.status = 'MODIFIED' as ApprovalStatus;
    apv.auditTrail.push({
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      action: 'Controller modified the plan — pending resubmission',
      actor: 'Ctrl. R. Sharma',
      type: 'USER',
    });
    return apv;
  },
};

// ============================================================
// REOPTIMIZATION API — ALNS + Time-Dependent A*
// ============================================================
export const reoptimizationApi = {
  async getReoptimization(_id: string): Promise<ReoptimizationPlan> {
    await delay(300);
    return mockReoptimization;
  },
  async approve(_id: string): Promise<ReoptimizationPlan> {
    await delay(700);
    return { ...mockReoptimization, status: 'APPROVED' as const };
  },
  async reject(_id: string): Promise<void> {
    await delay(400);
  },
};

// ============================================================
// ANALYTICS API — GET /api/v1/analytics/uptime
// ============================================================
export const analyticsApi = {
  async getAnalytics(): Promise<AnalyticsData> {
    await delay(500);
    return { ...mockAnalytics };
  },
};

// ============================================================
// EXECUTION API — POST /api/v1/execution/complete
// ============================================================
export const executionApi = {
  async getFieldBlock(_blockId: string): Promise<FieldBlock> {
    await delay(300);
    return { ...mockFieldBlock };
  },
  async updateProgress(blockId: string, progress: number): Promise<FieldBlock> {
    await delay(400);
    const block = { ...mockFieldBlock, progress };
    if (progress > 0 && block.status === 'NOT_STARTED') block.status = 'IN_PROGRESS';
    console.log(`Block ${blockId} progress: ${progress}%`);
    return block;
  },
  async startBlock(_blockId: string): Promise<FieldBlock> {
    await delay(400);
    return {
      ...mockFieldBlock,
      status: 'IN_PROGRESS',
      actualStart: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  },
  async completeBlock(_blockId: string): Promise<FieldBlock> {
    await delay(800);
    return {
      ...mockFieldBlock,
      status: 'COMPLETED',
      progress: 100,
      actualEnd: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  },
  async reportIssue(_blockId: string, issueType: string): Promise<void> {
    await delay(400);
    console.log(`Issue reported: ${issueType}`);
  },
};

// ============================================================
// OVERVIEW API — Aggregated dashboard KPIs
// ============================================================
export const overviewApi = {
  async getDashboardData() {
    await delay(350);
    const jobs = [...mockJobs];
    const blocks = [...mockBlocks];
    const trains = [...mockTrains];
    const criticalJobs = jobs.filter(j => j.priorityScore >= 80);
    const totalDelay = trains.reduce((sum, t) => sum + t.delay, 0);
    const integratedBlocks = blocks.filter(b => b.bundled);
    return {
      assetAvailability: 96.8,
      criticalJobCount: criticalJobs.length,
      pendingMaintenance: 42,
      blocksOptimized: 18,
      expectedTrainDelay: totalDelay || 37,
      integratedBlockCount: integratedBlocks.length,
      priorityQueue: jobs.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 7),
      recommendedBlock: blocks.find(b => b.id === 'BR-00231')!,
      allBlocks: blocks,
      allTrains: trains,
    };
  },
};

