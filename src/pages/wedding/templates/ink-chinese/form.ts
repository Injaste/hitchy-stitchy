import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Underline ink-line inputs — spare and brush-like.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-6",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.3em] text-(--ik-muted-fg)",
  fieldRequiredMark: "text-(--ik-seal) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-11 rounded-none border-0 border-b-2 border-(--ik-ink)/25 bg-transparent px-0",
  inputGroupTextarea: "gap-2 rounded-none border-0 border-b-2 border-(--ik-ink)/25 bg-transparent px-0",
  input: "text-base text-(--ik-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--ik-muted-fg)/55",
  textarea: "text-base text-(--ik-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--ik-muted-fg)/55",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--ik-ink)/40",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--ik-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-4",
  submit: "h-12 rounded-none bg-(--ik-ink) text-(--ik-on-ink) font-semibold uppercase tracking-[0.3em] text-sm hover:bg-(--ik-ink)/90 disabled:opacity-60 transition-colors mt-6",
  cancel: "h-11 rounded-none text-sm font-semibold text-(--ik-muted-fg) uppercase tracking-[0.2em] hover:text-(--ik-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--ik-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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
  content: "rounded-none border border-(--ik-border) bg-(--ik-card) max-w-sm font-medium text-(--ik-fg)",
  title: "italic text-(--ik-ink) text-xl",
  description: "italic text-(--ik-muted-fg)",
  cancel: "rounded-none border-(--ik-border) text-(--ik-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-none bg-(--ik-destructive) hover:bg-(--ik-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
