import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import PortalToApp from "@/components/custom/portal-to-app";
import { useIsMobile } from "@/hooks/use-media-query";
import { Z } from "@/lib/z-index";
import { useAdminStore } from "../../store/useAdminStore";
import { useEventSettingsStore } from "../../settings/useEventSettingsStore";
import { adminKeys } from "../../lib/queryKeys";
import { useSetupGuide } from "../hooks/useSetupGuide";
import { useSetupCountsSync } from "../queries";
import { useLiveRunDemoStore } from "../hooks/useLiveRunDemoStore";
import SetupGuidePanel from "./SetupGuidePanel";
import SetupGuidePill from "./SetupGuidePill";
import DismissFlight, { type Point } from "./DismissFlight";

/** Corner-docked setup guide (desktop + mobile). A small pill that expands to a
 *  persistent panel showing ONE group at a time, with prev/next + auto-advance.
 *  Progress is drawn as the element's BORDER. Persists while you work; completion
 *  refreshes on navigation. On dismiss, an icon flies to the Event Settings button
 *  so the couple learns where to reopen it. */
export default function SetupGuideWidget() {
  const {
    active,
    stateReady,
    groups,
    doneCount,
    totalCount,
    isComplete,
    dismissed,
    dismiss,
    minimised,
    setMinimised,
    celebrated,
    markCelebrated,
    markViewed,
  } = useSetupGuide();
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
  const isMobile = useIsMobile();
  useEffect(() => {
    // Complete "days" whenever the Event Dates panel is actually on screen: the
    // explicit "days" section, OR — desktop only — the fallback when no section is
    // chosen, which lands on the first tab (Event Dates). On mobile an unset
    // section shows the LIST, not dates, so there it must be explicit.
    const viewingDates =
      settingsSection === "days" || (!isMobile && settingsSection === undefined);
    if (active && settingsOpen && viewingDates) markViewed("days");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, settingsOpen, settingsSection, isMobile]);

  // Opening the live-run demo completes the "liverun" step (view-based, like days).
  const liveRunDemoOpen = useLiveRunDemoStore((s) => s.isOpen);
  useEffect(() => {
    if (active && liveRunDemoOpen) markViewed("liverun");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, liveRunDemoOpen]);

  // Keep completion retroactive as feature data changes (lives with the query).
  useSetupCountsSync();

  // Fire the completion confetti exactly ONCE per member (persisted in
  // celebrated_by): never repeats across sessions, or if the guide re-completes
  // (delete then re-add an item). The "all done" ring/header visual still shows
  // every time — only this one-shot burst is gated. Skipped if this member has
  // dismissed the guide (they hid it; don't celebrate behind their back). The ref
  // latches it to at most once per mount: un-dismissing a completed guide fires
  // replay + markCelebrated in the same tick, and replay's write momentarily
  // reverts `celebrated` — without the latch that would re-trigger a 2nd burst.
  const hasFiredConfetti = useRef(false);
  useEffect(() => {
    if (
      active &&
      !dismissed &&
      isComplete &&
      !celebrated &&
      !hasFiredConfetti.current
    ) {
      hasFiredConfetti.current = true;
      confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 38,
        angle: 110,
        origin: { x: 0.92, y: 0.9 },
      });
      markCelebrated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, dismissed, isComplete, celebrated]);

  const firstIncomplete = Math.max(
    0,
    groups.findIndex((g) => g.steps.some((s) => !s.completed)),
  );
  const [index, setIndex] = useState(firstIncomplete);
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) setIndex(firstIncomplete);
  }, [firstIncomplete]);

  // Hold the render until the persisted state has loaded, so we never flash the
  // maximised panel before snapping to the pill (or vice versa).
  if (!active || !stateReady || dismissed) return null;

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
        [
          { transform: "scale(1)" },
          { transform: "scale(1.3)" },
          { transform: "scale(1)" },
        ],
        { duration: 360, easing: "ease-out" },
      );
    dismiss();
    setFlight(null);
  };

  return (
    <PortalToApp>
      {!flight && (
        <div
          data-guide-widget
          style={{ zIndex: Z.tourWidget }}
          className="fixed bottom-4 right-4 print:hidden"
        >
          <AnimatePresence mode="wait">
            {!minimised ? (
              <SetupGuidePanel
                key="panel"
                panelRef={panelRef}
                pct={pct}
                isComplete={isComplete}
                doneCount={doneCount}
                totalCount={totalCount}
                group={group}
                index={i}
                groupCount={groups.length}
                onPrev={() => go(-1)}
                onNext={() => go(1)}
                onMinimize={() => setMinimised(true)}
                onDismiss={startDismiss}
              />
            ) : (
              <SetupGuidePill
                key="pill"
                pct={pct}
                doneCount={doneCount}
                totalCount={totalCount}
                onExpand={() => setMinimised(false)}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {flight && (
        <DismissFlight
          from={flight.from}
          to={flight.to}
          onComplete={finishFlight}
        />
      )}
    </PortalToApp>
  );
}
