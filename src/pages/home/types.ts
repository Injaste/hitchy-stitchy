import { z } from "zod";

export interface SubscribePayload {
  email: string;
}

export const subscribeSchema = z.object({
  email: z.email("Enter a valid email"),
});

export type SubscribeFormValues = z.infer<typeof subscribeSchema>;
