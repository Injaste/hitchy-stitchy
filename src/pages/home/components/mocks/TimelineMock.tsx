import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, MapPin } from "lucide-react";

const INITIAL_CUES = [
  { id: 1, time: "09:00", label: "Bridal Preparation", venue: "Bridal Suite", done: true },
  { id: 2, time: "11:30", label: "Photo Session", venue: "Gardens", done: false, active: true },
  { id: 3, time: "14:00", label: "Ceremony", venue: "Chapel", done: false },
];

const NEW_CUE = { id: 4, time: "17:00", label: "Reception & Dinner", venue: "Ballroom", done: false };

export function TimelineMock() {
  // 0: initial, 1: new cue appearing, 2: new cue settled + role assigned, 3: reset
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [2200, 2000, 2800];
    let timeout: ReturnType<typeof setTimeout>;

    const advance = (p: number) => {
      timeout = setTimeout(() => {
        const next = (p + 1) % timings.length;
        setPhase(next);
        advance(next);
      }, timings[p]);
    };

    advance(phase);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNewCue = phase >= 1;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* App chrome */}
      <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground font-medium mx-auto">
          Day 1 · The Ceremony
        </span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        {INITIAL_CUES.map((cue) => (
          <div
            key={cue.id}
            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
              cue.active ? "bg-primary/8 border border-primary/15" : "bg-transparent"
            }`}
          >
            {/* Status dot */}
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
              cue.done
                ? "bg-secondary/20 border-secondary/40"
                : cue.active
                ? "bg-primary/15 border-primary/30"
                : "bg-muted border-border"
            }`}>
              {cue.done ? (
                <Check className="w-3 h-3 text-secondary" strokeWidth={2.5} />
              ) : cue.active ? (
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{cue.time}</span>
                <span className={`text-sm font-medium truncate ${cue.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {cue.label}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground/60" />
                <span className="text-xs text-muted-foreground/70">{cue.venue}</span>
              </div>
            </div>

            {cue.active && (
              <span className="shrink-0 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                NOW
              </span>
            )}
          </div>
        ))}

        {/* New cue sliding in */}
        <AnimatePresence>
          {showNewCue && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl p-3 bg-primary/5 border border-primary/15 border-dashed">
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{NEW_CUE.time}</span>
                    <span className="text-sm font-medium text-foreground">{NEW_CUE.label}</span>
                    <AnimatePresence>
                      {phase === 2 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20"
                        >
                          Coordinator
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/70">{NEW_CUE.venue}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add a cue
        </motion.button>
      </div>
    </div>
  );
}
