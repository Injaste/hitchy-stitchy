import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Festive filled inputs — warm cream wells, rounded, bold.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-bold uppercase tracking-[0.2em] text-(--mg-magenta)",
  fieldRequiredMark: "text-(--mg-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-xl border-2 border-(--mg-border) bg-(--mg-bg) px-4 focus-within:border-(--mg-primary) transition-colors",
  inputGroupTextarea: "gap-2 rounded-xl border-2 border-(--mg-border) bg-(--mg-bg) px-4 focus-within:border-(--mg-primary) transition-colors",
  input: "text-base text-(--mg-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--mg-muted-fg)/55",
  textarea: "text-base text-(--mg-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--mg-muted-fg)/55",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--mg-primary)",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--mg-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-xl bg-(--mg-primary) text-(--mg-on-primary) font-bold uppercase tracking-[0.16em] text-sm hover:bg-(--mg-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-xl text-sm font-bold text-(--mg-muted-fg) uppercase tracking-[0.14em] hover:text-(--mg-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--mg-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Arjun Sharma" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a message" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-2xl border-2 border-(--mg-primary)/30 bg-(--mg-card) max-w-sm font-medium text-(--mg-fg)",
  title: "font-bold text-(--mg-magenta) text-xl",
  description: "text-(--mg-muted-fg)",
  cancel: "rounded-xl border-(--mg-primary)/40 text-(--mg-fg) font-bold uppercase tracking-widest text-xs",
  confirm: "rounded-xl bg-(--mg-destructive) hover:bg-(--mg-destructive)/90 font-bold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
