import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Edit2, Trash2 } from "lucide-react"
import LottieRaw from "lottie-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RSVPForm, RSVPDelete } from "@/pages/wedding/form"
import { AnchorDock } from "@/pages/wedding/anchors"
import { getWeddingDateTime } from "@/pages/wedding/anchors/calendar"
import successCheck from "@/assets/lottie/success-check.json"

import type { ThemeProps, SectionListValue } from "@/pages/wedding/templates/types"
import type { RSVPFormData } from "@/pages/wedding/types"
import { resolveFont } from "@/pages/wedding/templates/engine/fonts"
import { useThemeAssets } from "@/pages/wedding/templates/engine/useThemeAssets"
import { useRsvpSection } from "@/pages/wedding/templates/engine/useRsvpSection"

import type { MughalIndianPageConfig } from "./types"
import { rsvpClassNames, rsvpLabels, rsvpDeleteClassNames, rsvpDeleteLabels } from "./form"
import { mughalIndianAnchors } from "./anchors"
import slugCss from "./styles.css?inline"

const Lottie = (LottieRaw as any).default ?? LottieRaw

const DEFAULT_FONTS = {
  couple: resolveFont("Cinzel")!,
  number: resolveFont("Cinzel")!,
  heading: resolveFont("Cinzel")!,
  body: resolveFont("Cormorant")!,
}

const CONFETTI_COLORS = ["#d6b24a", "#c23142", "#b8932c", "#f3e2c2", "#6e4f2a"]

// ─── Mughal motifs ────────────────────────────────────────────────────────────

// Jharokha — an ogee (onion) arch outline used as a crown over the names.
const Arch = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 80" width={120} height={80} className={className} fill="none" stroke="var(--mu-primary)" strokeWidth={1.4} aria-hidden>
    <path d="M10 78 L10 40 C10 18 38 20 60 2 C82 20 110 18 110 40 L110 78" />
    <path d="M20 78 L20 42 C20 26 42 28 60 12 C78 28 100 26 100 42 L100 78" opacity={0.5} />
    <circle cx={60} cy={6} r={2.5} fill="var(--mu-primary)" />
  </svg>
)

const Peacock = ({ size = 56, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} fill="none" stroke="var(--mu-primary)" strokeWidth={1.2} aria-hidden>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = (i - 3) * 18
      return <g key={i} transform={`rotate(${a} 50 78)`}>
        <line x1={50} y1={78} x2={50} y2={26} />
        <ellipse cx={50} cy={22} rx={5} ry={8} />
        <circle cx={50} cy={22} r={2} fill="var(--mu-accent)" stroke="none" />
      </g>
    })}
    <circle cx={50} cy={80} r={6} fill="var(--mu-primary)" stroke="none" />
  </svg>
)

const OrnDivider = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-3 text-(--mu-primary)/55", className)}>
    <span className="h-px w-16 bg-linear-to-r from-transparent to-current" />
    <span className="size-2 rotate-45 border border-current" />
    <span className="size-1.5 rotate-45 bg-(--mu-accent)" />
    <span className="size-2 rotate-45 border border-current" />
    <span className="h-px w-16 bg-linear-to-l from-transparent to-current" />
  </div>
)

// ─── Animation variants ─────────────────────────────────────────────────────────

const fadeUp = (delay: number, y = 18, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration, delay, ease: [0.16, 1, 0.3, 1] } },
})
const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration, delay, ease: "easeOut" } },
})
const HERO_BASE = 1.0
const heroMake = (delay: number, y = 16, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration, delay: delay + HERO_BASE, ease: [0.16, 1, 0.3, 1] } },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ItinerarySection { title: string; items: { time: string; label?: string }[] }
function parseItinerary(raw: string | SectionListValue | null | undefined): ItinerarySection[] {
  if (Array.isArray(raw)) {
    return raw.filter((s) => s && Array.isArray(s.items)).map((s) => ({
      title: (s.title ?? "").trim(),
      items: s.items.map((it) => {
        const time = (it.time ?? "").trim(); const label = (it.label ?? "").trim()
        return { time, ...(label ? { label } : {}) }
      }).filter((it) => it.time || it.label),
    })).filter((s) => s.title || s.items.length)
  }
  if (!raw?.trim()) return []
  return raw.split(/\n[ \t]*\n/).map((b) => b.trim()).filter(Boolean).flatMap((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean)
    if (!lines.length) return []
    const [title, ...rest] = lines
    const items = rest.map((line) => {
      const idx = line.indexOf("|")
      if (idx === -1) return { time: line }
      return { time: line.slice(0, idx).trim(), label: line.slice(idx + 1).trim() }
    })
    return [{ title, items }]
  })
}

const UNITS: { key: "days" | "hours" | "minutes" | "seconds"; label: string }[] = [
  { key: "days", label: "Days" }, { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" }, { key: "seconds", label: "Seconds" },
]
function useCountdown(target: Date | null) {
  const calc = () => {
    if (!target) return null
    const d = target.getTime() - Date.now()
    if (d <= 0) return null
    return { days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return t
}
const InlineCountdown = ({ target }: { target: Date | null }) => {
  const t = useCountdown(target)
  if (!t) return null
  return (
    <div className="flex items-stretch justify-center gap-2.5">
      {UNITS.map((u) => (
        <div key={u.key} className="flex flex-col items-center rounded-md border border-(--mu-border) w-20 py-2.5">
          <span className="mu-countdown-number text-3xl text-(--mu-primary) tabular-nums leading-none">{String(t[u.key]).padStart(2, "0")}</span>
          <span className="mt-1.5 text-3xs uppercase tracking-[0.18em] text-(--mu-muted-fg)">{u.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Preloader ──────────────────────────────────────────────────────────────────

const HOLD_MS = 1000
const Preloader = ({ loaderReady, onExitComplete }: { loaderReady: boolean; onExitComplete: () => void }) => {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    document.documentElement.style.overflow = visible ? "hidden" : ""
    return () => { document.documentElement.style.overflow = "" }
  }, [visible])
  useEffect(() => {
    if (!loaderReady) return
    let cancelled = false
    const timer = setTimeout(() => { if (cancelled) return; setLeaving(true); setTimeout(onExitComplete, 500) }, HOLD_MS)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [loaderReady])
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-100 flex items-center justify-center bg-(--mu-bg)" initial={{ opacity: 1 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} onAnimationComplete={() => { if (leaving) setVisible(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <Peacock size={104} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Template ────────────────────────────────────────────────────────────────

const MughalIndian = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<MughalIndianPageConfig>
  const fonts = useMemo(() => ({
    couple: resolveFont(config.font_couple) ?? DEFAULT_FONTS.couple,
    heading: resolveFont(config.font_heading) ?? DEFAULT_FONTS.heading,
    body: resolveFont(config.font_body) ?? DEFAULT_FONTS.body,
    number: DEFAULT_FONTS.number,
  }), [config.font_couple, config.font_heading, config.font_body])
  const rootStyle = useThemeAssets({ css: slugCss, fonts })
  const [ready, setReady] = useState(false)
  const rsvp = useRsvpSection(eventConfig, { confettiColors: CONFETTI_COLORS })

  const weddingDate = getWeddingDateTime(eventConfig.event_date, eventConfig.event_time_start)
  const detailsList = [
    ...(config.date ? [{ title: "Date", detail: config.date }] : []),
    ...(config.time ? [{ title: "Time", detail: config.time }] : []),
    ...(config.venue_name ? [{ title: "Venue", detail: config.venue_name }] : []),
    ...(config.dress_code ? [{ title: "Attire", detail: config.dress_code }] : []),
  ]
  const itinerarySections = parseItinerary(config.itinerary)
  const mergedRsvpLabels = {
    ...rsvpLabels,
    name: { ...rsvpLabels.name, label: config.rsvp_label_name ?? rsvpLabels.name.label },
    phone: { ...rsvpLabels.phone, label: config.rsvp_label_phone ?? rsvpLabels.phone.label },
    guestCount: { ...rsvpLabels.guestCount, label: config.rsvp_label_guest_count ?? rsvpLabels.guestCount.label },
    message: { ...rsvpLabels.message, label: config.rsvp_label_message ?? rsvpLabels.message.label },
    code: { label: "Invite Code", placeholder: "Enter your code" },
  }

  const renderClosed = (key: string, message: string) => (
    <motion.p key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-(--mu-muted-fg) italic leading-relaxed py-8">{message}</motion.p>
  )
  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie animationData={successCheck} loop={false} style={{ width: 76, height: 76, margin: "0 auto" }} />
      <motion.div key="success-content" initial={rsvp.submitted ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <h3 className="text-2xl my-3 text-(--mu-primary) tracking-wide">{config.rsvp_success_heading}</h3>
        <motion.p initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className="text-(--mu-muted-fg) leading-relaxed mb-6">{eventConfig.confirmation_message}</motion.p>
        <motion.div initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => rsvp.setIsEditing(true)} className="rounded-md bg-transparent text-(--mu-fg) border-(--mu-border) hover:bg-(--mu-bg-2) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"><Edit2 size={14} className="text-(--mu-primary)" /> Edit</Button>
          <Button variant="outline" size="sm" disabled={rsvp.removePending} onClick={() => rsvp.setShowDeleteDialog(true)} className="rounded-md bg-transparent text-(--mu-fg) border-(--mu-border) hover:border-(--mu-destructive)/60 hover:text-(--mu-destructive) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"><Trash2 size={14} className="text-(--mu-primary)" />{rsvp.removePending ? "Removing…" : "Delete"}</Button>
        </motion.div>
      </motion.div>
    </div>
  )
  const renderForm = () => (
    <div key={rsvp.isEditing ? "edit-form" : "new-form"}>
      <RSVPForm key={rsvp.isEditing ? "edit" : "new"}
        defaultValues={rsvp.isEditing && rsvp.existingRSVP ? { name: rsvp.existingRSVP.name, phone: rsvp.existingRSVP.phone, guestCount: rsvp.existingRSVP.guest_count, message: rsvp.existingRSVP.message ?? undefined } : undefined}
        onSubmit={(value: RSVPFormData) => rsvp.handleSubmit(value)} onCancel={rsvp.isEditing ? () => rsvp.setIsEditing(false) : undefined}
        isEditing={rsvp.isEditing} rsvpConfig={rsvp.rsvpConfig} limits={rsvp.limits} showCode={rsvp.showCode} error={rsvp.submitError}
        classNames={rsvpClassNames} labels={mergedRsvpLabels} />
    </div>
  )
  const renderRsvpBody = () => {
    if (rsvp.isDeadlinePassed) return renderClosed("deadline", rsvp.deadlineMessage)
    if (rsvp.existingRSVP && !rsvp.isEditing) return renderSuccess()
    if (rsvp.isLoading) return renderClosed("loading", "Checking RSVP status…")
    return renderForm()
  }
  const anchorItems = mughalIndianAnchors.items.filter((item) => !item.when || item.when(config))

  return (
    <div className="mu-root relative min-h-svh bg-(--mu-bg) text-(--mu-fg)" style={rootStyle}>
      <Preloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />

      {/* ── Hero ── arch-crowned */}
      <section id="hero" className="relative min-h-svh flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div initial="hidden" animate={ready ? "show" : "hidden"} className="w-full max-w-lg mx-auto">
          <motion.div variants={heroMake(0)} className="flex justify-center mb-2"><Arch /></motion.div>
          <motion.p variants={heroMake(0.2)} className="text-(--mu-muted-fg) text-base italic mb-6 whitespace-pre-line mu-devanagari">{config.greeting}</motion.p>
          <motion.p variants={heroMake(0.4)} className="text-(--mu-accent) text-xs tracking-[0.4em] uppercase mb-5">{config.hero_divider_label}</motion.p>
          <motion.h1 variants={heroMake(0.6, 22, 1)} className="mu-couple-names text-4xl sm:text-5xl text-(--mu-primary) leading-tight tracking-wide">{config.groom_name}</motion.h1>
          <motion.p variants={heroMake(0.85)} className="mu-couple-names text-xl text-(--mu-accent) my-3">&amp;</motion.p>
          <motion.h1 variants={heroMake(1.0, 22, 1)} className="mu-couple-names text-4xl sm:text-5xl text-(--mu-primary) leading-tight tracking-wide">{config.bride_name}</motion.h1>
          {weddingDate && <motion.div variants={heroMake(1.4)} className="mt-10"><InlineCountdown target={weddingDate} /></motion.div>}
          {config.quote && (
            <motion.div variants={heroMake(1.7)} className="mt-10">
              <OrnDivider className="mb-5" />
              <p className="text-(--mu-fg)/85 leading-relaxed italic whitespace-pre-line max-w-md mx-auto mu-devanagari">{config.quote}</p>
              {config.quote_source && <span className="block mt-3 text-(--mu-muted-fg) text-xs tracking-[0.25em] uppercase">{config.quote_source}</span>}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Invitation + Details ── gold-bordered card on dark */}
      <section id="details" className="px-6 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="max-w-lg mx-auto rounded-lg border border-(--mu-border) bg-(--mu-card) p-8 sm:p-10 text-center">
          <motion.div variants={fadeIn(0)} className="flex justify-center mb-5"><Peacock size={44} /></motion.div>
          <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-2xl sm:text-3xl text-(--mu-primary) tracking-wide mb-5">{config.section_title ?? "A Royal Celebration"}</motion.h2>
          {config.invitation_body && <motion.p variants={fadeUp(0.2, 14, 0.8)} className="text-(--mu-muted-fg) leading-relaxed">{config.invitation_body}</motion.p>}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-8">
              <p className="text-(--mu-muted-fg) text-sm mb-2">{config.blessings_prefix}</p>
              {config.blessings_name && <h3 className="text-2xl text-(--mu-primary) whitespace-pre-line">{config.blessings_name}</h3>}
              {config.blessings_label && <p className="text-(--mu-muted-fg) text-sm mt-1">{config.blessings_label}</p>}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <motion.div variants={fadeIn(0.3)} className="mt-8 flex flex-col">
              {detailsList.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp(idx * 0.08, 10, 0.6)} className="py-3.5 border-t border-(--mu-border)/60 last:border-b">
                  <p className="text-2xs uppercase tracking-[0.3em] text-(--mu-accent) mb-1">{item.title}</p>
                  <p className="text-lg text-(--mu-fg)">{item.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Itinerary ── */}
      {itinerarySections.length > 0 && (
        <section id="itinerary" className="py-16 px-6">
          <div className="max-w-md mx-auto text-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mb-9">
              <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl text-(--mu-primary) tracking-wide">{config.itinerary_title ?? "Programme"}</motion.h2>
              <motion.div variants={fadeIn(0.2)} className="mt-3"><OrnDivider /></motion.div>
            </motion.div>
            <div className="flex flex-col">
              {itinerarySections.map((section, si) => (
                <motion.div key={si} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeUp(0, 14, 0.6)}>
                  {si > 0 && <OrnDivider className="my-7" />}
                  <p className="mu-couple-names text-2xl text-(--mu-primary) mb-3 tracking-wide">{section.title}</p>
                  <div className="flex flex-col gap-1.5 text-(--mu-muted-fg)">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-baseline justify-center gap-3 text-sm">
                        <span className="tabular-nums text-(--mu-accent)">{item.time}</span>
                        {item.label && <span>· {item.label}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {config.footnote && <motion.p initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeIn(0.1)} className="mt-9 text-(--mu-muted-fg) italic text-sm">{config.footnote}</motion.p>}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section ref={rsvp.sectionRef} id="rsvp" className="py-16 px-6">
        <div className="max-w-md mx-auto">
          <motion.div layout transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeIn(0, 0.8)} className="rounded-lg border border-(--mu-border) bg-(--mu-card) p-8">
            <div className="text-center mb-8">
              <motion.div variants={fadeIn(0)} className="flex justify-center mb-4"><Peacock size={44} /></motion.div>
              <motion.h2 variants={fadeUp(0.1, 12, 0.6)} className="text-3xl text-(--mu-primary) tracking-wide">RSVP</motion.h2>
              <motion.p variants={fadeUp(0.2, 10, 0.6)} className="text-(--mu-muted-fg) italic mt-2 text-sm">{config.rsvp_subtitle}</motion.p>
            </div>
            <AnimatePresence mode="popLayout">{renderRsvpBody()}</AnimatePresence>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="mt-14 text-center">
            <motion.div variants={fadeIn(0)} className="mb-5"><OrnDivider /></motion.div>
            <motion.p variants={fadeUp(0.1, 10, 0.6)} className="text-2xs uppercase tracking-[0.3em] text-(--mu-muted-fg) mb-3">{config.footer_tagline}</motion.p>
            <motion.h2 variants={fadeUp(0.2, 12, 0.7)} className="mu-couple-names text-3xl text-(--mu-primary) tracking-wide">{config.groom_name} &amp; {config.bride_name}</motion.h2>
          </motion.div>
        </div>
        <RSVPDelete open={rsvp.showDeleteDialog} onConfirm={rsvp.handleDeleteConfirm} onCancel={() => rsvp.setShowDeleteDialog(false)} classNames={rsvpDeleteClassNames} labels={rsvpDeleteLabels} />
      </section>

      <AnchorDock ready={ready} eventConfig={eventConfig} scrollItems={anchorItems}
        classNames={mughalIndianAnchors.classNames} drawerClassNames={mughalIndianAnchors.drawer} labels={mughalIndianAnchors.labels}
        calendar={{ title: `Wedding of ${config.groom_name ?? ""} & ${config.bride_name ?? ""}`, location: config.venue_address }}
        map={{ embedUrl: config.venue_map_embed_url, link: config.venue_map_link, address: config.venue_address }} />
    </div>
  )
}

export default MughalIndian
