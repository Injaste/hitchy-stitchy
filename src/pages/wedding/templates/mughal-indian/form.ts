import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Gilded inputs on dark — gold borders, warm wells.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.24em] text-(--mu-primary)",
  fieldRequiredMark: "text-(--mu-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-md border border-(--mu-border) bg-(--mu-bg-2) px-4 focus-within:border-(--mu-primary) transition-colors",
  inputGroupTextarea: "gap-2 rounded-md border border-(--mu-border) bg-(--mu-bg-2) px-4 focus-within:border-(--mu-primary) transition-colors",
  input: "text-base text-(--mu-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--mu-muted-fg)/50",
  textarea: "text-base text-(--mu-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--mu-muted-fg)/50",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--mu-primary)/70",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--mu-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-md bg-(--mu-primary) text-(--mu-on-primary) font-semibold uppercase tracking-[0.2em] text-sm hover:bg-(--mu-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-md text-sm font-semibold text-(--mu-muted-fg) uppercase tracking-[0.16em] hover:text-(--mu-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--mu-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Vikram Singh" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a message" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-md border border-(--mu-border) bg-(--mu-card) max-w-sm font-medium text-(--mu-fg)",
  title: "text-(--mu-primary) text-xl",
  description: "text-(--mu-muted-fg)",
  cancel: "rounded-md border-(--mu-border) text-(--mu-fg) font-semibold uppercase tracking-widest text-xs hover:bg-(--mu-bg-2)",
  confirm: "rounded-md bg-(--mu-destructive) hover:bg-(--mu-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
