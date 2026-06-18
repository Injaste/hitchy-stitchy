import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

// Soft filled boxes on a light card — distinct from unique-muslim's pills and
// geometric-muslim's underlines.
export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel:
    "text-2xs font-semibold uppercase tracking-[0.25em] text-(--cm-accent-deep)",
  fieldRequiredMark: "text-(--cm-destructive) ml-1",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-2 h-12 rounded-md border border-(--cm-border) bg-(--cm-bg) px-3",
  inputGroupTextarea: "gap-2 rounded-md border border-(--cm-border) bg-(--cm-bg) px-3",
  input:
    "text-base text-(--cm-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--cm-muted-fg)/60",
  textarea:
    "text-base text-(--cm-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-(--cm-muted-fg)/60",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-(--cm-accent)/60",
  fieldError: "text-sm font-semibold tracking-wide",
  formError:
    "text-(--cm-destructive) text-sm font-semibold text-center leading-snug -mb-2",
  actions: "flex flex-col gap-2.5 pt-3",
  submit:
    "h-12 rounded-md bg-(--cm-accent) text-white font-semibold uppercase tracking-[0.2em] text-sm hover:bg-(--cm-accent-deep) disabled:opacity-60 transition-colors mt-5",
  cancel:
    "h-11 rounded-md text-sm font-semibold text-(--cm-muted-fg) uppercase tracking-[0.15em] hover:text-(--cm-fg)",
  fields: {
    guestCount: {
      input:
        "text-base text-(--cm-fg) bg-transparent border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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
    "rounded-lg border border-(--cm-border) bg-(--cm-card) max-w-sm font-medium text-(--cm-fg)",
  title: "italic text-(--cm-accent-deep) text-xl",
  description: "italic text-(--cm-muted-fg)",
  cancel: "rounded-md border-(--cm-border) text-(--cm-fg) font-semibold uppercase tracking-widest text-xs",
  confirm: "rounded-md bg-(--cm-destructive) hover:bg-(--cm-destructive)/90 font-semibold uppercase tracking-widest text-xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description:
    "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
