import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isAfter, startOfDay } from "date-fns";
import { Heart, CheckCircle2, Edit2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fadeUp, fadeIn } from "@/lib/animations";
import { fireConfetti } from "@/lib/confetti";
import { useContentHeight } from "./hooks/useContentHeight";

import { useGuestRSVP, useRSVPMutations } from "./queries";
import type { RSVPFormData, PublicEventConfig } from "./types";
import RSVPForm from "./form/RSVPForm";
import Footer from "./form/Footer";
import RSVPDelete from "./form/RSVPDelete";

const RSVP = ({ eventConfig }: { eventConfig: PublicEventConfig }) => {
  const { data: existingRSVP, isLoading } = useGuestRSVP(eventConfig.id);
  const { submit, remove } = useRSVPMutations(eventConfig.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { ref: bodyRef, height: bodyHeight } = useContentHeight();

  const rsvpConfig = eventConfig.rsvpForm;

  // Check if RSVP is closed (past deadline)
  const isDeadlinePassed =
    eventConfig.rsvpDeadlineEnabled &&
    eventConfig.rsvpDeadline !== null &&
    isAfter(startOfDay(new Date()), startOfDay(eventConfig.rsvpDeadline));

  const handleSubmit = async (value: RSVPFormData) => {
    await submit.mutate({
      name: value.name,
      phone: value.phone ?? "",
      guestsCount: value.guestsCount ?? 1,
      dietaryNotes: value.dietaryNotes,
      message: value.message,
      cancelToken: "",
    });
    setIsEditing(false);
    fireConfetti();
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    await remove.mutate({ id: existingRSVP!.id });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="py-32 text-center text-primary font-bold italic font-serif">
        Checking RSVP status…
      </div>
    );
  }

  return (
    <section
      id="rsvp"
      className="pt-20 sm:pt-32 pb-10 sm:pb-12 px-4 sm:px-6 relative bg-white/10 backdrop-blur-sm z-10"
    >
      <div className="max-w-sm sm:max-w-md mx-auto">
        {/* Card */}
        <motion.div
          layout
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-card/80 backdrop-blur-md p-6 sm:p-10 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-xl border border-primary/20 overflow-hidden"
        >
          {/* Header */}
          <motion.div
            variants={fadeIn(0)}
            className="text-center mb-8 sm:mb-10"
          >
            <motion.div variants={fadeIn(0.05)}>
              <Heart
                className="text-primary mx-auto mb-4 sm:mb-6 fill-primary/10"
                size={40}
              />
            </motion.div>
            <motion.h2
              variants={fadeUp(0.15, 16, 0.7)}
              className="text-3xl sm:text-4xl font-bold text-primary mb-2 sm:mb-3 italic font-serif"
            >
              RSVP
            </motion.h2>
            <motion.p
              variants={fadeUp(0.25, 12, 0.7)}
              className="text-muted-foreground italic text-sm sm:text-base font-serif"
            >
              Your presence would mean the world to us.
            </motion.p>
          </motion.div>

          {/* Animated height wrapper */}
          <motion.div
            variants={fadeUp(0.35, 16, 0.7)}
            animate={{ height: bodyHeight }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Inner div measured by ResizeObserver */}
            <div ref={bodyRef}>
              {/* Pool-only closed state */}
              {rsvpConfig.mode === "pool" ? (
                <motion.div
                  key="pool-closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-foreground/70 italic text-sm sm:text-base font-serif leading-relaxed">
                    RSVPs are by invitation only.{" "}
                    Please contact us directly to confirm your attendance.
                  </p>
                </motion.div>
              ) : isDeadlinePassed ? (
                <motion.div
                  key="deadline-closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-foreground/70 italic text-sm sm:text-base font-serif leading-relaxed">
                    RSVP submissions are now closed.{" "}
                    Thank you to everyone who responded.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {existingRSVP && !isEditing ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="text-center py-4 sm:py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                      >
                        <CheckCircle2
                          className="text-green-400 mx-auto mb-4 sm:mb-6"
                          size={64}
                        />
                      </motion.div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground font-serif">
                        Alhamdulillah!
                      </h3>
                      <p className="text-foreground/70 leading-relaxed italic mb-6 sm:mb-8 text-sm sm:text-base font-serif">
                        {rsvpConfig.confirmationMessage}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs tracking-wide uppercase shrink-0"
                          >
                            <Edit2 size={14} className="text-primary" /> Edit
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={remove.isPending}
                            onClick={() => setShowDeleteDialog(true)}
                            className="rounded-xl border-primary/30 hover:border-destructive/60 hover:text-destructive gap-2 font-bold text-xs tracking-wide uppercase shrink-0"
                          >
                            <Trash2 size={14} className="text-primary" />
                            {remove.isPending ? "Removing…" : "Delete"}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={isEditing ? "edit-form" : "new-form"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <RSVPForm
                        key={isEditing ? "edit" : "new"}
                        defaultValues={
                          isEditing && existingRSVP
                            ? {
                                name: existingRSVP.name,
                                phone: existingRSVP.phone,
                                guestsCount: existingRSVP.guestsCount,
                                dietaryNotes: existingRSVP.dietaryNotes,
                                message: existingRSVP.message,
                              }
                            : undefined
                        }
                        onSubmit={handleSubmit}
                        onCancel={
                          isEditing ? () => setIsEditing(false) : undefined
                        }
                        isEditing={isEditing}
                        rsvpConfig={rsvpConfig}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>

        <Footer fadeUp={fadeUp} fadeIn={fadeIn} groomName={eventConfig.groomName} brideName={eventConfig.brideName} />
      </div>

      <RSVPDelete
        open={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </section>
  );
};

export default RSVP;
