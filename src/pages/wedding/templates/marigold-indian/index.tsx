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

import type { MarigoldIndianPageConfig } from "./types"
import { rsvpClassNames, rsvpLabels, rsvpDeleteClassNames, rsvpDeleteLabels } from "./form"
import { marigoldIndianAnchors } from "./anchors"
import slugCss from "./styles.css?inline"

const Lottie = (LottieRaw as any).default ?? LottieRaw

const DEFAULT_FONTS = {
  couple: resolveFont("DM Serif Display")!,
  number: resolveFont("DM Serif Display")!,
  heading: resolveFont("DM Serif Display")!,
  body: resolveFont("Poppins")!,
}

const CONFETTI_COLORS = ["#e8731c", "#c0246a", "#4f7c34", "#d99a2b", "#ffeccb"]

// ─── Marigold motifs ────────────────────────────────────────────────────────────

const Marigold = ({ size = 56, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
    {Array.from({ length: 16 }).map((_, i) => (
      <ellipse key={`o${i}`} cx={50} cy={18} rx={7} ry={13} fill="var(--mg-primary)" opacity={0.85} transform={`rotate(${i * 22.5} 50 50)`} />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse key={`m${i}`} cx={50} cy={28} rx={6} ry={10} fill="var(--mg-gold)" transform={`rotate(${i * 30 + 15} 50 50)`} />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={`i${i}`} cx={50} cy={36} rx={5} ry={7} fill="var(--mg-primary-deep)" transform={`rotate(${i * 45} 50 50)`} />
    ))}
    <circle cx={50} cy={50} r={6} fill="var(--mg-magenta)" />
  </svg>
)

const MangoLeaf = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 40" width={16} height={26} className={className} aria-hidden>
    <path d="M12 2 C4 12 4 28 12 38 C20 28 20 12 12 2 Z" fill="var(--mg-green)" />
    <path d="M12 4 L12 36" stroke="var(--mg-bg)" strokeWidth={1} opacity={0.5} />
  </svg>
)

// A hanging toran: a swag string with alternating marigolds and mango leaves.
const Toran = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-start justify-center gap-1.5 sm:gap-2.5", className)} aria-hidden>
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center" style={{ marginTop: `${Math.abs(i - 4) * 6}px` }}>
        {i % 2 === 0 ? <Marigold size={i === 4 ? 30 : 22} /> : <MangoLeaf />}
      </div>
    ))}
  </div>
)

const GarlandDivider = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-2 text-(--mg-primary)/50", className)}>
    <span className="h-px w-14 bg-linear-to-r from-transparent to-current" />
    <Marigold size={18} />
    <MangoLeaf />
    <Marigold size={18} />
    <span className="h-px w-14 bg-linear-to-l from-transparent to-current" />
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
        <div key={u.key} className="flex flex-col items-center rounded-xl bg-(--mg-magenta) text-(--mg-on-primary) w-20 py-2.5">
          <span className="mg-countdown-number text-3xl tabular-nums leading-none">{String(t[u.key]).padStart(2, "0")}</span>
          <span className="mt-1.5 text-3xs uppercase tracking-[0.18em] opacity-80">{u.label}</span>
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
        <motion.div className="fixed inset-0 z-100 flex items-center justify-center bg-(--mg-bg)" initial={{ opacity: 1 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} onAnimationComplete={() => { if (leaving) setVisible(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.4, rotate: -40 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
            <Marigold size={96} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Template ────────────────────────────────────────────────────────────────

const MarigoldIndian = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<MarigoldIndianPageConfig>
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
    <motion.p key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-(--mg-muted-fg) italic leading-relaxed py-8">{message}</motion.p>
  )
  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie animationData={successCheck} loop={false} style={{ width: 76, height: 76, margin: "0 auto" }} />
      <motion.div key="success-content" initial={rsvp.submitted ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <h3 className="text-2xl font-medium my-3 text-(--mg-magenta)">{config.rsvp_success_heading}</h3>
        <motion.p initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className="text-(--mg-muted-fg) leading-relaxed mb-6">{eventConfig.confirmation_message}</motion.p>
        <motion.div initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => rsvp.setIsEditing(true)} className="rounded-xl bg-transparent text-(--mg-fg) border-(--mg-primary)/40 hover:bg-(--mg-bg-2) gap-2 font-bold tracking-widest uppercase text-xs shrink-0"><Edit2 size={14} className="text-(--mg-primary)" /> Edit</Button>
          <Button variant="outline" size="sm" disabled={rsvp.removePending} onClick={() => rsvp.setShowDeleteDialog(true)} className="rounded-xl bg-transparent text-(--mg-fg) border-(--mg-primary)/40 hover:border-(--mg-destructive)/50 hover:text-(--mg-destructive) gap-2 font-bold tracking-widest uppercase text-xs shrink-0"><Trash2 size={14} className="text-(--mg-primary)" />{rsvp.removePending ? "Removing…" : "Delete"}</Button>
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
  const anchorItems = marigoldIndianAnchors.items.filter((item) => !item.when || item.when(config))

  return (
    <div className="mg-root relative min-h-svh bg-(--mg-bg) text-(--mg-fg)" style={rootStyle}>
      <Preloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-svh flex flex-col items-center justify-center text-center px-6 pb-20 pt-10">
        <motion.div initial="hidden" animate={ready ? "show" : "hidden"} className="w-full max-w-lg mx-auto">
          <motion.div variants={heroMake(0)} className="mb-10"><Toran /></motion.div>
          <motion.p variants={heroMake(0.2)} className="text-(--mg-muted-fg) text-base mb-6 whitespace-pre-line mg-devanagari">{config.greeting}</motion.p>
          <motion.p variants={heroMake(0.45)} className="text-(--mg-green) text-xs tracking-[0.4em] uppercase font-semibold mb-4">{config.hero_divider_label}</motion.p>
          <motion.h1 variants={heroMake(0.65, 22, 1)} className="mg-couple-names text-5xl sm:text-6xl text-(--mg-primary-deep) leading-tight">{config.groom_name}</motion.h1>
          <motion.div variants={heroMake(0.9)} className="my-3"><GarlandDivider /></motion.div>
          <motion.h1 variants={heroMake(1.05, 22, 1)} className="mg-couple-names text-5xl sm:text-6xl text-(--mg-magenta) leading-tight">{config.bride_name}</motion.h1>
          {weddingDate && <motion.div variants={heroMake(1.45)} className="mt-10"><InlineCountdown target={weddingDate} /></motion.div>}
          {config.quote && (
            <motion.div variants={heroMake(1.75)} className="mt-10">
              <p className="text-(--mg-fg)/85 leading-relaxed whitespace-pre-line max-w-md mx-auto mg-devanagari">{config.quote}</p>
              {config.quote_source && <span className="block mt-3 text-(--mg-muted-fg) text-xs tracking-[0.2em] uppercase">{config.quote_source}</span>}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Invitation + Details ── bold magenta band */}
      <section id="details" className="px-6 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="max-w-lg mx-auto rounded-3xl border-2 border-(--mg-border) bg-(--mg-card) p-8 sm:p-10 text-center shadow-sm">
          <motion.div variants={fadeIn(0)} className="flex justify-center mb-5"><Marigold size={42} /></motion.div>
          <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl font-medium text-(--mg-primary-deep) mb-5">{config.section_title ?? "With the blessings of our families"}</motion.h2>
          {config.invitation_body && <motion.p variants={fadeUp(0.2, 14, 0.8)} className="text-(--mg-muted-fg) leading-relaxed">{config.invitation_body}</motion.p>}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-8">
              <p className="text-(--mg-muted-fg) text-sm mb-2">{config.blessings_prefix}</p>
              {config.blessings_name && <h3 className="text-2xl font-medium text-(--mg-magenta) whitespace-pre-line">{config.blessings_name}</h3>}
              {config.blessings_label && <p className="text-(--mg-muted-fg) text-sm mt-1">{config.blessings_label}</p>}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <motion.div variants={fadeIn(0.3)} className="mt-8 grid grid-cols-2 gap-3">
              {detailsList.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp(idx * 0.08, 10, 0.6)} className="rounded-xl bg-(--mg-bg) py-4 px-3">
                  <p className="text-2xs uppercase tracking-[0.22em] text-(--mg-green) font-semibold mb-1">{item.title}</p>
                  <p className="text-base text-(--mg-fg)">{item.detail}</p>
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
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mb-8">
              <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl font-medium text-(--mg-primary-deep)">{config.itinerary_title ?? "The Celebrations"}</motion.h2>
              <motion.div variants={fadeIn(0.2)} className="mt-3"><GarlandDivider /></motion.div>
            </motion.div>
            <div className="flex flex-col gap-5">
              {itinerarySections.map((section, si) => (
                <motion.div key={si} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeUp(0, 14, 0.6)} className="rounded-2xl border-2 border-(--mg-border) bg-(--mg-card) p-5">
                  <p className="text-xl font-medium text-(--mg-magenta) mb-3">{section.title}</p>
                  <div className="flex flex-col gap-1.5 text-(--mg-muted-fg)">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-baseline justify-center gap-3 text-sm">
                        <span className="tabular-nums text-(--mg-primary) font-semibold">{item.time}</span>
                        {item.label && <span>· {item.label}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {config.footnote && <motion.p initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeIn(0.1)} className="mt-8 text-(--mg-muted-fg) italic text-sm">{config.footnote}</motion.p>}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section ref={rsvp.sectionRef} id="rsvp" className="py-16 px-6">
        <div className="max-w-md mx-auto">
          <motion.div layout transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeIn(0, 0.8)} className="rounded-3xl border-2 border-(--mg-border) bg-(--mg-card) p-8 shadow-sm">
            <div className="text-center mb-8">
              <motion.div variants={fadeIn(0)} className="flex justify-center mb-4"><Marigold size={42} /></motion.div>
              <motion.h2 variants={fadeUp(0.1, 12, 0.6)} className="text-3xl font-medium text-(--mg-primary-deep)">RSVP</motion.h2>
              <motion.p variants={fadeUp(0.2, 10, 0.6)} className="text-(--mg-muted-fg) mt-2 text-sm">{config.rsvp_subtitle}</motion.p>
            </div>
            <AnimatePresence mode="popLayout">{renderRsvpBody()}</AnimatePresence>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="mt-14 text-center">
            <motion.div variants={fadeIn(0)} className="mb-5"><GarlandDivider /></motion.div>
            <motion.p variants={fadeUp(0.1, 10, 0.6)} className="text-2xs uppercase tracking-[0.3em] text-(--mg-muted-fg) mb-3">{config.footer_tagline}</motion.p>
            <motion.h2 variants={fadeUp(0.2, 12, 0.7)} className="mg-couple-names text-3xl text-(--mg-primary-deep)">{config.groom_name} &amp; {config.bride_name}</motion.h2>
          </motion.div>
        </div>
        <RSVPDelete open={rsvp.showDeleteDialog} onConfirm={rsvp.handleDeleteConfirm} onCancel={() => rsvp.setShowDeleteDialog(false)} classNames={rsvpDeleteClassNames} labels={rsvpDeleteLabels} />
      </section>

      <AnchorDock ready={ready} eventConfig={eventConfig} scrollItems={anchorItems}
        classNames={marigoldIndianAnchors.classNames} drawerClassNames={marigoldIndianAnchors.drawer} labels={marigoldIndianAnchors.labels}
        calendar={{ title: `Wedding of ${config.groom_name ?? ""} & ${config.bride_name ?? ""}`, location: config.venue_address }}
        map={{ embedUrl: config.venue_map_embed_url, link: config.venue_map_link, address: config.venue_address }} />
    </div>
  )
}

export default MarigoldIndian
