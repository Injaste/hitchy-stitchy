import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Z } from "@/lib/z-index";
import PortalToApp from "@/components/custom/portal-to-app";
import { useTourSpotlight } from "../hooks/useTourSpotlight";

const PAD = 6; // breathing room around the highlighted target
const OPEN_MS = 320; // hole growing open at a new target
const CLOSE_MS = 200; // hole shrinking shut on navigation

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Rect = { x: number; y: number; w: number; h: number; r: number };

// The zero-size hole at a rect's centre — a fully closed cutout (solid dim).
const collapsed = (r: Rect): Rect => ({
  x: r.x + r.w / 2,
  y: r.y + r.h / 2,
  w: 0,
  h: 0,
  r: 0,
});

// A full-viewport rect + a rounded-rect hole, as one path. With evenodd the hole is
// cut out of the dim — and clip-path also clips hit-testing, so the hole passes
// clicks through to the target while the dim captures (and dismisses) the rest.
function spotlightPath(vw: number, vh: number, rect: Rect) {
  const { x, y, w, h } = rect;
  const radius = Math.min(rect.r, w / 2, h / 2);
  const outer = `M0 0 H${vw} V${vh} H0 Z`;
  const hole =
    `M${x + radius} ${y} H${x + w - radius} ` +
    `A${radius} ${radius} 0 0 1 ${x + w} ${y + radius} V${y + h - radius} ` +
    `A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h} H${x + radius} ` +
    `A${radius} ${radius} 0 0 1 ${x} ${y + h - radius} V${y + radius} ` +
    `A${radius} ${radius} 0 0 1 ${x + radius} ${y} Z`;
  return `${outer} ${hole}`;
}

/** Dim everything except the current page's primary action, to point the couple at
 *  the button the guide step wants them to click. Armed by clicking a route step;
 *  the dim blocks the background and dismisses on click (or on leaving the page /
 *  clicking the action itself). Portaled above the app so nothing clips it. Page
 *  scroll is locked while it's up. On navigation the cutout CLOSES (the dim stays
 *  solid over the loading page) and reopens once the destination's button mounts. */
export default function TourSpotlight() {
  const { armedRoute, disarm } = useTourSpotlight();
  const { slug } = useParams();
  const location = useLocation();

  // `target` = the measured button on the armed page (null while navigating/loading).
  // `hole` = the drawn cutout, which eases toward `target` — growing open, or
  // shrinking to a collapsed point (then null = solid dim) when target clears.
  const [target, setTarget] = useState<Rect | null>(null);
  const [hole, setHole] = useState<Rect | null>(null);
  const holeRef = useRef<Rect | null>(null);
  const drawHole = (v: Rect | null) => {
    holeRef.current = v;
    setHole(v);
  };

  const onArmedPage =
    armedRoute != null &&
    location.pathname.startsWith(`/${slug}/admin/${armedRoute}`);
  // The dim is up while armed and either on the target page or still showing a hole
  // (so it doesn't flash onto the page you're leaving, and the re-arm URL/route lag
  // doesn't blink it off).
  const engaged = armedRoute != null && (onArmedPage || hole != null);

  // Disarm only after we've arrived on the armed page and then left it — keyed to
  // the route so RE-arming to a different step (momentarily not on the new page yet)
  // doesn't cancel itself before that page loads.
  const arrivedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!armedRoute) {
      arrivedFor.current = null;
      return;
    }
    if (onArmedPage) arrivedFor.current = armedRoute;
    else if (arrivedFor.current === armedRoute) disarm();
  }, [armedRoute, onArmedPage, disarm]);

  // Navigating closes the hole (dim stays solid) so it never sits over a loading or
  // skeleton page; it reopens once the destination's button is measured.
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (armedRoute && prevPath.current !== location.pathname) setTarget(null);
    prevPath.current = location.pathname;
  }, [location.pathname, armedRoute]);

  // A fresh arm (from disarmed) drops any stale hole before paint, so it never shows
  // the previous target's cutout.
  const prevArmed = useRef(armedRoute);
  useLayoutEffect(() => {
    if (armedRoute && !prevArmed.current) {
      drawHole(null);
      setTarget(null);
    }
    prevArmed.current = armedRoute;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armedRoute]);

  // Measure the button on the ARMED route's page. data-tour-page carries the route
  // segment, so requiring it to equal armedRoute measures only the destination and
  // ignores the outgoing page during a transition. Poll until it mounts (it appears
  // only once the page's data has loaded); give up (disarm) if it never does.
  useEffect(() => {
    if (!onArmedPage) return;
    let found = false;
    const measure = (): Rect | null => {
      const el = document.querySelector<HTMLElement>("[data-tour-action]");
      if (!el) return null;
      const page = el.closest<HTMLElement>("[data-tour-page]");
      if (page?.dataset.tourPage !== armedRoute) return null;
      // Round the cutout between the target's own radius and a fully-parallel offset
      // (radius + half the padding) — softer than +PAD, tighter than a sharp corner.
      const control = el.querySelector<HTMLElement>("button, a") ?? el;
      const br = parseFloat(getComputedStyle(control).borderTopLeftRadius) || 0;
      const b = el.getBoundingClientRect();
      return {
        x: b.left - PAD,
        y: b.top - PAD,
        w: b.width + PAD * 2,
        h: b.height + PAD * 2,
        r: br + PAD / 2,
      };
    };
    const apply = () => {
      const t = measure();
      if (t) {
        found = true;
        setTarget(t);
      }
      return !!t;
    };
    const poll = window.setInterval(() => {
      if (apply()) window.clearInterval(poll);
    }, 80);
    const stopPoll = window.setTimeout(() => {
      window.clearInterval(poll);
      if (!found) disarm(); // nothing to point at on this page
    }, 4000);
    window.addEventListener("resize", apply);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
      window.removeEventListener("resize", apply);
    };
  }, [onArmedPage, location.pathname, armedRoute, disarm]);

  // Ease the hole toward the target: GROW open when a button appears, SHRINK shut
  // (then clear to solid dim) when the target goes away on navigation.
  useEffect(() => {
    const from = holeRef.current;
    const opening = target != null;
    const sameSpot =
      opening &&
      from &&
      from.x === target.x &&
      from.y === target.y &&
      from.w === target.w &&
      from.h === target.h;
    if (sameSpot || (!opening && !from)) return; // already open here / already shut
    const start = from ?? collapsed(target!);
    const end = opening ? target! : collapsed(from!);
    const dur = opening ? OPEN_MS : CLOSE_MS;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const e = easeOut(Math.min(1, (now - t0) / dur));
      drawHole({
        x: lerp(start.x, end.x, e),
        y: lerp(start.y, end.y, e),
        w: lerp(start.w, end.w, e),
        h: lerp(start.h, end.h, e),
        r: lerp(start.r, end.r, e),
      });
      if (e < 1) raf = requestAnimationFrame(tick);
      else if (!opening) drawHole(null); // fully shut → solid dim
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // Clicking the highlighted target dismisses the spotlight so its modal opens clean.
  useEffect(() => {
    if (!engaged) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-tour-action]")) disarm();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [engaged, disarm]);

  // Lock page scroll while the dim is up so the (sticky) target stays put and keeps
  // focus. The guide widget itself stays scrollable.
  useEffect(() => {
    if (!engaged) return;
    const inWidget = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("[data-guide-widget]");
    const preventMove = (e: Event) => {
      if (!inWidget(e.target)) e.preventDefault();
    };
    const scrollKeys = new Set([
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ]);
    const preventKey = (e: KeyboardEvent) => {
      if (scrollKeys.has(e.key) && !inWidget(e.target)) e.preventDefault();
    };
    document.addEventListener("wheel", preventMove, {
      passive: false,
      capture: true,
    });
    document.addEventListener("touchmove", preventMove, {
      passive: false,
      capture: true,
    });
    document.addEventListener("keydown", preventKey, true);
    return () => {
      document.removeEventListener("wheel", preventMove, true);
      document.removeEventListener("touchmove", preventMove, true);
      document.removeEventListener("keydown", preventKey, true);
    };
  }, [engaged]);

  // Always mounted; opacity transitions in (armed) and out (disarmed). A null hole =
  // no clip-path = solid dim (while a page loads); a hole cuts the target out.
  return (
    <PortalToApp>
      <div
        aria-hidden={!engaged}
        onClick={disarm}
        className={cn(
          "fixed inset-0 bg-foreground/50 transition-opacity duration-200",
          engaged ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{
          zIndex: Z.tourOverlay,
          ...(hole && {
            clipPath: `path(evenodd, "${spotlightPath(
              window.innerWidth,
              window.innerHeight,
              hole,
            )}")`,
          }),
        }}
      />
    </PortalToApp>
  );
}
