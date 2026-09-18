import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/landing/LandingPage';

// ─── New primary pages (7 destinations) ──────────────────────────────────────
import Command from './pages/Command';
import Plan from './pages/Plan';
import TrainsPage from './pages/TrainsPage';
import Live from './pages/Live';
import Analytics from './pages/Analytics';
import ReportsPage from './pages/ReportsPage';
import Requests from './pages/Requests';
import FieldExecution from './pages/FieldExecution';

export default function App() {
  return (
    <Routes>
      {/* Landing page — standalone, no app shell */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Main app shell ──────────────────────────────────────────────── */}
      <Route element={<AppShell />}>
        {/* Default: redirect to command */}
        <Route path="/app" element={<Navigate to="/command" replace />} />

        {/* ── PRIMARY ROUTES (8) ────────────────────────────────────────── */}
        <Route path="command" element={<Command />} />
        <Route path="plan" element={<Plan />} />
        <Route path="trains" element={<TrainsPage />} />
        <Route path="live" element={<Live />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="requests" element={<Requests />} />

        {/* Field is rendered inside AppShell too */}
        <Route path="field" element={<FieldExecution />} />
        <Route path="field/blocks/:id" element={<FieldExecution />} />

        {/* ── LEGACY REDIRECTS — No broken links ───────────────────────── */}

        {/* Dashboard / Overview → Command */}
        <Route path="dashboard" element={<Navigate to="/command" replace />} />
        <Route path="overview" element={<Navigate to="/command" replace />} />

        {/* Blocks → Plan (blocks view) */}
        <Route path="blocks" element={<Navigate to="/plan?view=blocks" replace />} />
        <Route path="blocks/:id" element={<Navigate to="/plan?view=blocks" replace />} />

        {/* Priority → Plan (maintenance view) */}
        <Route path="priority" element={<Navigate to="/plan?view=maintenance" replace />} />

        {/* Trains/:id → Trains (drawer opens for that train) */}
        <Route path="trains/:id" element={<Navigate to="/trains" replace />} />

        {/* Rerouting → Trains */}
        <Route path="rerouting" element={<Navigate to="/trains" replace />} />
        <Route path="rerouting/:trainId" element={<Navigate to="/trains" replace />} />

        {/* Live Events → Live */}
        <Route path="events" element={<Navigate to="/live" replace />} />
        <Route path="events/:id" element={<Navigate to="/live" replace />} />

        {/* Reoptimization → Live */}
        <Route path="reoptimization/:id" element={<Navigate to="/live" replace />} />

        {/* What-If → Analytics (what-if tool mode) */}
        <Route path="what-if" element={<Navigate to="/analytics?tool=whatif" replace />} />

        {/* Old new block request → Requests */}
        <Route path="requests/new" element={<Navigate to="/requests" replace />} />
      </Route>

      {/* Catch-all → Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
