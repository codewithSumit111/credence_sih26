import { Outlet, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import { Toaster } from 'sonner';
import ReportGeneratorModal from '../reports/ReportGeneratorModal';
import OnboardingTour from '../onboarding/OnboardingTour';

export default function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] overflow-hidden font-sans">
      {!isDashboard && <TopBar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors closeButton />
      <ReportGeneratorModal />
      <OnboardingTour />
    </div>
  );
}
