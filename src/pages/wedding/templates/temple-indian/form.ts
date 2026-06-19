import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Structured boxed inputs — maroon borders, square corners, traditional.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.22em] text-(--tp-primary)",
  fieldRequiredMark: "text-(--tp-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-none border border-(--tp-primary)/30 bg-(--tp-bg) px-4 focus-within:border-(--tp-primary) transition-colors",
  inputGroupTextarea: "gap-2 rounded-none border border-(--tp-primary)/30 bg-(--tp-bg) px-4 focus-within:border-(--tp-primary) transition-colors",
  input: "text-base text-(--tp-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--tp-muted-fg)/55",
  textarea: "text-base text-(--tp-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--tp-muted-fg)/55",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--tp-primary)/60",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--tp-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-none bg-(--tp-primary) text-(--tp-on-primary) font-semibold uppercase tracking-[0.2em] text-sm hover:bg-(--tp-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-none text-sm font-semibold text-(--tp-muted-fg) uppercase tracking-[0.16em] hover:text-(--tp-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--tp-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Karthik Iyer" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a message" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-none border border-(--tp-primary)/30 bg-(--tp-card) max-w-sm font-medium text-(--tp-fg)",
  title: "text-(--tp-primary) text-xl",
  description: "text-(--tp-muted-fg)",
  cancel: "rounded-none border-(--tp-primary)/40 text-(--tp-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-none bg-(--tp-destructive) hover:bg-(--tp-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
