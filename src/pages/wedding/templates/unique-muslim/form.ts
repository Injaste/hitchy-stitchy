import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/wedding/form"

export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel:
    "text-base font-bold uppercase tracking-widest text-[var(--um-muted-fg)]",
  fieldRequiredMark: "text-[var(--um-destructive)] ml-0.5",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-1 h-12 rounded-full bg-[var(--um-muted)]/40 border-[var(--um-border)] px-1.5",
  inputGroupTextarea: "gap-1 rounded-2xl bg-[var(--um-muted)]/40 border-[var(--um-border)] px-1.5",
  input:
    "rounded-tr-full rounded-br-full text-base font-medium focus-visible:ring-[var(--um-primary)] focus-visible:border-[var(--um-primary)] bg-transparent border-0",
  textarea:
    "text-base font-medium focus-visible:ring-[var(--um-primary)] focus-visible:border-[var(--um-primary)] rounded-r-2xl",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-1.5",
  inputIcon: "text-[var(--um-primary)]/40",
  fieldError: "text-sm font-semibold tracking-wide",
  actions: "flex flex-col gap-2.5 pt-2",
  submit:
    "h-12 rounded-full bg-[var(--um-primary)] text-[var(--um-primary-fg)] font-bold uppercase tracking-widest text-sm shadow-lg hover:bg-[var(--um-primary)]/90 disabled:opacity-60 transition-all mt-8",
  cancel:
    "h-12 rounded-full text-sm font-bold text-[var(--um-muted-fg)] uppercase tracking-widest hover:bg-[var(--um-primary)]/10",
  fields: {
    guestCount: {
      input:
        "rounded-tr-full rounded-br-full text-base font-medium focus-visible:ring-[var(--um-primary)] focus-visible:border-[var(--um-primary)] bg-transparent border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
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
    "rounded-2xl border border-[var(--um-primary)]/20 bg-[var(--um-card)]/95 backdrop-blur-md max-w-sm font-medium",
  title: "italic text-[var(--um-primary)] text-xl",
  description: "italic text-[var(--um-muted-fg)]",
  cancel: "rounded-xl border-[var(--um-primary)]/30 font-bold",
  confirm: "rounded-xl bg-[var(--um-destructive)] hover:bg-[var(--um-destructive)]/90 font-bold",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description:
    "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
