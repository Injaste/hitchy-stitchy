import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Gilded framed inputs — gold-bordered squared boxes on cream. Distinct from the
// pill / underline / soft-box styles of the other templates.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel:
    "text-2xs font-semibold uppercase tracking-[0.25em] text-(--ry-burgundy)/80",
  fieldRequiredMark: "text-(--ry-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-sm border border-(--ry-gold)/50 bg-(--ry-bg) px-3",
  inputGroupTextarea: "gap-2 rounded-sm border border-(--ry-gold)/50 bg-(--ry-bg) px-3",
  input:
    "text-base text-(--ry-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--ry-muted-fg)/60",
  textarea:
    "text-base text-(--ry-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--ry-muted-fg)/60",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--ry-gold)",
  fieldError: "text-sm font-semibold tracking-wide",
  formError:
    "text-(--ry-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit:
    "h-12 rounded-sm bg-(--ry-burgundy) text-(--ry-on-burgundy) font-semibold uppercase tracking-[0.25em] text-sm hover:bg-(--ry-burgundy-deep) disabled:opacity-60 transition-colors mt-5",
  cancel:
    "h-11 rounded-sm text-sm font-semibold text-(--ry-muted-fg) uppercase tracking-[0.18em] hover:text-(--ry-fg)",
  fields: {
    guestCount: {
      input:
        "text-base text-(--ry-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Ahmad Bin Ali" },
  phone: {
    label: "Phone Number",
    placeholder: "9123 4567",
  },
  guestCount: {
    label: "Number of Guests",
    placeholder: (max) => `1 - ${max}`,
  },
  message: {
    label: "Message",
    placeholder: "Leave us a message",
  },
  required: "*",
  submit: {
    idle: "Confirm Attendance",
    editing: "Update RSVP",
    submitting: "Sending Love...",
  },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content:
    "rounded-sm border border-(--ry-gold)/50 bg-(--ry-card) max-w-sm font-medium text-(--ry-fg)",
  title: "italic text-(--ry-burgundy) text-xl",
  description: "italic text-(--ry-muted-fg)",
  cancel: "rounded-sm border-(--ry-gold)/50 text-(--ry-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-sm bg-(--ry-destructive) hover:bg-(--ry-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description:
    "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
