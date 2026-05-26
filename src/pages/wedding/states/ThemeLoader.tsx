import { useEffect, useRef, type FC } from "react";
import { animate, motion, stagger } from "framer-motion";
import LottieRaw from "lottie-react";
import Logo from "@/components/custom/logo";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = (LottieRaw as any).default ?? LottieRaw;
import SplitType from "split-type";
import loveParticle from "@/assets/lottie/love-particle.json";

const CONTENT_DELAY = 0.8;

const ThemeLoader: FC<{ loadedCompleted: () => void }> = ({
  loadedCompleted,
}) => {
  const animationDone = useRef(false);

  const tryComplete = () => {
    if (!animationDone.current) return;
    if (document.readyState === "complete") {
      loadedCompleted();
    } else {
      window.addEventListener("load", loadedCompleted, { once: true });
    }
  };

  return (
    <div>
      {/* 2. BACKGROUND ELEGANCE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 bg-radial from-accent/20 via-transparent to-transparent"
      />

      {/* 3. CONTENT */}
      <div className="relative flex flex-col items-center px-12 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: CONTENT_DELAY }}
          className="flex flex-col items-center justify-center gap-4 mb-8"
        >
          <Logo
            imageClassName="w-32 h-32"
            brandClassName="text-2xl"
            showBrand
          />
          <div className="-my-10">
            <Lottie
              animationData={loveParticle}
              loop
              style={{ width: 120, height: 120 }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: CONTENT_DELAY + 0.2 }}
          className="mt-10 flex flex-col items-center gap-4"
          onAnimationComplete={() => {
            animationDone.current = true;
            tryComplete();
          }}
        >
          <div className="h-px w-8 bg-accent/50" />

          <p className="text-sm tracking-[0.3em] text-foreground/80 uppercase font-light">
            Please wait while we prepare your invitation
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeLoader;
