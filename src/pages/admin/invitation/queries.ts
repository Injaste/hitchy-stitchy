import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import {
  fetchInvitation,
  fetchTemplates,
  fetchEventInvitations,
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

// Old per-event invitation (event_invitation singular). Still the source for the
// guests feature's RSVP settings (deadline / count limits) until the go-live
// cleanup repoints it onto event_invitations.
export function useInvitationQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.invitation(slug!),
    queryFn: () => fetchInvitation(eventId!),
    enabled: !!eventId && !!slug,
  });
}

// ── New parallel model (event_invitations) ───────────────────────────────────
export function useTemplatesQuery() {
  const { slug } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.templates(slug!),
    queryFn: fetchTemplates,
    enabled: !!slug,
    staleTime: Infinity,
  });
}

export function useEventInvitationsQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.eventInvitation(slug!),
    queryFn: () => fetchEventInvitations(eventId!),
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

export function useEventInvitationMutations() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  // Per-page now: refetch the list rather than swapping a single object.
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: adminKeys.eventInvitation(slug!),
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

  // Publish = save + promote, atomically, via the one update RPC.
  const publish = useMutation(
    (payload: SaveInvitationPayload) => saveInvitation(payload, true),
    {
      successMessage: "Invitation published",
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
