import { motion } from "framer-motion";

const flowerTransition = {
  y: { duration: 1.2, ease: "easeOut" },
  opacity: { duration: 1.2, ease: "easeOut" },
  rotate: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
    times: [0, 0.3, 0.6, 0.8, 1],
  },
  skewX: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
    times: [0, 0.3, 0.6, 0.8, 1],
  },
};

const flowerAnimate = {
  y: 0,
  opacity: 1,
  rotate: [0, 0.6, -0.4, 0.3, 0],
  skewX: [0, 0.5, -0.3, 0.2, 0],
};

interface BackgroundFlowersProps {
  ready: boolean;
}

const BackgroundFlowers = ({ ready }: BackgroundFlowersProps) => (
  <>
    <motion.img
      src="/images/background/bg-flower-1.png"
      alt=""
      className="fixed left-0 right-0 top-0 rotate-180 w-[101%] scale-101 max-w-md mx-auto"
      initial={{ y: "100%", opacity: 0 }}
      animate={ready ? flowerAnimate : {}}
      transition={flowerTransition}
    />
    <motion.img
      src="/images/background/bg-flower-1.png"
      alt=""
      className="fixed left-0 right-0 bottom-0 w-[101%] max-w-md mx-auto scale-101"
      initial={{ y: "100%", opacity: 0 }}
      animate={ready ? flowerAnimate : {}}
      transition={flowerTransition}
    />
  </>
);

export default BackgroundFlowers;
