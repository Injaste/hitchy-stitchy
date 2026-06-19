import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Soft borderless inputs — light filled wells, airy & minimal.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-6",
  fieldLabel: "text-3xs font-medium uppercase tracking-[0.3em] text-(--lt-muted-fg)",
  fieldRequiredMark: "text-(--lt-primary) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-lg border-0 bg-(--lt-bg-2) px-4 ring-1 ring-transparent focus-within:ring-(--lt-primary)/40 transition",
  inputGroupTextarea: "gap-2 rounded-lg border-0 bg-(--lt-bg-2) px-4 ring-1 ring-transparent focus-within:ring-(--lt-primary)/40 transition",
  input: "text-base text-(--lt-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--lt-muted-fg)/50",
  textarea: "text-base text-(--lt-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--lt-muted-fg)/50",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--lt-primary)/50",
  fieldError: "text-sm font-medium tracking-wide",
  formError: "text-(--lt-destructive) text-sm font-medium text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-4",
  submit: "h-12 rounded-lg bg-(--lt-primary) text-(--lt-on-primary) font-medium uppercase tracking-[0.24em] text-xs hover:bg-(--lt-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-lg text-xs font-medium text-(--lt-muted-fg) uppercase tracking-[0.2em] hover:text-(--lt-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--lt-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Aditya Mehta" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a note" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-2xl border border-(--lt-border) bg-(--lt-card) max-w-sm font-medium text-(--lt-fg)",
  title: "text-(--lt-primary) text-xl",
  description: "text-(--lt-muted-fg)",
  cancel: "rounded-lg border-(--lt-border) text-(--lt-fg) font-medium uppercase tracking-widest text-xs",
  confirm: "rounded-lg bg-(--lt-destructive) hover:bg-(--lt-destructive)/90 font-medium uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
