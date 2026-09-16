const fs = require('fs');
let code = fs.readFileSync('src/api/index.ts', 'utf8');

const inlines = `
const mockEvents = [{ id: 'EV-1', type: 'DELAY', trainId: 'T-101', description: 'Signal failure', status: 'ACTIVE', time: '10:00' }];
const mockApprovals = [{ id: 'AP-1', blockId: 'BR-00231', status: 'PENDING', requestor: 'System', department: 'TRD', priority: 'HIGH', auditTrail: [] }];
const mockBlockRequests = [];
const mockFieldBlock = { id: 'BR-1', status: 'NOT_STARTED', progress: 0 };
const mockAnalytics = { uptime: 99.9 };
const mockReoptimization = { status: 'PENDING', proposedPlan: [] };
`;

code = inlines + code;
code = code.replace(/\[\.\.\.mockJobs\]/g, '[]');
code = code.replace(/mockJobs/g, '[]');
code = code.replace(/\[\.\.\.mockBlocks\]/g, '[]');
code = code.replace(/mockBlocks/g, '[]');
code = code.replace(/\[\.\.\.mockTrains\]/g, '[]');
code = code.replace(/mockTrains/g, '[]');

fs.writeFileSync('src/api/index.ts', code);
