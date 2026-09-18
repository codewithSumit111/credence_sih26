import './landing.css';
import LandingNavbar from './components/Navbar';
import Hero from './components/Hero';
import ContextStrip from './components/ContextStrip';
import FeaturesGrid from './components/FeaturesGrid';
import PipelineFlow from './components/PipelineFlow';
import OperationalView from './components/OperationalView';
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
        <FeaturesGrid />
        <PipelineFlow />
        <OperationalView />
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
