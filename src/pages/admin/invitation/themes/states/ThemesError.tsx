import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemesErrorProps {
  onRetry: () => void
  isRetrying: boolean
}

const ThemesError = ({ onRetry, isRetrying }: ThemesErrorProps) => (
  <div className="px-4 py-8 flex flex-col items-center gap-3 text-center">
    <AlertCircle className="h-5 w-5 text-destructive" />
    <p className="text-xs text-muted-foreground">Failed to load templates.</p>
    <Button size="sm" variant="outline" onClick={onRetry} disabled={isRetrying}>
      {isRetrying ? "Retrying..." : "Try again"}
    </Button>
  </div>
)

export default ThemesError
