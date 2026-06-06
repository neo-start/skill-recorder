import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from './components/HeroSection';
import WhySection from './components/WhySection';
import UseCasesSection from './components/UseCasesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TrustSection from './components/TrustSection';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <WhySection />
        <UseCasesSection />
        <HowItWorksSection />
        <TrustSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
