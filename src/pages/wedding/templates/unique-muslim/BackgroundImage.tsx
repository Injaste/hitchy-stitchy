import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface BackgroundImageProps {
  src: string;
  ready: boolean;
}

const BackgroundImage = ({ src, ready }: BackgroundImageProps) => {
  const [dims, setDims] = useState(() => ({
    height: window.innerHeight,
    top: window.innerHeight / 2,
  }));
  const rafRef = useRef<number>(0);
  const lastWidth = useRef(window.innerWidth);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth === lastWidth.current) return;
      lastWidth.current = window.innerWidth;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() =>
        setDims({ height: window.innerHeight, top: window.innerHeight / 2 }),
      );
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.img
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-md object-contain object-center opacity-50"
      style={{ top: dims.top, height: dims.height, translateY: "-50%" }}
      src={src}
      alt=""
      animate={{ filter: ready ? "blur(8px)" : "blur(0px)" }}
      transition={{ duration: 1, delay: 1 }}
    />
  );
};

export default BackgroundImage;
