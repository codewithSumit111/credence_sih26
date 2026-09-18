import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Toaster } from 'sonner';
import ReportGeneratorModal from '../reports/ReportGeneratorModal';

export default function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/overview';

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {!isDashboard && <TopBar />}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors closeButton />
      <ReportGeneratorModal />
    </div>
  );
}
