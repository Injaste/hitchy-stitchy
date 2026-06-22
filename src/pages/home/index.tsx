import { Lenis } from "lenis/react";

import { useIsMobile } from "@/hooks/use-media-query";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { CTABanner } from "./components/CTABanner";
import { Footer } from "./components/Footer";

export default function Home() {
  const isMobile = useIsMobile();

  const content = (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
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
