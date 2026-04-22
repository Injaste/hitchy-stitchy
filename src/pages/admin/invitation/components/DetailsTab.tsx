import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationDraftStore } from "../store/useInvitationDraftStore";
import { useUpdateInvitationMutation } from "../queries";

const emptyDraft = {
  groom_name: "",
  bride_name: "",
  event_date: "",
  event_time_start: "",
  event_time_end: "",
  venue_name: "",
  venue_address: "",
  venue_map_link: "",
  venue_map_embed_url: "",
};

const DetailsTab = () => {
  const { eventId } = useAdminStore();
  const invitation = useInvitationDraftStore((s) => s.serverInvitation);
  const draft = useInvitationDraftStore((s) => s.detailsDraft);
  const setDetails = useInvitationDraftStore((s) => s.setDetails);
  const clearDetails = useInvitationDraftStore((s) => s.clearDetails);
  const { mutate, isPending } = useUpdateInvitationMutation();

  useEffect(() => {
    if (!invitation || draft) return;
    setDetails({
      groom_name: invitation.groom_name ?? "",
      bride_name: invitation.bride_name ?? "",
      event_date: invitation.event_date ?? "",
      event_time_start: invitation.event_time_start ?? "",
      event_time_end: invitation.event_time_end ?? "",
      venue_name: invitation.venue_name ?? "",
      venue_address: invitation.venue_address ?? "",
      venue_map_link: invitation.venue_map_link ?? "",
      venue_map_embed_url: invitation.venue_map_embed_url ?? "",
    });
  }, [invitation, draft, setDetails]);

  const current = draft ?? emptyDraft;
  const update = (patch: Partial<typeof emptyDraft>) =>
    setDetails({ ...current, ...patch });

  const handleSave = () => {
    if (!eventId || !draft) return;
    mutate(
      {
        event_id: eventId,
        groom_name: draft.groom_name || null,
        bride_name: draft.bride_name || null,
        event_date: draft.event_date || null,
        event_time_start: draft.event_time_start || null,
        event_time_end: draft.event_time_end || null,
        venue_name: draft.venue_name || null,
        venue_address: draft.venue_address || null,
        venue_map_link: draft.venue_map_link || null,
        venue_map_embed_url: draft.venue_map_embed_url || null,
      },
      { onSuccess: () => clearDetails() },
    );
  };

  return (
    <Card>
      <CardContent className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="couple-names">Couple Names</Label>
            <Input
              id="couple-names"
              placeholder="e.g. Danish & Nadia"
              value={current.groom_name}
              onChange={(e) => update({ groom_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="couple-names">Couple Names</Label>
            <Input
              id="couple-names"
              placeholder="e.g. Danish & Nadia"
              value={current.bride_name}
              onChange={(e) => update({ bride_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={current.event_date}
              onChange={(e) => update({ event_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-start">Start Time</Label>
            <Input
              id="time-start"
              placeholder="e.g. 11:00 AM"
              value={current.event_time_start}
              onChange={(e) => update({ event_time_start: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-end">End Time</Label>
            <Input
              id="time-end"
              placeholder="e.g. 5:00 PM"
              value={current.event_time_end}
              onChange={(e) => update({ event_time_end: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue-name">Venue Name</Label>
          <Input
            id="venue-name"
            placeholder="e.g. Dewan Merak Kayangan"
            value={current.venue_name}
            onChange={(e) => update({ venue_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue-address">Venue Address</Label>
          <Textarea
            id="venue-address"
            placeholder="Full address"
            value={current.venue_address}
            onChange={(e) => update({ venue_address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="map-link">Map Link</Label>
          <Input
            id="map-link"
            placeholder="https://maps.google.com/..."
            value={current.venue_map_link}
            onChange={(e) => update({ venue_map_link: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="map-embed">Map Embed URL</Label>
          <Input
            id="map-embed"
            placeholder="https://maps.google.com/maps?..."
            value={current.venue_map_embed_url}
            onChange={(e) => update({ venue_map_embed_url: e.target.value })}
          />
        </div>

        <Button size="sm" onClick={handleSave} disabled={isPending}>
          Save Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default DetailsTab;
