import { RSVPForm } from "@/pages/wedding/form";
import type {
  RSVPFormClassNames,
  RSVPFormLabels,
} from "@/pages/wedding/form";
import type { RSVPSectionConfig } from "@/pages/admin/invitation/types";

// The real guest RSVP form — the exact component guests fill in on an
// invitation — themed to the landing palette. It's fully interactive; onSubmit
// is a no-op here so nothing is sent. Fields reveal on mount (the form's own
// staggered entrance); the field set is fixed, so the height is stable.
// Message field hidden to keep the form within the shared example height (its
// required legal/brand footer can't shrink — it lives in the shared RSVPForm).
const rsvpConfig: RSVPSectionConfig = {
  fields: { message: { visible: false, required: false } },
};

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
    "w-full h-11 rounded-lg bg-gradient-brand text-primary-foreground font-semibold text-sm transition-shadow hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60",
};

export function RsvpShowcase() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <RSVPForm
        isEditing={false}
        rsvpConfig={rsvpConfig}
        limits={{ min: 1, max: 8 }}
        labels={labels}
        classNames={classNames}
        onSubmit={async () => {}}
      />
    </div>
  );
}
