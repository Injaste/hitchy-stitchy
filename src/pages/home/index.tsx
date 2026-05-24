import { Lenis } from "lenis/react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDocumentMeta } from "@/hooks/use-document-meta";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "hitchystitchy.com";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { Features } from "./components/Features";
import { Testimonials } from "./components/Testimonials";
import { HowItWorks } from "./components/HowItWorks";
import { CTABanner } from "./components/CTABanner";
import { Footer } from "./components/Footer";

export default function Home() {
  const isMobile = useIsMobile();

  useDocumentMeta({
    title: "Hitchy Stitchy — Wedding Planning Suite",
    description: "A calm, beautiful suite for planning your wedding day — invitations, RSVPs, timeline, team coordination, and live event tools, all in one place.",
    image: `https://${BASE_URL}/dannad.png`,
    url: `https://${BASE_URL}/`,
  });

  const content = (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );

  if (isMobile) return content;

  return (
    <Lenis
      root
      options={{
        prevent: () => document.body.hasAttribute("data-scroll-locked"),
      }}
    >
      {content}
    </Lenis>
  );
}
