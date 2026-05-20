import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
} from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useFormShellOptional } from "./form-context";
import { itemShake } from "@/lib/animations";

const GAP = 5;
const SW = 2.5;
const BR = 8;
const ARC_PCT = 0.2;
const SPEED_MS = 1500;
// Success/error cascade — arc fills, then fades, then resets. Total must
// fit inside FormDialog's default closeDelay (300ms) so the button finishes
// its state before the dialog starts exiting.
const ARC_MS = 150;
const FADE_MS = 150;

function buildPath(W: number, H: number) {
  const r = BR + GAP,
    x = GAP,
    y = GAP;
  return `M ${x + r} ${y} L ${x + W - r} ${y} Q ${x + W} ${y} ${x + W} ${y + r}
          L ${x + W} ${y + H - r} Q ${x + W} ${y + H} ${x + W - r} ${y + H}
          L ${x + r} ${y + H} Q ${x} ${y + H} ${x} ${y + H - r}
          L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

function getPerimeter(W: number, H: number) {
  const r = BR + GAP;
  return 2 * (W - 2 * r) + 2 * (H - 2 * r) + 2 * Math.PI * r;
}

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

const SubmitButton: FC<SubmitButtonProps> = ({
  children,
  disabled,
  type = "submit",
  isPending: isPendingProp,
  isSuccess: isSuccessProp,
  isError: isErrorProp,
  ...props
}) => {
  const ctx = useFormShellOptional();
  const isPending = isPendingProp ?? ctx?.isPending ?? false;
  const isSuccess = isSuccessProp ?? ctx?.isSuccess ?? false;
  const isError = isErrorProp ?? ctx?.isError ?? false;
  const [shakeState, setShakeState] = useState<"idle" | "shake">("idle");

  const btnRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);
  const phase = useRef<"idle" | "spinning">("idle");
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Cancels the pending success/error tail (fade + reset). Called whenever a
  // new pending cycle begins, so back-to-back submits aren't swallowed by the
  // 300ms cascade left over from the previous result.
  const clearTailTimers = () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    fadeTimerRef.current = undefined;
    resetTimerRef.current = undefined;
  };

  // Instant snap-to-idle (no transition). Used when re-arming the spinner
  // mid-cascade — the soft fade in reset() looks wrong when we're about to
  // immediately start spinning again.
  const snapToIdle = () => {
    cancelAnimationFrame(rafRef.current);
    clearTailTimers();
    if (arcRef.current) {
      arcRef.current.style.cssText = "opacity: 0";
      arcRef.current.setAttribute("stroke", "var(--color-primary)");
    }
    if (trackRef.current) {
      trackRef.current.style.cssText = "opacity: 0";
      trackRef.current.setAttribute(
        "stroke",
        "oklch(from var(--color-primary) l c h / 0.25)",
      );
    }
    phase.current = "idle";
  };

  // Unmount cleanup — prevents the cascade from firing on detached refs after
  // the dialog closes mid-animation.
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      clearTailTimers();
    },
    [],
  );

  useLayoutEffect(() => {
    const btn = btnRef.current;
    const svg = svgRef.current;
    if (!btn || !svg) return;

    const sizeSvg = () => {
      const W = btn.offsetWidth,
        H = btn.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${W + GAP * 2} ${H + GAP * 2}`);
      svg.style.width = `${W + GAP * 2}px`;
      svg.style.height = `${H + GAP * 2}px`;
    };

    // Keeps the SVG container aligned with the button across font swaps,
    // container reflows, or label changes — otherwise the next animation
    // cycle's arc would be clipped by a stale viewBox.
    sizeSvg();
    const ro = new ResizeObserver(sizeSvg);
    ro.observe(btn);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isPending) return;
    // Re-arm: if a previous success/error cascade is still in its tail, snap
    // back to idle so the new submit gets a fresh spinner instead of being
    // silently swallowed by the `phase.current !== "idle"` guard.
    if (phase.current !== "idle") snapToIdle();

    const btn = btnRef.current;
    const svg = svgRef.current;
    const track = trackRef.current;
    const arc = arcRef.current;
    if (!btn || !svg || !track || !arc) return;

    phase.current = "spinning";

    const W = btn.offsetWidth,
      H = btn.offsetHeight;
    const P = getPerimeter(W, H);

    [track, arc].forEach((el) => {
      el.setAttribute("d", buildPath(W, H));
      el.setAttribute("stroke-width", String(SW));
    });

    track.style.opacity = "1";
    arc.style.opacity = "1";
    arc.style.strokeDasharray = `${P * ARC_PCT} ${P * (1 - ARC_PCT)}`;
    arc.style.strokeDashoffset = "0";

    let offset = 0;
    const step = (P / SPEED_MS) * 16;
    const tick = () => {
      offset -= step;
      arc.style.strokeDashoffset = String(offset);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [isPending]);

  useEffect(() => {
    if (!isSuccess && !isError) return;
    if (phase.current !== "spinning") return;

    cancelAnimationFrame(rafRef.current);

    const btn = btnRef.current;
    const track = trackRef.current;
    const arc = arcRef.current;
    if (!btn || !track || !arc) return;

    const P = getPerimeter(btn.offsetWidth, btn.offsetHeight);
    const currentOffset = parseFloat(arc.style.strokeDashoffset) || 0;

    arc.setAttribute(
      "stroke",
      isSuccess ? "var(--color-success)" : "var(--color-destructive)",
    );
    track.setAttribute(
      "stroke",
      isSuccess
        ? "oklch(from var(--color-success) l c h / 0.25)"
        : "oklch(from var(--color-destructive) l c h / 0.25)",
    );

    if (!isSuccess) setShakeState("shake");

    arc.style.transition = `stroke-dasharray ${ARC_MS}ms cubic-bezier(.4,0,.2,1), stroke-dashoffset ${ARC_MS}ms cubic-bezier(.4,0,.2,1)`;
    arc.style.strokeDasharray = `${P} 0`;
    arc.style.strokeDashoffset = String(currentOffset);

    // Trackable timers (not delay().then) so a re-armed submit can cancel
    // the tail via snapToIdle() instead of letting reset() fire on stale refs.
    fadeTimerRef.current = setTimeout(() => {
      arc.style.transition = `opacity ${FADE_MS}ms`;
      track.style.transition = `opacity ${FADE_MS}ms`;
      arc.style.opacity = "0";
      track.style.opacity = "0";
      resetTimerRef.current = setTimeout(reset, FADE_MS);
    }, ARC_MS);
  }, [isSuccess, isError]);

  function reset() {
    if (arcRef.current) {
      arcRef.current.style.cssText = "";
      arcRef.current.style.opacity = "0";
      arcRef.current.style.transition = "opacity 300ms";
      arcRef.current.setAttribute("stroke", "var(--color-primary)");
    }
    if (trackRef.current) {
      trackRef.current.style.cssText = "";
      trackRef.current.style.opacity = "0";
      trackRef.current.style.transition = "opacity 250ms";
      trackRef.current.setAttribute(
        "stroke",
        "oklch(from var(--color-primary) l c h / 0.25)",
      );
    }
    phase.current = "idle";
  }
  return (
    <motion.span
      className="relative inline-flex"
      variants={itemShake}
      animate={shakeState}
      onAnimationComplete={() => setShakeState("idle")}
    >
      <Button
        ref={btnRef}
        type={type}
        disabled={isPending || !!disabled}
        {...props}
        className="w-full"
      >
        {children}
      </Button>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: -GAP, top: -GAP }}
      >
        <path
          ref={trackRef}
          fill="none"
          stroke="oklch(from var(--color-primary) l c h / 0.25)"
          strokeLinecap="round"
          style={{ opacity: 0, transition: "opacity 250ms" }}
        />
        <path
          ref={arcRef}
          fill="none"
          stroke="var(--color-primary)"
          strokeLinecap="round"
          style={{ opacity: 0, transition: "opacity 300ms" }}
        />
      </svg>
    </motion.span>
  );
};

// Memoized so context-driven re-renders in FormDialog (attemptCount, animate,
// internalOpen) don't re-render the button when its own props/context-derived
// values haven't changed. Pair with the memoized contextValue in FormDialog.
export default memo(SubmitButton);
