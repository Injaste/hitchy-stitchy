import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const ALL_CUES = [
  { id: 1, label: "Bridal Preparation", time: "09:00" },
  { id: 2, label: "Photo Session", time: "11:30" },
  { id: 3, label: "Ceremony", time: "14:00" },
  { id: 4, label: "Reception & Dinner", time: "17:00" },
];

function formatTime(base: number, secondsElapsed: number) {
  const totalSeconds = base + secondsElapsed;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Start at 13:55:30 — about to transition into Ceremony
const BASE_SECONDS = 13 * 3600 + 55 * 60 + 30;

export function LiveMock() {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  // activeIndex = which cue is currently live
  const [activeIndex, setActiveIndex] = useState(1); // Photo Session active first
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsElapsed((s) => {
        const next = s + 1;
        // After ~4s, advance active cue; loop back after showing all
        if (next % 5 === 0) {
          setActiveIndex((a) => (a + 1) % ALL_CUES.length);
        }
        return next;
      });
    }, 500); // tick at 0.5s for visible movement without being annoying

    return () => clearInterval(intervalRef.current!);
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* Chrome — Live header */}
      <div className="bg-destructive/8 border-b border-destructive/15 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xs font-bold text-destructive uppercase tracking-widest">
            Live
          </span>
          <span className="text-xs text-muted-foreground">· Day 1</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {formatTime(BASE_SECONDS, secondsElapsed)}
        </span>
      </div>

      {/* Cue list */}
      <div className="p-5 space-y-2">
        <AnimatePresence mode="popLayout">
          {ALL_CUES.map((cue, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;

            return (
              <motion.div
                key={cue.id}
                layout
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isActive ? "bg-primary/8 border border-primary/15" : "bg-transparent"
                }`}
              >
                {/* Status */}
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                  isDone
                    ? "bg-secondary/20 border-secondary/30"
                    : isActive
                    ? "border-primary/30 bg-primary/10"
                    : "border-border bg-muted"
                }`}>
                  {isDone ? (
                    <Check className="w-3 h-3 text-secondary" strokeWidth={2.5} />
                  ) : isActive ? (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/25" />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isDone ? "text-muted-foreground line-through" : "text-foreground"
                  }`}>
                    {cue.label}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground/70">{cue.time}</p>
                </div>

                {/* Active badge */}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wide"
                  >
                    Active
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Footer stat */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Team check-ins</span>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {["EK", "RM"].map((initials) => (
                <div key={initials} className="w-5 h-5 rounded-full bg-muted border border-card flex items-center justify-center text-[8px] font-bold text-foreground">
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-xs text-foreground font-medium ml-1">2 arrived</span>
          </div>
        </div>
      </div>
    </div>
  );
}
