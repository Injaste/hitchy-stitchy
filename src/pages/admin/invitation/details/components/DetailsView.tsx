import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DetailsDraft } from "../../types";

interface DetailsViewProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const DetailsView: FC<DetailsViewProps> = ({ draft, onUpdate }) => (
  <div className="space-y-3 px-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Couple</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Groom / Person 1</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Danny"
                  value={draft.groom_name ?? ""}
                  onChange={(e) =>
                    onUpdate({ groom_name: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Bride / Person 2</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Naddy"
                  value={draft.bride_name ?? ""}
                  onChange={(e) =>
                    onUpdate({ bride_name: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Event</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field>
              <FieldLabel>Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={draft.event_date ?? ""}
                  onChange={(e) =>
                    onUpdate({ event_date: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Start Time</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="11:00 AM"
                  value={draft.event_time_start ?? ""}
                  onChange={(e) =>
                    onUpdate({ event_time_start: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>End Time</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="5:00 PM"
                  value={draft.event_time_end ?? ""}
                  onChange={(e) =>
                    onUpdate({ event_time_end: e.target.value || null })
                  }
                />
              </FieldContent>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Venue</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <Field>
            <FieldLabel>Venue Name</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Dewan Merak Kayangan"
                value={draft.venue_name ?? ""}
                onChange={(e) =>
                  onUpdate({ venue_name: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Venue Address</FieldLabel>
            <FieldContent>
              <Textarea
                rows={2}
                placeholder="Full address"
                value={draft.venue_address ?? ""}
                onChange={(e) =>
                  onUpdate({ venue_address: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Map Link</FieldLabel>
            <FieldContent>
              <Input
                placeholder="https://maps.google.com/..."
                value={draft.venue_map_link ?? ""}
                onChange={(e) =>
                  onUpdate({ venue_map_link: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Map Embed URL</FieldLabel>
            <FieldContent>
              <Input
                placeholder="https://maps.google.com/maps?..."
                value={draft.venue_map_embed_url ?? ""}
                onChange={(e) =>
                  onUpdate({ venue_map_embed_url: e.target.value || null })
                }
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Guest Limits</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="block space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field>
              <FieldLabel>Max Guests</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={draft.max_guests ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      max_guests: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Min per RSVP</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={1}
                  value={draft.guest_count_min}
                  onChange={(e) =>
                    onUpdate({ guest_count_min: Number(e.target.value) || 1 })
                  }
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Max per RSVP</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={1}
                  value={draft.guest_count_max}
                  onChange={(e) =>
                    onUpdate({ guest_count_max: Number(e.target.value) || 10 })
                  }
                />
              </FieldContent>
            </Field>
          </div>
          <Field>
            <FieldLabel>Confirmation Message</FieldLabel>
            <FieldContent>
              <Input
                placeholder="We look forward to celebrating with you!"
                value={draft.confirmation_message}
                onChange={(e) =>
                  onUpdate({ confirmation_message: e.target.value })
                }
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  </div>
);

export default DetailsView;
