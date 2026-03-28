import { motion, AnimatePresence } from "framer-motion";
import { useCueStore } from "@/pages/admin/store/useCueStore";
import { useModalStore } from "@/pages/admin/store/useModalStore";

export function ActiveCueBanner() {
  const { activeCueEvent } = useCueStore();
  const { openActiveCueModal } = useModalStore();

  return (
    <AnimatePresence>
      {activeCueEvent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          onClick={openActiveCueModal}
          className="cursor-pointer bg-primary text-primary-foreground px-4 py-2.5 flex items-center justify-center gap-2 text-xs md:text-sm font-medium border-b-[3px] border-destructive/60 shadow-[0_4px_12px_rgba(0,0,0,0.2)] relative hover:bg-primary/90 transition-colors"
        >
          <span className="absolute inset-0 bg-destructive/10 animate-pulse pointer-events-none" />
          <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="uppercase tracking-wider opacity-90 font-bold">Active Cue:</span>
          <span className="font-extrabold drop-shadow-md">{activeCueEvent.title}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
