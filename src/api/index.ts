import type { MaintenanceJob, OptimizedBlock, Train, LiveEvent, ApprovalItem, AnalyticsData, ReoptimizationPlan, FieldBlock, BlockRequest, BlockStatus, ApprovalStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const jobsApi = {
  async getJobs(): Promise<MaintenanceJob[]> {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch(e) {
      console.warn("Using mock fallback for jobs:", e);
      return [];
    }
  },
  async getJob(id: string): Promise<MaintenanceJob | undefined> {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch(e) {
      console.warn("Using mock fallback for job details:", e);
      return undefined;
    }
  },
  async createJob(job: Partial<MaintenanceJob>): Promise<MaintenanceJob> {
    await delay(600);
    return { ...job, id: `JOB-${Math.floor(Math.random() * 9000) + 1000}` } as MaintenanceJob;
  },
};

export const priorityApi = {
  async getScores(): Promise<MaintenanceJob[]> {
    try {
      const jobs = await jobsApi.getJobs();
      return jobs.sort((a, b) => b.priorityScore - a.priorityScore);
    } catch (e) {
      return [];
    }
  }
};

export const blocksApi = {
  async getBlocks(): Promise<OptimizedBlock[]> {
    try {
      const res = await fetch(`${API_URL}/api/blocks`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn("Using mock fallback for blocks:", e);
      return [];
    }
  },
  async getBlock(id: string): Promise<OptimizedBlock | undefined> {
    const blocks = await this.getBlocks();
    return blocks.find(b => b.id === id);
  },
  async createRequest(req: Partial<BlockRequest>): Promise<BlockRequest> {
    await delay();
    return { ...req, id: 'REQ-1' } as BlockRequest;
  },
  async getRequests(): Promise<BlockRequest[]> {
    await delay();
    return [];
  },
  async optimizeWeekly(): Promise<OptimizedBlock[]> {
    try {
      const res = await fetch(`${API_URL}/api/planning/run`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Planning API failed');
      const result = await res.json();
      return result.schedule || [];
    } catch (e) {
      console.warn("Using mock fallback for planning:", e);
      await delay(1500);
      return [];
    }
  },
  async whatIf(_scenario: any) { await delay(1200); return { status: 'COMPLETE', diff: {} } as any; },
  async checkCompatibility(_jobIds: string[]) { await delay(800); return { compatible: true, score: 0.8 } as any; },
  async bundleJobs(_blockId: string, _jobIds: string[]) { await delay(); },
};

export const trainsApi = {
  
  async getTrain(id: string): Promise<Train | undefined> {
    const trains = await this.getTrains();
    return trains.find(t => t.number === id);
  },
  async getTrains(): Promise<Train[]> {
    try {
      const res = await fetch(`${API_URL}/api/trains`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn("Using mock fallback for trains:", e);
      return [];
    }
  },
  async computeRoute(_trainNumber: string, _blockId: string): Promise<Train['proposedRoute']> {
    await delay(800);
    return undefined;
  },
  async acceptReroute(_trainNumber: string): Promise<Train> {
    await delay(600);
    throw new Error('Not implemented');
  },
};

export const eventsApi = {
  async getEvents(): Promise<LiveEvent[]> { await delay(); return []; },
  async getEvent(_id: string): Promise<LiveEvent | undefined> { await delay(200); return undefined; },
  async triggerReoptimize(_eventId: string): Promise<ReoptimizationPlan> {
    await delay(1200);
    return { id: 'RP-1', triggeredBy: 'EV', eventId: _eventId, disruptionDescription: '', proposedPlan: [], status: 'CALCULATING' } as any;
  },
};

export const approvalsApi = {
  async getApprovals(): Promise<ApprovalItem[]> { await delay(); return []; },
  async getApproval(_id: string): Promise<ApprovalItem | undefined> { await delay(200); return undefined; },
  async approve(_id: string): Promise<ApprovalItem> {
    await delay(600);
    return {} as ApprovalItem;
  },
  async reject(_id: string, _reason?: string): Promise<ApprovalItem> {
    await delay(600);
    return {} as ApprovalItem;
  },
  async modify(_id: string): Promise<ApprovalItem> {
    await delay(400);
    return {} as ApprovalItem;
  },
};

export const reoptimizationApi = {
  async getReoptimization(_id: string): Promise<ReoptimizationPlan> {
    await delay(300);
    return {} as ReoptimizationPlan;
  },
  async approve(_id: string): Promise<ReoptimizationPlan> {
    await delay(700);
    return {} as ReoptimizationPlan;
  },
  async reject(_id: string): Promise<void> { await delay(400); },
};

export const analyticsApi = {
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const res = await fetch(`${API_URL}/api/analytics`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (!data.overdueTrend || !data.disruptions) {
        throw new Error('Incomplete data');
      }
      return data;
    } catch (e) {
      return {
        jobsByDepartment: {},
        scheduledVsDeferred: { scheduled: 0, deferred: 0 },
        trainDelayDistribution: [],
        overdueTrend: [
            { date: 'Aug 01', value: 24 },
            { date: 'Aug 07', value: 21 },
            { date: 'Aug 14', value: 18 },
            { date: 'Aug 21', value: 11 },
            { date: 'Aug 28', value: 6 }
        ],
        disruptions: [
            { type: 'Track failures', events: 14, avgRecoveryMin: 45 },
            { type: 'Block overruns', events: 8, avgRecoveryMin: 30 },
            { type: 'Train delays', events: 22, avgRecoveryMin: 15 },
            { type: 'Signal faults', events: 11, avgRecoveryMin: 20 }
        ]
      } as unknown as AnalyticsData;
    }
  },
};

export const executionApi = {
  async getFieldBlock(_blockId: string): Promise<FieldBlock> {
    await delay(300);
    return {  status: 'NOT_STARTED', progress: 0, blockId: _blockId, track: '', location: '', startTime: '', endTime: '', jobs: [],  } as any;
  },
  async updateProgress(_blockId: string, _progress: number): Promise<FieldBlock> {
    return this.getFieldBlock(_blockId);
  },
  async startBlock(_blockId: string): Promise<FieldBlock> {
    return this.getFieldBlock(_blockId);
  },
  async completeBlock(_blockId: string): Promise<FieldBlock> {
    return this.getFieldBlock(_blockId);
  },
  async reportIssue(_blockId: string, _issueType: string): Promise<void> { await delay(400); },
};

export const overviewApi = {
  async getDashboardData() {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`);
      if (!res.ok) throw new Error('API failed');
      const dashboard = await res.json();
      
      const jobs = await jobsApi.getJobs();
      const blocks = await blocksApi.getBlocks();
      const trains = await trainsApi.getTrains();
      
      const integratedBlocks = blocks.filter(b => b.bundled || (b.jobIds && b.jobIds.length > 1));
      
      return {
        assetAvailability: 96.8,
        criticalJobCount: dashboard.highPriorityJobs || 0,
        pendingMaintenance: dashboard.maintenanceJobs || 0,
        blocksOptimized: dashboard.selectedBlocks || 0,
        expectedTrainDelay: dashboard.totalTrainDelay || 0,
        integratedBlockCount: integratedBlocks.length,
        priorityQueue: jobs.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 7),
        recommendedBlock: blocks.length ? blocks[0] : undefined,
        allBlocks: blocks,
        allTrains: trains,
      };
    } catch (e) {
      console.warn("Using mock fallback for dashboard data:", e);
      return {
        assetAvailability: 96.8,
        criticalJobCount: 0,
        pendingMaintenance: 0,
        blocksOptimized: 0,
        expectedTrainDelay: 0,
        integratedBlockCount: 0,
        priorityQueue: [],
        recommendedBlock: undefined,
        allBlocks: [],
        allTrains: [],
      };
    }
  },
};
