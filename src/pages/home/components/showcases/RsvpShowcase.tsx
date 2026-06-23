import { useState, useEffect, useRef } from "react";
import LottieRaw from "lottie-react";
import { AnimatePresence, motion } from "framer-motion";
import successCheck from "@/assets/lottie/success-check.json";
import { RSVPForm } from "@/pages/wedding/form";
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
} from "@/pages/wedding/form";
import type { RSVPFormData } from "@/pages/wedding/types";
import type { RSVPSectionConfig } from "../../features/types";
import GuestsTable from "@/pages/home/features/guests/GuestsTable";
import type { Guest, GuestStatus } from "../../features/types";

// Interop: under the bundler the default export can arrive wrapped — unwrap it
// the same way the wedding templates do, or rendering the namespace crashes.
const Lottie = (LottieRaw as unknown as { default?: typeof LottieRaw }).default ?? LottieRaw;

// The real guest RSVP form AND the real guest list table — the two sides of the
// feature — rotating every few seconds. Submitting runs a fake API (resolves
// after a beat) and flips to the real success state echoing the actual name and
// guest count, then returns to the form (which resets the rotation).
const rsvpConfig: RSVPSectionConfig = {
  fields: { message: { visible: true, required: false } },
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
  inputAddonTextarea: "self-start pt-2",
  input:
    "text-sm text-foreground bg-transparent placeholder:text-muted-foreground/55",
  textarea:
    "text-sm text-foreground bg-transparent placeholder:text-muted-foreground/55",
  inputIcon: "text-muted-foreground/60",
  fieldError: "text-xs text-destructive",
  formError: "text-destructive text-sm text-center leading-snug -mb-2",
  actions: "pt-5",
  submit:
    "w-full h-12 px-6 rounded-xl bg-gradient-brand text-primary-foreground font-semibold text-sm transition-shadow hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60",
};

// Dates always within 3 days of today so the "Registered" column stays fresh.
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString();

const mkGuest = (
  id: string,
  name: string,
  phone: string,
  guest_count: number,
  status: GuestStatus,
  createdAt: string,
): Guest => ({
  id,
  event_id: "demo",
  invitation_id: null,
  name,
  phone,
  guest_count,
  message: null,
  status,
  created_at: createdAt,
  confirmed_at: status === "confirmed" ? createdAt : null,
  cancelled_at: status === "cancelled" ? createdAt : null,
  updated_at: createdAt,
});

// A mixed-community guest list (the responses the form feeds).
const GUESTS: Guest[] = [
  mkGuest("gu1", "The Tan Family", "9123 4567", 6, "confirmed", daysAgo(0)),
  mkGuest("gu2", "Priya & Karthik", "9234 5678", 2, "confirmed", daysAgo(1)),
  mkGuest("gu3", "Nurul Huda", "9345 6789", 4, "pending", daysAgo(1)),
  mkGuest("gu4", "Hafiz & family", "9456 7890", 3, "confirmed", daysAgo(2)),
  mkGuest("gu5", "Uncle Raj", "9567 8901", 1, "cancelled", daysAgo(2)),
  mkGuest("gu6", "Aunty Lim", "9678 9012", 2, "pending", daysAgo(3)),
];

const ROTATE_MS = 5000;
const SUCCESS_MS = 3400;

function Success({ name, count }: { name: string; count: number }) {
  const first = name.trim().split(/\s+/)[0] || name;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col items-center justify-center text-center"
    >
      <Lottie animationData={successCheck} loop={false} style={{ width: 84, height: 84 }} />
      <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
        You're coming, {first}!
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
        Your RSVP for {count} {count === 1 ? "guest" : "guests"} is saved — we
        can't wait to celebrate with you.
      </p>
    </motion.div>
  );
}

const cardClass =
  "flex h-full flex-col justify-center rounded-2xl border border-border bg-card p-6 shadow-lg";

export function RsvpShowcase() {
  const [view, setView] = useState<"form" | "guests" | "success">("form");
  const [result, setResult] = useState<{ name: string; count: number } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [submittedGuest, setSubmittedGuest] = useState<Guest | null>(null);
  const [showSubmitted, setShowSubmitted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // The cycle: form → (it submits itself) → success tick → guest table → form.
  // The form phase auto-clicks the real submit button, so it plays the genuine
  // "Sending…" → tick flow. A manual submit just runs the same handler early.
  useEffect(() => {
    if (view === "form") {
      const id = setTimeout(() => {
        cardRef.current
          ?.querySelector<HTMLButtonElement>('button[type="submit"]')
          ?.click();
      }, ROTATE_MS);
      return () => clearTimeout(id);
    }
    if (view === "success") {
      const id = setTimeout(() => setView("guests"), SUCCESS_MS);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setResult(null);
      setSubmittedGuest(null);
      setFormKey((k) => k + 1); // fresh form next round
      setView("form");
    }, ROTATE_MS);
    return () => clearTimeout(id);
  }, [view]);

  // Delay showing the submitted guest so it animates in after the table renders.
  useEffect(() => {
    if (view === "guests" && submittedGuest) {
      const id = setTimeout(() => setShowSubmitted(true), 800);
      return () => clearTimeout(id);
    }
    setShowSubmitted(false);
  }, [view, submittedGuest]);

  const handleSubmit = async (value: RSVPFormData) => {
    await new Promise((r) => setTimeout(r, 900)); // fake API → ok
    setResult({ name: value.name, count: value.guestCount });
    setSubmittedGuest(
      mkGuest(
        "gu-submitted",
        value.name,
        value.phone ?? DEFAULTS.phone,
        value.guestCount,
        "confirmed",
        new Date().toISOString(),
      ),
    );
    setView("success");
  };

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {view === "guests" ? (
          <motion.div
            key="guests"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col justify-center"
          >
            <GuestsTable
              guests={showSubmitted && submittedGuest ? [submittedGuest, ...GUESTS] : GUESTS}
              statusFilter="all"
            />
          </motion.div>
        ) : (
          <motion.div
            ref={cardRef}
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cardClass}
          >
            {view === "success" && result ? (
              <Success name={result.name} count={result.count} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
