import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Ornate underlined inputs — thin henna lines, no boxes.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-6",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.24em] text-(--mh-primary)",
  fieldRequiredMark: "text-(--mh-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-11 border-b border-(--mh-primary)/40 bg-transparent px-1 rounded-none focus-within:border-(--mh-primary) transition-colors",
  inputGroupTextarea: "gap-2 border-b border-(--mh-primary)/40 bg-transparent px-1 rounded-none focus-within:border-(--mh-primary) transition-colors",
  input: "text-base text-(--mh-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--mh-muted-fg)/50",
  textarea: "text-base text-(--mh-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--mh-muted-fg)/50",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--mh-primary)/60",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--mh-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-4",
  submit: "h-12 rounded-md bg-(--mh-primary) text-(--mh-on-primary) font-semibold uppercase tracking-[0.2em] text-sm hover:bg-(--mh-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-md text-sm font-semibold text-(--mh-muted-fg) uppercase tracking-[0.16em] hover:text-(--mh-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--mh-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Rohan Kapoor" },
  phone: { label: "Phone Number", placeholder: "9123 4567" },
  guestCount: { label: "Number of Guests", placeholder: (max) => `1 - ${max}` },
  message: { label: "Message", placeholder: "Leave us a message" },
  required: "*",
  submit: { idle: "Confirm Attendance", editing: "Update RSVP", submitting: "Sending..." },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content: "rounded-lg border border-(--mh-primary)/30 bg-(--mh-card) max-w-sm font-medium text-(--mh-fg)",
  title: "text-(--mh-maroon) text-xl",
  description: "text-(--mh-muted-fg)",
  cancel: "rounded-md border-(--mh-primary)/40 text-(--mh-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-md bg-(--mh-destructive) hover:bg-(--mh-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
