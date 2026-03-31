import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  CalendarHeart,
  ListChecks,
  Users,
  Radio,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  heroHeadline,
  heroSub,
  heroActions,
  floatIn,
  staggerContainer,
  featureCard,
  dividerLine,
  statItem,
  testimonialCard,
} from "./animations";

/* ─── Decorative SVG: Wedding rings ─────────────────────────── */
function RingsSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="40" cy="30" r="22" stroke="currentColor" strokeWidth="3.5" fill="none" opacity="0.7" />
      <circle cx="80" cy="30" r="22" stroke="currentColor" strokeWidth="3.5" fill="none" opacity="0.7" />
    </svg>
  );
}

/* ─── Decorative SVG: Florals ────────────────────────────────── */
function FloralSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="40" cy="20" rx="8" ry="14" fill="currentColor" opacity="0.18" />
      <ellipse cx="40" cy="60" rx="8" ry="14" fill="currentColor" opacity="0.18" />
      <ellipse cx="20" cy="40" rx="14" ry="8" fill="currentColor" opacity="0.18" />
      <ellipse cx="60" cy="40" rx="14" ry="8" fill="currentColor" opacity="0.18" />
      <ellipse cx="26" cy="26" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(45 26 26)" />
      <ellipse cx="54" cy="26" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(-45 54 26)" />
      <ellipse cx="26" cy="54" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(-45 26 54)" />
      <ellipse cx="54" cy="54" rx="8" ry="14" fill="currentColor" opacity="0.12" transform="rotate(45 54 54)" />
      <circle cx="40" cy="40" r="6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/* ─── Feature data ───────────────────────────────────────────── */
const features = [
  {
    icon: CalendarHeart,
    title: "Event Timeline",
    description:
      "Orchestrate every moment across all wedding days. Assign times, venues, and owners to each cue with precision.",
  },
  {
    icon: ClipboardList,
    title: "RSVP Management",
    description:
      "A beautiful, customisable guest form. Track responses, dietary notes, and guest counts in real time.",
  },
  {
    icon: Users,
    title: "Team Coordination",
    description:
      "Assign roles to bridesmaids, groomsmen, and vendors. Everyone knows where to be and when.",
  },
  {
    icon: Radio,
    title: "Live Event Mode",
    description:
      "On the day, run a live feed of cues and check-ins. Never miss a moment — from the first look to the last dance.",
  },
  {
    icon: ListChecks,
    title: "Master Checklist",
    description:
      "Every task, every detail, one place. Assign to team members and track completion down to the last ribbon.",
  },
  {
    icon: Sparkles,
    title: "Guest Invitations",
    description:
      "Share a stunning digital invitation page with your guests. Personalised, elegant, and memorable.",
  },
];

/* ─── Stats data ─────────────────────────────────────────────── */
const stats = [
  { value: "120+", label: "Events planned" },
  { value: "4,800+", label: "Guests managed" },
  { value: "2,300+", label: "Planners on the platform" },
];

/* ─── Testimonials data ───────────────────────────────────────── */
const testimonials = [
  {
    quote:
      "Hitchy Stitchy turned our 3-day wedding into a seamlessly run production. Our coordinator said it was the most organised event she'd ever worked.",
    names: "Amara & Kofi",
    event: "3-day Traditional + White Wedding",
  },
  {
    quote:
      "The live mode on the day was a game changer. Every team member knew exactly where to be. No frantic calls, no chaos — just pure magic.",
    names: "Priya & Rajan",
    event: "Garden Wedding",
  },
  {
    quote:
      "From RSVP tracking to the final cue, everything lived in one place. I can't imagine planning without it.",
    names: "Sophie & James",
    event: "Country Estate Wedding",
  },
];

/* ─── Steps data ─────────────────────────────────────────────── */
const steps = [
  {
    number: "01",
    title: "Create your event",
    description: "Set up your wedding details — name, dates, and your unique invitation link.",
  },
  {
    number: "02",
    title: "Build your team",
    description: "Invite your coordinator, vendors, and wedding party. Everyone gets a role.",
  },
  {
    number: "03",
    title: "Live on the day",
    description: "Activate Live Mode. Real-time cues, arrivals, and coordination at your fingertips.",
  },
];

/* ─── Navbar ─────────────────────────────────────────────────── */
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <CalendarHeart className="w-4 h-4 text-primary" />
        </div>
        <span className="font-serif font-bold text-foreground text-lg leading-none">
          Hitchy Stitchy
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Start planning</Button>
        </Link>
      </div>
    </motion.nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[80px]" />
        <div className="absolute top-2/3 left-1/4 w-80 h-80 rounded-full bg-secondary/15 blur-[60px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/8 blur-[60px]" />
      </div>

      {/* Floating decorations */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div
          variants={floatIn(0.6)}
          initial="hidden"
          animate="show"
          className="absolute top-32 left-8 md:left-24 text-primary/25"
        >
          <FloralSVG className="w-20 h-20" />
        </motion.div>
        <motion.div
          variants={floatIn(0.8)}
          initial="hidden"
          animate="show"
          className="absolute top-40 right-8 md:right-24 text-secondary/40"
        >
          <FloralSVG className="w-14 h-14" />
        </motion.div>
        <motion.div
          variants={floatIn(1.0)}
          initial="hidden"
          animate="show"
          className="absolute bottom-40 left-12 md:left-32 text-primary/20"
        >
          <RingsSVG className="w-24 h-12" />
        </motion.div>
        <motion.div
          variants={floatIn(0.5)}
          initial="hidden"
          animate="show"
          className="absolute bottom-48 right-12 md:right-32 text-secondary/30"
        >
          <FloralSVG className="w-16 h-16" />
        </motion.div>
      </motion.div>

      {/* Badge */}
      <motion.div
        variants={floatIn(0)}
        initial="hidden"
        animate="show"
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium tracking-wide"
      >
        <Heart className="w-3 h-3 fill-primary" />
        Wedding planning, redefined
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={heroHeadline}
        initial="hidden"
        animate="show"
        className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.05] tracking-tight max-w-4xl"
      >
        Every moment,{" "}
        <span className="text-primary italic">beautifully</span>
        <br />
        orchestrated.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={heroSub}
        initial="hidden"
        animate="show"
        className="mt-6 text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed"
      >
        From the first RSVP to the last dance — Hitchy Stitchy gives your wedding team
        the tools to plan, coordinate, and celebrate with clarity and grace.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={heroActions}
        initial="hidden"
        animate="show"
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link to="/signup">
          <Button size="lg" className="gap-2 min-w-44 text-base">
            Begin your story
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" size="lg" className="min-w-44 text-base">
            Sign in
          </Button>
        </Link>
      </motion.div>

      {/* Rings divider */}
      <motion.div
        variants={floatIn(0.7)}
        initial="hidden"
        animate="show"
        className="mt-20 text-primary/30"
      >
        <RingsSVG className="w-20 h-10" />
      </motion.div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────────────────── */
function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-12 px-6 md:px-12">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-border"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={statItem}
            className="flex flex-col items-center text-center sm:px-12 gap-1"
          >
            <span className="font-serif font-bold text-4xl md:text-5xl text-primary">
              {s.value}
            </span>
            <span className="text-sm text-muted-foreground tracking-wide">
              {s.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────── */
function Features() {
  return (
    <section className="py-28 px-6 md:px-12 max-w-6xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-widest text-primary font-medium mb-3"
        >
          Everything you need
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-bold text-4xl md:text-5xl text-foreground"
        >
          One suite for the whole celebration
        </motion.h2>
        <motion.div
          variants={dividerLine}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-6 mx-auto h-px w-24 bg-primary/30 origin-center"
        />
      </div>

      {/* Feature grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={featureCard}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-card rounded-2xl border border-border p-7 shadow-sm hover:shadow-md hover:border-primary/20 transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="py-28 px-6 md:px-12 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-3"
          >
            Loved by couples
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-4xl md:text-5xl text-foreground"
          >
            Stories worth celebrating
          </motion.h2>
          <motion.div
            variants={dividerLine}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-6 mx-auto h-px w-24 bg-primary/30 origin-center"
          />
        </div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.names}
              variants={testimonialCard}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl border border-border p-8 shadow-sm hover:shadow-md hover:border-primary/20 transition-shadow flex flex-col gap-6"
            >
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Heart key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote mark */}
              <span className="font-serif text-6xl leading-none text-primary/20 -mt-2 select-none">
                "
              </span>

              {/* Quote text */}
              <p className="text-foreground/80 leading-relaxed text-[0.95rem] -mt-8 flex-1">
                {t.quote}
              </p>

              {/* Attribution */}
              <div className="border-t border-border pt-5">
                <p className="font-serif font-semibold text-foreground text-base">{t.names}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.event}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section className="py-28 px-6 md:px-12 bg-muted/40 border-y border-border">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-3"
          >
            Simple by design
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-4xl md:text-5xl text-foreground"
          >
            Up and running in minutes
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: i % 2 === 0 ? -32 : 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-8 items-start py-10 border-b border-border last:border-0"
            >
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center">
                <span className="font-serif font-bold text-primary text-lg">{step.number}</span>
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-foreground text-lg mb-1.5">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Banner ─────────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="py-28 px-6 md:px-12 text-center relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/6 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="inline-flex items-center justify-center text-primary/40 mb-8">
          <FloralSVG className="w-16 h-16" />
        </div>

        <h2 className="font-serif font-bold text-4xl md:text-6xl text-foreground mb-4 max-w-2xl mx-auto leading-tight">
          Your perfect day{" "}
          <span className="text-primary italic">starts here.</span>
        </h2>

        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Join couples who chose clarity over chaos. Plan every detail with elegance and confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="gap-2 min-w-48 text-base">
              Create your event
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg" className="min-w-48 text-base">
              Already planning?
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <CalendarHeart className="w-4 h-4 text-primary" />
        <span className="font-serif font-semibold text-foreground text-sm">Hitchy Stitchy</span>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Crafted with love for couples who care about every detail.
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Link to="/signup" className="hover:text-primary transition-colors">Sign up</Link>
        <Link to="/dashboard" className="hover:text-primary transition-colors">Sign in</Link>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );
}
