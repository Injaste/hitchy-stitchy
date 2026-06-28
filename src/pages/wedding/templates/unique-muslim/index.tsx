import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { motion, AnimatePresence, type Variants, type Transition } from "framer-motion"
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  Heart,
  Edit2,
  Trash2,
} from "lucide-react"
import LottieRaw from "lottie-react"

import { Button } from "@/components/ui/button"
import CountdownTimer from "@/components/custom/countdown-timer"
import { RSVPForm, RSVPDelete } from "@/pages/wedding/form"
import { AnchorDock } from "@/pages/wedding/anchors"
import { getWeddingDateTime } from "@/pages/wedding/anchors/calendar"
import successCheck from "@/assets/lottie/success-check.json"

import type { ThemeProps, SectionListValue } from "@/pages/wedding/templates/types"
import type { RSVPFormData } from "@/pages/wedding/types"
import { resolveFont } from "@/pages/wedding/templates/engine/fonts"
import { useThemeAssets } from "@/pages/wedding/templates/engine/useThemeAssets"
import { useRsvpSection } from "@/pages/wedding/templates/engine/useRsvpSection"

import type { UniqueMuslimPageConfig } from "./types"
import {
  rsvpClassNames,
  rsvpLabels,
  rsvpDeleteClassNames,
  rsvpDeleteLabels,
} from "./form"
import { uniqueMuslimAnchors } from "./anchors"
import slugCss from "./styles.css?inline"

const Lottie = (LottieRaw as any).default ?? LottieRaw

// Theme-matched default fonts (curated-catalogue families). The couple can
// override couple/heading/body via the editor; absent that, these ship out of
// the box. The countdown ("number") slot is a fixed template detail.
const DEFAULT_FONTS = {
  couple: resolveFont("Tangerine")!,
  number: resolveFont("Cinzel")!,
  heading: resolveFont("EB Garamond")!,
  body: resolveFont("EB Garamond")!,
}

const CONFETTI_COLORS = ["#ff4d8f", "#e8003a", "#ffb3c6", "#d4af37", "#ffd700"]

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = (delay: number, y = 20, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
})

const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration, delay, ease: "easeOut" } },
})

const scaleIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
  },
})

const dividerGrow: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

// Hero entrance — delays are offset by a base so they begin after the page is
// revealed (`ready`).
const HERO_BASE = 1.5
const heroMake = (delay: number, y = 20, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay: delay + HERO_BASE, ease: [0.16, 1, 0.3, 1] },
  },
})
const heroGreeting = heroMake(0.2, 16, 0.9)
const heroDivider: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}
const heroName1 = heroMake(1.1, 40, 1.1)
const heroAmp: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, delay: 1.5, ease: "easeOut" } },
}
const heroName2 = heroMake(1.7, 40, 1.1)
const heroCountdown = heroMake(2.5, 20, 0.8)
const heroVerse = heroMake(2.8, 16, 0.8)

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ItinerarySection {
  title: string
  items: { time: string; label?: string }[]
}

function parseItinerary(
  raw: string | SectionListValue | null | undefined,
): ItinerarySection[] {
  // Structured (section-list): titled sections with { time, label } rows.
  if (Array.isArray(raw)) {
    return raw
      .filter((s) => s && Array.isArray(s.items))
      .map((s) => ({
        title: (s.title ?? "").trim(),
        items: s.items
          .map((it) => {
            const time = (it.time ?? "").trim()
            const label = (it.label ?? "").trim()
            return { time, ...(label ? { label } : {}) }
          })
          .filter((it) => it.time || it.label),
      }))
      .filter((s) => s.title || s.items.length)
  }

  // Legacy string format (blank-line sections, "time | label" rows).
  if (!raw?.trim()) return []
  return raw
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean)
      if (!lines.length) return []
      const [title, ...rest] = lines
      const items = rest.map((line) => {
        const idx = line.indexOf("|")
        if (idx === -1) return { time: line }
        const time = line.slice(0, idx).trim()
        const label = line.slice(idx + 1).trim()
        return { time, ...(label ? { label } : {}) }
      })
      return [{ title, items }]
    })
}

// ─── Background pieces ──────────────────────────────────────────────────────────

const BackgroundImage = ({ src, ready }: { src: string; ready: boolean }) => {
  const [dims, setDims] = useState(() => ({
    height: window.innerHeight,
    top: window.innerHeight / 2,
  }))
  const rafRef = useRef<number>(0)
  const lastWidth = useRef(window.innerWidth)

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth === lastWidth.current) return
      lastWidth.current = window.innerWidth
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() =>
        setDims({ height: window.innerHeight, top: window.innerHeight / 2 }),
      )
    }
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <motion.img
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-md object-contain object-center opacity-50"
      style={{ top: dims.top, height: dims.height, translateY: "-50%" }}
      src={src}
      alt=""
      animate={{ filter: ready ? "blur(8px)" : "blur(0px)" }}
      transition={{ duration: 1, delay: 1 }}
    />
  )
}

const flowerTransition: Transition = {
  y: { duration: 1.2, ease: "easeOut" },
  opacity: { duration: 1.2, ease: "easeOut" },
  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.6, 0.8, 1] },
  skewX: { duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.6, 0.8, 1] },
}
const flowerAnimate = {
  y: 0,
  opacity: 1,
  rotate: [0, 0.6, -0.4, 0.3, 0],
  skewX: [0, 0.5, -0.3, 0.2, 0],
}

const BackgroundFlowers = ({ ready }: { ready: boolean }) => (
  <>
    <motion.img
      src="/images/background/bg-flower-1.png"
      alt=""
      className="fixed left-0 right-0 top-0 rotate-180 w-[101%] scale-101 max-w-md mx-auto"
      initial={{ y: "100%", opacity: 0 }}
      animate={ready ? flowerAnimate : {}}
      transition={flowerTransition}
    />
    <motion.img
      src="/images/background/bg-flower-1.png"
      alt=""
      className="fixed left-0 right-0 bottom-0 w-[101%] max-w-md mx-auto scale-101"
      initial={{ y: "100%", opacity: 0 }}
      animate={ready ? flowerAnimate : {}}
      transition={flowerTransition}
    />
  </>
)

// ─── Envelope preloader ─────────────────────────────────────────────────────────

const OPEN_DURATION_S = 2
const HOLD_MS = 1200
const ENVELOPE_EASE = [0.7, 0, 0.2, 1] as const

const EnvelopeHalf = ({ side }: { side: "left" | "right" }) => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden
  >
    <line
      x1={side === "left" ? 100 : 0}
      y1={0}
      x2={side === "left" ? 100 : 0}
      y2={100}
      className="stroke-(--um-fg)/50"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
    />
  </svg>
)

const EnvelopePreloader = ({
  loaderReady,
  onExitComplete,
}: {
  loaderReady: boolean
  onExitComplete: () => void
}) => {
  const [phase, setPhase] = useState<"sealed" | "opening">("sealed")
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    document.documentElement.style.overflow = visible ? "hidden" : ""
    return () => {
      document.documentElement.style.overflow = ""
    }
  }, [visible])

  useEffect(() => {
    if (!loaderReady) return
    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) return
      setPhase("opening")
      setTimeout(onExitComplete, (OPEN_DURATION_S * 1000) / 2)
    }, HOLD_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [loaderReady])

  const leftHalf: Variants = {
    sealed: { x: "0%" },
    opening: { x: "-100%", transition: { duration: OPEN_DURATION_S, ease: ENVELOPE_EASE, delay: 0.35 } },
  }
  const rightHalf: Variants = {
    sealed: { x: "0%" },
    opening: { x: "100%", transition: { duration: OPEN_DURATION_S, ease: ENVELOPE_EASE, delay: 0.35 } },
  }
  const stamp: Variants = {
    sealed: { opacity: 1, scale: 1, rotate: -6 },
    opening: { opacity: 0, scale: 1.35, rotate: -6, transition: { duration: 1, ease: "easeOut" } },
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-100 pointer-events-none"
          exit={{ opacity: 0, transition: { duration: 0.001 } }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-(--um-envelope) overflow-hidden"
            variants={leftHalf}
            initial="sealed"
            animate={phase}
            onAnimationComplete={() => {
              if (phase === "opening") setVisible(false)
            }}
          >
            <EnvelopeHalf side="left" />
          </motion.div>
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-(--um-envelope) overflow-hidden"
            variants={rightHalf}
            initial="sealed"
            animate={phase}
          >
            <EnvelopeHalf side="right" />
          </motion.div>
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            variants={stamp}
            initial="sealed"
            animate={phase}
          >
            <div className="relative size-28 sm:size-36 rounded-full bg-(--um-primary) shadow-xl p-6 flex items-center justify-center">
              <img
                src="/images/background/d-n-n.png"
                alt=""
                className="w-full h-full object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <div className="absolute inset-1 rounded-full border border-dashed border-white pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Template ────────────────────────────────────────────────────────────────

const UniqueMuslim = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  // This component IS the unique-muslim template — it owns its config shape and
  // reads it directly (no slug guard; the engine routes the right template here).
  const config = (pageConfig ?? {}) as Partial<UniqueMuslimPageConfig>

  const fonts = useMemo(
    () => ({
      couple: resolveFont(config.font_couple) ?? DEFAULT_FONTS.couple,
      heading: resolveFont(config.font_heading) ?? DEFAULT_FONTS.heading,
      body: resolveFont(config.font_body) ?? DEFAULT_FONTS.body,
      number: DEFAULT_FONTS.number,
    }),
    [config.font_couple, config.font_heading, config.font_body],
  )
  const rootStyle = useThemeAssets({ css: slugCss, fonts })

  const [ready, setReady] = useState(false)

  const rsvp = useRsvpSection(eventConfig, { confettiColors: CONFETTI_COLORS })

  const bgImage = config.background_image ?? "/images/unique-muslim/dannad.png"

  // Hero
  const weddingDate = getWeddingDateTime(eventConfig.event_date, eventConfig.event_time_start)

  // Details
  const detailsList = [
    ...(config.date ? [{ icon: Calendar, title: "Date", detail: config.date }] : []),
    ...(config.time ? [{ icon: Clock, title: "Time", detail: config.time }] : []),
    ...(config.venue_name ? [{ icon: MapPin, title: "Location", detail: config.venue_name }] : []),
    ...(config.dress_code ? [{ icon: Star, title: "Dress code", detail: config.dress_code }] : []),
  ]

  // Itinerary
  const itinerarySections = parseItinerary(config.itinerary)

  // RSVP labels merged with config overrides
  const mergedRsvpLabels = {
    ...rsvpLabels,
    name: { ...rsvpLabels.name, label: config.rsvp_label_name ?? rsvpLabels.name.label },
    phone: { ...rsvpLabels.phone, label: config.rsvp_label_phone ?? rsvpLabels.phone.label },
    guestCount: {
      ...rsvpLabels.guestCount,
      label: config.rsvp_label_guest_count ?? rsvpLabels.guestCount.label,
    },
    message: { ...rsvpLabels.message, label: config.rsvp_label_message ?? rsvpLabels.message.label },
    code: { label: "Invite Code", placeholder: "Enter your code" },
  }

  const renderClosed = (key: string, message: string) => (
    <motion.p
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center text-(--um-fg)/70 italic leading-relaxed py-8"
    >
      {message}
    </motion.p>
  )

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
        <h3 className="text-2xl font-bold my-3 text-(--um-fg)">
          {config.rsvp_success_heading}
        </h3>
        <motion.p
          initial={rsvp.submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="text-(--um-fg)/70 leading-relaxed italic mb-6"
        >
          {eventConfig.confirmation_message}
        </motion.p>
        <motion.div
          initial={rsvp.submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          className="flex gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rsvp.setIsEditing(true)}
              className="rounded-xl border-(--um-primary)/30 hover:border-(--um-primary)/60 gap-2 font-bold tracking-wide uppercase shrink-0"
            >
              <Edit2 size={14} className="text-(--um-primary)" /> Edit
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              disabled={rsvp.removePending}
              onClick={() => rsvp.setShowDeleteDialog(true)}
              className="rounded-xl border-(--um-primary)/30 hover:border-(--um-destructive)/60 hover:text-(--um-destructive) gap-2 font-bold tracking-wide uppercase shrink-0"
            >
              <Trash2 size={14} className="text-(--um-primary)" />
              {rsvp.removePending ? "Removing…" : "Delete"}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )

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
  )

  const renderRsvpBody = () => {
    if (rsvp.isEventOver) return renderClosed("event-over", "This event has already taken place.")
    if (rsvp.isDeadlinePassed)
      return renderClosed("deadline", rsvp.deadlineMessage)
    if (rsvp.existingRSVP && !rsvp.isEditing) return renderSuccess()
    if (rsvp.isLoading) return renderClosed("loading", "Checking RSVP status…")
    return renderForm()
  }

  const anchorItems = uniqueMuslimAnchors.items.filter(
    (item) => !item.when || item.when(config),
  )

  return (
    <motion.div
      className="um-root"
      style={rootStyle}
      initial={{ backgroundColor: "#ffffff" }}
      animate={{ backgroundColor: ready ? "#f4ead3" : "#ffffff" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <EnvelopePreloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />
      <BackgroundImage src={bgImage} ready={ready} />

      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-svh flex flex-col items-center justify-center text-center pb-10 pt-20 px-4 overflow-hidden bg-white/10"
      >
        <motion.div
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          className="z-10 w-full max-w-2xl mx-auto"
        >
          <motion.p
            variants={heroGreeting}
            className="text-(--um-fg)/80 text-lg tracking-wider mb-14 whitespace-pre-line"
          >
            {config.greeting}
          </motion.p>

          <motion.div
            variants={heroDivider}
            style={{ originX: "50%" }}
            className="flex items-center justify-center gap-5 mb-5"
          >
            <div className="h-px flex-1 max-w-20 bg-linear-to-r from-transparent to-(--um-primary)/50" />
            <span className="text-2xs font-medium uppercase tracking-[0.45em] text-(--um-muted-fg) whitespace-nowrap">
              {config.hero_divider_label}
            </span>
            <div className="h-px flex-1 max-w-20 bg-linear-to-l from-transparent to-(--um-primary)/50" />
          </motion.div>

          <h1 className="mb-12">
            <motion.span
              variants={heroName1}
              className="um-couple-names text-(--um-rose) italic tracking-wide leading-tight text-5xl"
            >
              {config.groom_name}
            </motion.span>
            <motion.span variants={heroAmp} className="flex items-center justify-center gap-5 my-2">
              <span className="h-px flex-1 max-w-16 bg-(--um-primary)/25" />
              <span className="text-xl font-light not-italic tracking-normal text-(--um-fg)/40">
                &amp;
              </span>
              <div className="h-px flex-1 max-w-16 bg-(--um-primary)/25" />
            </motion.span>
            <motion.span
              variants={heroName2}
              className="um-couple-names text-(--um-rose) italic tracking-wide leading-tight text-5xl"
            >
              {config.bride_name}
            </motion.span>
          </h1>

          {weddingDate && (
            <motion.div variants={heroCountdown} className="mb-14">
              <CountdownTimer targetDate={weddingDate} numberClassName="um-countdown-number" />
            </motion.div>
          )}

          <motion.div variants={heroVerse} className="mb-14">
            <div className="border-t border-(--um-primary)/20 pt-6">
              <p className="text-(--um-fg) leading-relaxed whitespace-pre-line">{config.quote}</p>
              <span className="block mt-3 text-(--um-fg)/80 text-sm tracking-widest uppercase font-medium">
                {config.quote_source}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Details ── */}
      <section id="details" className="pt-20 pb-10 px-4 bg-(--um-card)/60 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-16"
          >
            <motion.div variants={fadeIn(0)}>
              <Sparkles className="text-(--um-primary) mx-auto mb-5" size={28} />
            </motion.div>
            <motion.h3
              variants={fadeUp(0.1, 20, 0.7)}
              className="text-3xl font-bold text-(--um-primary) mb-4 italic"
            >
              {config.section_title}
            </motion.h3>
            <motion.p
              variants={fadeUp(0.25, 16, 0.8)}
              className="text-(--um-fg)/70 leading-relaxed max-w-2xl mx-auto"
            >
              {config.invitation_body}
            </motion.p>
          </motion.div>

          {(config.blessings_name || config.blessings_label) && (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mb-14"
            >
              <motion.p variants={fadeIn(0)} className="text-(--um-fg)/70 mb-3">
                {config.blessings_prefix}
              </motion.p>
              {config.blessings_name && (
                <motion.h3
                  variants={fadeUp(0.1, 20, 0.8)}
                  className="text-3xl font-bold text-(--um-primary) mb-2 whitespace-pre-line italic"
                >
                  {config.blessings_name}
                </motion.h3>
              )}
              {config.blessings_label && (
                <motion.p variants={fadeUp(0.2, 12, 0.7)} className="text-(--um-fg)/70">
                  {config.blessings_label}
                </motion.p>
              )}
              <motion.div
                variants={dividerGrow}
                style={{ originX: "50%" }}
                className="w-12 h-px bg-(--um-primary)/30 mx-auto mt-5"
              />
            </motion.div>
          )}

          {detailsList.length > 0 && (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-2 gap-8 mb-14"
            >
              {detailsList.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp(idx * 0.15, 28, 0.7)}
                  className="group flex flex-col items-center"
                >
                  <motion.div
                    variants={scaleIn(idx * 0.15 + 0.05)}
                    className="w-16 h-16 rounded-full bg-(--um-card) flex items-center justify-center text-(--um-primary) mb-4 group-hover:scale-110 transition-transform shadow-sm border border-(--um-primary)/20"
                  >
                    <item.icon size={28} />
                  </motion.div>
                  <h4 className="font-bold text-base mb-1 text-(--um-fg)">{item.title}</h4>
                  <p className="text-(--um-primary) font-bold text-base">{item.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </section>

      {/* ── Itinerary ── */}
      {itinerarySections.length > 0 && (
        <section id="itinerary" className="pt-10 pb-20 px-4 bg-(--um-card)/60 relative z-10">
          <div className="max-w-sm mx-auto">
            <div className="flex flex-col gap-8">
              {itinerarySections.map((section, si) => (
                <motion.div
                  key={si}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeIn(si * 0.08)}
                  className="italic"
                >
                  <motion.p
                    variants={fadeUp(si * 0.08 + 0.05, 12, 0.6)}
                    className="um-couple-names text-4xl font-bold text-center mb-2"
                  >
                    {section.title}
                  </motion.p>
                  <div className="flex flex-col max-w-3xs mx-auto w-full">
                    {section.items.map((item, ii) => (
                      <motion.div
                        key={ii}
                        variants={fadeUp(si * 0.08 + ii * 0.06 + 0.1, 8, 0.5)}
                        className={
                          "flex items-center gap-4 " +
                          (item.label ? "justify-between" : "justify-center")
                        }
                      >
                        <span className="tabular-nums shrink-0">{item.time}</span>
                        {item.label && (
                          <span className="text-right leading-snug">{item.label}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
              {config.footnote && (
                <motion.span
                  key="footnote"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeIn(itinerarySections.length * 0.08)}
                  className="text-center leading-snug italic"
                >
                  {config.footnote}
                </motion.span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section ref={rsvp.sectionRef} id="rsvp" className="pt-20 pb-10 px-4 relative bg-white/10 z-10">
        <div className="max-w-sm mx-auto">
          <motion.div
            layout
            transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeIn(0, 0.8)}
            className="bg-(--um-card)/80 backdrop-blur-md p-6 rounded-[1.75rem] shadow-xl border border-(--um-primary)/20"
          >
            <motion.div variants={fadeIn(0)} className="text-center mb-8">
              <motion.div variants={fadeIn(0.05)}>
                <Heart className="text-(--um-primary) mx-auto mb-4 fill-(--um-primary)/10" size={40} />
              </motion.div>
              <motion.h2
                variants={fadeUp(0.15, 16, 0.7)}
                className="text-3xl font-bold text-(--um-primary) mb-2 italic"
              >
                RSVP
              </motion.h2>
              <motion.p variants={fadeUp(0.25, 12, 0.7)} className="text-(--um-muted-fg) italic">
                {config.rsvp_subtitle}
              </motion.p>
            </motion.div>
            <AnimatePresence mode="popLayout">{renderRsvpBody()}</AnimatePresence>
          </motion.div>

          {/* ── Footer ── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-12 text-center relative"
          >
            <motion.div
              variants={dividerGrow}
              style={{ originX: "50%" }}
              className="w-10 h-px bg-(--um-primary)/30 mx-auto mb-6"
            />
            <motion.p variants={fadeUp(0.1, 12, 0.7)} className="mb-3 italic text-(--um-fg)">
              {config.footer_tagline}
            </motion.p>
            <motion.h2
              variants={fadeUp(0.2, 16, 0.8)}
              className="um-couple-names text-(--um-rose) italic tracking-wide leading-tight text-4xl flex flex-col"
            >
              <span>{config.groom_name}</span>
              <span>&amp;</span>
              <span>{config.bride_name}</span>
            </motion.h2>
            <motion.div variants={fadeIn(0.35, 1)} className="-mt-8 mb-4">
              <img
                className="w-full max-w-[260px] aspect-square object-contain mx-auto"
                src="/images/unique-muslim/dannad.png"
                alt="Hitchy Stitchy"
              />
            </motion.div>
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

      <BackgroundFlowers ready={ready} />

      <AnchorDock
        ready={ready}
        eventConfig={eventConfig}
        scrollItems={anchorItems}
        classNames={uniqueMuslimAnchors.classNames}
        drawerClassNames={uniqueMuslimAnchors.drawer}
        labels={uniqueMuslimAnchors.labels}
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
    </motion.div>
  )
}

export default UniqueMuslim
