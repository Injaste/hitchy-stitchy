import { useRef, useEffect, useState, type FC } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useFormShell } from "./form-context";
import { itemShake } from "@/lib/animations";
import { delay } from "@/lib/utils";

const GAP = 5;
const SW = 2.5;
const BR = 8;
const ARC_PCT = 0.2;
const SPEED_MS = 1500;

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

interface SubmitButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "type"
> {
  children: React.ReactNode;
}

const SubmitButton: FC<SubmitButtonProps> = ({
  children,
  disabled,
  ...props
}) => {
  const { isPending, isSuccess, isError } = useFormShell();
  const [shakeState, setShakeState] = useState<"idle" | "shake">("idle");

  const btnRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);
  const phase = useRef<"idle" | "spinning">("idle");

  useEffect(() => {
    if (!isPending || phase.current !== "idle") return;

    const btn = btnRef.current;
    const svg = svgRef.current;
    const track = trackRef.current;
    const arc = arcRef.current;
    if (!btn || !svg || !track || !arc) return;

    phase.current = "spinning";

    const W = btn.offsetWidth,
      H = btn.offsetHeight;
    const P = getPerimeter(W, H);

    svg.setAttribute("viewBox", `0 0 ${W + GAP * 2} ${H + GAP * 2}`);
    svg.style.width = `${W + GAP * 2}px`;
    svg.style.height = `${H + GAP * 2}px`;

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

    arc.style.transition =
      "stroke-dasharray 200ms cubic-bezier(.4,0,.2,1), stroke-dashoffset 200ms cubic-bezier(.4,0,.2,1)";
    arc.style.strokeDasharray = `${P} 0`;
    arc.style.strokeDashoffset = String(currentOffset);

    delay(200).then(() => {
      arc.style.transition = "opacity 200ms";
      track.style.transition = "opacity 200ms";
      arc.style.opacity = "0";
      track.style.opacity = "0";
      delay(200).then(reset);
    });
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
        type="submit"
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

export default SubmitButton;
