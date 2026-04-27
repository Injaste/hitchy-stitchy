import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { adminKeys } from '../lib/queryKeys'
import { fetchBootstrapContext } from './api'

export function useBootstrapQuery() {
  const { slug } = useParams<{ slug: string }>()

  return useQuery({
    queryKey: adminKeys.bootstrap(slug!),
    queryFn: () => fetchBootstrapContext(slug!),
    enabled: !!slug,
    retry: false,
    staleTime: Infinity,
  })
}