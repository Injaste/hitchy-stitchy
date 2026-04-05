import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAdminStore } from '../store/useAdminStore'
import type { AdminBootstrapContext, EventDay, RoleCategory } from '../types'

export function useBootstrap() {
  const { slug } = useParams<{ slug: string }>()
  const { isBootstrapped, setContext, setBootstrapError } = useAdminStore()

  useEffect(() => {
    if (isBootstrapped) return
    if (!slug) {
      setBootstrapError('No event slug found in URL.')
      return
    }

    async function bootstrap() {
      // Step 1: auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setBootstrapError('You must be logged in to view this page.')
        return
      }

      // Step 2: fetch event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, slug, name')
        .eq('slug', slug!)
        .is('deleted_at', null)
        .single()

      if (eventError || !event) {
        setBootstrapError('Event not found.')
        return
      }

      // Step 3: fetch member + settings in parallel
      const [memberResult, settingsResult] = await Promise.all([
        supabase
          .from('event_members')
          .select('id, display_name, role_id, event_roles(id, name, short_name, category)')
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single(),
        supabase
          .from('event_settings')
          .select('day_config')
          .eq('event_id', event.id)
          .single(),
      ])

      // Step 4: validate member
      if (memberResult.error || !memberResult.data) {
        setBootstrapError('You are not a member of this event.')
        return
      }

      const member = memberResult.data
      const role = member.event_roles as unknown as {
        id: string
        name: string
        short_name: string
        category: RoleCategory
      }

      // Step 5: parse day_config
      const rawDays = settingsResult.data?.day_config
      const days: EventDay[] = Array.isArray(rawDays) ? rawDays : []

      // Step 6: set context
      const ctx: AdminBootstrapContext = {
        slug: event.slug,
        eventId: event.id,
        eventName: event.name,
        days,
        memberId: member.id,
        memberDisplayName: member.display_name,
        memberRoleId: role.id,
        memberRoleName: role.name,
        memberRoleShortName: role.short_name,
        memberRoleCategory: role.category,
      }
      setContext(ctx)
    }

    bootstrap()
  }, [slug])
}
