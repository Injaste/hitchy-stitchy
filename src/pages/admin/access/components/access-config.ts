import { CheckCircle2, Eye, Minus } from "lucide-react";
import type { AccessLevel } from "../types";

export const ACCESS_CONFIG: Record<
  AccessLevel,
  { icon: typeof CheckCircle2; label: string; hint: string; className: string }
> = {
  full: {
    icon: CheckCircle2,
    label: "Full",
    hint: "Can view, add, edit and remove",
    className: "text-primary",
  },
  read: {
    icon: Eye,
    label: "View",
    hint: "Can view, but not change",
    className: "text-muted-foreground/70",
  },
  none: {
    icon: Minus,
    label: "—",
    hint: "Hidden — no access",
    className: "text-muted-foreground/50",
  },
};
