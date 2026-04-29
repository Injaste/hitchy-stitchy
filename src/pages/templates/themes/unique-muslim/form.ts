import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/templates/form"

export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-5",
  fieldLabel:
    "text-2xs font-bold uppercase tracking-widest text-muted-foreground",
  fieldRequiredMark: "text-destructive ml-0.5",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup: "gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5",
  inputGroupTextarea: "gap-1 rounded-2xl bg-muted/40 border-border px-1.5",
  input:
    "rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0",
  textarea:
    "text-sm focus-visible:ring-primary focus-visible:border-primary rounded-r-2xl",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-2.5",
  inputIcon: "text-primary/40",
  fieldError: "text-2xs font-bold uppercase tracking-wide",
  actions: "flex flex-col gap-2.5 pt-2",
  submit:
    "h-12 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg hover:bg-primary/90 disabled:opacity-60 transition-all mt-8",
  cancel:
    "h-12 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest hover:bg-primary/10",
  fields: {
    guestCount: {
      input:
        "rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Full Name", placeholder: "e.g. Ahmad Bin Ali" },
  phone: {
    label: "Phone Number",
    placeholder: "+65 9123 4567",
    optional: "(Optional)",
  },
  guestCount: {
    label: "Number of Guests",
    placeholder: (max) => `1 – ${max}`,
    optional: "(Optional)",
  },
  message: {
    label: "Message",
    placeholder: "Leave us a message",
    optional: "(Optional)",
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
    "rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-md max-w-sm font-medium",
  title: "italic text-primary text-xl",
  description: "italic text-muted-foreground",
  cancel: "rounded-xl border-primary/30 font-bold",
  confirm: "rounded-xl bg-destructive hover:bg-destructive/90 font-bold",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove your RSVP?",
  description:
    "We'd hate to see you go. Are you sure you want to remove your RSVP?",
  cancel: "Keep it",
  confirm: "Yes, remove",
}
