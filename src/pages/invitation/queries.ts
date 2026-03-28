import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchMockRsvp, submitMockRsvp, deleteMockRsvp } from "./api";

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
    isQuerying: rsvpQuery.isLoading,
    isSubmitting: submitMutation.isPending,
    isDeleting: deleteMutation.isPending,
    submitRSVP: submitMutation.mutateAsync,
    deleteRSVP: deleteMutation.mutateAsync,
  };
};
