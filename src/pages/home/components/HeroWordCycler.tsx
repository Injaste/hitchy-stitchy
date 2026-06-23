import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORDS = ["beautifully", "lovingly", "gracefully", "memorably"];
const HOLD_MS = 2800;
const EASE_IN = [0.16, 1, 0.3, 1] as const;
const EASE_OUT = [0.4, 0, 0.8, 1] as const;

export function HeroWordCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % WORDS.length),
      HOLD_MS,
    );
    return () => clearInterval(id);
  }, []);

  const word = WORDS[index];
  const chars = word.split("");

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={word}
        className="inline-block italic pr-[0.28em]"
        aria-label={word}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block bg-gradient-brand bg-clip-text text-transparent p-3 -m-3"
            initial={{ y: "0.55em", opacity: 0, filter: "blur(14px)" }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                delay: i * 0.045,
                duration: 0.65,
                ease: EASE_IN,
              },
            }}
            exit={{
              y: "-0.35em",
              opacity: 0,
              filter: "blur(10px)",
              transition: {
                delay: i * 0.022,
                duration: 0.28,
                ease: EASE_OUT,
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
