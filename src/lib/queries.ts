import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMockRsvp, submitMockRsvp, deleteMockRsvp } from "./api";
import * as z from "zod";

export const rsvpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(99, "Name is too long"),
  phoneNumber: z
    .string()
    .length(8, "Phone number must be exactly 8 digits")
    .regex(/^[89]\d{7}$/, "Must be a valid SG number"),
  guestsCount: z
    .number()
    .min(1, "At least 1 guest")
    .max(10, "Max 10 guests per RSVP"),
});

export type RSVPFormData = z.infer<typeof rsvpSchema>;

export const useRSVP = () => {
  const queryClient = useQueryClient();

  const rsvpQuery = useQuery({
    queryKey: ["rsvp"],
    queryFn: fetchMockRsvp,
    staleTime: Infinity,
  });

  const submitMutation = useMutation({
    mutationFn: submitMockRsvp,
    onSuccess: (data) => {
      queryClient.setQueryData(["rsvp"], data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMockRsvp,
    onSuccess: () => {
      queryClient.setQueryData(["rsvp"], null);
    },
  });

  return {
    rsvp: rsvpQuery.data,
    isLoading: rsvpQuery.isLoading,
    isSubmitting: submitMutation.isPending,
    isDeleting: deleteMutation.isPending,
    submitRSVP: submitMutation.mutateAsync,
    deleteRSVP: deleteMutation.mutateAsync,
  };
};
