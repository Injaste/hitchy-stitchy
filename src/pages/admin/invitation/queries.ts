import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import {
  fetchInvitation,
  fetchTemplates,
  fetchEventInvitation,
  createInvitation,
  saveInvitation,
  deleteInvitation,
  unpublishInvitation,
} from "./api";
import type {
  EventInvitation,
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

export function useEventInvitationQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.eventInvitation(slug!),
    queryFn: () => fetchEventInvitation(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useEventInvitationMutations() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  const setData = (result: EventInvitation) =>
    queryClient.setQueryData<EventInvitation>(
      adminKeys.eventInvitation(slug!),
      result,
    );

  const create = useMutation(
    (payload: CreateInvitationPayload) => createInvitation(payload),
    {
      successMessage: "Invitation created",
      errorMessage: (err) => err.message,
      onSuccess: setData,
    },
  );

  const save = useMutation(
    (payload: SaveInvitationPayload) => saveInvitation(payload, false),
    {
      // successMessage/errorMessage (not the toast.promise style) so toasts fire
      // through mutateAsync — the SubmitButton already covers the pending state.
      successMessage: "Saved",
      errorMessage: (err) => err.message,
      onSuccess: setData,
    },
  );

  const remove = useMutation(
    (payload: DeleteInvitationPayload) => deleteInvitation(payload),
    {
      successMessage: "Invitation deleted",
      errorMessage: (err) => err.message,
      onSuccess: () =>
        queryClient.setQueryData(adminKeys.eventInvitation(slug!), null),
    },
  );

  // Publish = save + promote, atomically, via the one update RPC.
  const publish = useMutation(
    (payload: SaveInvitationPayload) => saveInvitation(payload, true),
    {
      successMessage: "Invitation published",
      errorMessage: (err) => err.message,
      onSuccess: setData,
    },
  );

  const unpublish = useMutation(
    (payload: UnpublishInvitationPayload) => unpublishInvitation(payload),
    {
      successMessage: "Invitation unpublished",
      errorMessage: (err) => err.message,
      onSuccess: setData,
    },
  );

  return { create, save, remove, publish, unpublish, eventId };
}
