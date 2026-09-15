import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/landing/LandingPage';
import Overview from './pages/Overview';
import BlockPlans from './pages/BlockPlans';
import BlockDetail from './pages/BlockDetail';
import NewBlockRequest from './pages/NewBlockRequest';
import Priority from './pages/Priority';
import Trains from './pages/Trains';
import TrainDetail from './pages/TrainDetail';
import Rerouting from './pages/Rerouting';
import LiveEvents from './pages/LiveEvents';
import EventDetail from './pages/EventDetail';
import Reoptimization from './pages/Reoptimization';
import WhatIf from './pages/WhatIf';
import Approvals from './pages/Approvals';
import ApprovalDetail from './pages/ApprovalDetail';
import Analytics from './pages/Analytics';
import FieldExecution from './pages/FieldExecution';

export default function App() {
  return (
    <Routes>
      {/* Landing page — standalone, no app shell */}
      <Route path="/" element={<LandingPage />} />

      {/* Main app shell with sidebar nav */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<Overview />} />
        <Route path="overview" element={<Navigate to="/dashboard" replace />} />
        <Route path="blocks" element={<BlockPlans />} />
        <Route path="blocks/:id" element={<BlockDetail />} />
        <Route path="requests/new" element={<NewBlockRequest />} />
        <Route path="priority" element={<Priority />} />
        <Route path="trains" element={<Trains />} />
        <Route path="trains/:id" element={<TrainDetail />} />
        <Route path="rerouting" element={<Rerouting />} />
        <Route path="rerouting/:trainId" element={<Rerouting />} />
        <Route path="events" element={<LiveEvents />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="reoptimization/:id" element={<Reoptimization />} />
        <Route path="what-if" element={<WhatIf />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="approvals/:id" element={<ApprovalDetail />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      {/* Mobile-first field execution view */}
      <Route path="field" element={<FieldExecution />} />
      <Route path="field/blocks/:id" element={<FieldExecution />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


