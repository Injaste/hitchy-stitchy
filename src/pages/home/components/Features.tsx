import { motion } from "framer-motion";
import { dividerLine } from "../animations";
import { features } from "../data";
import { TimelineMock } from "./mocks/TimelineMock";
import { RsvpMock } from "./mocks/RsvpMock";
import { TeamMock } from "./mocks/TeamMock";
import { LiveMock } from "./mocks/LiveMock";

const MOCKS: Record<string, React.ReactNode> = {
  timeline: <TimelineMock />,
  rsvp: <RsvpMock />,
  team: <TeamMock />,
  live: <LiveMock />,
};

export function Features() {
  return (
    <section className="py-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-24">
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

        {/* Feature rows */}
        <div className="space-y-0">
          {features.map((feature, i) => {
            const isEven = i % 2 === 0;
            const mock = MOCKS[feature.key];

            return (
              <div
                key={feature.key}
                className="py-24 first:pt-0 last:pb-0"
              >
                <div
                  className={`min-h-[500px] flex flex-col lg:flex-row items-center gap-16 xl:gap-24 ${!isEven ? "lg:flex-row-reverse" : ""}`}
                >
                  {/* Mock showcase */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full lg:w-1/2 relative"
                  >
                    <div className="absolute inset-0 -m-8 rounded-3xl bg-primary/4 blur-2xl pointer-events-none" />
                    <div className="relative max-w-md mx-auto lg:mx-0">
                      {mock}
                    </div>
                  </motion.div>

                  {/* Text content */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.9,
                      delay: 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-full lg:w-1/2"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                        {feature.label}
                      </p>
                    </div>

                    <h3 className="font-bold text-3xl md:text-4xl text-foreground leading-tight mb-6">
                      {feature.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-base max-w-prose mb-10">
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
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
