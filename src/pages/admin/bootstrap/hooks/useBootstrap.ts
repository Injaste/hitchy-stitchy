import { useEffect } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import { useBootstrapQuery } from '../queries'
import { useAdminRealtime } from './useAdminRealtime'

export function useBootstrap() {
  const { setContext, setBootstrapError } = useAdminStore()
  const { data, error, refetch } = useBootstrapQuery()

  useAdminRealtime()

  useEffect(() => {
    if (data) setContext(data)
    if (error) setBootstrapError((error as Error).message)
  }, [data, error])

  useEffect(() => {
    const handleOnline = () => {
      setBootstrapError(null)
      refetch()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refetch])
}
