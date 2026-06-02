import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@/lib/query/useMutation"
import { truncate } from "@/lib/utils"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { fetchAccessGroups, createAccessGroup, updateAccessGroup, deleteAccessGroup, fetchAvailableResources } from "./api"
import type { AccessGroup, CreateAccessGroupPayload, UpdateAccessGroupPayload, DeleteAccessGroupPayload } from "./types"
import type { Member } from "../members/types"
import type { AdminBootstrapContext } from "../types"

export function useAccessGroupsQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.accessGroups(slug!),
    queryFn: () => fetchAccessGroups(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useAvailableResourcesQuery() {
  return useQuery({
    queryKey: adminKeys.availableResources(),
    queryFn: fetchAvailableResources,
    staleTime: Infinity,
  })
}

export function useAccessGroupMutations() {
  const { slug, memberAccessGroupId } = useAdminStore()
  const queryClient = useQueryClient()

  const setAccessGroups = (fn: (old: AccessGroup[] | undefined) => AccessGroup[]) =>
    queryClient.setQueryData<AccessGroup[]>(adminKeys.accessGroups(slug!), fn)

  const setMembers = (fn: (old: Member[] | undefined) => Member[]) =>
    queryClient.setQueryData<Member[]>(adminKeys.members(slug!), fn)

  const create = useMutation(
    (payload: CreateAccessGroupPayload) => createAccessGroup(payload),
    {
      successMessage: (result: AccessGroup) => `"${truncate(result.name)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: AccessGroup) => {
        setAccessGroups((old) => [...(old ?? []), result])
      },
    },
  )

  const update = useMutation(
    (payload: UpdateAccessGroupPayload) => updateAccessGroup(payload),
    {
      successMessage: (result: AccessGroup) => `"${truncate(result.name)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: AccessGroup) => {
        setAccessGroups((old) => old?.map((r) => r.id === result.id ? result : r) ?? [])
        setMembers((old) =>
          old?.map((m) => m.access_group_id === result.id ? { ...m, accessGroup: result } : m) ?? []
        )
        if (result.id === memberAccessGroupId) {
          queryClient.setQueryData<AdminBootstrapContext>(
            adminKeys.bootstrap(slug!),
            (old) => old && { ...old, memberAccessGroupName: result.name, permissions: result.permissions },
          )
        }
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.accessGroups(slug!) })
      },
    },
  )

  const remove = useMutation(
    (payload: DeleteAccessGroupPayload) => deleteAccessGroup(payload),
    {
      successMessage: (_: void, args: DeleteAccessGroupPayload) =>
        `"${truncate(args.name)}" deleted`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args: DeleteAccessGroupPayload) => {
        setAccessGroups((old) => old?.filter((r) => r.id !== args.id) ?? [])
        queryClient.invalidateQueries({ queryKey: adminKeys.members(slug!) })
      },
      onError: () => {
        queryClient.invalidateQueries({ queryKey: adminKeys.accessGroups(slug!) })
      },
    },
  )

  return { create, update, remove }
}
