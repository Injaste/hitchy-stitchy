import { Banknote, Coins, Mail, Send, type LucideIcon } from "lucide-react";

import type { GiftMethod } from "../types";

export const METHOD_META: Record<GiftMethod, { label: string; icon: LucideIcon }> = {
  envelope: { label: "Envelope", icon: Mail },
  cash: { label: "Cash", icon: Banknote },
  transfer: { label: "PayNow", icon: Send },
  others: { label: "Others", icon: Coins },
};
