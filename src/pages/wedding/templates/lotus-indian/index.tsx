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

import type { LotusIndianPageConfig } from "./types"
import { rsvpClassNames, rsvpLabels, rsvpDeleteClassNames, rsvpDeleteLabels } from "./form"
import { lotusIndianAnchors } from "./anchors"
import slugCss from "./styles.css?inline"

const Lottie = (LottieRaw as any).default ?? LottieRaw

const DEFAULT_FONTS = {
  couple: resolveFont("Cormorant Garamond")!,
  number: resolveFont("Jost")!,
  heading: resolveFont("Jost")!,
  body: resolveFont("Jost")!,
}

const CONFETTI_COLORS = ["#b76e79", "#c4a06a", "#e7ddd0", "#fffdfa", "#9c5760"]

// ─── Lotus line-art ──────────────────────────────────────────────────────────────

const Lotus = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 100 70" width={size} height={size * 0.7} className={className} fill="none" stroke="var(--lt-primary)" strokeWidth={1.2} strokeLinejoin="round" aria-hidden>
    <path d="M50 66 C50 40 50 20 50 8 C58 22 60 44 50 66 Z" />
    <path d="M50 66 C40 44 38 26 30 16 C30 38 34 54 50 66 Z" />
    <path d="M50 66 C60 44 62 26 70 16 C70 38 66 54 50 66 Z" />
    <path d="M50 66 C30 52 18 40 10 30 C24 34 42 48 50 66 Z" />
    <path d="M50 66 C70 52 82 40 90 30 C76 34 58 48 50 66 Z" />
  </svg>
)

const Hairline = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-3 text-(--lt-gold)/60", className)}>
    <span className="h-px w-10 bg-current" />
    <span className="size-1 rotate-45 bg-current" />
    <span className="h-px w-10 bg-current" />
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
    <div className="flex items-start justify-center gap-4">
      {UNITS.map((u) => (
        <div key={u.key} className="flex flex-col items-center w-16">
          <span className="lt-countdown-number text-2xl text-(--lt-fg) tabular-nums leading-none font-light">{String(t[u.key]).padStart(2, "0")}</span>
          <span className="mt-2 text-3xs uppercase tracking-[0.24em] text-(--lt-muted-fg)">{u.label}</span>
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
        <motion.div className="fixed inset-0 z-100 flex items-center justify-center bg-(--lt-bg)" initial={{ opacity: 1 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} onAnimationComplete={() => { if (leaving) setVisible(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.7, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <Lotus size={84} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Template ────────────────────────────────────────────────────────────────

const LotusIndian = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<LotusIndianPageConfig>
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
    <motion.p key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-(--lt-muted-fg) italic leading-relaxed py-8">{message}</motion.p>
  )
  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie animationData={successCheck} loop={false} style={{ width: 72, height: 72, margin: "0 auto" }} />
      <motion.div key="success-content" initial={rsvp.submitted ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <h3 className="text-2xl my-3 text-(--lt-primary) font-light">{config.rsvp_success_heading}</h3>
        <motion.p initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className="text-(--lt-muted-fg) leading-relaxed mb-6">{eventConfig.confirmation_message}</motion.p>
        <motion.div initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => rsvp.setIsEditing(true)} className="rounded-lg bg-transparent text-(--lt-fg) border-(--lt-border) hover:bg-(--lt-bg-2) gap-2 font-medium tracking-widest uppercase text-xs shrink-0"><Edit2 size={14} className="text-(--lt-primary)" /> Edit</Button>
          <Button variant="outline" size="sm" disabled={rsvp.removePending} onClick={() => rsvp.setShowDeleteDialog(true)} className="rounded-lg bg-transparent text-(--lt-fg) border-(--lt-border) hover:border-(--lt-destructive)/50 hover:text-(--lt-destructive) gap-2 font-medium tracking-widest uppercase text-xs shrink-0"><Trash2 size={14} className="text-(--lt-primary)" />{rsvp.removePending ? "Removing…" : "Delete"}</Button>
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
    if (rsvp.isEventOver) return renderClosed("event-over", "This event has already taken place.")
    if (rsvp.isDeadlinePassed) return renderClosed("deadline", rsvp.deadlineMessage)
    if (rsvp.existingRSVP && !rsvp.isEditing) return renderSuccess()
    if (rsvp.isLoading) return renderClosed("loading", "Checking RSVP status…")
    return renderForm()
  }
  const anchorItems = lotusIndianAnchors.items.filter((item) => !item.when || item.when(config))

  return (
    <div className="lt-root relative min-h-svh bg-(--lt-bg) text-(--lt-fg)" style={rootStyle}>
      <Preloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />

      {/* ── Hero ── airy, minimal */}
      <section id="hero" className="relative min-h-svh flex flex-col items-center justify-center text-center px-8 py-24">
        <motion.div initial="hidden" animate={ready ? "show" : "hidden"} className="w-full max-w-md mx-auto">
          <motion.div variants={heroMake(0)} className="flex justify-center mb-10"><Lotus size={56} /></motion.div>
          <motion.p variants={heroMake(0.2)} className="text-(--lt-muted-fg) text-xs tracking-[0.35em] uppercase mb-8">{config.hero_divider_label}</motion.p>
          <motion.h1 variants={heroMake(0.5, 22, 1)} className="lt-couple-names text-6xl sm:text-7xl text-(--lt-fg) leading-[1.05] font-light">{config.groom_name}</motion.h1>
          <motion.p variants={heroMake(0.75)} className="lt-couple-names text-3xl text-(--lt-primary) my-2 font-light">&amp;</motion.p>
          <motion.h1 variants={heroMake(0.9, 22, 1)} className="lt-couple-names text-6xl sm:text-7xl text-(--lt-fg) leading-[1.05] font-light">{config.bride_name}</motion.h1>
          {config.greeting && <motion.p variants={heroMake(1.2)} className="text-(--lt-muted-fg) text-base mt-8 whitespace-pre-line lt-devanagari">{config.greeting}</motion.p>}
          {weddingDate && <motion.div variants={heroMake(1.45)} className="mt-12"><InlineCountdown target={weddingDate} /></motion.div>}
          {config.quote && (
            <motion.div variants={heroMake(1.75)} className="mt-12">
              <Hairline className="mb-6" />
              <p className="text-(--lt-fg)/75 leading-relaxed italic whitespace-pre-line max-w-sm mx-auto font-light text-lg">{config.quote}</p>
              {config.quote_source && <span className="block mt-3 text-(--lt-muted-fg) text-xs tracking-[0.2em] uppercase">{config.quote_source}</span>}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Invitation + Details ── borderless, hairline-separated */}
      <section id="details" className="px-8 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="max-w-md mx-auto text-center">
          <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-xs uppercase tracking-[0.35em] text-(--lt-primary) mb-6">{config.section_title ?? "An Invitation"}</motion.h2>
          {config.invitation_body && <motion.p variants={fadeUp(0.2, 14, 0.8)} className="text-(--lt-fg)/80 leading-loose font-light text-lg">{config.invitation_body}</motion.p>}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-10">
              <p className="text-(--lt-muted-fg) text-sm mb-2">{config.blessings_prefix}</p>
              {config.blessings_name && <h3 className="text-2xl text-(--lt-fg) whitespace-pre-line font-light">{config.blessings_name}</h3>}
              {config.blessings_label && <p className="text-(--lt-muted-fg) text-sm mt-1">{config.blessings_label}</p>}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <motion.div variants={fadeIn(0.3)} className="mt-12 flex flex-col gap-6">
              {detailsList.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp(idx * 0.08, 10, 0.6)}>
                  <p className="text-3xs uppercase tracking-[0.32em] text-(--lt-muted-fg) mb-1.5">{item.title}</p>
                  <p className="text-lg text-(--lt-fg) font-light">{item.detail}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
          <motion.div variants={fadeIn(0.4)} className="mt-12"><Hairline /></motion.div>
        </motion.div>
      </section>

      {/* ── Itinerary ── */}
      {itinerarySections.length > 0 && (
        <section id="itinerary" className="py-20 px-8">
          <div className="max-w-sm mx-auto text-center">
            <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeUp(0.1, 14, 0.7)} className="text-xs uppercase tracking-[0.35em] text-(--lt-primary) mb-10">{config.itinerary_title ?? "The Day"}</motion.h2>
            <div className="flex flex-col gap-8">
              {itinerarySections.map((section, si) => (
                <motion.div key={si} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeUp(0, 14, 0.6)}>
                  <p className="lt-couple-names text-2xl text-(--lt-fg) mb-2 font-light">{section.title}</p>
                  <div className="flex flex-col gap-1.5 text-(--lt-muted-fg)">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-baseline justify-center gap-3 text-sm">
                        <span className="tabular-nums text-(--lt-primary)">{item.time}</span>
                        {item.label && <span>· {item.label}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {config.footnote && <motion.p initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeIn(0.1)} className="mt-10 text-(--lt-muted-fg) italic text-sm">{config.footnote}</motion.p>}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section ref={rsvp.sectionRef} id="rsvp" className="py-20 px-8">
        <div className="max-w-md mx-auto">
          <motion.div layout transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeIn(0, 0.8)} className="rounded-2xl bg-(--lt-card) p-8 shadow-sm">
            <div className="text-center mb-8">
              <motion.div variants={fadeIn(0)} className="flex justify-center mb-4"><Lotus size={40} /></motion.div>
              <motion.h2 variants={fadeUp(0.1, 12, 0.6)} className="text-xs uppercase tracking-[0.35em] text-(--lt-primary)">RSVP</motion.h2>
              <motion.p variants={fadeUp(0.2, 10, 0.6)} className="text-(--lt-muted-fg) mt-3 text-sm font-light">{config.rsvp_subtitle}</motion.p>
            </div>
            <AnimatePresence mode="popLayout">{renderRsvpBody()}</AnimatePresence>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="mt-14 text-center">
            <motion.div variants={fadeIn(0)} className="mb-6"><Hairline /></motion.div>
            <motion.p variants={fadeUp(0.1, 10, 0.6)} className="text-3xs uppercase tracking-[0.32em] text-(--lt-muted-fg) mb-3">{config.footer_tagline}</motion.p>
            <motion.h2 variants={fadeUp(0.2, 12, 0.7)} className="lt-couple-names text-3xl text-(--lt-fg) font-light">{config.groom_name} &amp; {config.bride_name}</motion.h2>
          </motion.div>
        </div>
        <RSVPDelete open={rsvp.showDeleteDialog} onConfirm={rsvp.handleDeleteConfirm} onCancel={() => rsvp.setShowDeleteDialog(false)} classNames={rsvpDeleteClassNames} labels={rsvpDeleteLabels} />
      </section>

      <AnchorDock ready={ready} eventConfig={eventConfig} scrollItems={anchorItems}
        classNames={lotusIndianAnchors.classNames} drawerClassNames={lotusIndianAnchors.drawer} labels={lotusIndianAnchors.labels}
        calendar={{ title: `Wedding of ${config.groom_name ?? ""} & ${config.bride_name ?? ""}`, location: config.venue_address }}
        map={{ embedUrl: config.venue_map_embed_url, link: config.venue_map_link, address: config.venue_address }} />
    </div>
  )
}

export default LotusIndian
