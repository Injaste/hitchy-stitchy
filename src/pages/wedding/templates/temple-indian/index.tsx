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

import type { TempleIndianPageConfig } from "./types"
import { rsvpClassNames, rsvpLabels, rsvpDeleteClassNames, rsvpDeleteLabels } from "./form"
import { templeIndianAnchors } from "./anchors"
import slugCss from "./styles.css?inline"

const Lottie = (LottieRaw as any).default ?? LottieRaw

const DEFAULT_FONTS = {
  couple: resolveFont("Forum")!,
  number: resolveFont("Forum")!,
  heading: resolveFont("Forum")!,
  body: resolveFont("Lora")!,
}

const CONFETTI_COLORS = ["#8c1d2b", "#b8860b", "#c69214", "#fdf6ea", "#571820"]

// ─── Temple motifs ──────────────────────────────────────────────────────────────

// A single stepped gopuram tower silhouette.
const Gopuram = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 40 48" width={22} height={26} className={className} aria-hidden>
    <polygon points="20,2 24,10 16,10" fill="var(--tp-primary)" />
    <rect x={17} y={9} width={6} height={4} fill="var(--tp-gold)" />
    <polygon points="12,13 28,13 26,21 14,21" fill="var(--tp-primary)" />
    <polygon points="9,21 31,21 29,31 11,31" fill="var(--tp-primary)" />
    <polygon points="6,31 34,31 32,44 8,44" fill="var(--tp-primary)" />
    <rect x={17} y={36} width={6} height={8} fill="var(--tp-bg)" />
  </svg>
)

// A horizontal temple-border band: a repeating row of gopuram towers.
const GopuramBorder = ({ className = "", count = 11 }: { className?: string; count?: number }) => (
  <div className={cn("flex items-end justify-center gap-1 overflow-hidden", className)} aria-hidden>
    {Array.from({ length: count }).map((_, i) => <Gopuram key={i} />)}
  </div>
)

// A kolam-inspired motif — dotted square with looping corners.
const Kolam = ({ size = 60, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} className={className} fill="none" stroke="var(--tp-primary)" strokeWidth={1.2} aria-hidden>
    <path d="M40 12 C52 12 68 28 68 40 C68 52 52 68 40 68 C28 68 12 52 12 40 C12 28 28 12 40 12 Z" strokeDasharray="1 4" />
    <path d="M40 22 L58 40 L40 58 L22 40 Z" />
    <path d="M40 30 L50 40 L40 50 L30 40 Z" fill="var(--tp-gold)" fillOpacity={0.18} />
    {[[40,8],[72,40],[40,72],[8,40]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={2} fill="var(--tp-gold)" stroke="none" />)}
    <circle cx={40} cy={40} r={3} fill="var(--tp-primary)" stroke="none" />
  </svg>
)

const KolamDivider = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-3 text-(--tp-primary)/50", className)}>
    <span className="h-px w-14 bg-linear-to-r from-transparent to-current" />
    <Kolam size={26} />
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
    <div className="flex items-stretch justify-center divide-x divide-(--tp-border)">
      {UNITS.map((u) => (
        <div key={u.key} className="flex flex-col items-center w-20">
          <span className="tp-countdown-number text-3xl text-(--tp-primary) tabular-nums leading-none">{String(t[u.key]).padStart(2, "0")}</span>
          <span className="mt-1.5 text-3xs uppercase tracking-[0.18em] text-(--tp-gold)">{u.label}</span>
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
        <motion.div className="fixed inset-0 z-100 flex items-center justify-center bg-(--tp-bg)" initial={{ opacity: 1 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} onAnimationComplete={() => { if (leaving) setVisible(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.6, rotate: 45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
            <Kolam size={96} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Template ────────────────────────────────────────────────────────────────

const TempleIndian = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<TempleIndianPageConfig>
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
    <motion.p key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-(--tp-muted-fg) italic leading-relaxed py-8">{message}</motion.p>
  )
  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie animationData={successCheck} loop={false} style={{ width: 76, height: 76, margin: "0 auto" }} />
      <motion.div key="success-content" initial={rsvp.submitted ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <h3 className="text-2xl my-3 text-(--tp-primary)">{config.rsvp_success_heading}</h3>
        <motion.p initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className="text-(--tp-muted-fg) leading-relaxed mb-6">{eventConfig.confirmation_message}</motion.p>
        <motion.div initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => rsvp.setIsEditing(true)} className="rounded-none bg-transparent text-(--tp-fg) border-(--tp-primary)/40 hover:bg-(--tp-bg-2) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"><Edit2 size={14} className="text-(--tp-primary)" /> Edit</Button>
          <Button variant="outline" size="sm" disabled={rsvp.removePending} onClick={() => rsvp.setShowDeleteDialog(true)} className="rounded-none bg-transparent text-(--tp-fg) border-(--tp-primary)/40 hover:border-(--tp-destructive)/50 hover:text-(--tp-destructive) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"><Trash2 size={14} className="text-(--tp-primary)" />{rsvp.removePending ? "Removing…" : "Delete"}</Button>
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
  const anchorItems = templeIndianAnchors.items.filter((item) => !item.when || item.when(config))

  return (
    <div className="tp-root relative min-h-svh bg-(--tp-bg) text-(--tp-fg)" style={rootStyle}>
      <Preloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />

      {/* ── Hero ── temple-border crown */}
      <section id="hero" className="relative min-h-svh flex flex-col items-center justify-center text-center px-6 pb-20 pt-8">
        <motion.div initial="hidden" animate={ready ? "show" : "hidden"} className="w-full max-w-lg mx-auto">
          <motion.div variants={heroMake(0)} className="mb-8"><GopuramBorder /></motion.div>
          <motion.p variants={heroMake(0.2)} className="text-(--tp-muted-fg) text-base mb-5 whitespace-pre-line tp-devanagari">{config.greeting}</motion.p>
          <motion.p variants={heroMake(0.4)} className="text-(--tp-gold) text-xs tracking-[0.4em] uppercase mb-4">{config.hero_divider_label}</motion.p>
          <motion.h1 variants={heroMake(0.6, 22, 1)} className="tp-couple-names text-5xl sm:text-6xl text-(--tp-primary) leading-tight">{config.groom_name}</motion.h1>
          <motion.div variants={heroMake(0.85)} className="my-3"><KolamDivider /></motion.div>
          <motion.h1 variants={heroMake(1.0, 22, 1)} className="tp-couple-names text-5xl sm:text-6xl text-(--tp-primary) leading-tight">{config.bride_name}</motion.h1>
          {weddingDate && <motion.div variants={heroMake(1.4)} className="mt-10"><InlineCountdown target={weddingDate} /></motion.div>}
          {config.quote && (
            <motion.div variants={heroMake(1.7)} className="mt-10">
              <p className="text-(--tp-fg)/85 leading-relaxed whitespace-pre-line max-w-md mx-auto tp-devanagari">{config.quote}</p>
              {config.quote_source && <span className="block mt-3 text-(--tp-muted-fg) text-xs tracking-[0.2em] uppercase">{config.quote_source}</span>}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── Invitation + Details ── */}
      <section id="details" className="px-6 py-16">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="max-w-lg mx-auto rounded-none border-2 border-(--tp-primary)/25 bg-(--tp-card) p-8 sm:p-10 text-center">
          <motion.div variants={fadeIn(0)} className="flex justify-center mb-5"><Kolam size={44} /></motion.div>
          <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl text-(--tp-primary) mb-5">{config.section_title ?? "Shubha Vivaham"}</motion.h2>
          {config.invitation_body && <motion.p variants={fadeUp(0.2, 14, 0.8)} className="text-(--tp-muted-fg) leading-relaxed">{config.invitation_body}</motion.p>}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-8">
              <p className="text-(--tp-muted-fg) text-sm mb-2">{config.blessings_prefix}</p>
              {config.blessings_name && <h3 className="text-2xl text-(--tp-primary) whitespace-pre-line">{config.blessings_name}</h3>}
              {config.blessings_label && <p className="text-(--tp-muted-fg) text-sm mt-1">{config.blessings_label}</p>}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <motion.div variants={fadeIn(0.3)} className="mt-8 flex flex-col gap-2">
              {detailsList.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp(idx * 0.08, 10, 0.6)} className="flex items-center justify-center gap-3 py-2">
                  <Gopuram />
                  <div className="text-left">
                    <p className="text-2xs uppercase tracking-[0.28em] text-(--tp-gold)">{item.title}</p>
                    <p className="text-lg text-(--tp-fg)">{item.detail}</p>
                  </div>
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
              <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl text-(--tp-primary)">{config.itinerary_title ?? "Muhurtham"}</motion.h2>
              <motion.div variants={fadeIn(0.2)} className="mt-3"><KolamDivider /></motion.div>
            </motion.div>
            <div className="flex flex-col gap-5">
              {itinerarySections.map((section, si) => (
                <motion.div key={si} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeUp(0, 14, 0.6)} className="border border-(--tp-primary)/20 bg-(--tp-card) p-5">
                  <p className="text-xl text-(--tp-primary) mb-3">{section.title}</p>
                  <div className="flex flex-col gap-1.5 text-(--tp-muted-fg)">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-baseline justify-center gap-3 text-sm">
                        <span className="tabular-nums text-(--tp-gold)">{item.time}</span>
                        {item.label && <span>· {item.label}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {config.footnote && <motion.p initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeIn(0.1)} className="mt-9 text-(--tp-muted-fg) italic text-sm">{config.footnote}</motion.p>}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section ref={rsvp.sectionRef} id="rsvp" className="py-16 px-6">
        <div className="max-w-md mx-auto">
          <motion.div layout transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeIn(0, 0.8)} className="rounded-none border-2 border-(--tp-primary)/25 bg-(--tp-card) p-8">
            <div className="text-center mb-8">
              <motion.div variants={fadeIn(0)} className="flex justify-center mb-4"><Kolam size={44} /></motion.div>
              <motion.h2 variants={fadeUp(0.1, 12, 0.6)} className="text-3xl text-(--tp-primary)">RSVP</motion.h2>
              <motion.p variants={fadeUp(0.2, 10, 0.6)} className="text-(--tp-muted-fg) mt-2 text-sm">{config.rsvp_subtitle}</motion.p>
            </div>
            <AnimatePresence mode="popLayout">{renderRsvpBody()}</AnimatePresence>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="mt-14 text-center">
            <motion.div variants={fadeIn(0)} className="mb-6"><GopuramBorder count={9} /></motion.div>
            <motion.p variants={fadeUp(0.1, 10, 0.6)} className="text-2xs uppercase tracking-[0.3em] text-(--tp-muted-fg) mb-3">{config.footer_tagline}</motion.p>
            <motion.h2 variants={fadeUp(0.2, 12, 0.7)} className="tp-couple-names text-3xl text-(--tp-primary)">{config.groom_name} &amp; {config.bride_name}</motion.h2>
          </motion.div>
        </div>
        <RSVPDelete open={rsvp.showDeleteDialog} onConfirm={rsvp.handleDeleteConfirm} onCancel={() => rsvp.setShowDeleteDialog(false)} classNames={rsvpDeleteClassNames} labels={rsvpDeleteLabels} />
      </section>

      <AnchorDock ready={ready} eventConfig={eventConfig} scrollItems={anchorItems}
        classNames={templeIndianAnchors.classNames} drawerClassNames={templeIndianAnchors.drawer} labels={templeIndianAnchors.labels}
        calendar={{ title: `Wedding of ${config.groom_name ?? ""} & ${config.bride_name ?? ""}`, location: config.venue_address }}
        map={{ embedUrl: config.venue_map_embed_url, link: config.venue_map_link, address: config.venue_address }} />
    </div>
  )
}

export default TempleIndian
