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

import type { ImperialChinesePageConfig } from "./types"
import { rsvpClassNames, rsvpLabels, rsvpDeleteClassNames, rsvpDeleteLabels } from "./form"
import { imperialChineseAnchors } from "./anchors"
import slugCss from "./styles.css?inline"

const Lottie = (LottieRaw as any).default ?? LottieRaw

const DEFAULT_FONTS = {
  couple: resolveFont("Bodoni Moda")!,
  number: resolveFont("Bodoni Moda")!,
  heading: resolveFont("Cormorant Garamond")!,
  body: resolveFont("EB Garamond")!,
}

const CONFETTI_COLORS = ["#c9a14e", "#e2c478", "#f3e3c8", "#6a2a2e", "#3a0f14"]

// ─── Lantern + cloud-scroll motifs ──────────────────────────────────────────────

const Lantern = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 48 66" width={size * (48 / 66)} height={size} className={className} aria-hidden stroke="var(--im-gold)" fill="none">
    <line x1={24} y1={1} x2={24} y2={6} strokeWidth={1.2} />
    <rect x={17} y={6} width={14} height={4} rx={1} fill="var(--im-gold)" stroke="none" />
    <ellipse cx={24} cy={33} rx={18} ry={22} strokeWidth={1.5} fill="var(--im-gold)" fillOpacity={0.12} />
    <line x1={24} y1={11} x2={24} y2={55} strokeWidth={0.7} opacity={0.5} />
    <path d="M9 26 Q 24 21 39 26" strokeWidth={0.7} opacity={0.5} />
    <path d="M7 33 Q 24 28 41 33" strokeWidth={0.7} opacity={0.5} />
    <path d="M9 40 Q 24 45 39 40" strokeWidth={0.7} opacity={0.5} />
    <rect x={17} y={55} width={14} height={4} rx={1} fill="var(--im-gold)" stroke="none" />
    <line x1={24} y1={59} x2={24} y2={65} strokeWidth={1.2} />
  </svg>
)

const CloudScroll = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-3 text-(--im-gold)", className)}>
    <span className="h-px w-14 bg-linear-to-r from-transparent to-current" />
    <svg viewBox="0 0 60 22" width={48} height={18} aria-hidden stroke="currentColor" fill="none" strokeWidth={1.4} strokeLinecap="round">
      <path d="M6 16 q0 -9 9 -9 q6 0 6 6 q0 3 -3 3 q-2 0 -2 -2.5" />
      <path d="M54 16 q0 -9 -9 -9 q-6 0 -6 6 q0 3 3 3 q2 0 2 -2.5" />
      <path d="M21 16 h18" />
    </svg>
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
const HERO_BASE = 1.1
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
    <div className="flex items-center justify-center">
      {UNITS.map((u, i) => (
        <div key={u.key} className="flex items-center">
          {i > 0 && <span className="mx-3 size-1 rotate-45 bg-(--im-gold)/60 shrink-0" />}
          <div className="flex flex-col items-center w-16">
            <span className="im-countdown-number text-3xl text-(--im-gold-soft) tabular-nums leading-none">{String(t[u.key]).padStart(2, "0")}</span>
            <span className="mt-1.5 text-3xs uppercase tracking-[0.2em] text-(--im-muted-fg)">{u.label}</span>
          </div>
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
        <motion.div className="fixed inset-0 z-100 flex items-center justify-center bg-(--im-bg)" initial={{ opacity: 1 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} onAnimationComplete={() => { if (leaving) setVisible(false) }}>
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <Lantern size={88} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Template ────────────────────────────────────────────────────────────────

const ImperialChinese = ({ eventConfig, pageConfig, loaderReady }: ThemeProps) => {
  const config = (pageConfig ?? {}) as Partial<ImperialChinesePageConfig>
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
    <motion.p key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-(--im-muted-fg) italic leading-relaxed py-8">{message}</motion.p>
  )
  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie animationData={successCheck} loop={false} style={{ width: 76, height: 76, margin: "0 auto" }} />
      <motion.div key="success-content" initial={rsvp.submitted ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <h3 className="text-2xl font-medium my-3 text-(--im-gold-soft) italic">{config.rsvp_success_heading}</h3>
        <motion.p initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className="text-(--im-muted-fg) leading-relaxed italic mb-6">{eventConfig.confirmation_message}</motion.p>
        <motion.div initial={rsvp.submitted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => rsvp.setIsEditing(true)} className="rounded-sm bg-transparent text-(--im-fg) border-(--im-gold)/40 hover:bg-(--im-bg-2) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"><Edit2 size={14} className="text-(--im-gold)" /> Edit</Button>
          <Button variant="outline" size="sm" disabled={rsvp.removePending} onClick={() => rsvp.setShowDeleteDialog(true)} className="rounded-sm bg-transparent text-(--im-fg) border-(--im-gold)/40 hover:border-(--im-destructive)/50 hover:text-(--im-destructive) gap-2 font-semibold tracking-widest uppercase text-xs shrink-0"><Trash2 size={14} className="text-(--im-gold)" />{rsvp.removePending ? "Removing…" : "Delete"}</Button>
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
  const anchorItems = imperialChineseAnchors.items.filter((item) => !item.when || item.when(config))

  return (
    <div className="im-root relative min-h-svh bg-(--im-bg) text-(--im-fg)" style={rootStyle}>
      <Preloader loaderReady={!!loaderReady} onExitComplete={() => setReady(true)} />

      {/* ── Hero ── */}
      <section id="hero" className="relative min-h-svh flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div initial="hidden" animate={ready ? "show" : "hidden"} className="w-full max-w-lg mx-auto">
          <motion.div variants={heroMake(0)} className="flex justify-center mb-8"><Lantern size={64} /></motion.div>
          <motion.p variants={heroMake(0.2)} className="text-(--im-muted-fg) text-base italic mb-8 whitespace-pre-line im-hanzi">{config.greeting}</motion.p>
          <motion.div variants={heroMake(0.4)}><CloudScroll className="mb-6" /></motion.div>
          <motion.p variants={heroMake(0.55)} className="text-(--im-gold) text-xs tracking-[0.4em] uppercase mb-5">{config.hero_divider_label}</motion.p>
          <motion.h1 variants={heroMake(0.75, 22, 1)} className="im-couple-names text-4xl sm:text-5xl uppercase text-(--im-gold-soft) leading-tight">{config.groom_name}</motion.h1>
          <motion.p variants={heroMake(1.0)} className="im-couple-names text-2xl text-(--im-gold) my-3">&amp;</motion.p>
          <motion.h1 variants={heroMake(1.15, 22, 1)} className="im-couple-names text-4xl sm:text-5xl uppercase text-(--im-gold-soft) leading-tight">{config.bride_name}</motion.h1>
          {weddingDate && <motion.div variants={heroMake(1.5)} className="mt-10"><InlineCountdown target={weddingDate} /></motion.div>}
          <motion.div variants={heroMake(1.8)} className="mt-10">
            <CloudScroll className="mb-6" />
            <p className="text-(--im-fg)/85 leading-relaxed italic whitespace-pre-line max-w-md mx-auto im-hanzi">{config.quote}</p>
            <span className="block mt-3 text-(--im-muted-fg) text-xs tracking-[0.25em] uppercase">{config.quote_source}</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Invitation + Details ── */}
      <section id="details" className="py-20 px-6 bg-(--im-bg-2)/40">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="max-w-lg mx-auto rounded-sm border border-(--im-gold)/40 bg-(--im-card)/70 p-8 sm:p-10 text-center shadow-lg">
          <motion.div variants={fadeIn(0)} className="flex justify-center mb-5"><Lantern size={42} /></motion.div>
          <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl font-medium italic text-(--im-gold-soft) mb-5">{config.section_title ?? "A Celebration of Love"}</motion.h2>
          {config.invitation_body && <motion.p variants={fadeUp(0.2, 14, 0.8)} className="text-(--im-muted-fg) leading-relaxed">{config.invitation_body}</motion.p>}
          {(config.blessings_name || config.blessings_label) && (
            <motion.div variants={fadeIn(0.25)} className="mt-8">
              <p className="text-(--im-muted-fg) text-sm mb-2">{config.blessings_prefix}</p>
              {config.blessings_name && <h3 className="text-2xl font-medium text-(--im-gold-soft) whitespace-pre-line italic">{config.blessings_name}</h3>}
              {config.blessings_label && <p className="text-(--im-muted-fg) text-sm mt-1">{config.blessings_label}</p>}
            </motion.div>
          )}
          {detailsList.length > 0 && (
            <motion.div variants={fadeIn(0.3)} className="mt-8 flex flex-col">
              {detailsList.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp(idx * 0.08, 10, 0.6)} className="py-3.5 border-t border-(--im-gold)/20 last:border-b">
                  <p className="text-2xs uppercase tracking-[0.3em] text-(--im-gold) mb-1">{item.title}</p>
                  <p className="text-lg text-(--im-fg)">{item.detail}</p>
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
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="mb-10">
              <motion.div variants={fadeIn(0)} className="flex justify-center mb-4"><Lantern size={36} /></motion.div>
              <motion.h2 variants={fadeUp(0.1, 14, 0.7)} className="text-3xl font-medium italic text-(--im-gold-soft)">{config.itinerary_title ?? "Programme"}</motion.h2>
            </motion.div>
            <div className="flex flex-col">
              {itinerarySections.map((section, si) => (
                <motion.div key={si} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeUp(0, 14, 0.6)}>
                  {si > 0 && <CloudScroll className="my-7" />}
                  <p className="im-couple-names text-xl uppercase text-(--im-gold-soft) mb-3">{section.title}</p>
                  <div className="flex flex-col gap-1.5 text-(--im-muted-fg)">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-baseline justify-center gap-3 text-sm">
                        <span className="tabular-nums text-(--im-gold)">{item.time}</span>
                        {item.label && <span>· {item.label}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {config.footnote && <motion.p initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fadeIn(0.1)} className="mt-10 text-(--im-muted-fg) italic text-sm">{config.footnote}</motion.p>}
          </div>
        </section>
      )}

      {/* ── RSVP ── */}
      <section ref={rsvp.sectionRef} id="rsvp" className="py-20 px-6 bg-(--im-bg-2)/40">
        <div className="max-w-md mx-auto">
          <motion.div layout transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fadeIn(0, 0.8)} className="rounded-sm border border-(--im-gold)/40 bg-(--im-card) p-8 shadow-lg">
            <div className="text-center mb-8">
              <motion.div variants={fadeIn(0)} className="flex justify-center mb-4"><Lantern size={40} /></motion.div>
              <motion.h2 variants={fadeUp(0.1, 12, 0.6)} className="text-3xl font-medium text-(--im-gold-soft) italic">RSVP</motion.h2>
              <motion.p variants={fadeUp(0.2, 10, 0.6)} className="text-(--im-muted-fg) italic mt-2 text-sm">{config.rsvp_subtitle}</motion.p>
            </div>
            <AnimatePresence mode="popLayout">{renderRsvpBody()}</AnimatePresence>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="mt-14 text-center">
            <motion.div variants={fadeIn(0)} className="flex justify-center mb-5"><Lantern size={34} /></motion.div>
            <motion.p variants={fadeUp(0.1, 10, 0.6)} className="text-2xs uppercase tracking-[0.3em] text-(--im-muted-fg) mb-3">{config.footer_tagline}</motion.p>
            <motion.h2 variants={fadeUp(0.2, 12, 0.7)} className="im-couple-names text-2xl uppercase text-(--im-gold-soft)">{config.groom_name} &amp; {config.bride_name}</motion.h2>
          </motion.div>
        </div>
        <RSVPDelete open={rsvp.showDeleteDialog} onConfirm={rsvp.handleDeleteConfirm} onCancel={() => rsvp.setShowDeleteDialog(false)} classNames={rsvpDeleteClassNames} labels={rsvpDeleteLabels} />
      </section>

      <AnchorDock ready={ready} eventConfig={eventConfig} scrollItems={anchorItems}
        classNames={imperialChineseAnchors.classNames} drawerClassNames={imperialChineseAnchors.drawer} labels={imperialChineseAnchors.labels}
        calendar={{ title: `Wedding of ${config.groom_name ?? ""} & ${config.bride_name ?? ""}`, location: config.venue_address }}
        map={{ embedUrl: config.venue_map_embed_url, link: config.venue_map_link, address: config.venue_address }} />
    </div>
  )
}

export default ImperialChinese
