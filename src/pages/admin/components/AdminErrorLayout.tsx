import Logo from '@/components/custom/logo'

interface AdminErrorLayoutProps {
  errorMessage: string
  isOffline?: boolean
}

const AdminErrorLayout = ({ errorMessage, isOffline }: AdminErrorLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <Logo imageClassName="w-16 h-16" className="mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">
          {isOffline ? "You're offline" : "Unable to load event"}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {isOffline
            ? "Please check your connection. We'll reload automatically once you're back online."
            : errorMessage}
        </p>
        {!isOffline && (
          <p className="text-xs text-muted-foreground">
            Please contact support if this issue persists.
          </p>
        )}
      </div>
    </div>
  )
}

export default AdminErrorLayout
