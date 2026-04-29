import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/templates/form"

export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-6",
  fieldLabel:
    "text-2xs font-bold uppercase tracking-[0.3em] text-primary/70",
  fieldRequiredMark: "text-destructive ml-0.5",
  fieldOptionalMark: "ml-1 normal-case tracking-normal font-normal",
  inputGroup:
    "gap-1 h-12 rounded-none bg-card/60 border-2 border-primary/30 px-2",
  inputGroupTextarea:
    "gap-1 rounded-none bg-card/60 border-2 border-primary/30 px-2",
  input:
    "text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0 font-display",
  textarea:
    "text-sm focus-visible:ring-primary focus-visible:border-primary font-display",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-2.5",
  inputIcon: "text-primary/60",
  fieldError: "text-2xs font-bold uppercase tracking-wide",
  actions: "flex flex-col gap-3 pt-2",
  submit:
    "h-12 rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-[0.25em] text-xs sm:text-sm shadow-lg hover:bg-primary/90 disabled:opacity-60 transition-all mt-8 border-2 border-primary",
  cancel:
    "h-12 rounded-none text-xs font-bold text-muted-foreground uppercase tracking-[0.25em] hover:bg-primary/10 border border-primary/20",
  fields: {
    guestCount: {
      input:
        "text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0 font-display [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Honoured Name", placeholder: "e.g. Muhammad Bin Abdullah" },
  phone: {
    label: "Contact Number",
    placeholder: "+65 9123 4567",
    optional: "(Optional)",
  },
  guestCount: {
    label: "Number Attending",
    placeholder: (max) => `1 – ${max}`,
    optional: "(Optional)",
  },
  message: {
    label: "Du'a or Message",
    placeholder: "Share your blessings…",
    optional: "(Optional)",
  },
  required: "*",
  submit: {
    idle: "Confirm Attendance",
    editing: "Update RSVP",
    submitting: "InshaAllah…",
  },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content:
    "rounded-none border-2 border-primary/40 bg-card/95 backdrop-blur-md max-w-sm font-display",
  title: "text-primary text-xl tracking-wide uppercase",
  description: "text-muted-foreground",
  cancel: "rounded-none border-2 border-primary/30 font-bold uppercase tracking-wider",
  confirm:
    "rounded-none bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Withdraw your RSVP?",
  description:
    "Are you certain you wish to withdraw your attendance? You may rejoin us at any time.",
  cancel: "Stay",
  confirm: "Yes, withdraw",
}
