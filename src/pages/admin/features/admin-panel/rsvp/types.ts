export interface RSVP {
  id: string;
  name: string;
  email: string;
  guests: number;
  status: "Confirmed" | "Declined" | "Pending";
  dietaryRequirements?: string;
  submittedAt: string;
}
