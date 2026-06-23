import { useState } from "react";
import LottieRaw from "lottie-react";
import { motion } from "framer-motion";
import successCheck from "@/assets/lottie/success-check.json";

// Interop: under the bundler the default export can arrive wrapped — unwrap it
// the same way the wedding templates do, or rendering the namespace crashes.
const Lottie = (LottieRaw as unknown as { default?: typeof LottieRaw }).default ?? LottieRaw;
import { RSVPForm } from "@/pages/wedding/form";
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
} from "@/pages/wedding/form";
import type { RSVPSectionConfig } from "@/pages/admin/invitation/types";

// The real guest RSVP form — the exact component guests fill in on an
// invitation — themed to the landing palette. Prefilled so the submit button is
// live; submitting runs a fake API (resolves true after a beat) and flips to the
// real success state (the success-check Lottie + a global confirmation), then
// loops back to the form. Message field hidden to keep it within the shared box.
const rsvpConfig: RSVPSectionConfig = {
  fields: { message: { visible: false, required: false } },
};

const DEFAULTS = { name: "Wei Jie", phone: "9123 4567", guestCount: 2 };

const labels: RSVPFormLabels = {
  name: { label: "Your name", placeholder: "e.g. Wei Jie" },
  phone: { label: "Phone", placeholder: "9123 4567" },
  guestCount: { label: "Number of guests", placeholder: (max) => `1 – ${max}` },
  message: { label: "Message for the couple", placeholder: "Leave a note (optional)" },
  required: "*",
  submit: {
    idle: "Confirm Attendance",
    editing: "Update RSVP",
    submitting: "Sending…",
  },
  cancel: "Cancel",
};

const classNames: RSVPFormClassNames = {
  fieldGroup: "gap-4",
  fieldLabel: "text-xs font-medium text-muted-foreground",
  fieldRequiredMark: "text-primary ml-0.5",
  fieldOptionalMark: "ml-1 font-normal text-muted-foreground/60",
  inputGroup:
    "h-11 rounded-lg border border-border bg-background px-3 transition-colors focus-within:border-primary",
  inputGroupTextarea:
    "rounded-lg border border-border bg-background px-3 py-1 transition-colors focus-within:border-primary",
  input:
    "text-sm text-foreground bg-transparent placeholder:text-muted-foreground/55",
  textarea:
    "text-sm text-foreground bg-transparent placeholder:text-muted-foreground/55",
  inputIcon: "text-muted-foreground/60",
  fieldError: "text-xs text-destructive",
  formError: "text-destructive text-sm text-center leading-snug -mb-2",
  actions: "pt-2",
  submit:
    "w-full h-12 px-6 rounded-xl bg-gradient-brand text-primary-foreground font-semibold text-sm transition-shadow hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60",
};

function Success() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center h-full text-center"
    >
      <Lottie
        animationData={successCheck}
        loop={false}
        style={{ width: 84, height: 84 }}
      />
      <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
        You're coming!
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
        Your RSVP for 2 is saved — we can't wait to celebrate with you.
      </p>
    </motion.div>
  );
}

export function RsvpShowcase() {
  const [done, setDone] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async () => {
    // Fake API — resolves "true" after a beat so the form shows "Sending…",
    // then we flip to the success state and loop back to the form.
    await new Promise((r) => setTimeout(r, 900));
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setFormKey((k) => k + 1);
    }, 3200);
  };

  return (
    <div className="flex h-full flex-col justify-center rounded-2xl border border-border bg-card p-6 shadow-lg">
      {done ? (
        <Success />
      ) : (
        <RSVPForm
          key={formKey}
          isEditing={false}
          defaultValues={DEFAULTS}
          rsvpConfig={rsvpConfig}
          limits={{ min: 1, max: 8 }}
          labels={labels}
          classNames={classNames}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
