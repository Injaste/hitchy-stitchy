import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'
import { fetchLiveLogs, insertLiveLog, markArrived, advanceCue } from './api'
import type {
  InsertLiveLogPayload,
  MarkArrivedPayload,
  AdvanceCuePayload,
} from './types'

export function useLiveLogsQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.liveLogs(slug),
    queryFn: () => fetchLiveLogs(eventId),
    enabled: !!eventId,
  })
}

export function useInsertLogMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation(
    (payload: InsertLiveLogPayload) => insertLiveLog(payload),
    {
      silent: true,
      onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.liveLogs(slug) }) },
    },
  )
}

export function useMarkArrivedMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation(
    (payload: MarkArrivedPayload) => markArrived(payload),
    {
      successMessage: (_: void, args: MarkArrivedPayload) =>
        `"${args.display_name}" marked as arrived`,
      errorMessage: 'Failed to mark arrival',
      onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.members(slug) }) },
    },
  )
}

export function useAdvanceCueMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation(
    (payload: AdvanceCuePayload) => advanceCue(payload),
    {
      successMessage: 'Cue advanced',
      errorMessage: 'Failed to advance cue',
      onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.timeline(slug) }) },
    },
  )
}
