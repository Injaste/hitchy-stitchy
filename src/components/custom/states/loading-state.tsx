import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Logo from "@/components/custom/logo";
import { usePortalContainer } from "@/app/AppPortals";
import LottieRaw from "lottie-react";

const Lottie = (LottieRaw as any).default ?? LottieRaw;
import loveParticle from "@/assets/lottie/love-particle.json";
import ComponentFade from "@/components/animations/animate-component-fade";

const LoadingState = () => {
  const container = usePortalContainer() ?? document.body;
  const [slowMessage, setSlowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlowMessage(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return createPortal(
    <ComponentFade
      key="loading-state"
      useBlur
      className="fixed inset-0 flex flex-col justify-center items-center gap-10 bg-gradient-surface z-99999"
    >
      <Logo
        imageClassName="w-28 h-28 -mb-7"
        showBrand
        brandClassName="text-xl"
        showTagline
      />

      <div className="flex flex-col items-center gap-4">
        <div className="-my-10">
          <Lottie
            animationData={loveParticle}
            loop
            style={{ width: 120, height: 120 }}
          />
        </div>

        <AnimatePresence>
          {slowMessage && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              Taking longer than usual…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </ComponentFade>,
    container,
  );
};

export default LoadingState;
