import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, ChevronLeft, ChevronRight, Minus, X } from "lucide-react";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useAdminStore } from "../store/useAdminStore";
import { useEventSettingsStore } from "../settings/useEventSettingsStore";
import { adminKeys } from "../lib/queryKeys";
import { useSetupGuide } from "./useSetupGuide";
import { useSetupCountsSync } from "./queries";
import SetupStepRow from "./SetupStepRow";

const SW = 2.5;

// A rounded-rect border path + its perimeter — same methodology as SubmitButton's
// border arc, generalised to any measured size/corner radius.
function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}
function roundedRectPerimeter(w: number, h: number, r: number) {
  return 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
}

/** Draws the progress as the BORDER of its positioned parent. Measures the parent
 *  (size + corner radius) so the radius/length are computed exactly, then fills
 *  `pct` of the perimeter — the SubmitButton approach, used as a progress meter. */
function ProgressBorder({ pct }: { pct: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0, br: 0 });

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () =>
      setDims({
        w: parent.offsetWidth,
        h: parent.offsetHeight,
        br: parseFloat(getComputedStyle(parent).borderTopLeftRadius) || 0,
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  const { w, h, br } = dims;
  const inset = SW / 2;
  const W = Math.max(0, w - SW);
  const H = Math.max(0, h - SW);
  const r = Math.max(0, Math.min(br - inset, Math.min(W, H) / 2));
  const d = w && h ? roundedRectPath(inset, inset, W, H, r) : "";
  const P = roundedRectPerimeter(W, H, r) || 1;
  const clamped = Math.max(0, Math.min(1, pct));

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    >
      {d && (
        <>
          <path d={d} strokeWidth={SW} className="stroke-current opacity-15" />
          <motion.path
            d={d}
            strokeWidth={SW}
            strokeLinecap="round"
            className="stroke-primary"
            strokeDasharray={P}
            initial={false}
            animate={{ strokeDashoffset: P * (1 - clamped) }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
          />
        </>
      )}
    </svg>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors enabled:hover:bg-muted enabled:hover:text-foreground disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}

type Point = { x: number; y: number };

/** Corner-docked setup guide (desktop + mobile). A small pill that expands to a
 *  persistent panel showing ONE group at a time, with prev/next + auto-advance.
 *  Progress is drawn as the element's BORDER. Persists while you work; completion
 *  refreshes on navigation. On dismiss, an icon flies to the Event Settings button
 *  so the couple learns where to reopen it. */
export default function SetupGuideWidget() {
  const { active, groups, doneCount, totalCount, isComplete, dismissed, dismiss, markViewed } =
    useSetupGuide();
  const [expanded, setExpanded] = useState(true);
  const [flight, setFlight] = useState<{ from: Point; to: Point } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const qc = useQueryClient();
  const { slug, eventId } = useAdminStore();
  useEffect(() => {
    if (!active) return;
    if (slug && eventId) {
      qc.invalidateQueries({ queryKey: adminKeys.setupCounts(slug, eventId) });
    }
    // The Access page is read-only — opening it completes the "review roles" step.
    if (location.pathname.endsWith("/admin/access")) markViewed("access");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Dates are already set at create-event, so the days step is "review/update": it
  // completes once the Event Dates settings section is opened (the same view-only
  // pattern as Access, but the target is a settings section, not a route).
  const settingsOpen = useEventSettingsStore((s) => s.isOpen);
  const settingsSection = useEventSettingsStore((s) => s.section);
  useEffect(() => {
    if (active && settingsOpen && settingsSection === "days") markViewed("days");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, settingsOpen, settingsSection]);

  // Keep completion retroactive as feature data changes (lives with the query).
  useSetupCountsSync();

  const firstIncomplete = Math.max(
    0,
    groups.findIndex((g) => g.steps.some((s) => !s.completed)),
  );
  const [index, setIndex] = useState(firstIncomplete);
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) setIndex(firstIncomplete);
  }, [firstIncomplete]);

  if (!active || dismissed) return null;

  const pct = totalCount > 0 ? doneCount / totalCount : 0;
  const i = Math.min(index, groups.length - 1);
  const group = groups[i];
  const go = (delta: number) => {
    touched.current = true;
    setIndex((prev) => Math.min(groups.length - 1, Math.max(0, prev + delta)));
  };

  // On dismiss, fly a small icon to the Event Settings button (the guide's home) so
  // the couple sees where to reopen it. Falls back to an immediate dismiss when the
  // target isn't on screen (e.g. mobile, sidebar drawer closed).
  const startDismiss = () => {
    const target = document.querySelector<HTMLElement>("[data-guide-home]");
    const panel = panelRef.current;
    if (!target || !panel) {
      dismiss();
      return;
    }
    const f = panel.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    setFlight({
      from: { x: f.right - 22, y: f.top + 22 },
      to: { x: t.left + t.width / 2, y: t.top + t.height / 2 },
    });
  };

  const finishFlight = () => {
    document
      .querySelector<HTMLElement>("[data-guide-home]")
      ?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
        { duration: 360, easing: "ease-out" },
      );
    dismiss();
    setFlight(null);
  };

  const F = 18; // half the flying icon's size, to center it on the coordinates

  return (
    <>
      {!flight && (
        <div className="fixed bottom-4 right-4 z-30 print:hidden">
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.div
                key="panel"
                ref={panelRef}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "bottom right" }}
                className="relative w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg"
              >
                <ProgressBorder pct={pct} />

                <div className="flex items-start gap-1 px-4 pt-3.5 pb-3">
                  <div className="min-w-0 flex-1">
                    {isComplete ? (
                      <p className="font-display text-sm font-medium">You're all set! 🎉</p>
                    ) : (
                      <>
                        <p className="font-display text-sm font-medium">Get your event ready</p>
                        <p className="text-2xs text-muted-foreground">
                          {doneCount} of {totalCount} done
                        </p>
                      </>
                    )}
                  </div>
                  <IconButton label="Minimize" onClick={() => setExpanded(false)}>
                    <Minus className="size-4" />
                  </IconButton>
                  <IconButton label="Dismiss" onClick={startDismiss}>
                    <X className="size-4" />
                  </IconButton>
                </div>

                <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
                  <IconButton label="Previous group" disabled={i === 0} onClick={() => go(-1)}>
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <div className="flex-1 text-center">
                    <p className="text-sm font-medium">{group.label}</p>
                  </div>
                  <IconButton
                    label="Next group"
                    disabled={i === groups.length - 1}
                    onClick={() => go(1)}
                  >
                    <ChevronRight className="size-4" />
                  </IconButton>
                </div>

                <div className="border-t border-border p-1">
                  <AnimatePresence mode="wait">
                    <ComponentFade key={group.id} useBlur className="flex flex-col">
                      {group.steps.map((step) => (
                        <SetupStepRow key={step.id} step={step} />
                      ))}
                    </ComponentFade>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="pill"
                type="button"
                onClick={() => setExpanded(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                style={{ transformOrigin: "bottom right" }}
                aria-label={`Get started — ${doneCount} of ${totalCount} done`}
                className="relative flex cursor-pointer items-center gap-2 rounded-full bg-popover py-2.5 pl-4 pr-5 text-sm font-medium text-popover-foreground shadow-lg transition-transform active:scale-95"
              >
                <ProgressBorder pct={pct} />
                <ListChecks className="size-4 text-primary" />
                <span>{isComplete ? "All set" : "Get started"}</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {flight && (
        <motion.div
          initial={{ x: flight.from.x - F, y: flight.from.y - F, scale: 1, opacity: 1 }}
          animate={{ x: flight.to.x - F, y: flight.to.y - F, scale: 0.45, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={finishFlight}
          className="pointer-events-none fixed left-0 top-0 z-50 flex size-9 items-center justify-center rounded-full bg-popover shadow-lg ring-1 ring-primary/30"
        >
          <ListChecks className="size-4 text-primary" />
        </motion.div>
      )}
    </>
  );
}
