import './landing.css';
import LandingNavbar from './components/Navbar';
import Hero from './components/Hero';
import ContextStrip from './components/ContextStrip';
import ProblemSection from './components/ProblemSection';
import ScrollJourney from './components/ScrollJourney';
import DynamicReoptimization from './components/DynamicReoptimization';
import PlanningHorizons from './components/PlanningHorizons';
import ImpactMetrics from './components/ImpactMetrics';
import SafetySection from './components/SafetySection';
import ResearchSection from './components/ResearchSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main>
        <Hero />
        <ContextStrip />
        <ProblemSection />
        <ScrollJourney />
        <DynamicReoptimization />
        <PlanningHorizons />
        <ImpactMetrics />
        <SafetySection />
        <ResearchSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
