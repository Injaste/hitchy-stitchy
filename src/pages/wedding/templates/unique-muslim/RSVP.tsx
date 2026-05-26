import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { isAfter, startOfDay } from "date-fns";
import confetti from "canvas-confetti";
import { Heart, Edit2, Trash2 } from "lucide-react";
import LottieRaw from "lottie-react";

import { Button } from "@/components/ui/button";
import { useGuestRSVP, useRSVPMutations } from "@/pages/wedding/queries";
import type { RSVPFormData } from "@/pages/wedding/types";
import type { ThemeProps } from "@/pages/wedding/templates/types";
import { RSVPForm, RSVPDelete } from "@/pages/wedding/form";
import {
  rsvpClassNames,
  rsvpLabels,
  rsvpDeleteClassNames,
  rsvpDeleteLabels,
} from "./form";
import Footer from "./Footer";
import successCheck from "@/assets/lottie/success-check.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = (LottieRaw as any).default ?? LottieRaw;

const fadeUp = (delay: number, y = 20, duration = 0.8): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

const fadeIn = (delay: number, duration = 0.8): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration, delay, ease: "easeOut" } },
});

const fireConfetti = () => {
  confetti({
    particleCount: 200,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#ff4d8f", "#e8003a", "#ffb3c6", "#d4af37", "#ffd700"],
  });
};

const RSVP = ({ eventConfig, pageConfig }: ThemeProps) => {
  const { data: existingRSVP, isLoading } = useGuestRSVP(eventConfig.event_id);
  const { submit, update, remove } = useRSVPMutations(eventConfig.event_id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tickDone, setTickDone] = useState(false);

  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const {
    groom_name,
    bride_name,
    rsvp_subtitle,
    rsvp_success_heading,
    footer_tagline,
  } = config ?? {};
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
      setSubmitted(true);
      setTickDone(false);
    }
    setIsEditing(false);
    fireConfetti();
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    await remove.mutate({});
    setIsEditing(false);
  };

  const renderClosed = (key: string, message: string) => (
    <motion.p
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center text-foreground/70 italic text-sm leading-relaxed py-8"
    >
      {message}
    </motion.p>
  );

  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie
        animationData={successCheck}
        loop={false}
        onComplete={() => setTickDone(true)}
        style={{ width: 80, height: 80, margin: "0 auto" }}
      />
      <AnimatePresence>
        {(tickDone || !submitted) && (
          <motion.div
            key="success-content"
            initial={submitted ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-xl font-bold my-3 text-foreground">
              {rsvp_success_heading}
            </h3>
            <motion.p
              initial={submitted ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="text-foreground/70 leading-relaxed italic mb-6 text-sm"
            >
              {eventConfig.confirmation_message}
            </motion.p>
            <motion.div
              initial={submitted ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
              className="flex gap-3 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-sm tracking-wide uppercase shrink-0"
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
                  className="rounded-xl border-primary/30 hover:border-destructive/60 hover:text-destructive gap-2 font-bold text-sm tracking-wide uppercase shrink-0"
                >
                  <Trash2 size={14} className="text-primary" />
                  {remove.isPending ? "Removing…" : "Delete"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderForm = () => (
    <div key={isEditing ? "edit-form" : "new-form"}>
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
        onCancel={isEditing ? () => setIsEditing(false) : undefined}
        isEditing={isEditing}
        rsvpConfig={rsvpConfig}
        limits={{
          min: eventConfig.guest_count_min,
          max: eventConfig.guest_count_max,
        }}
        classNames={rsvpClassNames}
        labels={rsvpLabels}
      />
    </div>
  );

  const renderBody = () => {
    if (eventConfig.rsvp_mode === "private")
      return renderClosed(
        "private",
        "RSVPs are by invitation only. Please contact us directly to confirm your attendance.",
      );
    if (isDeadlinePassed)
      return renderClosed(
        "deadline",
        "RSVP submissions are now closed. Thank you to everyone who responded.",
      );
    if (existingRSVP && !isEditing) return renderSuccess();
    return renderForm();
  };

  if (isLoading) {
    return (
      <div className="py-32 text-center text-primary font-bold italic">
        Checking RSVP status…
      </div>
    );
  }

  return (
    <section id="rsvp" className="pt-20 pb-10 px-4 relative bg-white/10 z-10">
      <div className="max-w-sm mx-auto">
        <motion.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeIn(0, 0.8)}
          className="bg-card/80 backdrop-blur-md p-6 rounded-[1.75rem] shadow-xl border border-primary/20"
        >
          {/* Header */}
          <motion.div variants={fadeIn(0)} className="text-center mb-8">
            <motion.div variants={fadeIn(0.05)}>
              <Heart
                className="text-primary mx-auto mb-4 fill-primary/10"
                size={40}
              />
            </motion.div>
            <motion.h2
              variants={fadeUp(0.15, 16, 0.7)}
              className="text-3xl font-bold text-primary mb-2 italic"
            >
              RSVP
            </motion.h2>
            <motion.p
              variants={fadeUp(0.25, 12, 0.7)}
              className="text-muted-foreground italic text-sm"
            >
              {rsvp_subtitle}
            </motion.p>
          </motion.div>

          {/* Body */}
          <AnimatePresence mode="popLayout">{renderBody()}</AnimatePresence>
        </motion.div>

        <Footer
          fadeUp={fadeUp}
          fadeIn={fadeIn}
          groom_name={groom_name}
          bride_name={bride_name}
          footer_tagline={footer_tagline}
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
