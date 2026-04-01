import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus } from "lucide-react";

const MEMBERS = [
  { id: 1, initials: "EK", name: "Emma K.", role: "Bridesmaid", color: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: 2, initials: "RM", name: "Rajan M.", role: "Coordinator", color: "bg-primary/15 text-primary border-primary/25" },
];

const NEW_MEMBER = {
  id: 3,
  initials: "KN",
  name: "Kezia N.",
  role: "Photographer",
  color: "bg-accent/15 text-accent border-accent/25",
};

export function TeamMock() {
  // 0: 2 members, 1: new member slides in (no role), 2: role badge appears, 3: reset
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [2000, 1200, 2400, 400];
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

  const showNew = phase >= 1;
  const showRole = phase === 2;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* Chrome */}
      <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Wedding Team</span>
        <span className="text-xs text-primary font-semibold">
          {showNew ? "3" : "2"} roles
        </span>
      </div>

      <div className="p-5 space-y-2.5">
        {/* Existing members */}
        {MEMBERS.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl p-3 bg-muted/30">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0">
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{m.name}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.color}`}>
              {m.role}
            </span>
          </div>
        ))}

        {/* New member */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl p-3 bg-primary/5 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {NEW_MEMBER.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{NEW_MEMBER.name}</p>
                </div>
                <AnimatePresence>
                  {showRole && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${NEW_MEMBER.color}`}
                    >
                      {NEW_MEMBER.role}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invite button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          className="w-full flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite a member
        </motion.button>
      </div>
    </div>
  );
}
