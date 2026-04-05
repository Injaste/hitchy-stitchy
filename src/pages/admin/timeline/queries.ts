import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'
import {
  fetchTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
  startCue,
} from './api'
import type { TimelineEvent } from './types'

export function useTimelineQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.timeline(slug),
    queryFn: () => fetchTimelineEvents(eventId),
    enabled: !!eventId,
  })
}

export function useCreateTimelineMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<Omit<TimelineEvent, 'id'>, TimelineEvent>(createTimelineEvent, {
    successMessage: 'Event added to timeline',
    errorMessage: 'Failed to add event',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.timeline(slug) }) },
  })
}

export function useUpdateTimelineMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<TimelineEvent, TimelineEvent>(updateTimelineEvent, {
    successMessage: 'Timeline event updated',
    errorMessage: 'Failed to update event',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.timeline(slug) }) },
  })
}

export function useDeleteTimelineMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<string, void>(deleteTimelineEvent, {
    successMessage: 'Event removed',
    errorMessage: 'Failed to remove event',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.timeline(slug) }) },
  })
}

export function useStartCueMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<string, void>(startCue, {
    successMessage: 'Cue started',
    errorMessage: 'Failed to start cue',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.timeline(slug) }) },
  })
}
