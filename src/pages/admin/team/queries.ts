import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'
import {
  fetchRoles, fetchMembers, createRole, updateRole, deleteRole,
  updateMemberActive, inviteMember,
} from './api'
import type { Role } from './types'

export function useTeamRolesQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: [...adminKeys.team(slug), 'roles'] as const,
    queryFn: () => fetchRoles(eventId),
    enabled: !!eventId,
  })
}

export function useTeamMembersQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: [...adminKeys.team(slug), 'members'] as const,
    queryFn: () => fetchMembers(eventId),
    enabled: !!eventId,
  })
}

export function useCreateRoleMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<Omit<Role, 'id'>, Role>(createRole, {
    successMessage: 'Role created',
    errorMessage: 'Failed to create role',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.team(slug) }) },
  })
}

export function useUpdateRoleMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<Role, Role>(updateRole, {
    successMessage: 'Role updated',
    errorMessage: 'Failed to update role',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.team(slug) }) },
  })
}

export function useDeleteRoleMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<string, void>(deleteRole, {
    successMessage: 'Role deleted',
    errorMessage: 'Failed to delete role',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.team(slug) }) },
  })
}

export function useToggleMemberActiveMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<{ memberId: string; isActive: boolean }, void>(
    ({ memberId, isActive }) => updateMemberActive(memberId, isActive),
    {
      successMessage: 'Member updated',
      errorMessage: 'Failed to update member',
      onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.team(slug) }) },
    },
  )
}

export function useInviteMemberMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<
    { eventId: string; email: string; roleId: string; displayName: string },
    void
  >(inviteMember, {
    successMessage: 'Invitation sent',
    errorMessage: 'Failed to send invitation',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.team(slug) }) },
  })
}
