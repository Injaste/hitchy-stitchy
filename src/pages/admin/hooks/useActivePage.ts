import { useLocation } from 'react-router-dom'

const useActivePage = () => {
  const { pathname } = useLocation()
  const segments = pathname.split('/')
  return segments[3] ?? 'timeline'
}

export default useActivePage
