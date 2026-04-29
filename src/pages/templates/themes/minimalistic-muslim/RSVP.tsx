import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { isAfter, startOfDay } from "date-fns";
import confetti from "canvas-confetti";
import { Check, Edit2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useGuestRSVP, useRSVPMutations } from "@/pages/templates/queries";
import type { RSVPFormData, PublicEventConfig } from "@/pages/templates/types";
import { RSVPForm, RSVPDelete } from "@/pages/templates/form";
import {
  rsvpClassNames,
  rsvpLabels,
  rsvpDeleteClassNames,
  rsvpDeleteLabels,
} from "./form";
import Footer from "./Footer";

const fadeUp = (delay: number, y = 16, duration = 0.7): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const fadeIn = (delay: number, duration = 0.7): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" },
  },
});

const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ["#222222", "#888888", "#cccccc"],
  });
};

const useContentHeight = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, height };
};

const RSVP = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const { data: existingRSVP, isLoading } = useGuestRSVP(eventConfig.event_id);
  const { submit, update, remove } = useRSVPMutations(eventConfig.event_id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { ref: bodyRef, height: bodyHeight } = useContentHeight();

  const rsvpConfig = eventConfig.config.rsvp;

  const isDeadlinePassed =
    eventConfig.rsvp_deadline !== null &&
    isAfter(
      startOfDay(new Date()),
      startOfDay(new Date(eventConfig.rsvp_deadline!)),
    );

  const handleSubmit = async (value: RSVPFormData) => {
    if (isEditing) {
      await update.mutate(value);
    } else {
      await submit.mutate(value);
    }
    setIsEditing(false);
    fireConfetti();
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    await remove.mutate({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="py-32 text-center text-muted-foreground text-2xs uppercase tracking-[0.3em]">
        Checking RSVP…
      </div>
    );
  }

  return (
    <section
      id="rsvp"
      className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 relative bg-background z-10"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          layout
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="border border-foreground/10 p-8 sm:p-12"
        >
          <motion.div
            variants={fadeIn(0)}
            className="text-center mb-10 sm:mb-12"
          >
            <motion.h2
              variants={fadeUp(0.1)}
              className="text-2xl sm:text-3xl font-light text-foreground mb-3 tracking-tight font-display"
            >
              RSVP
            </motion.h2>
            <motion.div
              variants={fadeIn(0.15)}
              className="w-8 h-px bg-foreground/20 mx-auto mb-4"
            />
            <motion.p
              variants={fadeUp(0.2)}
              className="text-muted-foreground text-xs sm:text-sm"
            >
              Kindly respond by the date provided.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp(0.25)}
            animate={{ height: bodyHeight }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div ref={bodyRef}>
              {eventConfig.rsvp_mode === "private" ? (
                <motion.div
                  key="pool-closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    RSVPs are by invitation only.
                  </p>
                </motion.div>
              ) : isDeadlinePassed ? (
                <motion.div
                  key="deadline-closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    RSVP submissions are now closed.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {existingRSVP && !isEditing ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center mx-auto mb-6"
                      >
                        <Check className="text-foreground" size={20} />
                      </motion.div>
                      <h3 className="text-base sm:text-lg font-light text-foreground mb-3 font-display">
                        Confirmed
                      </h3>
                      <p className="text-foreground/70 leading-relaxed mb-8 text-xs sm:text-sm">
                        {rsvpConfig.confirmation_message}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="rounded-none gap-2 text-2xs tracking-[0.3em] uppercase border-b border-foreground/30 hover:bg-transparent hover:border-foreground px-0 h-auto pb-1"
                        >
                          <Edit2 size={12} /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={remove.isPending}
                          onClick={() => setShowDeleteDialog(true)}
                          className="rounded-none gap-2 text-2xs tracking-[0.3em] uppercase border-b border-foreground/30 hover:bg-transparent hover:border-foreground px-0 h-auto pb-1 ml-6"
                        >
                          <Trash2 size={12} />
                          {remove.isPending ? "Removing…" : "Delete"}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={isEditing ? "edit-form" : "new-form"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RSVPForm
                        key={isEditing ? "edit" : "new"}
                        defaultValues={
                          isEditing && existingRSVP
                            ? {
                                name: existingRSVP.name,
                                phone: existingRSVP.phone,
                                guestCount: existingRSVP.guest_count,
                                message: existingRSVP.message ?? undefined,
                              }
                            : undefined
                        }
                        onSubmit={handleSubmit}
                        onCancel={
                          isEditing ? () => setIsEditing(false) : undefined
                        }
                        isEditing={isEditing}
                        rsvpConfig={rsvpConfig}
                        classNames={rsvpClassNames}
                        labels={rsvpLabels}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>

        <Footer
          fadeUp={fadeUp}
          fadeIn={fadeIn}
          groom_name={eventConfig.groom_name}
          bride_name={eventConfig.bride_name}
        />
      </div>

      <RSVPDelete
        open={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
        classNames={rsvpDeleteClassNames}
        labels={rsvpDeleteLabels}
      />
    </section>
  );
};

export default RSVP;
