import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";

const FloatingElement = ({
  delay = 0,
  x = "10%",
  y = "10%",
  size = 40,
  rotate = 0,
  color = "#77DD77",
  type = "petal",
}) => {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const rotation = useTransform(
    scrollYProgress,
    [0, 1],
    [rotate, rotate + 360],
  );

  const paths = {
    heart:
      "M50 88.9L42.7 82.3C17.1 59.1 0 43.6 0 24.7C0 9.3 12.1 0 27.5 0C36.2 0 44.5 4.1 50 10.5C55.5 4.1 63.8 0 72.5 0C87.9 0 100 9.3 100 24.7C100 43.6 82.9 59.1 57.3 82.3L50 88.9Z",
    flower:
      "M50 0C54.4 17.7 67.7 31 85.4 35.4C67.7 39.8 54.4 53.1 50 70.8C45.6 53.1 32.3 39.8 14.6 35.4C32.3 31 45.6 17.7 50 0ZM50 100C54.4 82.3 67.7 69 85.4 64.6C67.7 60.2 54.4 46.9 50 29.2C45.6 46.9 32.3 60.2 14.6 64.6C32.3 69 45.6 82.3 50 100Z",
    petal:
      "M50 0C50 0 85 35 85 65C85 84.33 69.33 100 50 100C30.67 100 15 84.33 15 65C15 35 50 0 50 0Z",
  };

  return (
    <motion.div
      style={{ left: x, top: y, y: yPos, rotate: rotation }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.1, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className="absolute pointer-events-none z-0"
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d={paths[type as keyof typeof paths]} fill={color} />
      </svg>
    </motion.div>
  );
};

const SparkleElement = ({ delay = 0, x = "10%", y = "10%", size = 20 }) => {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.3, 0.1]);

  return (
    <motion.div
      transition={{ delay }}
      style={{ left: x, top: y, y: yPos, opacity }}
      className="absolute pointer-events-none z-0 text-gold-500"
    >
      <Sparkles size={size} />
    </motion.div>
  );
};

export const BackgroundDecor = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <FloatingElement
      x="5%"
      y="15%"
      size={60}
      rotate={45}
      delay={0.2}
      type="petal"
      color="#D4AF37"
    />
    <FloatingElement
      x="85%"
      y="10%"
      size={80}
      rotate={-20}
      delay={0.5}
      type="flower"
      color="#D4AF37"
    />
    <FloatingElement
      x="15%"
      y="60%"
      size={40}
      rotate={120}
      delay={0.8}
      type="heart"
      color="#FFB7B2"
    />
    <FloatingElement
      x="75%"
      y="75%"
      size={100}
      rotate={-60}
      delay={1.1}
      type="flower"
      color="#77DD77"
    />
    <FloatingElement
      x="40%"
      y="40%"
      size={30}
      rotate={10}
      delay={1.4}
      type="heart"
      color="#D4AF37"
    />

    <SparkleElement x="20%" y="20%" size={24} delay={0.3} />
    <SparkleElement x="80%" y="30%" size={32} delay={0.6} />
    <SparkleElement x="30%" y="70%" size={20} delay={0.9} />
  </div>
);
