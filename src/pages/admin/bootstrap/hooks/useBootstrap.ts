import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAdminStore } from '../../store/useAdminStore'
import { useBootstrapQuery } from '../queries'
import { useAdminRealtime } from './useAdminRealtime'

export function useBootstrap() {
  const setContext = useAdminStore((s) => s.setContext)
  const query = useBootstrapQuery()
  const { data, refetch } = query
  const { pathname } = useLocation()

  useAdminRealtime()

  // Mirror a successful bootstrap into the store so the rest of the admin shell
  // can read event/member context. Loading and error gating is driven directly
  // off the slug-keyed query in AdminView (not the store), so stale state from a
  // previously viewed event can never flash across navigation between events.
  useEffect(() => {
    if (data) setContext(data)
  }, [data])

  // Re-validate access on signals realtime can't deliver. When a member is frozen
  // or removed, RLS hides their own row, so Supabase Realtime never sends the
  // change that locked them out — their session would otherwise keep stale
  // "active" context (blank pages, no lockout). Re-running get_bootstrap_context
  // surfaces the suspended/removed error.
  useEffect(() => {
    const revalidate = () => refetch()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch()
    }
    window.addEventListener('online', revalidate)
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('online', revalidate)
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refetch])

  // Re-validate as the user moves around the admin shell (skip the initial mount —
  // the query already fetched).
  const isInitial = useRef(true)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false
      return
    }
    refetch()
  }, [pathname, refetch])

  return query
}
