import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from './components/HeroSection';
import AnatomySection from './components/AnatomySection';
import CatalogSection from './components/CatalogSection';
import WorkedExampleSection from './components/WorkedExampleSection';
import CTASection from './components/CTASection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AnatomySection />
        <CatalogSection />
        <WorkedExampleSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
