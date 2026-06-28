import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import {
  fetchTemplates,
  fetchInvitations,
  fetchEventSegments,
  createInvitation,
  saveInvitation,
  deleteInvitation,
  unpublishInvitation,
} from "./api";
import type {
  CreateInvitationPayload,
  SaveInvitationPayload,
  DeleteInvitationPayload,
  UnpublishInvitationPayload,
} from "./types";

export function useTemplatesQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.templates(slug!),
    queryFn: () => fetchTemplates(eventId!),
    enabled: !!slug && !!eventId,
    staleTime: Infinity,
  });
}

export function useInvitationsQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.invitation(slug!),
    queryFn: () => fetchInvitations(eventId!),
    enabled: !!eventId && !!slug,
  });
}

// Day segments — for hub tile labels + the create flow's segment picker.
export function useEventSegmentsQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.segments(slug!),
    queryFn: () => fetchEventSegments(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useInvitationMutations() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  // Per-page now: refetch the list rather than swapping a single object.
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: adminKeys.invitation(slug!),
    });

  const create = useMutation(
    (payload: CreateInvitationPayload) => createInvitation(payload),
    {
      successMessage: "Invitation created",
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  );

  const save = useMutation(
    (payload: SaveInvitationPayload) => saveInvitation(payload, false),
    {
      // successMessage/errorMessage (not the toast.promise style) so toasts fire
      // through mutateAsync — the SubmitButton already covers the pending state.
      successMessage: "Saved",
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  );

  const remove = useMutation(
    (payload: DeleteInvitationPayload) => deleteInvitation(payload),
    {
      successMessage: "Invitation deleted",
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  );

  // Publish = save + promote, atomically, via the one update RPC. publishAt set
  // (a future timestamp) schedules the page to go live then instead of now.
  const publish = useMutation(
    ({
      payload,
      publishAt = null,
    }: {
      payload: SaveInvitationPayload;
      publishAt?: string | null;
    }) => saveInvitation(payload, true, publishAt),
    {
      successMessage: (inv) =>
        inv.published_at && new Date(inv.published_at) > new Date()
          ? "Publish scheduled"
          : "Invitation published",
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  );

  const unpublish = useMutation(
    (payload: UnpublishInvitationPayload) => unpublishInvitation(payload),
    {
      successMessage: "Invitation unpublished",
      errorMessage: (err) => err.message,
      onSuccess: invalidate,
    },
  );

  return { create, save, remove, publish, unpublish, eventId };
}
