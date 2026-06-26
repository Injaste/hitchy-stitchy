import { Fragment, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import LottieRaw from "lottie-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RSVPForm, RSVPDelete } from "@/pages/wedding/form";
import { AnchorDock } from "@/pages/wedding/anchors";
import { getWeddingDateTime } from "@/pages/wedding/anchors/calendar";
import successCheck from "@/assets/lottie/success-check.json";

import type {
  ThemeProps,
  SectionListValue,
} from "@/pages/wedding/templates/types";
import type { RSVPFormData } from "@/pages/wedding/types";
import { resolveFont } from "@/pages/wedding/templates/engine/fonts";
import { useThemeAssets } from "@/pages/wedding/templates/engine/useThemeAssets";
import { useRsvpSection } from "@/pages/wedding/templates/engine/useRsvpSection";

import type { BlackLuxuryPageConfig } from "./types";
import {
  rsvpClassNames,
  rsvpLabels,
  rsvpDeleteClassNames,
  rsvpDeleteLabels,
} from "./form";
import { blackLuxuryAnchors } from "./anchors";
import slugCss from "./styles.css?inline";

const Lottie = (LottieRaw as any).default ?? LottieRaw;

const DEFAULT_FONTS = {
  couple: resolveFont("Pinyon Script")!,
  number: resolveFont("Playfair Display")!,
  heading: resolveFont("Playfair Display")!,
  body: resolveFont("EB Garamond")!,
};

const CONFETTI_COLORS = ["#e9e1d0", "#cfc7b6", "#b4ab97", "#f6f1e6", "#a59c89"];

// ─── Five-petal blossom motif (black-luxury's own — distinct from the roses) ───

const PETAL = "M0 0 C -3 -4 -3 -9 0 -11 C 3 -9 3 -4 0 0 Z";
const Blossom = ({ t }: { t: string }) => (
  <g transform={t}>
    <path d={PETAL} />
    <path d={PETAL} transform="rotate(72)" />
    <path d={PETAL} transform="rotate(144)" />
    <path d={PETAL} transform="rotate(216)" />
    <path d={PETAL} transform="rotate(288)" />
    <circle r="1.5" fill="var(--bl-emboss)" stroke="none" />
  </g>
);
const SPRIG_LEAF = "M0 0 C 6 -3 13 -2 18 1 C 13 4 6 3 0 0 Z";

const CornerSprig = ({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) => (
  <svg
    viewBox="0 0 64 64"
    width="64"
    height="64"
    aria-hidden="true"
    className={className}
    style={flip ? { transform: "scaleX(-1)" } : undefined}
  >
    <g
      fill="none"
      stroke="var(--bl-emboss)"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Blossom t="translate(20,18) scale(1.15)" />
      <Blossom t="translate(34,32) scale(0.82)" />
    </g>
  </svg>
);

// A right-angle corner floral that frames each corner along both edges — a
// fuller cream cluster trailing down the top and side edges (hero only).
const HeroCornerFloral = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 132 132"
    width="142"
    height="142"
    aria-hidden="true"
    className={className}
  >
    <g
      fill="none"
      stroke="var(--bl-emboss)"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* edge branches forming the L + inner curls */}
      <path d="M6 12 C 45 9, 85 11, 124 9" />
      <path d="M12 6 C 9 45, 11 85, 9 124" />
      <path d="M8 8 C 24 17, 30 28, 30 46" />
      <path d="M16 14 C 30 22, 38 36, 42 56" />
      <path d="M14 16 C 22 30, 36 38, 56 42" />
      {/* blossoms — corner cluster + trailing along both edges */}
      <Blossom t="translate(15,15) scale(1.3)" />
      <Blossom t="translate(32,12) scale(0.9)" />
      <Blossom t="translate(12,32) scale(0.9)" />
      <Blossom t="translate(30,30) scale(0.72)" />
      <Blossom t="translate(23,23) scale(0.6)" />
      <Blossom t="translate(46,14) scale(0.72)" />
      <Blossom t="translate(72,12) scale(0.6)" />
      <Blossom t="translate(102,10) scale(0.5)" />
      <Blossom t="translate(14,46) scale(0.72)" />
      <Blossom t="translate(12,72) scale(0.6)" />
      <Blossom t="translate(10,102) scale(0.5)" />
      <Blossom t="translate(44,40) scale(0.55)" />
      <Blossom t="translate(40,44) scale(0.55)" />
      {/* slim leaves along the arms */}
      <g transform="translate(38,14) rotate(8)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(60,12) rotate(-4)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(86,10) rotate(2)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(112,9) rotate(4)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(14,38) rotate(84)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(12,60) rotate(94)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(10,86) rotate(88)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(9,112) rotate(86)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(36,36) rotate(45)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(26,20) rotate(20)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(20,26) rotate(60)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(52,26) rotate(35)">
        <path d={SPRIG_LEAF} />
      </g>
      <g transform="translate(26,52) rotate(70)">
        <path d={SPRIG_LEAF} />
      </g>
      {/* baby's-breath filler */}
      <g fill="var(--bl-emboss)" stroke="none">
        <circle cx="40" cy="20" r="1" />
        <circle cx="20" cy="40" r="1" />
        <circle cx="64" cy="18" r="0.9" />
        <circle cx="18" cy="64" r="0.9" />
        <circle cx="90" cy="16" r="0.8" />
        <circle cx="16" cy="90" r="0.8" />
        <circle cx="34" cy="34" r="0.8" />
        <circle cx="50" cy="22" r="0.8" />
        <circle cx="22" cy="50" r="0.8" />
      </g>
    </g>
  </svg>
);

const Rose = ({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7 c 2.4 -2 5.4 0 5.4 3.2 c 0 3.2 -4.2 4.4 -6.4 1.2 c -2.2 -3.2 0.2 -7.4 4.4 -7.4" />
    <path d="M11.4 12 c -2.2 3 -5.6 4 -8.4 3" />
    <path d="M12.6 12 c 2.2 3 5.6 4 8.4 3" />
    <path d="M12 11.5 l 0 7" />
  </svg>
);

// Wax-seal stamp — the hero's own five-petal blossom impressed into a cream
// disc, inside a stamped ring of dots. White + black only (no gold).
const WaxSeal = ({
  size = 60,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    aria-hidden="true"
    className={className}
  >
    <circle cx="32" cy="32" r="28" fill="var(--bl-seal)" />
    <circle
      cx="32"
      cy="32"
      r="24"
      fill="none"
      stroke="var(--bl-bg)"
      strokeWidth="0.8"
      opacity="0.4"
    />
    <g fill="var(--bl-bg)" stroke="none">
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={32 + 19.5 * Math.cos(a)}
            cy={32 + 19.5 * Math.sin(a)}
            r="0.8"
          />
        );
      })}
    </g>
    <g
      transform="translate(32,32) scale(1.35)"
      fill="none"
      stroke="var(--bl-bg)"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PETAL} />
      <path d={PETAL} transform="rotate(72)" />
      <path d={PETAL} transform="rotate(144)" />
      <path d={PETAL} transform="rotate(216)" />
      <path d={PETAL} transform="rotate(288)" />
      <circle r="1.3" fill="var(--bl-bg)" stroke="none" />
    </g>
  </svg>
);

// Gilded lozenge divider — black-luxury's own (not cream's rose).
const RoseDivider = ({ className = "" }: { className?: string }) => (
  <div
    className={cn(
      "flex items-center justify-center gap-3 text-(--bl-emboss)",
      className,
    )}
  >
    <span className="h-px w-16 bg-linear-to-r from-transparent to-current" />
    <span className="flex items-center gap-1.5 shrink-0">
      <span className="size-1 rotate-45 bg-current" />
      <span className="size-1.5 rotate-45 border border-current" />
      <span className="size-1 rotate-45 bg-current" />
    </span>
    <span className="h-px w-16 bg-linear-to-l from-transparent to-current" />
  </div>
);

// ─── Formal engraved date — spelled out, black-tie style (its own, not cream's
//     numeric divided-bar treatment).
const DAY_ORDINALS = [
  "", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh",
  "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth",
  "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth",
  "Twenty-First", "Twenty-Second", "Twenty-Third", "Twenty-Fourth", "Twenty-Fifth",
  "Twenty-Sixth", "Twenty-Seventh", "Twenty-Eighth", "Twenty-Ninth", "Thirtieth",
  "Thirty-First",
];

const FormalDate = ({ iso }: { iso: string | null | undefined }) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  const day = DAY_ORDINALS[d.getDate()] ?? String(d.getDate());
  return (
    <div className="flex flex-col items-center gap-3 text-(--bl-primary)">
      <span className="text-2xs uppercase tracking-[0.45em] text-(--bl-accent)">
        {weekday}
      </span>
      <span className="text-2xl sm:text-3xl italic leading-tight">
        the {day} of {month}
      </span>
      <span className="text-sm tracking-[0.4em] tabular-nums text-(--bl-muted-fg)">
        {d.getFullYear()}
      </span>
    </div>
  );
};

// ─── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = (delay: number, y = 18, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});
const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration, delay, ease: "easeOut" } },
});
const HERO_BASE = 1.1;
const heroMake = (delay: number, y = 16, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay: delay + HERO_BASE, ease: [0.16, 1, 0.3, 1] },
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ItinerarySection {
  title: string;
  items: { time: string; label?: string }[];
}
function parseItinerary(
  raw: string | SectionListValue | null | undefined,
): ItinerarySection[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((s) => s && Array.isArray(s.items))
      .map((s) => ({
        title: (s.title ?? "").trim(),
        items: s.items
          .map((it) => {
            const time = (it.time ?? "").trim();
            const label = (it.label ?? "").trim();
            return { time, ...(label ? { label } : {}) };
          })
          .filter((it) => it.time || it.label),
      }))
      .filter((s) => s.title || s.items.length);
  }
  if (!raw?.trim()) return [];
  return raw
    .split(/\n[ \t]*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return [];
      const [title, ...rest] = lines;
      const items = rest.map((line) => {
        const idx = line.indexOf("|");
        if (idx === -1) return { time: line };
        return {
          time: line.slice(0, idx).trim(),
          label: line.slice(idx + 1).trim(),
        };
      });
      return [{ title, items }];
    });
}

const UNITS: {
  key: "days" | "hours" | "minutes" | "seconds";
  label: string;
}[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];
function useCountdown(target: Date | null) {
  const calc = () => {
    if (!target) return null;
    const d = target.getTime() - Date.now();
    if (d <= 0) return null;
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return t;
}
const InlineCountdown = ({ target }: { target: Date | null }) => {
  const t = useCountdown(target);
  if (!t) return null;
  return (
    <div className="flex items-center justify-center">
      {UNITS.map((u, i) => (
        <div key={u.key} className="flex items-center">
          {i > 0 && (
            <span className="mx-1.5 text-(--bl-accent) text-xs">·</span>
          )}
          <div className="flex flex-col items-center w-14">
            <span className="bl-countdown-number text-3xl text-(--bl-primary) tabular-nums leading-none">
              {String(t[u.key]).padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-3xs uppercase tracking-[0.2em] text-(--bl-muted-fg)">
              {u.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Preloader ──────────────────────────────────────────────────────────────────

const HOLD_MS = 1000;
const Preloader = ({
  loaderReady,
  onExitComplete,
}: {
  loaderReady: boolean;
  onExitComplete: () => void;
}) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = visible ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [visible]);
  useEffect(() => {
    if (!loaderReady) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setLeaving(true);
      setTimeout(onExitComplete, 500);
    }, HOLD_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loaderReady]);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-(--bl-bg) text-(--bl-primary)"
          initial={{ opacity: 1 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (leaving) setVisible(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <WaxSeal size={76} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Template ────────────────────────────────────────────────────────────────

const BlackLuxury = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<BlackLuxuryPageConfig>;
  const fonts = useMemo(
    () => ({
      couple: resolveFont(config.font_couple) ?? DEFAULT_FONTS.couple,
      heading: resolveFont(config.font_heading) ?? DEFAULT_FONTS.heading,
      body: resolveFont(config.font_body) ?? DEFAULT_FONTS.body,
      number: DEFAULT_FONTS.number,
    }),
    [config.font_couple, config.font_heading, config.font_body],
  );
  const rootStyle = useThemeAssets({ css: slugCss, fonts });
  const [ready, setReady] = useState(false);
  const rsvp = useRsvpSection(eventConfig, { confettiColors: CONFETTI_COLORS });

  const weddingDate = getWeddingDateTime(
    eventConfig.event_date,
    eventConfig.event_time_start,
  );
  const detailsList = [
    ...(config.date ? [{ title: "Date", detail: config.date }] : []),
    ...(config.time ? [{ title: "Time", detail: config.time }] : []),
    ...(config.venue_name
      ? [{ title: "Venue", detail: config.venue_name }]
      : []),
    ...(config.dress_code
      ? [{ title: "Attire", detail: config.dress_code }]
      : []),
  ];
  const itinerarySections = parseItinerary(config.itinerary);
  const mergedRsvpLabels = {
    ...rsvpLabels,
    name: {
      ...rsvpLabels.name,
      label: config.rsvp_label_name ?? rsvpLabels.name.label,
    },
    phone: {
      ...rsvpLabels.phone,
      label: config.rsvp_label_phone ?? rsvpLabels.phone.label,
    },
    guestCount: {
      ...rsvpLabels.guestCount,
      label: config.rsvp_label_guest_count ?? rsvpLabels.guestCount.label,
    },
    message: {
      ...rsvpLabels.message,
      label: config.rsvp_label_message ?? rsvpLabels.message.label,
    },
    code: { label: "Invite Code", placeholder: "Enter your code" },
  };

  const renderClosed = (key: string, message: string) => (
    <motion.p
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center text-(--bl-muted-fg) italic leading-relaxed py-8"
    >
      {message}
    </motion.p>
  );
  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie
        animationData={successCheck}
        loop={false}
        style={{ width: 76, height: 76, margin: "0 auto" }}
      />
      <motion.div
        key="success-content"
        initial={rsvp.submitted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3 className="text-2xl font-medium my-3 text-(--bl-primary) italic">
          {config.rsvp_success_heading}
        </h3>
        <motion.p
          initial={rsvp.submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="text-(--bl-muted-fg) leading-relaxed italic mb-6"
        >
          {eventConfig.confirmation_message}
        </motion.p>
        <motion.div
          initial={rsvp.submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          className="flex gap-3 justify-center"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => rsvp.setIsEditing(true)}
            className="rounded-sm bg-transparent text-(--bl-fg) border-(--bl-accent)/50 hover:bg-(--bl-bg-2) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"
          >
            <Edit2 size={14} className="text-(--bl-primary)" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rsvp.removePending}
            onClick={() => rsvp.setShowDeleteDialog(true)}
            className="rounded-sm bg-transparent text-(--bl-fg) border-(--bl-accent)/50 hover:border-(--bl-destructive)/50 hover:text-(--bl-destructive) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"
          >
            <Trash2 size={14} className="text-(--bl-primary)" />
            {rsvp.removePending ? "Removing…" : "Delete"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
  const renderForm = () => (
    <div key={rsvp.isEditing ? "edit-form" : "new-form"}>
      <RSVPForm
        key={rsvp.isEditing ? "edit" : "new"}
        defaultValues={
          rsvp.isEditing && rsvp.existingRSVP
            ? {
                name: rsvp.existingRSVP.name,
                phone: rsvp.existingRSVP.phone,
                guestCount: rsvp.existingRSVP.guest_count,
                message: rsvp.existingRSVP.message ?? undefined,
              }
            : undefined
        }
        onSubmit={(value: RSVPFormData) => rsvp.handleSubmit(value)}
        onCancel={rsvp.isEditing ? () => rsvp.setIsEditing(false) : undefined}
        isEditing={rsvp.isEditing}
        rsvpConfig={rsvp.rsvpConfig}
        limits={rsvp.limits}
        showCode={rsvp.showCode}
        error={rsvp.submitError}
        classNames={rsvpClassNames}
        labels={mergedRsvpLabels}
      />
    </div>
  );
  const renderRsvpBody = () => {
    if (rsvp.isDeadlinePassed)
      return renderClosed("deadline", rsvp.deadlineMessage);
    if (rsvp.existingRSVP && !rsvp.isEditing) return renderSuccess();
    if (rsvp.isLoading) return renderClosed("loading", "Checking RSVP status…");
    return renderForm();
  };
  const anchorItems = blackLuxuryAnchors.items.filter(
    (item) => !item.when || item.when(config),
  );

  return (
    <div
      className="bl-root relative min-h-svh bg-(--bl-bg) text-(--bl-fg)"
      style={rootStyle}
    >
      <Preloader
        loaderReady={!!loaderReady}
        onExitComplete={() => setReady(true)}
      />

      {/* ── Hero ── gilded frame, right-angle corner florals, script names */}
      <section
        id="hero"
        className="relative min-h-svh flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-5 border border-(--bl-emboss)/20" />
        <HeroCornerFloral className="absolute top-5 left-5 opacity-95" />
        <HeroCornerFloral className="absolute top-5 right-5 opacity-95 -scale-x-100" />
        <HeroCornerFloral className="absolute bottom-5 left-5 opacity-95 -scale-y-100" />
        <HeroCornerFloral className="absolute bottom-5 right-5 opacity-95 -scale-100" />
        <motion.div
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="w-full max-w-lg mx-auto"
        >
          <motion.p
            variants={heroMake(0)}
            className="text-(--bl-muted-fg) text-sm tracking-[0.18em] uppercase mb-6 whitespace-pre-line leading-relaxed"
          >
            {config.greeting}
          </motion.p>
          <motion.div variants={heroMake(0.3)}>
            <RoseDivider className="mb-8" />
          </motion.div>
          <motion.h1
            variants={heroMake(0.6, 22, 1)}
            className="bl-couple-names text-5xl sm:text-6xl text-(--bl-primary) leading-none"
          >
            {config.groom_name}
          </motion.h1>
          <motion.p
            variants={heroMake(0.85)}
            className="bl-couple-names text-3xl text-(--bl-accent) my-1"
          >
            &amp;
          </motion.p>
          <motion.h1
            variants={heroMake(1.0, 22, 1)}
            className="bl-couple-names text-5xl sm:text-6xl text-(--bl-primary) leading-none"
          >
            {config.bride_name}
          </motion.h1>
          <motion.div variants={heroMake(1.35)} className="mt-9">
            <FormalDate iso={eventConfig.event_date} />
          </motion.div>
          {weddingDate && (
            <motion.div variants={heroMake(1.6)} className="mt-9">
              <InlineCountdown target={weddingDate} />
            </motion.div>
          )}
          {config.quote && (
            <motion.div variants={heroMake(1.85)} className="mt-10">
              <RoseDivider className="mb-6" />
              <p className="text-(--bl-fg)/80 leading-relaxed italic whitespace-pre-line max-w-md mx-auto">
                {config.quote}
              </p>
              {config.quote_source && (
                <span className="block mt-3 text-(--bl-muted-fg) text-xs tracking-[0.25em] uppercase">
                  {config.quote_source}
                </span>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Invitation + Details ── */}
      <section id="details" className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-md mx-auto text-center"
        >
          <motion.h2
            variants={fadeUp(0.1, 14, 0.7)}
            className="text-3xl font-medium italic text-(--bl-primary)"
          >
            {config.section_title ?? "A celebration of love"}
          </motion.h2>
          {config.invitation_body && (
            <motion.p
              variants={fadeUp(0.2, 14, 0.8)}
              className="text-(--bl-muted-fg) leading-relaxed mt-6"
            >
              {config.invitation_body}
            </motion.p>
          )}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-8">
              <p className="text-(--bl-muted-fg) text-sm mb-2">
                {config.blessings_prefix}
              </p>
              {config.blessings_name && (
                <h3 className="text-2xl font-medium text-(--bl-primary) whitespace-pre-line italic">
                  {config.blessings_name}
                </h3>
              )}
              {config.blessings_label && (
                <p className="text-(--bl-muted-fg) text-sm mt-1">
                  {config.blessings_label}
                </p>
              )}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <>
              <motion.div variants={fadeIn(0.3)}>
                <RoseDivider className="my-12" />
              </motion.div>
              <motion.div
                variants={fadeIn(0.4)}
                className="flex flex-col items-center gap-9"
              >
                {detailsList.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp(idx * 0.08, 10, 0.6)}
                    className="flex flex-col items-center"
                  >
                    <p className="text-2xs uppercase tracking-[0.35em] text-(--bl-accent) mb-2.5">
                      {item.title}
                    </p>
                    <p className="text-xl text-(--bl-fg)">{item.detail}</p>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* ── Itinerary ── */}
      {itinerarySections.length > 0 && (
        <section id="itinerary" className="py-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mb-10"
            >
              <motion.h2
                variants={fadeUp(0.1, 14, 0.7)}
                className="text-3xl font-medium italic text-(--bl-primary)"
              >
                {config.itinerary_title ?? "Programme"}
              </motion.h2>
            </motion.div>
            <div className="flex flex-col">
              {itinerarySections.map((section, si) => (
                <motion.div
                  key={si}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp(0, 14, 0.6)}
                >
                  {si > 0 && <RoseDivider className="my-7" />}
                  <p className="text-xl tracking-[0.18em] uppercase text-(--bl-primary) mb-4">
                    {section.title}
                  </p>
                  <div className="mx-auto max-w-72 grid grid-cols-[auto_1fr] items-baseline gap-x-8 gap-y-2 text-sm">
                    {section.items.map((item, ii) => (
                      <Fragment key={ii}>
                        <span className="tabular-nums text-(--bl-accent) text-left">
                          {item.time}
                        </span>
                        <span className="text-(--bl-fg) text-right">
                          {item.label ?? ""}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {config.footnote && (
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeIn(0.1)}
                className="mt-10 text-(--bl-muted-fg) italic text-sm"
              >
                {config.footnote}
              </motion.p>
            )}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section
        ref={rsvp.sectionRef}
        id="rsvp"
        className="py-20 px-6 bg-(--bl-bg-2)/50"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            layout
            transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeIn(0, 0.8)}
            className="relative rounded-sm border border-(--bl-accent)/40 bg-(--bl-card) p-8 shadow-sm"
          >
            <CornerSprig className="absolute top-3 left-3 opacity-70" />
            <CornerSprig className="absolute top-3 right-3 opacity-70" flip />
            <div className="text-center mb-8">
              <motion.div
                variants={fadeIn(0)}
                className="flex justify-center mb-4 text-(--bl-primary)/70"
              >
                <Rose size={34} />
              </motion.div>
              <motion.h2
                variants={fadeUp(0.1, 12, 0.6)}
                className="text-3xl font-medium text-(--bl-primary) italic"
              >
                RSVP
              </motion.h2>
              <motion.p
                variants={fadeUp(0.2, 10, 0.6)}
                className="text-(--bl-muted-fg) italic mt-2 text-sm"
              >
                {config.rsvp_subtitle}
              </motion.p>
            </div>
            <AnimatePresence mode="popLayout">
              {renderRsvpBody()}
            </AnimatePresence>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-14 text-center"
          >
            <motion.div
              variants={fadeIn(0)}
              className="flex justify-center mb-5 text-(--bl-primary)/70"
            >
              <WaxSeal size={56} />
            </motion.div>
            <motion.p
              variants={fadeUp(0.1, 10, 0.6)}
              className="text-2xs uppercase tracking-[0.3em] text-(--bl-muted-fg) mb-4"
            >
              {config.footer_tagline}
            </motion.p>
            <motion.h2
              variants={fadeUp(0.2, 12, 0.7)}
              className="bl-couple-names text-4xl text-(--bl-primary) leading-tight"
            >
              <span className="block">{config.groom_name}</span>
              <span className="block text-(--bl-accent) text-2xl my-0.5">
                &amp;
              </span>
              <span className="block">{config.bride_name}</span>
            </motion.h2>
          </motion.div>
        </div>
        <RSVPDelete
          open={rsvp.showDeleteDialog}
          onConfirm={rsvp.handleDeleteConfirm}
          onCancel={() => rsvp.setShowDeleteDialog(false)}
          classNames={rsvpDeleteClassNames}
          labels={rsvpDeleteLabels}
        />
      </section>

      <AnchorDock
        ready={ready}
        eventConfig={eventConfig}
        scrollItems={anchorItems}
        classNames={blackLuxuryAnchors.classNames}
        drawerClassNames={blackLuxuryAnchors.drawer}
        labels={blackLuxuryAnchors.labels}
        calendar={{
          title: `Wedding of ${config.groom_name ?? ""} & ${config.bride_name ?? ""}`,
          location: config.venue_address,
        }}
        map={{
          embedUrl: config.venue_map_embed_url,
          link: config.venue_map_link,
          address: config.venue_address,
        }}
      />
    </div>
  );
};

export default BlackLuxury;
