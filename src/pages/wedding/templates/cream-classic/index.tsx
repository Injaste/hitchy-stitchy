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

import type { CreamClassicPageConfig } from "./types";
import {
  rsvpClassNames,
  rsvpLabels,
  rsvpDeleteClassNames,
  rsvpDeleteLabels,
} from "./form";
import { creamClassicAnchors } from "./anchors";
import slugCss from "./styles.css?inline";

const Lottie = (LottieRaw as any).default ?? LottieRaw;

const DEFAULT_FONTS = {
  couple: resolveFont("Great Vibes")!,
  number: resolveFont("Cormorant Garamond")!,
  heading: resolveFont("Cormorant Garamond")!,
  body: resolveFont("EB Garamond")!,
};

const CONFETTI_COLORS = ["#dcd2bf", "#b9ab97", "#8a7d6c", "#fbf7ef", "#4a3f34"];

// ─── Embossed corner rose sprig ───────────────────────────────────────────────

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
      stroke="var(--cl-emboss)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 30 C 12 26, 20 18, 24 6" />
      <path d="M30 2 C 26 12, 18 20, 6 24" />
      <path d="M24 6 c 4 -3 9 0 9 5 c 0 5 -6 7 -10 3 c -4 -4 -2 -11 4 -12" />
      <path d="M6 24 c -3 4 0 9 5 9 c 5 0 7 -6 3 -10 c -4 -4 -11 -2 -12 4" />
      <path d="M16 16 c 6 -5 13 -4 17 0 c -4 5 -12 5 -17 0 Z" />
      <path d="M30 30 c 5 -6 12 -7 17 -3 c -4 5 -12 6 -17 3 Z" />
    </g>
  </svg>
);

// A lush, frame-like floral corner — hero only. Long trailing branches along
// both edges with a cluster of open roses, leaves, buds and baby's-breath.
const ROSE =
  "M0 0 c 4 -3 9 0 9 5 c 0 5 -6 7 -10 3 c -4 -4 -2 -11 4 -12 c 6 -2 13 3 13 10";
const LEAF = "M0 0 c 6 -5 14 -4 18 1 c -5 5 -13 5 -18 -1 Z";

const HeroCornerFloral = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 184 184"
    width="176"
    height="176"
    aria-hidden="true"
    className={className}
  >
    <g
      fill="none"
      stroke="var(--cl-emboss)"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* long trailing branches sweep down both edges → a fuller frame */}
      <path d="M4 118 C 26 98, 40 66, 46 34 C 49 18, 58 9, 80 7" />
      <path d="M118 4 C 98 26, 66 40, 34 46 C 18 49, 9 58, 7 80" />
      <path d="M10 44 C 32 50, 48 68, 56 94" />
      <path d="M44 10 C 50 32, 68 48, 94 56" />
      <path d="M74 8 C 84 20, 98 24, 116 22" />
      <path d="M8 74 C 20 84, 24 98, 22 116" />
      {/* roses — seven, varied size, clustered at the corner and trailing out */}
      <g transform="translate(38,38) scale(1.7)">
        <path d={ROSE} />
      </g>
      <g transform="translate(66,18) scale(1.1)">
        <path d={ROSE} />
      </g>
      <g transform="translate(18,66) scale(1.1)">
        <path d={ROSE} />
      </g>
      <g transform="translate(94,14) scale(0.85)">
        <path d={ROSE} />
      </g>
      <g transform="translate(14,94) scale(0.85)">
        <path d={ROSE} />
      </g>
      <g transform="translate(62,56) scale(1.2)">
        <path d={ROSE} />
      </g>
      <g transform="translate(116,30) scale(0.7)">
        <path d={ROSE} />
      </g>
      <g transform="translate(30,116) scale(0.7)">
        <path d={ROSE} />
      </g>
      {/* leaves */}
      <g transform="translate(82,26) rotate(16)">
        <path d={LEAF} />
      </g>
      <g transform="translate(26,82) rotate(74)">
        <path d={LEAF} />
      </g>
      <g transform="translate(70,48) rotate(-16)">
        <path d={LEAF} />
      </g>
      <g transform="translate(48,70) rotate(62)">
        <path d={LEAF} />
      </g>
      <g transform="translate(104,20) rotate(8)">
        <path d={LEAF} />
      </g>
      <g transform="translate(20,104) rotate(82)">
        <path d={LEAF} />
      </g>
      <g transform="translate(34,24) rotate(33)">
        <path d={LEAF} />
      </g>
      <g transform="translate(24,34) rotate(54)">
        <path d={LEAF} />
      </g>
      <g transform="translate(56,40) rotate(2)">
        <path d={LEAF} />
      </g>
      <g transform="translate(40,56) rotate(78)">
        <path d={LEAF} />
      </g>
      <g transform="translate(128,40) rotate(20)">
        <path d={LEAF} />
      </g>
      <g transform="translate(40,128) rotate(70)">
        <path d={LEAF} />
      </g>
      {/* buds */}
      <path d="M118 18 c 5 -1 8 3 6 8 c -5 1 -8 -3 -6 -8 Z" />
      <path d="M18 118 c -1 5 3 8 8 6 c 1 -5 -3 -8 -8 -6 Z" />
      <path d="M132 34 c 5 0 7 4 5 9" />
      <path d="M34 132 c 0 5 4 7 9 5" />
      {/* baby's-breath filler */}
      <g fill="var(--cl-emboss)" stroke="none">
        <circle cx="120" cy="46" r="1.3" />
        <circle cx="126" cy="52" r="1.2" />
        <circle cx="118" cy="54" r="1.1" />
        <circle cx="46" cy="120" r="1.3" />
        <circle cx="52" cy="126" r="1.2" />
        <circle cx="54" cy="118" r="1.1" />
        <circle cx="100" cy="34" r="1.1" />
        <circle cx="34" cy="100" r="1.1" />
        <circle cx="78" cy="66" r="1" />
        <circle cx="66" cy="78" r="1" />
        <circle cx="138" cy="56" r="1.1" />
        <circle cx="56" cy="138" r="1.1" />
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

const RoseDivider = ({ className = "" }: { className?: string }) => (
  <div
    className={cn(
      "flex items-center justify-center gap-3 text-(--cl-accent)",
      className,
    )}
  >
    <span className="h-px w-14 bg-linear-to-r from-transparent to-current" />
    <Rose size={20} className="text-(--cl-primary)/70 shrink-0" />
    <span className="h-px w-14 bg-linear-to-l from-transparent to-current" />
  </div>
);

// ─── Divided date — JULY · 25 · 2026 from the ISO countdown date ──────────────

const DividedDate = ({ iso }: { iso: string | null | undefined }) => {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  return (
    <div className="flex items-center justify-center gap-4 text-(--cl-primary)">
      <span className="text-base sm:text-lg tracking-[0.2em] uppercase">
        {month}
      </span>
      <span className="h-8 w-px bg-(--cl-accent)" />
      <span className="text-3xl font-medium tabular-nums leading-none">
        {d.getDate()}
      </span>
      <span className="h-8 w-px bg-(--cl-accent)" />
      <span className="text-base sm:text-lg tracking-[0.2em] tabular-nums">
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
          {i > 0 && <span className="mx-3 text-(--cl-accent) text-xs">·</span>}
          <div className="flex flex-col items-center w-16">
            <span className="cl-countdown-number text-3xl text-(--cl-primary) tabular-nums leading-none">
              {String(t[u.key]).padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-3xs uppercase tracking-[0.2em] text-(--cl-muted-fg)">
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
          className="fixed inset-0 z-100 flex items-center justify-center bg-(--cl-bg) text-(--cl-primary)"
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
            <Rose size={68} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Template ────────────────────────────────────────────────────────────────

const CreamClassic = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<CreamClassicPageConfig>;
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
      className="text-center text-(--cl-muted-fg) italic leading-relaxed py-8"
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
        <h3 className="text-2xl font-medium my-3 text-(--cl-primary) italic">
          {config.rsvp_success_heading}
        </h3>
        <motion.p
          initial={rsvp.submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="text-(--cl-muted-fg) leading-relaxed italic mb-6"
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
            className="rounded-sm bg-transparent text-(--cl-fg) border-(--cl-accent)/50 hover:bg-(--cl-bg-2) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"
          >
            <Edit2 size={14} className="text-(--cl-primary)" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rsvp.removePending}
            onClick={() => rsvp.setShowDeleteDialog(true)}
            className="rounded-sm bg-transparent text-(--cl-fg) border-(--cl-accent)/50 hover:border-(--cl-destructive)/50 hover:text-(--cl-destructive) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"
          >
            <Trash2 size={14} className="text-(--cl-primary)" />
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
  const anchorItems = creamClassicAnchors.items.filter(
    (item) => !item.when || item.when(config),
  );

  return (
    <div
      className="cl-root relative min-h-svh bg-(--cl-bg) text-(--cl-fg)"
      style={rootStyle}
    >
      <Preloader
        loaderReady={!!loaderReady}
        onExitComplete={() => setReady(true)}
      />

      {/* ── Hero ── embossed corner roses, script names, divided date */}
      <section
        id="hero"
        className="relative min-h-svh flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden"
      >
        <HeroCornerFloral className="absolute top-3 left-3 opacity-90" />
        <HeroCornerFloral className="absolute top-3 right-3 opacity-90 -scale-x-100" />
        <HeroCornerFloral className="absolute bottom-3 left-3 opacity-90 -scale-y-100" />
        <HeroCornerFloral className="absolute bottom-3 right-3 opacity-90 -scale-100" />
        <motion.div
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="w-full max-w-lg mx-auto"
        >
          <motion.p
            variants={heroMake(0)}
            className="text-(--cl-muted-fg) text-sm tracking-[0.18em] uppercase mb-6 whitespace-pre-line leading-relaxed"
          >
            {config.greeting}
          </motion.p>
          <motion.div variants={heroMake(0.3)}>
            <RoseDivider className="mb-8" />
          </motion.div>
          <motion.h1
            variants={heroMake(0.6, 22, 1)}
            className="cl-couple-names text-5xl sm:text-6xl text-(--cl-primary) leading-none"
          >
            {config.groom_name}
          </motion.h1>
          <motion.p
            variants={heroMake(0.85)}
            className="cl-couple-names text-3xl text-(--cl-accent) my-1"
          >
            &amp;
          </motion.p>
          <motion.h1
            variants={heroMake(1.0, 22, 1)}
            className="cl-couple-names sm:text-6xl text-(--cl-primary) leading-none"
          >
            {config.bride_name}
          </motion.h1>
          <motion.div variants={heroMake(1.35)} className="mt-9">
            <DividedDate iso={eventConfig.event_date} />
          </motion.div>
          {weddingDate && (
            <motion.div variants={heroMake(1.6)} className="mt-9">
              <InlineCountdown target={weddingDate} />
            </motion.div>
          )}
          {config.quote && (
            <motion.div variants={heroMake(1.85)} className="mt-10">
              <RoseDivider className="mb-6" />
              <p className="text-(--cl-fg)/80 leading-relaxed italic whitespace-pre-line max-w-md mx-auto">
                {config.quote}
              </p>
              {config.quote_source && (
                <span className="block mt-3 text-(--cl-muted-fg) text-xs tracking-[0.25em] uppercase">
                  {config.quote_source}
                </span>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Invitation + Details ── */}
      <section id="details" className="py-20 px-6 bg-(--cl-bg-2)/50">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative max-w-lg mx-auto rounded-sm border border-(--cl-accent)/40 bg-(--cl-card)/85 p-8 sm:p-10 text-center shadow-sm"
        >
          <CornerSprig className="absolute top-3 left-3 opacity-70" />
          <CornerSprig className="absolute bottom-3 right-3 opacity-70 -scale-100" />
          <motion.div
            variants={fadeIn(0)}
            className="flex justify-center mb-5 text-(--cl-primary)/70"
          >
            <Rose size={34} />
          </motion.div>
          <motion.h2
            variants={fadeUp(0.1, 14, 0.7)}
            className="text-3xl font-medium italic text-(--cl-primary) mb-5"
          >
            {config.section_title ?? "A celebration of love"}
          </motion.h2>
          {config.invitation_body && (
            <motion.p
              variants={fadeUp(0.2, 14, 0.8)}
              className="text-(--cl-muted-fg) leading-relaxed"
            >
              {config.invitation_body}
            </motion.p>
          )}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-8">
              <p className="text-(--cl-muted-fg) text-sm mb-2">
                {config.blessings_prefix}
              </p>
              {config.blessings_name && (
                <h3 className="text-2xl font-medium text-(--cl-primary) whitespace-pre-line italic">
                  {config.blessings_name}
                </h3>
              )}
              {config.blessings_label && (
                <p className="text-(--cl-muted-fg) text-sm mt-1">
                  {config.blessings_label}
                </p>
              )}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <motion.div variants={fadeIn(0.3)} className="mt-8 flex flex-col">
              {detailsList.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp(idx * 0.08, 10, 0.6)}
                  className="py-3.5 border-t border-(--cl-accent)/25 last:border-b"
                >
                  <p className="text-2xs uppercase tracking-[0.3em] text-(--cl-accent) mb-1">
                    {item.title}
                  </p>
                  <p className="text-lg text-(--cl-fg)">{item.detail}</p>
                </motion.div>
              ))}
            </motion.div>
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
              <motion.div
                variants={fadeIn(0)}
                className="flex justify-center mb-4 text-(--cl-primary)/70"
              >
                <Rose size={32} />
              </motion.div>
              <motion.h2
                variants={fadeUp(0.1, 14, 0.7)}
                className="text-3xl font-medium italic text-(--cl-primary)"
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
                  <p className="text-xl tracking-[0.18em] uppercase text-(--cl-primary) mb-4">
                    {section.title}
                  </p>
                  <div className="mx-auto max-w-72 grid grid-cols-[auto_1fr] items-baseline gap-x-8 gap-y-2 text-sm">
                    {section.items.map((item, ii) => (
                      <Fragment key={ii}>
                        <span className="tabular-nums text-(--cl-accent) text-left">
                          {item.time}
                        </span>
                        <span className="text-(--cl-fg) text-right">
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
                className="mt-10 text-(--cl-muted-fg) italic text-sm"
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
        className="py-20 px-6 bg-(--cl-bg-2)/50"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            layout
            transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeIn(0, 0.8)}
            className="relative rounded-sm border border-(--cl-accent)/40 bg-(--cl-card) p-8 shadow-sm"
          >
            <CornerSprig className="absolute top-3 left-3 opacity-70" />
            <CornerSprig className="absolute top-3 right-3 opacity-70" flip />
            <div className="text-center mb-8">
              <motion.div
                variants={fadeIn(0)}
                className="flex justify-center mb-4 text-(--cl-primary)/70"
              >
                <Rose size={34} />
              </motion.div>
              <motion.h2
                variants={fadeUp(0.1, 12, 0.6)}
                className="text-3xl font-medium text-(--cl-primary) italic"
              >
                RSVP
              </motion.h2>
              <motion.p
                variants={fadeUp(0.2, 10, 0.6)}
                className="text-(--cl-muted-fg) italic mt-2 text-sm"
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
              className="flex justify-center mb-5 text-(--cl-primary)/70"
            >
              <Rose size={28} />
            </motion.div>
            <motion.p
              variants={fadeUp(0.1, 10, 0.6)}
              className="text-2xs uppercase tracking-[0.3em] text-(--cl-muted-fg) mb-4"
            >
              {config.footer_tagline}
            </motion.p>
            <motion.h2
              variants={fadeUp(0.2, 12, 0.7)}
              className="cl-couple-names text-4xl text-(--cl-primary) leading-tight"
            >
              <span className="block">{config.groom_name}</span>
              <span className="block text-(--cl-accent) text-2xl my-0.5">
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
        classNames={creamClassicAnchors.classNames}
        drawerClassNames={creamClassicAnchors.drawer}
        labels={creamClassicAnchors.labels}
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

export default CreamClassic;
