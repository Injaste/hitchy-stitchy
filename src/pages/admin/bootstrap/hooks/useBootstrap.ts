import { useEffect } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import { useBootstrapQuery } from '../queries'

export function useBootstrap() {
  const { setContext, setBootstrapError } = useAdminStore()
  const { data, error } = useBootstrapQuery()

  useEffect(() => {
    if (data) setContext(data)
    if (error) setBootstrapError((error as Error).message)
  }, [data, error])
}