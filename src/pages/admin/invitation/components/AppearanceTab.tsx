import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useInvitationDraftStore } from "../store/useInvitationDraftStore"
import { useUpdateInvitationMutation } from "../queries"
import type { AppearanceConfig } from "../types"

const empty: AppearanceConfig = {
  greeting: "",
  quote: "",
  quote_source: "",
  section_title: "",
  invitation_body: "",
  attire: "",
  blessings_name: "",
  blessings_label: "",
}

const AppearanceTab = () => {
  const { eventId } = useAdminStore()
  const invitation = useInvitationDraftStore((s) => s.serverInvitation)
  const draft = useInvitationDraftStore((s) => s.appearanceDraft)
  const setAppearance = useInvitationDraftStore((s) => s.setAppearance)
  const clearAppearance = useInvitationDraftStore((s) => s.clearAppearance)
  const { mutate, isPending } = useUpdateInvitationMutation()

  useEffect(() => {
    if (!invitation || draft) return
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
  }, [invitation, draft, setAppearance])

  const current = draft ?? empty
  const update = (patch: Partial<AppearanceConfig>) =>
    setAppearance({ ...current, ...patch })

  const handleSave = () => {
    if (!eventId || !invitation || !draft) return
    mutate(
      {
        event_id: eventId,
        config: {
          ...invitation.config,
          appearance: {
            greeting: draft.greeting || null,
            quote: draft.quote || null,
            quote_source: draft.quote_source || null,
            section_title: draft.section_title || null,
            invitation_body: draft.invitation_body || null,
            attire: draft.attire || null,
            blessings_name: draft.blessings_name || null,
            blessings_label: draft.blessings_label || null,
          },
        },
      },
      { onSuccess: () => clearAppearance() },
    )
  }

  return (
    <Card>
      <CardContent className="px-5 py-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="greeting">Opening Greeting</Label>
          <Input
            id="greeting"
            placeholder="e.g. السلام عليكم ورحمة الله وبركاته"
            value={current.greeting ?? ""}
            onChange={(e) => update({ greeting: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Displayed at the top of the invitation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quote">Quote / Verse</Label>
            <Textarea
              id="quote"
              placeholder="e.g. And We created you in pairs."
              value={current.quote ?? ""}
              onChange={(e) => update({ quote: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-source">Quote Source</Label>
            <Input
              id="quote-source"
              placeholder="e.g. Surah An-Naba 78:8"
              value={current.quote_source ?? ""}
              onChange={(e) => update({ quote_source: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="section-title">Section Title</Label>
          <Input
            id="section-title"
            placeholder="e.g. A Journey of Love"
            value={current.section_title ?? ""}
            onChange={(e) => update({ section_title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invitation-body">Invitation Body</Label>
          <Textarea
            id="invitation-body"
            placeholder="In the name of Allah..."
            value={current.invitation_body ?? ""}
            onChange={(e) => update({ invitation_body: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attire">Dress Code / Attire</Label>
          <Input
            id="attire"
            placeholder="e.g. Traditional Malay — Shades of Green"
            value={current.attire ?? ""}
            onChange={(e) => update({ attire: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="blessings-name">Blessings — Name</Label>
            <Input
              id="blessings-name"
              placeholder="e.g. Hj Ahmad & Hjh Ramlah"
              value={current.blessings_name ?? ""}
              onChange={(e) => update({ blessings_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blessings-label">Blessings — Label</Label>
            <Input
              id="blessings-label"
              placeholder="e.g. Parents of the Groom"
              value={current.blessings_label ?? ""}
              onChange={(e) => update({ blessings_label: e.target.value })}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleSave} disabled={isPending}>
          Save Text
        </Button>
      </CardContent>
    </Card>
  )
}

export default AppearanceTab
