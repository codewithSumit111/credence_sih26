import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdvisoryBar from './AdvisoryBar';
import TopBar from './TopBar';
import AppFooter from './AppFooter';
import ReportGeneratorModal from '../reports/ReportGeneratorModal';
import OnboardingTour from '../onboarding/OnboardingTour';

export default function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col h-screen bg-irctc-bg overflow-hidden font-sans">
      {/* Advisory bar — always visible in app shell */}
      {!isHome && <AdvisoryBar />}

      {/* Top navigation */}
      {!isHome && <TopBar />}

      {/* Main content area */}
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        {/* Footer at bottom of scroll */}
        {!isHome && <AppFooter />}
      </main>

      {/* Global overlays */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
      <ReportGeneratorModal />
      <OnboardingTour />
    </div>
  );
}
