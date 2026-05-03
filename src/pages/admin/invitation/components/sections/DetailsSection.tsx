import { useEffect } from "react"
import { AnimateItem } from "@/components/animations/forms/field-animate"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useInvitationDraftStore } from "../../store/useInvitationDraftStore"
import type { DetailsDraft } from "../../types"

const emptyDraft: DetailsDraft = {
  groom_name: null, bride_name: null,
  event_date: null, event_time_start: null, event_time_end: null,
  venue_name: null, venue_address: null,
  venue_map_link: null, venue_map_embed_url: null,
  max_guests: null, guest_count_min: 1, guest_count_max: 10,
  confirmation_message: "",
}

const DetailsSection = () => {
  const invitation = useInvitationDraftStore((s) => s.serverInvitation)
  const draft = useInvitationDraftStore((s) => s.detailsDraft)
  const setDetails = useInvitationDraftStore((s) => s.setDetails)

  useEffect(() => {
    if (!invitation || draft) return
    setDetails({
      groom_name: invitation.groom_name, bride_name: invitation.bride_name,
      event_date: invitation.event_date, event_time_start: invitation.event_time_start,
      event_time_end: invitation.event_time_end, venue_name: invitation.venue_name,
      venue_address: invitation.venue_address, venue_map_link: invitation.venue_map_link,
      venue_map_embed_url: invitation.venue_map_embed_url,
      max_guests: invitation.max_guests,
      guest_count_min: invitation.guest_count_min,
      guest_count_max: invitation.guest_count_max,
      confirmation_message: invitation.confirmation_message,
    })
  }, [invitation, draft, setDetails])

  const cur = draft ?? emptyDraft
  const upd = (patch: Partial<DetailsDraft>) => setDetails({ ...cur, ...patch })

  return (
    <div className="p-4">
      <FieldGroup className="block space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Groom / Person 1</FieldLabel>
            <FieldContent>
              <Input placeholder="e.g. Danny" value={cur.groom_name ?? ""} onChange={(e) => upd({ groom_name: e.target.value || null })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Bride / Person 2</FieldLabel>
            <FieldContent>
              <Input placeholder="e.g. Naddy" value={cur.bride_name ?? ""} onChange={(e) => upd({ bride_name: e.target.value || null })} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel>Date</FieldLabel>
            <FieldContent>
              <Input type="date" value={cur.event_date ?? ""} onChange={(e) => upd({ event_date: e.target.value || null })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Start Time</FieldLabel>
            <FieldContent>
              <Input placeholder="11:00 AM" value={cur.event_time_start ?? ""} onChange={(e) => upd({ event_time_start: e.target.value || null })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>End Time</FieldLabel>
            <FieldContent>
              <Input placeholder="5:00 PM" value={cur.event_time_end ?? ""} onChange={(e) => upd({ event_time_end: e.target.value || null })} />
            </FieldContent>
          </Field>
        </div>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Venue Name</FieldLabel>
            <FieldContent>
              <Input placeholder="e.g. Dewan Merak Kayangan" value={cur.venue_name ?? ""} onChange={(e) => upd({ venue_name: e.target.value || null })} />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Venue Address</FieldLabel>
            <FieldContent>
              <Textarea rows={2} placeholder="Full address" value={cur.venue_address ?? ""} onChange={(e) => upd({ venue_address: e.target.value || null })} />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Map Link</FieldLabel>
            <FieldContent>
              <Input placeholder="https://maps.google.com/..." value={cur.venue_map_link ?? ""} onChange={(e) => upd({ venue_map_link: e.target.value || null })} />
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Map Embed URL</FieldLabel>
            <FieldContent>
              <Input placeholder="https://maps.google.com/maps?..." value={cur.venue_map_embed_url ?? ""} onChange={(e) => upd({ venue_map_embed_url: e.target.value || null })} />
            </FieldContent>
          </Field>
        </AnimateItem>

        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel>Max Guests</FieldLabel>
            <FieldContent>
              <Input type="number" placeholder="No limit" value={cur.max_guests ?? ""} onChange={(e) => upd({ max_guests: e.target.value ? Number(e.target.value) : null })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Min per RSVP</FieldLabel>
            <FieldContent>
              <Input type="number" min={1} value={cur.guest_count_min} onChange={(e) => upd({ guest_count_min: Number(e.target.value) || 1 })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Max per RSVP</FieldLabel>
            <FieldContent>
              <Input type="number" min={1} value={cur.guest_count_max} onChange={(e) => upd({ guest_count_max: Number(e.target.value) || 10 })} />
            </FieldContent>
          </Field>
        </div>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>Confirmation Message</FieldLabel>
            <FieldContent>
              <Input placeholder="We look forward to celebrating with you!" value={cur.confirmation_message} onChange={(e) => upd({ confirmation_message: e.target.value })} />
            </FieldContent>
          </Field>
        </AnimateItem>
      </FieldGroup>
    </div>
  )
}

export default DetailsSection
