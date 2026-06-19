import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Soft pill inputs — rounded and romantic.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.22em] text-(--pn-primary)/80",
  fieldRequiredMark: "text-(--pn-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-full border border-(--pn-border) bg-(--pn-bg) px-4",
  inputGroupTextarea: "gap-2 rounded-3xl border border-(--pn-border) bg-(--pn-bg) px-4",
  input: "text-base text-(--pn-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--pn-muted-fg)/55",
  textarea: "text-base text-(--pn-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--pn-muted-fg)/55",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--pn-primary)/50",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--pn-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-full bg-(--pn-primary) text-(--pn-on-primary) font-semibold uppercase tracking-[0.2em] text-sm hover:bg-(--pn-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-full text-sm font-semibold text-(--pn-muted-fg) uppercase tracking-[0.16em] hover:text-(--pn-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--pn-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Wei Chen" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a message" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-3xl border border-(--pn-primary)/25 bg-(--pn-card) max-w-sm font-medium text-(--pn-fg)",
  title: "italic text-(--pn-primary) text-xl",
  description: "italic text-(--pn-muted-fg)",
  cancel: "rounded-full border-(--pn-primary)/30 text-(--pn-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-full bg-(--pn-destructive) hover:bg-(--pn-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
