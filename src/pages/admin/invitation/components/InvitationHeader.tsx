import { ExternalLink } from "lucide-react"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"

const InvitationHeader = () => {
  const { slug } = useAdminStore()
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-display font-semibold">Invitation</h2>
        <p className="text-sm text-muted-foreground">
          Edit your invitation content and theme. Changes preview live on the right.
        </p>
      </div>
      {slug && (
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          Open live page
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}

export default InvitationHeader
