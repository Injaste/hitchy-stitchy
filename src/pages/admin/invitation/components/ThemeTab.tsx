import { useEffect, useMemo } from "react"
import { Plus, MoreHorizontal, Globe, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useInvitationDraftStore } from "../store/useInvitationDraftStore"
import { usePagesModalStore } from "../store/usePagesModalStore"
import { useUpdatePageConfigMutation } from "../queries"

const ThemeTab = () => {
  const pages = useInvitationDraftStore((s) => s.serverPages)
  const selectedPageId = useInvitationDraftStore((s) => s.selectedPageId)
  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  )
  const pageDraft = useInvitationDraftStore((s) => s.pageDraft)
  const setPage = useInvitationDraftStore((s) => s.setPage)
  const clearPage = useInvitationDraftStore((s) => s.clearPage)

  const { openThemePicker, openRename, openDelete, openPublish } = usePagesModalStore()
  const updateConfig = useUpdatePageConfigMutation()

  useEffect(() => {
    if (!selectedPage || pageDraft) return
    setPage(selectedPage.config)
  }, [selectedPage?.id, pageDraft, setPage, selectedPage])

  if (!pages.length) {
    return (
      <Card>
        <CardContent className="px-5 py-10 text-center space-y-3">
          <p className="text-sm font-medium">No invitation pages yet</p>
          <p className="text-xs text-muted-foreground">
            Pick a theme to create your first page.
          </p>
          <Button size="sm" variant="outline" className="gap-2" onClick={openThemePicker}>
            <Plus className="h-4 w-4" />
            Create Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!selectedPage) return null

  const current = pageDraft ?? selectedPage.config
  const update = (patch: Record<string, unknown>) =>
    setPage({ ...current, ...patch })

  const handleSave = () => {
    updateConfig.mutate(
      { id: selectedPage.id, config: current },
      { onSuccess: () => clearPage() },
    )
  }

  return (
    <Card>
      <CardContent className="px-5 py-4 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm truncate">{selectedPage.name}</p>
              {selectedPage.is_published && (
                <Badge variant="default" className="text-xs gap-1">
                  <Globe className="h-2.5 w-2.5" />
                  Published
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPage.theme?.name ?? "No theme"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="outline" className="gap-2" onClick={openThemePicker}>
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!selectedPage.is_published && (
                  <DropdownMenuItem onClick={() => openPublish(selectedPage)}>
                    <Globe className="h-4 w-4 mr-2" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openRename(selectedPage)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openDelete(selectedPage)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bg-image">Background Image</Label>
          <Input
            id="bg-image"
            placeholder="/image.png or https://..."
            value={(current.background_image as string) ?? ""}
            onChange={(e) => update({ background_image: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Path or URL for the background displayed behind the invitation.
          </p>
        </div>

        <Button size="sm" onClick={handleSave} disabled={updateConfig.isPending}>
          Save Theme Config
        </Button>
      </CardContent>
    </Card>
  )
}

export default ThemeTab
