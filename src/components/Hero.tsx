import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const distance = targetDate.getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 justify-center mt-8">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col items-center px-4 py-3 bg-white/50 backdrop-blur-md rounded-2xl border border-gold-500/20 min-w-[75px] shadow-sm"
        >
          <span className="font-mono text-3xl font-bold text-black tabular-nums">
            {value.toString().padStart(2, "0")}
          </span>
          <span className="font-sans text-[10px] uppercase tracking-widest text-black font-bold mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export const Hero = () => {
  const weddingDate = new Date("2026-07-04T10:00:00");

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-white/10 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="z-10"
      >
        <p className="text-black text-xl mb-6 tracking-widest">
          السلام عليكم ورحمة الله وبركاته
        </p>

        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-black mb-2">
            The Wedding of
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold-500/40" />
            <Heart className="text-black fill-gold-500/10" size={16} />
            <div className="h-px w-12 bg-gold-500/40" />
          </div>
        </div>

        <h1 className="flex flex-col text-7xl font-black text-white [text-shadow:_2px_2px_0_rgb(212_175_55),_-2px_-2px_0_rgb(212_175_55),_2px_-2px_0_rgb(212_175_55),_-2px_2px_0_rgb(212_175_55)] mb-6 tracking-tighter italic drop-shadow-md">
          Izhan Danish{" "}
          <span className="text-4xl font-light not-italic tracking-normal">
            &
          </span>{" "}
          Sharifah Nadhirah
        </h1>

        <CountdownTimer targetDate={weddingDate} />

        <p className="max-w-md mx-auto text-base md:text-lg text-black/80 leading-relaxed font-medium mt-12 mb-12">
          "And We created you in pairs."
          <span className="block italic text-sm mt-1">
            — Surah An-Naba 78:8
          </span>
        </p>

        <motion.a
          href="#details"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="block w-fit mx-auto bg-gold-500 text-white px-12 py-4 rounded-full shadow-lg hover:bg-gold-600 transition-all uppercase tracking-widest text-sm font-bold border-2 border-white/20"
        >
          Our Invitation
        </motion.a>
      </motion.div>
    </section>
  );
};
