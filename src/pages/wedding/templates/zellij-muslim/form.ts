import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Bolder tile-bordered inputs (2px teal border on cream) — distinct from the
// pill / underline / soft-box / gilded styles of the other templates.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel:
    "text-2xs font-semibold uppercase tracking-[0.25em] text-(--zj-teal)",
  fieldRequiredMark: "text-(--zj-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-md border-2 border-(--zj-teal)/30 bg-(--zj-bg) px-3",
  inputGroupTextarea: "gap-2 rounded-md border-2 border-(--zj-teal)/30 bg-(--zj-bg) px-3",
  input:
    "text-base text-(--zj-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--zj-muted-fg)/60",
  textarea:
    "text-base text-(--zj-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--zj-muted-fg)/60",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--zj-primary)",
  fieldError: "text-sm font-semibold tracking-wide",
  formError:
    "text-(--zj-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit:
    "h-12 rounded-md bg-(--zj-primary) text-(--zj-on-primary) font-semibold uppercase tracking-[0.22em] text-sm hover:bg-(--zj-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel:
    "h-11 rounded-md text-sm font-semibold text-(--zj-muted-fg) uppercase tracking-[0.16em] hover:text-(--zj-fg)",
  fields: {
    guestCount: {
      input:
        "text-base text-(--zj-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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
    "rounded-md border-2 border-(--zj-teal)/30 bg-(--zj-card) max-w-sm font-medium text-(--zj-fg)",
  title: "italic text-(--zj-primary) text-xl",
  description: "italic text-(--zj-muted-fg)",
  cancel: "rounded-md border-(--zj-teal)/40 text-(--zj-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-md bg-(--zj-destructive) hover:bg-(--zj-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description:
    "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
