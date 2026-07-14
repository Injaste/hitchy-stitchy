import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import {
  fetchMembers,
  fetchInviteMessage,
  updateInviteMessage,
  createMember,
  regenerateMemberInvite,
  updateMember,
  updateMemberAccessGroup,
  updateMemberCouple,
  freezeMember,
  deleteMember,
} from "./api";
import type {
  Member,
  CreateMemberPayload,
  RegenerateMemberInvitePayload,
  UpdateMemberPayload,
  UpdateMemberAccessGroupPayload,
  UpdateMemberCouplePayload,
  FreezeMemberPayload,
  DeleteMemberPayload,
} from "./types";
import type { AccessGroup } from "../access/types";
import type { AdminBootstrapContext } from "../types";

export function useMembersQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.members(slug!),
    queryFn: () => fetchMembers(eventId!),
    enabled: !!eventId && !!slug,
  });
}

/** Per-event invite-message override (null = use the code default). Shared cache
 *  between the settings editor and the share UI in MemberDetailModal. */
export function useInviteMessageQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.inviteMessage(slug!),
    queryFn: () => fetchInviteMessage(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useUpdateInviteMessageMutation() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  // Silent: autosave shouldn't toast on every debounced save. The field itself
  // surfaces validation inline; cache is reconciled to server truth on success.
  return useMutation((message: string) => updateInviteMessage(eventId!, message), {
    silent: true,
    onSuccess: (result: string | null) => {
      queryClient.setQueryData(adminKeys.inviteMessage(slug!), result);
    },
  });
}

export function useMemberMutations() {
  const { slug, memberId } = useAdminStore();
  const queryClient = useQueryClient();

  const setMembers = (fn: (old: Member[] | undefined) => Member[]) =>
    queryClient.setQueryData<Member[]>(adminKeys.members(slug!), fn);

  const create = useMutation(
    (payload: CreateMemberPayload) => createMember(payload),
    {
      successMessage: (result: Member) =>
        `Invite sent to "${truncate(result.display_name)}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        const accessGroups = queryClient.getQueryData<AccessGroup[]>(adminKeys.accessGroups(slug!));
        const accessGroup = accessGroups?.find((g) => g.id === result.access_group_id);
        if (!accessGroup) {
          queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) });
        } else {
          setMembers((old) => [...(old ?? []), { ...result, accessGroup }]);
        }
      },
    },
  );

  const regenerate = useMutation(
    (payload: RegenerateMemberInvitePayload) => regenerateMemberInvite(payload),
    {
      successMessage: () => "Invite link regenerated",
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        setMembers(
          (old) =>
            old?.map((m) =>
              m.id === result.id ? { ...result, accessGroup: m.accessGroup } : m,
            ) ?? [],
        );
      },
    },
  );

  const update = useMutation(
    (payload: UpdateMemberPayload) => updateMember(payload),
    {
      successMessage: (result: Member) =>
        `"${truncate(result.display_name)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        setMembers(
          (old) =>
            old?.map((m) =>
              m.id === result.id ? { ...result, accessGroup: m.accessGroup } : m,
            ) ?? [],
        );
        // Sync bootstrap context if the current user's display_name or role changed.
        if (result.id === memberId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) =>
              old && {
                ...old,
                memberDisplayName: result.display_name,
                memberRole: result.role,
              },
          );
        }
      },
    },
  );

  const updateAccessGroup = useMutation(
    (payload: UpdateMemberAccessGroupPayload) => updateMemberAccessGroup(payload),
    {
      successMessage: (result: Member) =>
        `Access updated for "${truncate(result.display_name)}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        const accessGroups = queryClient.getQueryData<AccessGroup[]>(adminKeys.accessGroups(slug!));
        const newAccessGroup = accessGroups?.find((g) => g.id === result.access_group_id);
        if (!newAccessGroup) {
          queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) });
        } else {
          setMembers(
            (old) =>
              old?.map((m) =>
                m.id === result.id ? { ...result, accessGroup: newAccessGroup } : m,
              ) ?? [],
          );
          // Sync bootstrap context if the current user's access group changed.
          // isRoot / isAdmin are flags on event_members, not derived from the access group —
          // changing access_group_id does not affect them.
          if (result.id === memberId) {
            queryClient.setQueryData<AdminBootstrapContext>(
              adminKeys.bootstrap(slug!),
              (old) =>
                old && {
                  ...old,
                  memberAccessGroupId: result.access_group_id,
                  memberAccessGroupName: newAccessGroup.name,
                  permissions: newAccessGroup.permissions,
                },
            );
          }
        }
      },
    },
  );

  const updateCouple = useMutation(
    (payload: UpdateMemberCouplePayload) => updateMemberCouple(payload),
    {
      successMessage: (result: Member) =>
        `Couple role updated for "${truncate(result.display_name)}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        setMembers(
          (old) =>
            old?.map((m) =>
              m.id === result.id
                ? { ...m, is_bride: result.is_bride, is_groom: result.is_groom }
                : m,
            ) ?? [],
        );
        if (result.id === memberId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) =>
              old && {
                ...old,
                isBride: result.is_bride,
                isGroom: result.is_groom,
                isSuperAdmin: old.isRoot || result.is_bride || result.is_groom,
              },
          );
        }
      },
    },
  );

  const freeze = useMutation(
    (payload: FreezeMemberPayload) => freezeMember(payload),
    {
      successMessage: (result: Member, args) =>
        args.freeze
          ? `Access frozen for "${truncate(result.display_name)}"`
          : `Access restored for "${truncate(result.display_name)}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        setMembers(
          (old) =>
            old?.map((m) =>
              m.id === result.id ? { ...result, accessGroup: m.accessGroup } : m,
            ) ?? [],
        );
      },
    },
  );

  const remove = useMutation(
    (payload: DeleteMemberPayload) => deleteMember(payload),
    {
      successMessage: (_: void, args: DeleteMemberPayload) =>
        `"${truncate(args.display_name)}" removed`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteMemberPayload) => {
        setMembers((old) => old?.filter((m) => m.id !== args.id) ?? []);
      },
    },
  );

  return { create, regenerate, update, updateAccessGroup, updateCouple, freeze, remove };
}
