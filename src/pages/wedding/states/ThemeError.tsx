import { motion } from "framer-motion";
import { CalendarHeart } from "lucide-react";

import { itemFadeUp } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

const ThemeError = () => {
  return (
    <>
      <div className="flex flex-col items-center gap-2 mb-12">
        <span className="flex items-center gap-2 text-sm tracking-widest text-accent/60 font-serif italic">
          Hitchy Stitchy
        </span>
      </div>

      <div className="max-w-xs flex flex-col items-center gap-6">
        <p className="text-primary text-center text-lg md:text-xl italic font-light leading-relaxed">
          The invitation you are looking for <br />
          could not be found.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <div className="h-px w-8 bg-accent/50" />
      </div>

      <motion.div variants={itemFadeUp} className="text-center mt-6">
        <BackLink to="/" label="Back to Home" variant="outline" />
      </motion.div>
    </>
  );
};

export default ThemeError;
