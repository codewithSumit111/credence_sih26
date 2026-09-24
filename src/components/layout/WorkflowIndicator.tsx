import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { ClipboardList, Calendar, CheckSquare, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const WORKFLOW_STEPS = [
  { id: 'requests', label: 'Requests', path: '/requests', icon: ClipboardList },
  { id: 'planning', label: 'Planning', path: '/plan?view=blocks', icon: Calendar },
  { id: 'review', label: 'Review', path: '/trains', icon: CheckSquare },
  { id: 'recovery', label: 'Recovery', path: '/live', icon: AlertTriangle },
  { id: 'approval', label: 'Approval', path: '/command', icon: ShieldCheck },
];

export default function WorkflowIndicator() {
  const location = useLocation();
  const { user } = useAuth();

  // Only show for SECTION_CONTROLLER as this is the Controller Workspace
  if (user?.role !== 'SECTION_CONTROLLER') {
    return null;
  }

  // Determine active step based on current path
  let activeStep = 'approval'; // default to dashboard
  if (location.pathname === '/requests' || (location.pathname === '/plan' && location.search.includes('view=maintenance'))) {
    activeStep = 'requests';
  } else if (location.pathname === '/plan' && location.search.includes('view=blocks')) {
    activeStep = 'planning';
  } else if (location.pathname === '/trains') {
    activeStep = 'review';
  } else if (location.pathname === '/live') {
    activeStep = 'recovery';
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-center overflow-x-auto" role="navigation" aria-label="Controller Workflow">
      <div className="flex items-center space-x-2 md:space-x-4 max-w-[1400px] w-full mx-auto px-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const isActive = step.id === activeStep;
          // Consider steps before the active one as "completed" in a loose sense for visual feedback, 
          // but the instruction says "This is navigation and workflow guidance... Do NOT lock users into a wizard."
          const isPast = WORKFLOW_STEPS.findIndex(s => s.id === activeStep) > index;
          
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <Link
                to={step.path}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors',
                  isActive 
                    ? 'bg-irctc-blue text-white shadow-sm' 
                    : isPast
                      ? 'bg-blue-50 text-irctc-blue hover:bg-blue-100'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <step.icon className={clsx('w-4 h-4', isActive ? 'text-white' : isPast ? 'text-irctc-blue' : 'text-gray-400')} />
                <span>{step.label}</span>
              </Link>
              {index < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-1 md:mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
