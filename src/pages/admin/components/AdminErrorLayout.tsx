import { CalendarHeart } from 'lucide-react'

interface AdminErrorLayoutProps {
  errorMessage: string
}

const AdminErrorLayout = ({ errorMessage }: AdminErrorLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
          <CalendarHeart className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Unable to load event
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
        <p className="text-xs text-muted-foreground">
          Please contact support if this issue persists.
        </p>
      </div>
    </div>
  )
}

export default AdminErrorLayout
