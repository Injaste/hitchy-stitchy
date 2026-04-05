import AuthGate from '@/auth/AuthGate'
import AdminView from './AdminView'

const Admin = () => {
  return (
    <AuthGate>
      <AdminView />
    </AuthGate>
  )
}

export default Admin
