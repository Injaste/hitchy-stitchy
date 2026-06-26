import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.25em] text-(--bl-primary)/80",
  fieldRequiredMark: "text-(--bl-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-sm border border-(--bl-accent)/50 bg-(--bl-bg) px-3",
  inputGroupTextarea: "gap-2 rounded-sm border border-(--bl-accent)/50 bg-(--bl-bg) px-3",
  input: "text-base text-(--bl-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--bl-muted-fg)/60",
  textarea: "text-base text-(--bl-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--bl-muted-fg)/60",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--bl-accent)",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--bl-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-sm bg-(--bl-primary) text-(--bl-on-primary) font-semibold uppercase tracking-[0.22em] text-sm hover:bg-(--bl-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-sm text-sm font-semibold text-(--bl-muted-fg) uppercase tracking-[0.16em] hover:text-(--bl-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--bl-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Daniel Tan" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a message" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-sm border border-(--bl-accent)/50 bg-(--bl-card) max-w-sm font-medium text-(--bl-fg)",
  title: "italic text-(--bl-primary) text-xl",
  description: "italic text-(--bl-muted-fg)",
  cancel: "rounded-sm border-(--bl-accent)/50 text-(--bl-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-sm bg-(--bl-destructive) hover:bg-(--bl-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
