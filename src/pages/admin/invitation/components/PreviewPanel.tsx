import { useMemo } from "react"
import { ExternalLink, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { themeRegistry, FallbackTheme } from "@/pages/templates/themes"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import {
  useInvitationDraftStore,
  composeEventConfig,
} from "../store/useInvitationDraftStore"

const PHONE_W = 390
const PREVIEW_SCALE = 0.72
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE)
const PREVIEW_H = 620

const PreviewPanel = () => {
  const { slug } = useAdminStore()

  const serverInvitation = useInvitationDraftStore((s) => s.serverInvitation)
  const serverPages = useInvitationDraftStore((s) => s.serverPages)
  const selectedPageId = useInvitationDraftStore((s) => s.selectedPageId)
  const setSelectedPageId = useInvitationDraftStore((s) => s.setSelectedPageId)
  const detailsDraft = useInvitationDraftStore((s) => s.detailsDraft)
  const appearanceDraft = useInvitationDraftStore((s) => s.appearanceDraft)
  const rsvpDraft = useInvitationDraftStore((s) => s.rsvpDraft)
  const pageDraft = useInvitationDraftStore((s) => s.pageDraft)

  const selectedPage = useMemo(
    () => serverPages.find((p) => p.id === selectedPageId) ?? null,
    [serverPages, selectedPageId],
  )

  const composed = useMemo(
    () =>
      composeEventConfig({
        invitation: serverInvitation,
        page: selectedPage,
        details: detailsDraft,
        appearance: appearanceDraft,
        rsvp: rsvpDraft,
        pageDraft,
      }),
    [serverInvitation, selectedPage, detailsDraft, appearanceDraft, rsvpDraft, pageDraft],
  )

  const themeSlug = composed?.published_page?.theme_slug ?? null
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug] : null) ?? FallbackTheme

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Live Preview
        </p>
        {slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Open live
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {serverPages.length > 0 && (
        <Select
          value={selectedPageId ?? ""}
          onValueChange={(v) => setSelectedPageId(v)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent>
            {serverPages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                <span className="inline-flex items-center gap-2">
                  {page.name}
                  {page.is_published && (
                    <Badge variant="default" className="text-[10px] gap-1 h-4 px-1.5">
                      <Globe className="h-2.5 w-2.5" />
                      Published
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div
        className="relative overflow-hidden rounded-2xl border bg-background shadow-sm mx-auto"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        {!composed ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !selectedPage ? (
          <div className="flex items-center justify-center h-full px-6 text-center">
            <p className="text-xs text-muted-foreground">
              Create a page in the Theme tab to see a preview.
            </p>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: PHONE_W,
              height: PREVIEW_H / PREVIEW_SCALE,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <ThemeComponent
              eventConfig={composed}
              pageConfig={composed.published_page?.config ?? {}}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PreviewPanel
