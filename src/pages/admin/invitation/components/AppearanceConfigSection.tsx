import { useState, useEffect, type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useUpdateInvitationMutation } from "../queries"
import type { EventInvitation } from "../types"

interface Props {
  invitation: EventInvitation
}

const AppearanceConfigSection: FC<Props> = ({ invitation }) => {
  const { eventId } = useAdminStore()
  const { mutate, isPending } = useUpdateInvitationMutation()

  const a = invitation.config.appearance ?? {}

  const [greeting, setGreeting] = useState(a.greeting ?? "")
  const [quote, setQuote] = useState(a.quote ?? "")
  const [quote_source, setQuoteSource] = useState(a.quote_source ?? "")
  const [section_title, setSectionTitle] = useState(a.section_title ?? "")
  const [invitation_body, setInvitationBody] = useState(a.invitation_body ?? "")
  const [attire, setAttire] = useState(a.attire ?? "")
  const [blessings_name, setBlessingsName] = useState(a.blessings_name ?? "")
  const [blessings_label, setBlessingsLabel] = useState(a.blessings_label ?? "")

  useEffect(() => {
    const ap = invitation.config.appearance ?? {}
    setGreeting(ap.greeting ?? "")
    setQuote(ap.quote ?? "")
    setQuoteSource(ap.quote_source ?? "")
    setSectionTitle(ap.section_title ?? "")
    setInvitationBody(ap.invitation_body ?? "")
    setAttire(ap.attire ?? "")
    setBlessingsName(ap.blessings_name ?? "")
    setBlessingsLabel(ap.blessings_label ?? "")
  }, [invitation])

  const handleSave = () => {
    if (!eventId) return
    mutate({
      event_id: eventId,
      config: {
        ...invitation.config,
        appearance: {
          greeting: greeting || null,
          quote: quote || null,
          quote_source: quote_source || null,
          section_title: section_title || null,
          invitation_body: invitation_body || null,
          attire: attire || null,
          blessings_name: blessings_name || null,
          blessings_label: blessings_label || null,
        },
      },
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Invitation Text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="greeting">Opening Greeting</Label>
          <Input
            id="greeting"
            placeholder="e.g. السلام عليكم ورحمة الله وبركاته"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Displayed at the top of the invitation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quote">Quote / Verse</Label>
            <Textarea
              id="quote"
              placeholder="e.g. And We created you in pairs."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-source">Quote Source</Label>
            <Input
              id="quote-source"
              placeholder="e.g. Surah An-Naba 78:8"
              value={quote_source}
              onChange={(e) => setQuoteSource(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="section-title">Section Title</Label>
          <Input
            id="section-title"
            placeholder="e.g. A Journey of Love"
            value={section_title}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invitation-body">Invitation Body</Label>
          <Textarea
            id="invitation-body"
            placeholder="In the name of Allah..."
            value={invitation_body}
            onChange={(e) => setInvitationBody(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attire">Dress Code / Attire</Label>
          <Input
            id="attire"
            placeholder="e.g. Traditional Malay — Shades of Green"
            value={attire}
            onChange={(e) => setAttire(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="blessings-name">Blessings — Name</Label>
            <Input
              id="blessings-name"
              placeholder="e.g. Hj Ahmad & Hjh Ramlah"
              value={blessings_name}
              onChange={(e) => setBlessingsName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blessings-label">Blessings — Label</Label>
            <Input
              id="blessings-label"
              placeholder="e.g. Parents of the Groom"
              value={blessings_label}
              onChange={(e) => setBlessingsLabel(e.target.value)}
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

export default AppearanceConfigSection
