import { useEffect, useMemo } from "react"
import { Plus, MoreHorizontal, Globe, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { themeRegistry } from "@/pages/templates/themes"
import type { ThemePageConfig } from "@/pages/templates/themes/types"
import { useInvitationDraftStore } from "../store/useInvitationDraftStore"
import { usePagesModalStore } from "../store/usePagesModalStore"
import {
  useUpdatePageConfigMutation,
  useUpdateInvitationMutation,
} from "../queries"
import type { AppearanceConfig } from "../types"

const emptyAppearance: AppearanceConfig = {
  greeting: "",
  quote: "",
  quote_source: "",
  section_title: "",
  invitation_body: "",
  attire: "",
  blessings_name: "",
  blessings_label: "",
}

const ThemeTab = () => {
  const { eventId } = useAdminStore()
  const invitation = useInvitationDraftStore((s) => s.serverInvitation)
  const pages = useInvitationDraftStore((s) => s.serverPages)
  const selectedPageId = useInvitationDraftStore((s) => s.selectedPageId)
  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  )
  const pageDraft = useInvitationDraftStore((s) => s.pageDraft)
  const setPage = useInvitationDraftStore((s) => s.setPage)
  const clearPage = useInvitationDraftStore((s) => s.clearPage)
  const appearanceDraft = useInvitationDraftStore((s) => s.appearanceDraft)
  const setAppearance = useInvitationDraftStore((s) => s.setAppearance)
  const clearAppearance = useInvitationDraftStore((s) => s.clearAppearance)

  const { openThemePicker, openRename, openDelete, openPublish } = usePagesModalStore()
  const updatePageConfig = useUpdatePageConfigMutation()
  const updateInvitation = useUpdateInvitationMutation()

  useEffect(() => {
    if (!selectedPage || pageDraft) return
    setPage(selectedPage.config)
  }, [selectedPage?.id, pageDraft, setPage, selectedPage])

  useEffect(() => {
    if (!invitation || appearanceDraft) return
    const a = invitation.config.appearance ?? {}
    setAppearance({
      greeting: a.greeting ?? "",
      quote: a.quote ?? "",
      quote_source: a.quote_source ?? "",
      section_title: a.section_title ?? "",
      invitation_body: a.invitation_body ?? "",
      attire: a.attire ?? "",
      blessings_name: a.blessings_name ?? "",
      blessings_label: a.blessings_label ?? "",
    })
  }, [invitation, appearanceDraft, setAppearance])

  const currentPage: ThemePageConfig = pageDraft ?? selectedPage?.config ?? {}
  const updatePage = (patch: Partial<ThemePageConfig>) =>
    setPage({ ...currentPage, ...patch })

  const handleSavePage = () => {
    if (!selectedPage) return
    updatePageConfig.mutate(
      { id: selectedPage.id, config: currentPage },
      { onSuccess: () => clearPage() },
    )
  }

  const currentAppearance = appearanceDraft ?? emptyAppearance
  const updateAppearance = (patch: Partial<AppearanceConfig>) =>
    setAppearance({ ...currentAppearance, ...patch })

  const handleSaveContent = () => {
    if (!eventId || !invitation || !appearanceDraft) return
    updateInvitation.mutate(
      {
        event_id: eventId,
        config: {
          ...invitation.config,
          appearance: {
            greeting: appearanceDraft.greeting || null,
            quote: appearanceDraft.quote || null,
            quote_source: appearanceDraft.quote_source || null,
            section_title: appearanceDraft.section_title || null,
            invitation_body: appearanceDraft.invitation_body || null,
            attire: appearanceDraft.attire || null,
            blessings_name: appearanceDraft.blessings_name || null,
            blessings_label: appearanceDraft.blessings_label || null,
          },
        },
      },
      { onSuccess: () => clearAppearance() },
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-5 py-4 space-y-5">
          {!pages.length ? (
            <div className="text-center space-y-3 py-6">
              <p className="text-sm font-medium">No invitation pages yet</p>
              <p className="text-xs text-muted-foreground">
                Pick a theme to create your first page.
              </p>
              <Button size="sm" variant="outline" className="gap-2" onClick={openThemePicker}>
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </div>
          ) : selectedPage ? (
            <>
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

              {(() => {
                const entry = currentPage._theme_slug ? themeRegistry[currentPage._theme_slug] : null
                return entry?.ConfigEditor
                  ? <entry.ConfigEditor config={currentPage} onChange={updatePage} />
                  : null
              })()}

              <Button size="sm" onClick={handleSavePage} disabled={updatePageConfig.isPending}>
                Save Theme
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-5 py-4 space-y-5">
          <div className="space-y-1">
            <p className="font-medium text-sm">Content</p>
            <p className="text-xs text-muted-foreground">
              Text displayed on the invitation across all pages.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting">Opening Greeting</Label>
            <Input
              id="greeting"
              placeholder="e.g. السلام عليكم ورحمة الله وبركاته"
              value={currentAppearance.greeting ?? ""}
              onChange={(e) => updateAppearance({ greeting: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Displayed at the top of the invitation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Quote / Verse</Label>
              <Textarea
                id="quote"
                placeholder="e.g. And We created you in pairs."
                value={currentAppearance.quote ?? ""}
                onChange={(e) => updateAppearance({ quote: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-source">Quote Source</Label>
              <Input
                id="quote-source"
                placeholder="e.g. Surah An-Naba 78:8"
                value={currentAppearance.quote_source ?? ""}
                onChange={(e) => updateAppearance({ quote_source: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              placeholder="e.g. A Journey of Love"
              value={currentAppearance.section_title ?? ""}
              onChange={(e) => updateAppearance({ section_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invitation-body">Invitation Body</Label>
            <Textarea
              id="invitation-body"
              placeholder="In the name of Allah..."
              value={currentAppearance.invitation_body ?? ""}
              onChange={(e) => updateAppearance({ invitation_body: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attire">Dress Code / Attire</Label>
            <Input
              id="attire"
              placeholder="e.g. Traditional Malay — Shades of Green"
              value={currentAppearance.attire ?? ""}
              onChange={(e) => updateAppearance({ attire: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blessings-name">Blessings — Name</Label>
              <Input
                id="blessings-name"
                placeholder="e.g. Hj Ahmad & Hjh Ramlah"
                value={currentAppearance.blessings_name ?? ""}
                onChange={(e) => updateAppearance({ blessings_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blessings-label">Blessings — Label</Label>
              <Input
                id="blessings-label"
                placeholder="e.g. Parents of the Groom"
                value={currentAppearance.blessings_label ?? ""}
                onChange={(e) => updateAppearance({ blessings_label: e.target.value })}
              />
            </div>
          </div>

          <Button size="sm" onClick={handleSaveContent} disabled={updateInvitation.isPending}>
            Save Content
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ThemeTab
