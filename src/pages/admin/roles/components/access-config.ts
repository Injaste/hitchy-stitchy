import { CheckCircle2, Eye, Minus, PenLine } from "lucide-react";
import type { AccessLevel } from "../types";

export const ACCESS_CONFIG: Record<
  AccessLevel,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  full:  { icon: CheckCircle2, label: "Full",  className: "text-primary" },
  write: { icon: PenLine,      label: "Edit",  className: "text-muted-foreground" },
  read:  { icon: Eye,          label: "View",  className: "text-muted-foreground/60" },
  none:  { icon: Minus,        label: "—",     className: "text-muted-foreground/25" },
};

export const LEVEL_ORDER: AccessLevel[] = ["full", "write", "read", "none"];
