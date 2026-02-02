import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ConversionSection } from "@/components/ConversionSection";
import { UseCasesSection } from "@/components/UseCasesSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { ConversionModeProvider } from "@/hooks/conversion-mode";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ConversionModeProvider>
        <HeroSection />
        <ConversionSection />
      </ConversionModeProvider>
      <UseCasesSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
};

export default Index;
