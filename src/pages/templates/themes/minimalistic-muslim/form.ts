import type {
  RSVPFormClassNames,
  RSVPFormLabels,
  RSVPDeleteClassNames,
  RSVPDeleteLabels,
} from "@/pages/templates/form"

export const rsvpClassNames: RSVPFormClassNames = {
  fieldGroup: "gap-6",
  fieldLabel:
    "text-2xs uppercase tracking-[0.25em] text-muted-foreground font-normal",
  fieldRequiredMark: "text-destructive ml-0.5",
  fieldOptionalMark: "ml-1 normal-case tracking-normal",
  inputGroup:
    "gap-1 h-11 rounded-none border-0 border-b border-foreground/30 bg-transparent px-0",
  inputGroupTextarea:
    "gap-1 rounded-none border-0 border-b border-foreground/30 bg-transparent px-0",
  input:
    "text-sm focus-visible:ring-0 focus-visible:border-foreground bg-transparent border-0 px-0",
  textarea:
    "text-sm focus-visible:ring-0 focus-visible:border-foreground border-0 px-0",
  inputAddon: "mt-0.5",
  inputAddonTextarea: "self-start mt-2.5",
  inputIcon: "text-muted-foreground/40",
  fieldError: "text-2xs uppercase tracking-wide",
  actions: "flex flex-col gap-2 pt-4",
  submit:
    "h-11 rounded-none bg-foreground text-background uppercase tracking-[0.3em] text-2xs hover:bg-foreground/90 disabled:opacity-50 transition-all mt-6",
  cancel:
    "h-11 rounded-none text-2xs text-muted-foreground uppercase tracking-[0.3em] hover:bg-transparent hover:text-foreground",
  fields: {
    guestCount: {
      input:
        "text-sm focus-visible:ring-0 focus-visible:border-foreground bg-transparent border-0 px-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
}

export const rsvpLabels: RSVPFormLabels = {
  name: { label: "Name", placeholder: "Your name" },
  phone: {
    label: "Phone",
    placeholder: "+65 9123 4567",
    optional: "(optional)",
  },
  guestCount: {
    label: "Guests",
    placeholder: (max) => `1 – ${max}`,
    optional: "(optional)",
  },
  message: {
    label: "Message",
    placeholder: "A note for us",
    optional: "(optional)",
  },
  required: "*",
  submit: {
    idle: "Confirm",
    editing: "Update",
    submitting: "Sending…",
  },
  cancel: "Cancel",
}

export const rsvpDeleteClassNames: RSVPDeleteClassNames = {
  content:
    "rounded-none border border-foreground/15 bg-background max-w-sm",
  title: "text-foreground text-lg uppercase tracking-wider",
  description: "text-muted-foreground text-sm",
  cancel:
    "rounded-none border border-foreground/20 uppercase tracking-wider text-2xs",
  confirm:
    "rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-wider text-2xs",
}

export const rsvpDeleteLabels: RSVPDeleteLabels = {
  title: "Remove RSVP",
  description: "Are you sure you want to remove your RSVP?",
  cancel: "Keep",
  confirm: "Remove",
}
