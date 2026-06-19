import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Gold-bordered inputs on deep oxblood.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.25em] text-(--im-gold)/80",
  fieldRequiredMark: "text-(--im-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-sm border border-(--im-gold)/40 bg-(--im-bg) px-3",
  inputGroupTextarea: "gap-2 rounded-sm border border-(--im-gold)/40 bg-(--im-bg) px-3",
  input: "text-base text-(--im-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--im-muted-fg)/55",
  textarea: "text-base text-(--im-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--im-muted-fg)/55",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--im-gold)/60",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--im-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-sm bg-(--im-gold) text-(--im-on-primary) font-semibold uppercase tracking-[0.22em] text-sm hover:bg-(--im-gold)/90 disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-sm text-sm font-semibold text-(--im-muted-fg) uppercase tracking-[0.16em] hover:text-(--im-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--im-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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
  content: "rounded-sm border border-(--im-gold)/40 bg-(--im-card) max-w-sm font-medium text-(--im-fg)",
  title: "italic text-(--im-gold-soft) text-xl",
  description: "italic text-(--im-muted-fg)",
  cancel: "rounded-sm border-(--im-gold)/40 text-(--im-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-sm bg-(--im-destructive) hover:bg-(--im-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
