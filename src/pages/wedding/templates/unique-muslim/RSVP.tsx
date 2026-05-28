import { useState, useRef } from "react";
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
  const sectionRef = useRef<HTMLElement>(null);

  const config = pageConfig?.slug === "unique-muslim" ? pageConfig : undefined;
  const {
    groom_name,
    bride_name,
    rsvp_subtitle,
    rsvp_success_heading,
    footer_tagline,
    rsvp_label_name,
    rsvp_label_phone,
    rsvp_label_guest_count,
    rsvp_label_message,
  } = config ?? {};

  const mergedRsvpLabels = {
    ...rsvpLabels,
    name: {
      ...rsvpLabels.name,
      label: rsvp_label_name ?? rsvpLabels.name.label,
    },
    phone: {
      ...rsvpLabels.phone,
      label: rsvp_label_phone ?? rsvpLabels.phone.label,
    },
    guestCount: {
      ...rsvpLabels.guestCount,
      label: rsvp_label_guest_count ?? rsvpLabels.guestCount.label,
    },
    message: {
      ...rsvpLabels.message,
      label: rsvp_label_message ?? rsvpLabels.message.label,
    },
  };
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
    }
    setIsEditing(false);
    fireConfetti();
    if (sectionRef.current) {
      const top =
        sectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
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
      className="text-center text-(--um-fg)/70 italic leading-relaxed py-8"
    >
      {message}
    </motion.p>
  );

  const renderSuccess = () => (
    <div key="success" className="text-center">
      <Lottie
        animationData={successCheck}
        loop={false}
        style={{ width: 80, height: 80, margin: "0 auto" }}
      />
      <motion.div
        key="success-content"
        initial={submitted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3 className="text-2xl font-bold my-3 text-(--um-fg)">
          {rsvp_success_heading}
        </h3>
        <motion.p
          initial={submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="text-(--um-fg)/70 leading-relaxed italic mb-6"
        >
          {eventConfig.confirmation_message}
        </motion.p>
        <motion.div
          initial={submitted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          className="flex gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-xl border-(--um-primary)/30 hover:border-(--um-primary)/60 gap-2 font-bold tracking-wide uppercase shrink-0"
            >
              <Edit2 size={14} className="text-(--um-primary)" /> Edit
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              disabled={remove.isPending}
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-xl border-(--um-primary)/30 hover:border-(--um-destructive)/60 hover:text-(--um-destructive) gap-2 font-bold tracking-wide uppercase shrink-0"
            >
              <Trash2 size={14} className="text-(--um-primary)" />
              {remove.isPending ? "Removing…" : "Delete"}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
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
        labels={mergedRsvpLabels}
      />
    </div>
  );

  const renderBody = () => {
    if (eventConfig.rsvp_mode === "private")
      return renderClosed(
        "private",
        "RSVPs are by invitation only. Please contact us directly to confirm your attendance.",
      );
    else if (isDeadlinePassed)
      return renderClosed(
        "deadline",
        "RSVP submissions are now closed. Thank you to everyone who responded.",
      );
    if (existingRSVP && !isEditing) return renderSuccess();
    else if (isLoading) return renderClosed("loading", "Checking RSVP status…");
    else return renderForm();
  };

  return (
    <section
      ref={sectionRef}
      id="rsvp"
      className="pt-20 pb-10 px-4 relative bg-white/10 z-10"
    >
      <div className="max-w-sm mx-auto">
        <motion.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeIn(0, 0.8)}
          className="bg-(--um-card)/80 backdrop-blur-md p-6 rounded-[1.75rem] shadow-xl border border-(--um-primary)/20"
        >
          {/* Header */}
          <motion.div variants={fadeIn(0)} className="text-center mb-8">
            <motion.div variants={fadeIn(0.05)}>
              <Heart
                className="text-(--um-primary) mx-auto mb-4 fill-(--um-primary)/10"
                size={40}
              />
            </motion.div>
            <motion.h2
              variants={fadeUp(0.15, 16, 0.7)}
              className="text-3xl font-bold text-(--um-primary) mb-2 italic"
            >
              RSVP
            </motion.h2>
            <motion.p
              variants={fadeUp(0.25, 12, 0.7)}
              className="text-(--um-muted-fg) italic"
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
