import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Wrench, Calendar, Settings, Train, BarChart3, Check } from 'lucide-react';
import { clsx } from 'clsx';

const ONBOARDING_KEY = 'pulzion_railway_onboarding_completed';

const steps = [
  {
    title: 'Welcome to the Railway Maintenance Planning System',
    description: 'Explore how maintenance requests are prioritized, optimized into possession blocks, and evaluated for their impact on train operations.',
    icon: <LayoutDashboard className="w-8 h-8 text-green-500" />,
    path: '/command',
    target: null,
  },
  {
    title: 'Dashboard',
    description: 'Get a quick overview of maintenance priorities, scheduled work, deferred jobs, possession time, and train impact.',
    icon: <LayoutDashboard className="w-8 h-8 text-green-500" />,
    path: '/command',
    target: null,
  },
  {
    title: 'Maintenance Jobs',
    description: 'Review maintenance requests and their priority, risk, urgency, and operational information.',
    icon: <Wrench className="w-8 h-8 text-blue-500" />,
    path: '/plan?view=maintenance',
    target: null,
  },
  {
    title: 'Block Plans',
    description: 'View maintenance jobs grouped into feasible possession blocks and inspect the generated plan.',
    icon: <Calendar className="w-8 h-8 text-indigo-500" />,
    path: '/plan?view=blocks',
    target: null,
  },
  {
    title: 'Run Planning',
    description: 'The optimizer evaluates maintenance requirements, constraints, available possession windows, and operational impact to generate a planning result.',
    icon: <Settings className="w-8 h-8 text-amber-500" />,
    path: '/plan?view=blocks',
    target: null,
  },
  {
    title: 'Train Impact',
    description: 'See how planned maintenance blocks affect train journeys and inspect delay/feasibility results from the routing evaluation.',
    icon: <Train className="w-8 h-8 text-purple-500" />,
    path: '/trains',
    target: null,
  },
  {
    title: 'Analytics',
    description: 'Explore workload, priorities, scheduling outcomes, and train-impact information through visual summaries.',
    icon: <BarChart3 className="w-8 h-8 text-rose-500" />,
    path: '/analytics',
    target: null,
  },
  {
    title: "You're ready to explore.",
    description: 'You can revisit the dashboard and run a new planning cycle whenever you want.',
    icon: <Check className="w-8 h-8 text-green-500" />,
    path: '/command',
    target: null,
  }
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const isCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!isCompleted) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
    
    // Add replay listener
    const handleReplay = () => {
      setIsOpen(true);
      setCurrentStep(0);
      navigate(steps[0].path);
    };
    window.addEventListener('replay-tour', handleReplay);
    return () => window.removeEventListener('replay-tour', handleReplay);
  }, [navigate]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      navigate(steps[nextStep].path);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigate(steps[prevStep].path);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'completed');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start p-5 pb-0">
          <div className="p-3 bg-slate-100 rounded-lg">
            {step.icon}
          </div>
          <button 
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {step.title}
          </h2>
          <p className="text-slate-600 leading-relaxed min-h-[60px]">
            {step.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentStep ? "w-4 bg-blue-600" : "w-1.5 bg-slate-300"
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            )}
            
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Skip Tour
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium bg-[#0A3D80] text-white hover:bg-blue-800 rounded-lg transition-colors flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
