import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";
import {
  fetchMembers,
  inviteMember,
  updateMember,
  updateMemberRole,
  updateMemberCouple,
  freezeMember,
  deleteMember,
} from "./api";
import type {
  Member,
  InviteMemberPayload,
  UpdateMemberPayload,
  UpdateMemberRolePayload,
  UpdateMemberCouplePayload,
  FreezeMemberPayload,
  DeleteMemberPayload,
} from "./types";
import type { Role } from "../roles/types";
import type { AdminBootstrapContext } from "../types";

export function useMembersQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.members(slug!),
    queryFn: () => fetchMembers(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useMemberMutations() {
  const { slug, memberId } = useAdminStore();
  const queryClient = useQueryClient();

  const setMembers = (fn: (old: Member[] | undefined) => Member[]) =>
    queryClient.setQueryData<Member[]>(adminKeys.members(slug!), fn);

  const invite = useMutation(
    (payload: InviteMemberPayload) => inviteMember(payload),
    {
      successMessage: (result: Member) =>
        `Invite sent to "${truncate(result.display_name)}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        const roles = queryClient.getQueryData<Role[]>(adminKeys.roles(slug!));
        const role = roles?.find((r) => r.id === result.role_id);
        if (!role) {
          queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) });
        } else {
          setMembers((old) => [...(old ?? []), { ...result, role }]);
        }
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
              m.id === result.id ? { ...result, role: m.role } : m,
            ) ?? [],
        );
        // Sync bootstrap context if the current user's display_name or label changed.
        if (result.id === memberId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) =>
              old && {
                ...old,
                memberDisplayName: result.display_name,
                memberLabel: result.label,
              },
          );
        }
      },
    },
  );

  const updateRole = useMutation(
    (payload: UpdateMemberRolePayload) => updateMemberRole(payload),
    {
      successMessage: (result: Member) =>
        `Role updated for "${truncate(result.display_name)}"`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Member) => {
        const roles = queryClient.getQueryData<Role[]>(adminKeys.roles(slug!));
        const newRole = roles?.find((r) => r.id === result.role_id);
        if (!newRole) {
          queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) });
        } else {
          setMembers(
            (old) =>
              old?.map((m) =>
                m.id === result.id ? { ...result, role: newRole } : m,
              ) ?? [],
          );
          // Sync bootstrap context if the current user's role changed.
          // isRoot / isAdmin are flags on event_members, not derived from the role —
          // changing role_id does not affect them.
          if (result.id === memberId) {
            queryClient.setQueryData<AdminBootstrapContext>(
              adminKeys.bootstrap(slug!),
              (old) =>
                old && {
                  ...old,
                  memberRoleId: result.role_id,
                  memberRoleName: newRole.name,
                  permissions: newRole.permissions,
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
              m.id === result.id ? { ...result, role: m.role } : m,
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

  return { invite, update, updateRole, updateCouple, freeze, remove };
}
