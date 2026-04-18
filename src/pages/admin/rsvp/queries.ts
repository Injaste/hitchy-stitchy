import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { supabase } from '@/lib/supabase'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'
import { fetchRSVPs, updateRSVPStatus } from './api'
import type { RSVPStatus } from './types'

export function useRSVPQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.rsvps(slug!),
    queryFn: () => fetchRSVPs(eventId!),
    enabled: !!eventId && !!slug,
  })
}

export function useRSVPRealtime() {
  const { slug, eventId } = useAdminStore()
  const qc = useQueryClient()

  useEffect(() => {
    if (!eventId || !slug) return

    const channel = supabase
      .channel(`admin-rsvps-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'event_rsvps',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: adminKeys.rsvps(slug) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, slug, qc])
}

export function useUpdateRSVPStatusMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation(
    (payload: { id: string; status: RSVPStatus }) => updateRSVPStatus(payload),
    {
      successMessage: 'RSVP updated',
      errorMessage: 'Failed to update RSVP',
      onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.rsvps(slug!) }) },
    },
  )
}
