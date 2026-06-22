import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Mirrors the real Access matrix: per-resource level is none / read / full.
type Level = "none" | "read" | "full";

const LEVEL: Record<Level, { label: string; icon: LucideIcon; className: string }> = {
  full: { label: "Full", icon: CheckCircle2, className: "text-primary" },
  read: { label: "View", icon: Eye, className: "text-muted-foreground/80" },
  none: { label: "—", icon: Minus, className: "text-muted-foreground/40" },
};

// Rows = features (real resource labels). Admin is fixed at Full; the Team
// column for "Budget" is the hero cell that gets granted access over the cycle.
const ROWS: { feature: string; admin: Level; team: Level | "hero" }[] = [
  { feature: "Timeline", admin: "full", team: "read" },
  { feature: "Budget", admin: "full", team: "hero" },
  { feature: "Gifts", admin: "full", team: "none" },
  { feature: "Guests", admin: "full", team: "full" },
];

// The hero cell walks none -> View -> Full, holds, then resets.
const HERO_PHASES: { level: Level; dur: number }[] = [
  { level: "none", dur: 1600 },
  { level: "read", dur: 1800 },
  { level: "full", dur: 2600 },
];

function LevelCell({ level, hero }: { level: Level; hero?: boolean }) {
  const { label, icon: Icon, className } = LEVEL[level];
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md py-1.5",
        hero && "bg-primary/5 ring-1 ring-primary/15",
      )}
    >
      {/* Keyed on level so each change remounts with a small pop — the cell's
          box is fixed, so only the icon/label swap (no layout shift). */}
      <motion.span
        key={level}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn("inline-flex items-center gap-1.5", className)}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-2xs font-medium">
          {level === "none" ? "—" : label}
        </span>
      </motion.span>
    </div>
  );
}

export function AccessMock() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const advance = (p: number) => {
      timeout = setTimeout(() => {
        const next = (p + 1) % HERO_PHASES.length;
        setPhase(next);
        advance(next);
      }, HERO_PHASES[p].dur);
    };
    advance(phase);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroLevel = HERO_PHASES[phase].level;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden select-none">
      {/* Chrome */}
      <div className="bg-muted/60 border-b border-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted-foreground font-medium mx-auto">
          Roles &amp; Access
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-x-2 gap-y-1.5 items-center">
          {/* Header row */}
          <span className="text-3xs uppercase tracking-wide font-semibold text-muted-foreground">
            Feature
          </span>
          <span className="text-center text-3xs uppercase tracking-wide font-semibold text-muted-foreground">
            Admin
          </span>
          <span className="text-center text-3xs uppercase tracking-wide font-semibold text-muted-foreground">
            Team
          </span>

          {ROWS.map((row) => (
            <div key={row.feature} className="contents">
              <span className="text-sm font-medium text-foreground py-1.5">
                {row.feature}
              </span>
              <LevelCell level={row.admin} />
              {row.team === "hero" ? (
                <LevelCell level={heroLevel} hero />
              ) : (
                <LevelCell level={row.team} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
