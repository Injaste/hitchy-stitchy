import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroHeadline, heroSub, heroActions, floatIn } from "../animations";
import { RingsSVG, FloralSVG } from "./Decorations";

export function Hero() {
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
      <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
        <motion.div variants={floatIn(0.6)} initial="hidden" animate="show" className="absolute top-32 left-8 md:left-24 text-primary/25">
          <FloralSVG className="w-20 h-20" />
        </motion.div>
        <motion.div variants={floatIn(0.8)} initial="hidden" animate="show" className="absolute top-40 right-8 md:right-24 text-secondary/40">
          <FloralSVG className="w-14 h-14" />
        </motion.div>
        <motion.div variants={floatIn(1.0)} initial="hidden" animate="show" className="absolute bottom-40 left-12 md:left-32 text-primary/20">
          <RingsSVG className="w-24 h-12" />
        </motion.div>
        <motion.div variants={floatIn(0.5)} initial="hidden" animate="show" className="absolute bottom-48 right-12 md:right-32 text-secondary/30">
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
