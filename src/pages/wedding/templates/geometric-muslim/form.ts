import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Underline-style fields (border-bottom only) — deliberately unlike the pill
// inputs of unique-muslim, to give this template its own form language.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-6",
  fieldLabel:
    "text-2xs font-semibold uppercase tracking-[0.3em] text-(--gm-primary)/70",
  fieldRequiredMark: "text-(--gm-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-11 rounded-none border-0 border-b border-(--gm-border) bg-transparent px-0",
  inputGroupTextarea: "gap-2 rounded-none border-0 border-b border-(--gm-border) bg-transparent px-0",
  input:
    "text-base font-medium text-(--gm-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--gm-muted-fg)/60",
  textarea:
    "text-base font-medium text-(--gm-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--gm-muted-fg)/60",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--gm-primary)/50",
  fieldError: "text-sm font-semibold tracking-wide",
  formError:
    "text-(--gm-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-4",
  submit:
    "h-12 rounded-none border border-(--gm-primary) bg-transparent text-(--gm-primary) font-semibold uppercase tracking-[0.25em] text-sm hover:bg-(--gm-primary) hover:text-(--gm-primary-fg) disabled:opacity-60 transition-colors mt-6",
  cancel:
    "h-11 rounded-none text-sm font-semibold text-(--gm-muted-fg) uppercase tracking-[0.2em] hover:text-(--gm-fg)",
  fields: {
    guestCount: {
      input:
        "text-base font-medium text-(--gm-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Ahmad Bin Ali" },
  phone: {
    label: "Phone Number",
    placeholder: "9123 4567",
  },
  guestCount: {
    label: "Number of Guests",
    placeholder: (max) => `1 - ${max}`,
  },
  message: {
    label: "Message",
    placeholder: "Leave us a message",
  },
  required: "*",
  submit: {
    idle: "Confirm Attendance",
    editing: "Update RSVP",
    submitting: "Sending Love...",
  },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content:
    "rounded-none border border-(--gm-primary)/30 bg-(--gm-bg-2) max-w-sm font-medium text-(--gm-fg)",
  title: "italic text-(--gm-gold-soft) text-xl",
  description: "italic text-(--gm-muted-fg)",
  cancel: "rounded-none border-(--gm-primary)/30 text-(--gm-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-none bg-(--gm-destructive) hover:bg-(--gm-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description:
    "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
