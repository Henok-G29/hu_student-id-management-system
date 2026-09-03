import PublicNavbar from "../../components/public/PublicNavbar";
import HeroSection from "../../components/public/HeroSection";
import LiveStatistics from "../../components/public/LiveStatistics";
import HowItWorks from "../../components/public/HowItWorks";
import FeaturesSection from "../../components/public/FeaturesSection";
import PublicFooter from "../../components/public/PublicFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <main>
        <HeroSection />
        <LiveStatistics />
        <HowItWorks />
        <FeaturesSection />
      </main>

      <PublicFooter />
    </div>
  );
}
