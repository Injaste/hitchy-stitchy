export interface RSVP {
  id: string;
  name: string;
  email: string;
  guests: number;
  status: "Confirmed" | "Declined" | "Pending";
  dietaryRequirements?: string;
  submittedAt: string;
}

export const statusVariant: Record<
  RSVP["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  Confirmed: "default",
  Pending: "outline",
  Declined: "destructive",
};
