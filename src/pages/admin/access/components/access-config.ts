import { CheckCircle2, Eye, Minus } from "lucide-react";
import type { AccessLevel } from "../types";

export const ACCESS_CONFIG: Record<
  AccessLevel,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  full: { icon: CheckCircle2, label: "Full", className: "text-primary" },
  read: { icon: Eye, label: "View", className: "text-muted-foreground/70" },
  none: { icon: Minus, label: "—", className: "text-muted-foreground/50" },
};
