import { motion } from "framer-motion";
import { dividerLine } from "../animations";
import { pillars, type Feature } from "../data";
import { TimelineShowcase } from "./showcases/TimelineShowcase";
import { DaysShowcase } from "./showcases/DaysShowcase";
import { TasksShowcase } from "./showcases/TasksShowcase";
import { BudgetShowcase } from "./showcases/BudgetShowcase";
import { GiftsShowcase } from "./showcases/GiftsShowcase";
import { MembersShowcase } from "./showcases/MembersShowcase";
import { AccessShowcase } from "./showcases/AccessShowcase";
import { RsvpShowcase } from "./showcases/RsvpShowcase";

// Each showcase renders the REAL product component fed sample SG data.
const SHOWCASES: Record<string, React.ReactNode> = {
  days: <DaysShowcase />,
  timeline: <TimelineShowcase />,
  tasks: <TasksShowcase />,
  budget: <BudgetShowcase />,
  gifts: <GiftsShowcase />,
  team: <MembersShowcase />,
  access: <AccessShowcase />,
  rsvp: <RsvpShowcase />,
};

// Every example lives in a box of this exact height — a fixed-height div stays
// this tall in layout no matter what its animating child does, so the page can
// never shift (0px), and all features line up.
const EXAMPLE_HEIGHT = "h-[520px]";

const EASE = [0.16, 1, 0.3, 1] as const;

function FeatureCopy({ feature }: { feature: Feature }) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
          <feature.icon
            className="w-4.5 h-4.5 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          {feature.label}
        </p>
      </div>
      <h3 className="font-bold text-2xl md:text-3xl text-foreground leading-tight mb-4">
        {feature.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed max-w-prose mb-6">
        {feature.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {feature.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-3 py-1.5 rounded-full border border-primary/20 text-primary bg-primary/5 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );
}

/** Title/copy first, then the live example in a shared fixed-height box. Wide
 *  features get a roomier box (the access matrix / multi-day rail need width). */
function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className="flex flex-col"
    >
      <FeatureCopy feature={feature} />
      <div
        className={`relative mt-8 w-full mx-auto ${feature.wide ? "max-w-3xl" : "max-w-xl"}`}
      >
        <div className="absolute inset-0 -m-6 rounded-3xl bg-primary/4 blur-2xl pointer-events-none" />
        <div className={`relative w-full ${EXAMPLE_HEIGHT}`}>
          {SHOWCASES[feature.key]}
        </div>
      </div>
    </motion.div>
  );
}

/** Lay a pillar's features into rows: wide features take a full-width row of
 *  their own; the rest flow two-up. Preserves authored order. */
type Row = { kind: "wide" | "pair"; items: Feature[] };
function toRows(features: Feature[]): Row[] {
  const rows: Row[] = [];
  let pair: Feature[] = [];
  const flush = () => {
    if (pair.length) rows.push({ kind: "pair", items: pair });
    pair = [];
  };
  for (const f of features) {
    if (f.wide) {
      flush();
      rows.push({ kind: "wide", items: [f] });
    } else {
      pair.push(f);
      if (pair.length === 2) flush();
    }
  }
  flush();
  return rows;
}

function PillarFeatures({ features }: { features: Feature[] }) {
  return (
    <div className="space-y-16">
      {toRows(features).map((row, ri) =>
        row.kind === "wide" || row.items.length === 1 ? (
          <div
            key={ri}
            className={`mx-auto ${row.kind === "wide" ? "max-w-3xl" : "max-w-xl"}`}
          >
            <FeatureCard feature={row.items[0]} delay={0} />
          </div>
        ) : (
          <div key={ri} className="grid xl:grid-cols-2 gap-12 lg:gap-16">
            {row.items.map((feature, i) => (
              <FeatureCard key={feature.key} feature={feature} delay={i * 0.1} />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

function PillarHeader({ label, tagline }: { label: string; tagline: string }) {
  return (
    <div className="text-center mb-12">
      <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-semibold text-foreground">
        {tagline}
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-xs uppercase tracking-widest text-primary font-medium mb-3"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="font-bold text-4xl md:text-5xl text-foreground"
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

        {/* Pillars */}
        <div className="space-y-28">
          {pillars.map((pillar) => (
            <div key={pillar.key}>
              <PillarHeader label={pillar.label} tagline={pillar.tagline} />
              <PillarFeatures features={pillar.features} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
