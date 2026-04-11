import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloralSVG } from "./Decorations";

export function CTABanner() {
  return (
    <section className="py-28 px-6 md:px-12 text-center relative overflow-hidden">
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

        <h2 className="font-serif font-bold text-4xl md:text-6xl text-foreground mb-6 max-w-2xl mx-auto leading-tight">
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
