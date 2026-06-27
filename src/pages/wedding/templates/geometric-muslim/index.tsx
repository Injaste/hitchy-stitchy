import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Calendar, Clock, MapPin, Star, Edit2, Trash2 } from "lucide-react";
import LottieRaw from "lottie-react";

import { Button } from "@/components/ui/button";
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

import type { GeometricMuslimPageConfig } from "./types";
import {
  rsvpClassNames,
  rsvpLabels,
  rsvpDeleteClassNames,
  rsvpDeleteLabels,
} from "./form";
import { geometricMuslimAnchors } from "./anchors";
import slugCss from "./styles.css?inline";

const Lottie = (LottieRaw as any).default ?? LottieRaw;

const DEFAULT_FONTS = {
  couple: resolveFont("Great Vibes")!,
  number: resolveFont("Cinzel")!,
  heading: resolveFont("Cormorant Garamond")!,
  body: resolveFont("EB Garamond")!,
};

const CONFETTI_COLORS = ["#c9a86a", "#e7d09a", "#ffffff", "#9aa3bf", "#0e1f47"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

// ─── Geometry primitives ──────────────────────────────────────────────────────

function starPoints(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points = 8,
) {
  const step = Math.PI / points;
  let out = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    out += `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)} `;
  }
  return out.trim();
}

const KhatamStar = ({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={className}
    aria-hidden
  >
    <polygon
      points={starPoints(50, 50, 47, 21)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    />
    <polygon
      points={starPoints(50, 50, 31, 14)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      opacity={0.7}
    />
    <circle cx={50} cy={50} r={5.5} fill="currentColor" />
  </svg>
);


// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = (delay: number, y = 20, duration = 0.8): Variants => ({
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
const lineGrow: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
const railGrow: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
};

const HERO_BASE = 1.3;
const heroMake = (delay: number, y = 20, duration = 0.7): Variants => ({
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
    .map((block) => block.trim())
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

// Local inline countdown — a single strip, not boxed cards (CountdownTimer's
// fixed Card grid uses global theme tokens that clash with this dark palette).
const UNITS: {
  key: "days" | "hours" | "minutes" | "seconds";
  label: string;
}[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
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
    <div className="flex items-stretch justify-center divide-x divide-(--gm-primary)/20">
      {UNITS.map((u) => (
        <div key={u.key} className="flex flex-col items-center w-20">
          <span className="gm-countdown-number text-3xl text-(--gm-gold-soft) tabular-nums leading-none">
            {String(t[u.key]).padStart(2, "0")}
          </span>
          <span className="mt-2 text-3xs uppercase tracking-[0.25em] text-(--gm-muted-fg)">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Left-aligned, numbered editorial section heading.
const SectionHeading = ({ index, title }: { index: number; title: string }) => (
  <div className="mb-12">
    <motion.div
      variants={fadeIn(0)}
      className="flex items-center gap-3 text-(--gm-primary)"
    >
      <span className="gm-countdown-number text-lg text-(--gm-primary)/60">
        {ROMAN[index]}
      </span>
      <motion.span
        variants={lineGrow}
        style={{ originX: 0 }}
        className="h-px w-12 bg-(--gm-primary)/40"
      />
    </motion.div>
    <motion.h2
      variants={fadeUp(0.1, 16, 0.7)}
      className="mt-3 text-3xl font-bold italic text-(--gm-gold-soft)"
    >
      {title}
    </motion.h2>
  </div>
);

// ─── Curtain preloader ────────────────────────────────────────────────────────

const CURTAIN_DURATION_S = 1.8;
const HOLD_MS = 1100;
const CURTAIN_EASE = [0.7, 0, 0.2, 1] as const;

const CurtainPreloader = ({
  loaderReady,
  onExitComplete,
  groomInitial,
  brideInitial,
}: {
  loaderReady: boolean;
  onExitComplete: () => void;
  groomInitial: string;
  brideInitial: string;
}) => {
  const [phase, setPhase] = useState<"sealed" | "opening">("sealed");
  const [visible, setVisible] = useState(true);

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
      setPhase("opening");
      setTimeout(onExitComplete, (CURTAIN_DURATION_S * 1000) / 2);
    }, HOLD_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loaderReady]);

  const topHalf: Variants = {
    sealed: { y: "0%" },
    opening: {
      y: "-100%",
      transition: {
        duration: CURTAIN_DURATION_S,
        ease: CURTAIN_EASE,
        delay: 0.35,
      },
    },
  };
  const bottomHalf: Variants = {
    sealed: { y: "0%" },
    opening: {
      y: "100%",
      transition: {
        duration: CURTAIN_DURATION_S,
        ease: CURTAIN_EASE,
        delay: 0.35,
      },
    },
  };
  const stamp: Variants = {
    sealed: { opacity: 1, scale: 1 },
    opening: {
      opacity: 0,
      scale: 1.35,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-100 pointer-events-none"
          exit={{ opacity: 0, transition: { duration: 0.001 } }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-(--gm-bg) overflow-hidden"
            variants={topHalf}
            initial="sealed"
            animate={phase}
            onAnimationComplete={() => {
              if (phase === "opening") setVisible(false);
            }}
          >
            <svg
              className="absolute bottom-0 left-0 w-full"
              height="1"
              aria-hidden
            >
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                stroke="var(--gm-primary)"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-(--gm-bg) overflow-hidden"
            variants={bottomHalf}
            initial="sealed"
            animate={phase}
          >
            <svg
              className="absolute top-0 left-0 w-full"
              height="1"
              aria-hidden
            >
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                stroke="var(--gm-primary)"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            variants={stamp}
            initial="sealed"
            animate={phase}
          >
            <div className="relative size-24 rounded-full bg-(--gm-bg-2) border border-(--gm-primary)/50 shadow-xl">
              <div className="absolute inset-1 rounded-full border border-dashed border-(--gm-primary)/30 pointer-events-none" />
              <span className="gm-couple-names text-4xl text-(--gm-gold-soft) absolute top-3 left-3 leading-none">
                {groomInitial}
              </span>
              <span className="gm-couple-names text-2xl text-(--gm-gold-soft)/70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none">
                &
              </span>
              <span className="gm-couple-names text-4xl text-(--gm-gold-soft) absolute bottom-3 right-5 leading-none">
                {brideInitial}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Background ───────────────────────────────────────────────────────────────

const GeometricBackground = () => (
  <div className="fixed inset-0 pointer-events-none" aria-hidden>
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, var(--gm-bg-2) 0%, var(--gm-bg) 55%, var(--gm-bg) 100%)",
      }}
    />
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
      <defs>
        <pattern
          id="gm-lattice"
          width={72}
          height={72}
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points={starPoints(36, 36, 13, 5.5)}
            fill="none"
            stroke="var(--gm-primary)"
            strokeWidth={1}
          />
          <line
            x1={36}
            y1={0}
            x2={36}
            y2={9}
            stroke="var(--gm-primary)"
            strokeWidth={1}
          />
          <line
            x1={36}
            y1={63}
            x2={36}
            y2={72}
            stroke="var(--gm-primary)"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={36}
            x2={9}
            y2={36}
            stroke="var(--gm-primary)"
            strokeWidth={1}
          />
          <line
            x1={63}
            y1={36}
            x2={72}
            y2={36}
            stroke="var(--gm-primary)"
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gm-lattice)" />
    </svg>
  </div>
);

// ─── Template ────────────────────────────────────────────────────────────────

const GeometricMuslim = ({
  eventConfig,
  pageConfig,
  loaderReady,
}: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<GeometricMuslimPageConfig>;

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

  const groomInitial = (config.groom_name ?? "G").charAt(0).toUpperCase();
  const brideInitial = (config.bride_name ?? "B").charAt(0).toUpperCase();

  const rsvp = useRsvpSection(eventConfig, { confettiColors: CONFETTI_COLORS });

  const weddingDate = getWeddingDateTime(
    eventConfig.event_date,
    eventConfig.event_time_start,
  );

  const detailsList = [
    ...(config.date
      ? [{ icon: Calendar, title: "Date", detail: config.date }]
      : []),
    ...(config.time
      ? [{ icon: Clock, title: "Time", detail: config.time }]
      : []),
    ...(config.venue_name
      ? [{ icon: MapPin, title: "Location", detail: config.venue_name }]
      : []),
    ...(config.dress_code
      ? [{ icon: Star, title: "Dress code", detail: config.dress_code }]
      : []),
  ];

  const itinerarySections = parseItinerary(config.itinerary);

  // Section numbering — only count sections that actually render.
  let sectionNo = -1;
  const detailsNo =
    detailsList.length || config.invitation_body ? ++sectionNo : sectionNo;
  const itineraryNo = itinerarySections.length ? ++sectionNo : sectionNo;
  const rsvpNo = ++sectionNo;

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
      className="text-center text-(--gm-fg)/70 italic leading-relaxed py-8"
    >
      {message}
    </motion.p>
  );

  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie
        animationData={successCheck}
        loop={false}
        style={{ width: 80, height: 80, margin: "0 auto" }}
      />
      <motion.div
        key="success-content"
        initial={rsvp.submitted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3 className="text-2xl font-bold my-3 text-(--gm-gold-soft)">
          {config.rsvp_success_heading}
        </h3>
        <motion.p
          initial={rsvp.submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="text-(--gm-fg)/70 leading-relaxed italic mb-6"
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
            className="rounded-none bg-transparent text-(--gm-fg) border-(--gm-primary)/40 hover:bg-(--gm-primary)/10 gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"
          >
            <Edit2 size={14} className="text-(--gm-primary)" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={rsvp.removePending}
            onClick={() => rsvp.setShowDeleteDialog(true)}
            className="rounded-none bg-transparent text-(--gm-fg) border-(--gm-primary)/40 hover:border-(--gm-destructive)/60 hover:text-(--gm-destructive) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"
          >
            <Trash2 size={14} className="text-(--gm-primary)" />
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

  const anchorItems = geometricMuslimAnchors.items.filter(
    (item) => !item.when || item.when(config),
  );

  return (
    <div
      className="gm-root relative min-h-svh text-(--gm-fg)"
      style={rootStyle}
    >
      <CurtainPreloader
        loaderReady={!!loaderReady}
        onExitComplete={() => setReady(true)}
        groomInitial={groomInitial}
        brideInitial={brideInitial}
      />
      <GeometricBackground />

      {/* ── Hero ── names + inline countdown */}
      <section
        id="hero"
        className="relative min-h-svh flex flex-col items-center justify-center text-center pb-16 pt-16 px-6 overflow-hidden"
      >
        {/* corner flower borders — all 4 corners */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <motion.div
            key={corner}
            className={[
              "absolute pointer-events-none select-none",
              corner === "tl" || corner === "tr" ? "-top-7" : "-bottom-7",
              corner === "tl" || corner === "bl" ? "-left-15" : "-right-15",
            ].join(" ")}
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          >
            <img
              src="/images/weddings/gold-flower-1.png"
              alt=""
              className={`w-64 ${{ tl: "-scale-x-100 -scale-y-100", tr: "-scale-y-100", bl: "-scale-x-100", br: "" }[corner]}`}
            />
          </motion.div>
        ))}

        <motion.div
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="z-10 w-full max-w-xl mx-auto"
        >
          <motion.p
            variants={heroMake(0.2, 16, 0.9)}
            className="text-(--gm-fg)/80 text-base tracking-wider mb-12 whitespace-pre-line"
          >
            {config.greeting}
          </motion.p>

          <motion.p
            variants={heroMake(0.5)}
            className="text-2xs font-medium uppercase tracking-[0.45em] text-(--gm-muted-fg) mb-6"
          >
            {config.hero_divider_label}
          </motion.p>

          <div className="mb-12">
            <motion.span
              variants={heroMake(0.8, 30, 1)}
              className="gm-couple-names block text-(--gm-gold-soft) tracking-wide leading-none text-6xl"
            >
              {config.groom_name}
            </motion.span>
            <motion.div
              variants={heroMake(1.3)}
              className="text-(--gm-primary) flex justify-center my-3"
            >
              <KhatamStar size={26} />
            </motion.div>
            <motion.span
              variants={heroMake(1.6, 30, 1)}
              className="gm-couple-names block text-(--gm-gold-soft) tracking-wide leading-none text-6xl"
            >
              {config.bride_name}
            </motion.span>
          </div>

          {weddingDate && (
            <motion.div variants={heroMake(2.2)} className="mb-12">
              <InlineCountdown target={weddingDate} />
            </motion.div>
          )}

          <motion.div variants={heroMake(2.5)}>
            <p className="text-(--gm-fg) leading-relaxed whitespace-pre-line italic">
              {config.quote}
            </p>
            <span className="block mt-3 text-(--gm-fg)/70 text-xs tracking-[0.3em] uppercase">
              {config.quote_source}
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Invitation + Details ── left-aligned heading, vertical detail rows */}
      <section id="details" className="py-20 px-6 relative z-10">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <SectionHeading
              index={detailsNo}
              title={config.section_title ?? "The Invitation"}
            />
            {config.invitation_body && (
              <motion.p
                variants={fadeUp(0.2, 16, 0.8)}
                className="text-(--gm-fg)/70 leading-relaxed mb-12"
              >
                {config.invitation_body}
              </motion.p>
            )}
          </motion.div>

          {(config.blessings_name || config.blessings_label) && (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mb-14 border-l-2 border-(--gm-primary)/30 pl-5"
            >
              <motion.p
                variants={fadeIn(0)}
                className="text-(--gm-muted-fg) text-sm mb-2"
              >
                {config.blessings_prefix}
              </motion.p>
              {config.blessings_name && (
                <motion.h3
                  variants={fadeUp(0.1, 16, 0.7)}
                  className="text-2xl font-bold text-(--gm-gold-soft) whitespace-pre-line italic"
                >
                  {config.blessings_name}
                </motion.h3>
              )}
              {config.blessings_label && (
                <motion.p
                  variants={fadeUp(0.2, 10, 0.6)}
                  className="text-(--gm-fg)/60 text-sm mt-1"
                >
                  {config.blessings_label}
                </motion.p>
              )}
            </motion.div>
          )}

          {detailsList.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="divide-y divide-(--gm-primary)/15 border-y border-(--gm-primary)/15"
            >
              {detailsList.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp(idx * 0.1, 16, 0.6)}
                  className="flex items-center gap-5 py-5"
                >
                  <div className="size-11 shrink-0 grid place-items-center border border-(--gm-primary)/30 text-(--gm-primary)">
                    <item.icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1 flex items-baseline justify-between gap-4">
                    <span className="text-2xs uppercase tracking-[0.25em] text-(--gm-muted-fg)">
                      {item.title}
                    </span>
                    <span className="text-(--gm-gold-soft) font-semibold text-right">
                      {item.detail}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Itinerary ── vertical timeline: gold rail + star nodes */}
      {itinerarySections.length > 0 && (
        <section id="itinerary" className="py-20 px-6 relative z-10">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <SectionHeading
                index={itineraryNo}
                title={config.itinerary_title ?? "Programme"}
              />
            </motion.div>

            <div className="relative pl-10">
              <motion.span
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={railGrow}
                style={{ originY: 0 }}
                className="absolute left-[7px] top-2 bottom-2 w-px bg-(--gm-primary)/30"
              />
              <div className="flex flex-col gap-10">
                {itinerarySections.map((section, si) => (
                  <motion.div
                    key={si}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={fadeUp(0, 16, 0.6)}
                    className="relative"
                  >
                    <span className="absolute -left-10 top-1 text-(--gm-primary) bg-(--gm-bg)">
                      <KhatamStar size={16} />
                    </span>
                    <p className="gm-couple-names text-3xl text-(--gm-gold-soft) mb-3 leading-none">
                      {section.title}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {section.items.map((item, ii) => (
                        <div
                          key={ii}
                          className="flex items-baseline gap-4 text-sm"
                        >
                          <span className="tabular-nums shrink-0 text-(--gm-primary) w-20">
                            {item.time}
                          </span>
                          {item.label && (
                            <span className="text-(--gm-fg)/80">
                              {item.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {config.footnote && (
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeIn(0.1)}
                className="mt-12 text-center text-(--gm-muted-fg) italic text-sm"
              >
                {config.footnote}
              </motion.p>
            )}
          </div>
        </section>
      )}

      {/* ── RSVP ── framed panel, arch top, underline inputs */}
      <section
        ref={rsvp.sectionRef}
        id="rsvp"
        className="py-20 px-6 relative z-10"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            layout
            transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeIn(0, 0.8)}
            className="border border-(--gm-primary)/25 bg-(--gm-bg-2)/40 backdrop-blur-md p-8"
          >
            <div className="text-center mb-10">
              <motion.h2
                variants={fadeUp(0, 14, 0.6)}
                className="text-3xl font-bold text-(--gm-gold-soft) italic"
              >
                RSVP
              </motion.h2>
              <motion.p
                variants={fadeUp(0.2, 10, 0.6)}
                className="text-(--gm-muted-fg) italic mt-2 text-sm"
              >
                {config.rsvp_subtitle}
              </motion.p>
            </div>
            <AnimatePresence mode="popLayout">
              {renderRsvpBody()}
            </AnimatePresence>
          </motion.div>

          {/* ── Footer ── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-16 text-center"
          >
            <motion.p
              variants={fadeUp(0, 10, 0.6)}
              className="text-2xs uppercase tracking-[0.3em] text-(--gm-muted-fg) mb-2"
            >
              {config.footer_tagline}
            </motion.p>
            <motion.p
              variants={fadeUp(0.1, 10, 0.6)}
              className="gm-couple-names text-2xl text-(--gm-gold-soft) leading-none"
            >
              {config.groom_name} &amp; {config.bride_name}
            </motion.p>
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
        classNames={geometricMuslimAnchors.classNames}
        drawerClassNames={geometricMuslimAnchors.drawer}
        labels={geometricMuslimAnchors.labels}
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

export default GeometricMuslim;
