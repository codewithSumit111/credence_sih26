import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/landing/LandingPage';

// ─── New primary pages (7 destinations) ──────────────────────────────────────
import Command from './pages/Command';
import Plan from './pages/Plan';
import TrainsPage from './pages/TrainsPage';
import Live from './pages/Live';
import Assets from './pages/Assets';
import Analytics from './pages/Analytics';
import ReportsPage from './pages/ReportsPage';
import Requests from './pages/Requests';
import FieldExecution from './pages/FieldExecution';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user } = useAuth();
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to default route for their role if unauthorized
    if (user.role === 'FIELD_MANAGER') return <Navigate to="/field" replace />;
    if (user.role === 'BDMS_INCHARGE') return <Navigate to="/plan" replace />;
    return <Navigate to="/command" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Landing page — standalone, no app shell */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ── Main app shell ──────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          {/* Default: redirect to command */}
          <Route path="/app" element={<Navigate to="/command" replace />} />

          {/* ── PRIMARY ROUTES (9) ────────────────────────────────────────── */}
          <Route path="command" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER']}><Command /></RoleRoute>} />
          <Route path="plan" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER', 'BDMS_INCHARGE']}><Plan /></RoleRoute>} />
          <Route path="trains" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER']}><TrainsPage /></RoleRoute>} />
          <Route path="live" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER', 'BDMS_INCHARGE', 'FIELD_MANAGER']}><Live /></RoleRoute>} />
          <Route path="assets" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER']}><Assets /></RoleRoute>} />
          <Route path="analytics" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER']}><Analytics /></RoleRoute>} />
          <Route path="reports" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER']}><ReportsPage /></RoleRoute>} />
          <Route path="requests" element={<RoleRoute allowedRoles={['SECTION_CONTROLLER', 'BDMS_INCHARGE']}><Requests /></RoleRoute>} />

          {/* Field is rendered inside AppShell too */}
          <Route path="field" element={<RoleRoute allowedRoles={['FIELD_MANAGER']}><FieldExecution /></RoleRoute>} />
          <Route path="field/blocks/:id" element={<RoleRoute allowedRoles={['FIELD_MANAGER']}><FieldExecution /></RoleRoute>} />

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
    </AuthProvider>
  );
}
