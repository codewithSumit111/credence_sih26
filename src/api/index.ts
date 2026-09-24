import type {
  MaintenanceJob, OptimizedBlock, Train, LiveEvent, ApprovalItem,
  AnalyticsData, ReoptimizationPlan, FieldBlock, BlockRequest, BlockStatus
} from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Jobs ──────────────────────────────────────────────────────────────────────
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
};

// ── Priority ──────────────────────────────────────────────────────────────────
export const priorityApi = {
  async getScores(): Promise<MaintenanceJob[]> {
    try {
      const jobs = await jobsApi.getJobs();
      return jobs.sort((a, b) => (Number(b.priorityScore) - Number(a.priorityScore)));
    } catch (e) {
      return [];
    }
  }
};

// ── Blocks ────────────────────────────────────────────────────────────────────
export const blocksApi = {
  async getBlocks(): Promise<OptimizedBlock[]> {
    try {
      const res = await fetch(`${API_URL}/api/blocks`);
      if (!res.ok) throw new Error('API failed');
      const raw = await res.json();
      return raw.map(normalizeBlock);
    } catch (e) {
      console.warn("Using mock fallback for blocks:", e);
      return [];
    }
  },

  async getBlock(id: string): Promise<OptimizedBlock | undefined> {
    try {
      const res = await fetch(`${API_URL}/api/blocks/${id}`);
      if (!res.ok) throw new Error('API failed');
      const raw = await res.json();
      return normalizeBlock(raw);
    } catch (e) {
      console.warn("Failed to fetch block detail:", e);
      return undefined;
    }
  },

  async updateStatus(
    id: string,
    status: BlockStatus,
    options?: { approvedBy?: string; notes?: string; modifiedStartTime?: string; modifiedEndTime?: string }
  ): Promise<{ success: boolean; blockId: string; status: BlockStatus }> {
    const res = await fetch(`${API_URL}/api/blocks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...options }),
    });
    if (!res.ok) throw new Error('Failed to update block status');
    return res.json();
  },

  async createRequest(req: Partial<BlockRequest> & { actor_id?: string }): Promise<BlockRequest> {
    const res = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error('Failed to create block request');
    return res.json();
  },

  async getRequests(): Promise<BlockRequest[]> {
    try {
      const res = await fetch(`${API_URL}/api/requests`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn("Failed to fetch requests:", e);
      return [];
    }
  },

  async optimizeWeekly(): Promise<OptimizedBlock[]> {
    try {
      const res = await fetch(`${API_URL}/api/planning/run`, { method: 'POST' });
      if (!res.ok) throw new Error('Planning API failed');
      const result = await res.json();
      return (result.schedule || []).map(normalizeBlock);
    } catch (e) {
      console.warn("Using mock fallback for planning:", e);
      return [];
    }
  },

  async whatIf(_scenario: any) { return { status: 'COMPLETE', diff: {} } as any; },
  async checkCompatibility(_jobIds: string[]) { return { compatible: true, score: 0.8 } as any; },
  async bundleJobs(_blockId: string, _jobIds: string[]) { },
};

// ── Trains ────────────────────────────────────────────────────────────────────
export const trainsApi = {
  async getTrain(id: string): Promise<Train | undefined> {
    const trains = await this.getTrains();
    return trains.find(t => t.number === id || t.id === id);
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
    return undefined;
  },
  async acceptReroute(trainNumber: string): Promise<Train> {
    const trains = await this.getTrains();
    const train = trains.find(t => t.number === trainNumber);
    if (!train) throw new Error('Train not found');
    return { ...train, reroutingStatus: 'ACCEPTED' };
  },
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsApi = {
  async getEvents(): Promise<LiveEvent[]> {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn("Failed to fetch events:", e);
      return [];
    }
  },
  async getEvent(_id: string): Promise<LiveEvent | undefined> {
    const events = await this.getEvents();
    return events.find(e => e.id === _id);
  },
  async triggerReoptimize(eventId: string): Promise<ReoptimizationPlan> {
    // Simulate reoptimization using current train data
    const trains = await trainsApi.getTrains();
    const delayedTrains = trains.filter(t => t.delay > 0);
    return {
      id: `RP-${Date.now().toString(36).toUpperCase()}`,
      triggeredBy: 'System Optimized',
      eventId,
      disruptionDescription: 'Block possession causing train delays',
      disruptionLocation: 'Corridor',
      estimatedRestorationMin: 30,
      status: 'READY',
      previousPlan: [],
      recoveredPlan: [],
      changesMade: [
        'Completed operations frozen and protected',
        `${delayedTrains.length} train(s) rerouted via alternate path`,
        'Remaining schedule shifted downstream by minimum required margin',
      ],
      impact: {
        additionalDelay: delayedTrains.reduce((sum, t) => sum + Math.min(t.delay, 30), 0),
        blocksChanged: 1,
        trainsRerouted: delayedTrains.filter(t => t.reroutingEligible).length,
        safetyViolations: 0,
        maintenanceDelayed: 0,
      },
      algorithm: 'Re-optimization Engine',
      createdAt: new Date().toISOString(),
    };
  },
};

// ── Approvals ─────────────────────────────────────────────────────────────────
export const approvalsApi = {
  async getApprovals(): Promise<ApprovalItem[]> { return []; },
  async getApproval(_id: string): Promise<ApprovalItem | undefined> { return undefined; },
  async approve(blockId: string, approvedBy?: string): Promise<{ success: boolean }> {
    return blocksApi.updateStatus(blockId, 'APPROVED', { approvedBy: approvedBy || 'Section Controller' });
  },
  async reject(blockId: string, reason?: string): Promise<{ success: boolean }> {
    return blocksApi.updateStatus(blockId, 'REJECTED', { notes: reason });
  },
  async modify(blockId: string, startTime?: string, endTime?: string): Promise<{ success: boolean }> {
    return blocksApi.updateStatus(blockId, 'MODIFIED', { modifiedStartTime: startTime, modifiedEndTime: endTime });
  },
};

// ── Reoptimization ────────────────────────────────────────────────────────────
export const reoptimizationApi = {
  async getReoptimization(_id: string): Promise<ReoptimizationPlan> {
    return {} as ReoptimizationPlan;
  },
  async approve(_id: string): Promise<ReoptimizationPlan> {
    return {} as ReoptimizationPlan;
  },
  async reject(_id: string): Promise<void> { },
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const res = await fetch(`${API_URL}/api/analytics`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      if (!data.overdueTrend || !data.disruptions) throw new Error('Incomplete data');
      return data;
    } catch (e) {
      return {
        jobsByDepartment: {},
        scheduledVsDeferred: { scheduled: 0, deferred: 0 },
        trainDelayDistribution: [],
        overdueTrend: [
          { date: 'Aug 01', value: 24 }, { date: 'Aug 07', value: 21 },
          { date: 'Aug 14', value: 18 }, { date: 'Aug 21', value: 11 },
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

// ── Field Execution ───────────────────────────────────────────────────────────
export const executionApi = {
  async getFieldBlock(_blockId?: string): Promise<FieldBlock> {
    try {
      const res = await fetch(`${API_URL}/api/field/active-block`);
      if (!res.ok) throw new Error('No active block');
      return await res.json();
    } catch (e) {
      console.warn('No active field block:', e);
      return {
        blockId: 'N/A', track: '', location: '', startTime: '', endTime: '',
        status: 'NOT_STARTED', progress: 0, jobs: [], crew: 0, machinery: '', safetyBuffer: 10,
      };
    }
  },
  async updateProgress(blockId: string, progress: number, actor_id?: string): Promise<FieldBlock> {
    await fetch(`${API_URL}/api/field/${blockId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress, status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS', actor_id }),
    });
    return this.getFieldBlock(blockId);
  },
  async startBlock(blockId: string, actor_id?: string): Promise<FieldBlock> {
    await fetch(`${API_URL}/api/field/${blockId}/start`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor_id })
    });
    return this.getFieldBlock(blockId);
  },
  async completeBlock(blockId: string, actor_id?: string): Promise<FieldBlock> {
    await fetch(`${API_URL}/api/field/${blockId}/complete`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor_id })
    });
    return this.getFieldBlock(blockId);
  },
  async reportIssue(blockId: string, issueType: string, notes?: string): Promise<void> {
    await fetch(`${API_URL}/api/field/${blockId}/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueType, notes }),
    });
  },
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const overviewApi = {
  async getDashboardData() {
    try {
      const [dashboard, jobs, blocks, trains] = await Promise.all([
        fetch(`${API_URL}/api/dashboard`).then(r => r.json()),
        jobsApi.getJobs(),
        blocksApi.getBlocks(),
        trainsApi.getTrains(),
      ]);

      const pendingBlocks = blocks.filter(b => b.status === 'AI-OPTIMIZED' || b.status === 'PROPOSED');
      const approvedBlocks = blocks.filter(b => b.status === 'APPROVED');
      const integratedBlocks = blocks.filter(b => b.bundled || (b.jobIds && b.jobIds.length > 1));

      return {
        assetAvailability: 96.8,
        criticalJobCount: dashboard.highPriorityJobs || 0,
        pendingMaintenance: dashboard.maintenanceJobs || 0,
        blocksOptimized: dashboard.selectedBlocks || 0,
        pendingApprovals: pendingBlocks.length,
        approvedBlocks: approvedBlocks.length,
        expectedTrainDelay: dashboard.totalTrainDelay || 0,
        integratedBlockCount: integratedBlocks.length,
        priorityQueue: jobs.slice(0, 7),
        recommendedBlock: pendingBlocks.length ? pendingBlocks[0] : undefined,
        allBlocks: blocks,
        allTrains: trains,
        overdueJobs: jobs.filter(j => j.overdueDays > 0),
        delayedTrains: trains.filter(t => t.currentStatus === 'DELAYED'),
      };
    } catch (e) {
      console.warn("Using mock fallback for dashboard data:", e);
      return {
        assetAvailability: 96.8, criticalJobCount: 0, pendingMaintenance: 0,
        blocksOptimized: 0, pendingApprovals: 0, approvedBlocks: 0,
        expectedTrainDelay: 0, integratedBlockCount: 0,
        priorityQueue: [], recommendedBlock: undefined,
        allBlocks: [], allTrains: [], overdueJobs: [], delayedTrains: [],
      };
    }
  },
};

// ── Normalizer: DB block shape → frontend OptimizedBlock shape ────────────────
function normalizeBlock(b: any): OptimizedBlock {
  const formatTime = (t: string) => t ? t.substring(0, 5) : '00:00';
  return {
    id: b.id,
    track: b.track || '',
    section: b.section || b.track?.split('-').slice(1).join('-') || 'Section',
    startTime: formatTime(b.startTime || b.start_time),
    endTime: formatTime(b.endTime || b.end_time),
    duration: b.duration || 0,
    departments: b.departments || [],
    jobIds: b.jobIds || b.job_ids || [],
    priority: b.priority > 0.6 ? 'High' : b.priority > 0.4 ? 'Medium' : 'Low',
    status: (b.status || 'AI-OPTIMIZED') as BlockStatus,
    affectedTrains: b.affectedTrains || [],
    expectedDelay: b.trainImpact || b.expectedDelay || 0,
    safetyBuffer: b.safetyBuffer || 10,
    resources: b.resources || { manpower: 0, machinery: [], available: true },
    optimizationSource: (b.optimizationSource || 'SYSTEM') as any,
    bundled: b.bundled ?? (b.jobIds?.length > 1),
    bundledCount: b.bundledCount || b.jobIds?.length || 1,
    whyThisSlot: b.whyThisSlot || [],
    alternatives: b.alternatives || [],
    createdAt: b.createdAt || new Date().toISOString(),
    approvedBy: b.approvedBy,
    approvedAt: b.approvedAt,
    assetBenefit: b.assetBenefit || (b.priority > 0.6 ? 'High' : b.priority > 0.4 ? 'Medium' : 'Low'),
    operationalImpact: b.operationalImpact || (b.trainImpact > 50 ? 'High' : b.trainImpact > 10 ? 'Medium' : 'Low'),
    // Extra fields from enriched block endpoint
    jobDetails: b.jobDetails,
  } as any;
}
