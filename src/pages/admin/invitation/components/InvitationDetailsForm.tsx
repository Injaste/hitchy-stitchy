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

const InvitationDetailsForm: FC<Props> = ({ invitation }) => {
  const { eventId } = useAdminStore()
  const { mutate, isPending } = useUpdateInvitationMutation()

  const [couple_names, setCoupleNames] = useState(invitation.couple_names ?? "")
  const [event_date, setEventDate] = useState(invitation.event_date ?? "")
  const [event_time_start, setEventTimeStart] = useState(invitation.event_time_start ?? "")
  const [event_time_end, setEventTimeEnd] = useState(invitation.event_time_end ?? "")
  const [venue_name, setVenueName] = useState(invitation.venue_name ?? "")
  const [venue_address, setVenueAddress] = useState(invitation.venue_address ?? "")
  const [venue_map_link, setVenueMapLink] = useState(invitation.venue_map_link ?? "")
  const [venue_map_embed_url, setVenueMapEmbedUrl] = useState(invitation.venue_map_embed_url ?? "")

  useEffect(() => {
    setCoupleNames(invitation.couple_names ?? "")
    setEventDate(invitation.event_date ?? "")
    setEventTimeStart(invitation.event_time_start ?? "")
    setEventTimeEnd(invitation.event_time_end ?? "")
    setVenueName(invitation.venue_name ?? "")
    setVenueAddress(invitation.venue_address ?? "")
    setVenueMapLink(invitation.venue_map_link ?? "")
    setVenueMapEmbedUrl(invitation.venue_map_embed_url ?? "")
  }, [invitation])

  const handleSave = () => {
    if (!eventId) return
    mutate({
      event_id: eventId,
      couple_names: couple_names || null,
      event_date: event_date || null,
      event_time_start: event_time_start || null,
      event_time_end: event_time_end || null,
      venue_name: venue_name || null,
      venue_address: venue_address || null,
      venue_map_link: venue_map_link || null,
      venue_map_embed_url: venue_map_embed_url || null,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Invitation Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="couple-names">Couple Names</Label>
          <Input
            id="couple-names"
            placeholder="e.g. Danish & Nadia"
            value={couple_names}
            onChange={(e) => setCoupleNames(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={event_date}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-start">Start Time</Label>
            <Input
              id="time-start"
              placeholder="e.g. 11:00 AM"
              value={event_time_start}
              onChange={(e) => setEventTimeStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-end">End Time</Label>
            <Input
              id="time-end"
              placeholder="e.g. 5:00 PM"
              value={event_time_end}
              onChange={(e) => setEventTimeEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue-name">Venue Name</Label>
          <Input
            id="venue-name"
            placeholder="e.g. Dewan Merak Kayangan"
            value={venue_name}
            onChange={(e) => setVenueName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue-address">Venue Address</Label>
          <Textarea
            id="venue-address"
            placeholder="Full address"
            value={venue_address}
            onChange={(e) => setVenueAddress(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="map-link">Map Link</Label>
          <Input
            id="map-link"
            placeholder="https://maps.google.com/..."
            value={venue_map_link}
            onChange={(e) => setVenueMapLink(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="map-embed">Map Embed URL</Label>
          <Input
            id="map-embed"
            placeholder="https://maps.google.com/maps?..."
            value={venue_map_embed_url}
            onChange={(e) => setVenueMapEmbedUrl(e.target.value)}
          />
        </div>

        <Button size="sm" onClick={handleSave} disabled={isPending}>
          Save Details
        </Button>
      </CardContent>
    </Card>
  )
}

export default InvitationDetailsForm
