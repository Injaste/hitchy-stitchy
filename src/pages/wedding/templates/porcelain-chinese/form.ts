import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Crisp blue-bordered inputs on white porcelain.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel: "text-2xs font-semibold uppercase tracking-[0.25em] text-(--pc-primary)/80",
  fieldRequiredMark: "text-(--pc-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-md border border-(--pc-primary)/30 bg-(--pc-bg) px-3",
  inputGroupTextarea: "gap-2 rounded-md border border-(--pc-primary)/30 bg-(--pc-bg) px-3",
  input: "text-base text-(--pc-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--pc-muted-fg)/55",
  textarea: "text-base text-(--pc-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--pc-muted-fg)/55",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--pc-primary)/50",
  fieldError: "text-sm font-semibold tracking-wide",
  formError: "text-(--pc-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit: "h-12 rounded-md bg-(--pc-primary) text-(--pc-on-primary) font-semibold uppercase tracking-[0.2em] text-sm hover:bg-(--pc-primary-deep) disabled:opacity-60 transition-colors mt-5",
  cancel: "h-11 rounded-md text-sm font-semibold text-(--pc-muted-fg) uppercase tracking-[0.16em] hover:text-(--pc-fg)",
  fields: {
    guestCount: {
      input: "text-base text-(--pc-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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
  content: "rounded-md border border-(--pc-primary)/25 bg-(--pc-card) max-w-sm font-medium text-(--pc-fg)",
  title: "italic text-(--pc-primary) text-xl",
  description: "italic text-(--pc-muted-fg)",
  cancel: "rounded-md border-(--pc-primary)/30 text-(--pc-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-md bg-(--pc-destructive) hover:bg-(--pc-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description: "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
