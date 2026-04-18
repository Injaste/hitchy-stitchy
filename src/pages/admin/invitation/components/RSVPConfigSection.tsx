import { useState, useEffect, type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useUpdateInvitationMutation } from "../queries"
import type { EventInvitation, RSVPMode } from "../types"

interface Props {
  invitation: EventInvitation
}

const RSVPConfigSection: FC<Props> = ({ invitation }) => {
  const { eventId } = useAdminStore()
  const { mutate, isPending } = useUpdateInvitationMutation()

  const fields = invitation.config.rsvp.fields
  const [rsvp_mode, setRsvpMode] = useState<RSVPMode>(invitation.rsvp_mode)
  const [rsvp_deadline, setRsvpDeadline] = useState(invitation.rsvp_deadline ?? "")
  const [showPhone, setShowPhone] = useState(fields.phone.visible)
  const [requirePhone, setRequirePhone] = useState(fields.phone.required)
  const [showGuestCount, setShowGuestCount] = useState(fields.guestCount.visible)
  const [requireGuestCount, setRequireGuestCount] = useState(fields.guestCount.required)
  const [guestMin, setGuestMin] = useState(String(fields.guestCount.min))
  const [guestMax, setGuestMax] = useState(String(fields.guestCount.max))
  const [showMessage, setShowMessage] = useState(fields.message.visible)
  const [requireMessage, setRequireMessage] = useState(fields.message.required)
  const [confirmationMessage, setConfirmationMessage] = useState(
    invitation.config.rsvp.confirmation_message,
  )

  useEffect(() => {
    const f = invitation.config.rsvp.fields
    setRsvpMode(invitation.rsvp_mode)
    setRsvpDeadline(invitation.rsvp_deadline ?? "")
    setShowPhone(f.phone.visible)
    setRequirePhone(f.phone.required)
    setShowGuestCount(f.guestCount.visible)
    setRequireGuestCount(f.guestCount.required)
    setGuestMin(String(f.guestCount.min))
    setGuestMax(String(f.guestCount.max))
    setShowMessage(f.message.visible)
    setRequireMessage(f.message.required)
    setConfirmationMessage(invitation.config.rsvp.confirmation_message)
  }, [invitation])

  const handleSave = () => {
    if (!eventId) return
    mutate({
      event_id: eventId,
      rsvp_mode,
      rsvp_deadline: rsvp_deadline || null,
      config: {
        ...invitation.config,
        rsvp: {
          fields: {
            name: { visible: true, required: true },
            phone: { visible: showPhone, required: requirePhone },
            guestCount: {
              visible: showGuestCount,
              required: requireGuestCount,
              min: Number(guestMin) || 1,
              max: Number(guestMax) || 10,
            },
            message: { visible: showMessage, required: requireMessage },
          },
          confirmation_message: confirmationMessage,
        },
      },
    })
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">RSVP Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>RSVP Mode</Label>
            <Select value={rsvp_mode} onValueChange={(v) => setRsvpMode(v as RSVPMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public — anyone can RSVP</SelectItem>
                <SelectItem value="private">Private — pool only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rsvp-deadline">Deadline</Label>
            <Input
              id="rsvp-deadline"
              type="date"
              value={rsvp_deadline}
              onChange={(e) => setRsvpDeadline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty for no deadline</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Form Fields</p>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm">Name</p>
              <p className="text-xs text-muted-foreground">Always visible and required</p>
            </div>
            <Switch checked disabled />
          </div>

          <FieldToggleRow
            label="Phone number"
            visible={showPhone}
            required={requirePhone}
            onVisibleChange={setShowPhone}
            onRequiredChange={setRequirePhone}
          />

          <FieldToggleRow
            label="Guest count"
            visible={showGuestCount}
            required={requireGuestCount}
            onVisibleChange={setShowGuestCount}
            onRequiredChange={setRequireGuestCount}
          >
            {showGuestCount && (
              <div className="flex items-center gap-3 mt-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    min={1}
                    value={guestMin}
                    onChange={(e) => setGuestMin(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    min={1}
                    value={guestMax}
                    onChange={(e) => setGuestMax(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </FieldToggleRow>

          <FieldToggleRow
            label="Message"
            visible={showMessage}
            required={requireMessage}
            onVisibleChange={setShowMessage}
            onRequiredChange={setRequireMessage}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmation-msg">Confirmation Message</Label>
          <Input
            id="confirmation-msg"
            value={confirmationMessage}
            onChange={(e) => setConfirmationMessage(e.target.value)}
            placeholder="We look forward to celebrating with you!"
          />
        </div>

        <Button size="sm" onClick={handleSave} disabled={isPending}>
          Save RSVP Config
        </Button>
      </CardContent>
    </Card>
  )
}

interface FieldToggleRowProps {
  label: string
  visible: boolean
  required: boolean
  onVisibleChange: (v: boolean) => void
  onRequiredChange: (v: boolean) => void
  children?: React.ReactNode
}

const FieldToggleRow = ({
  label,
  visible,
  required,
  onVisibleChange,
  onRequiredChange,
  children,
}: FieldToggleRowProps) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between py-1">
      <p className="text-sm">{label}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Show</span>
          <Switch checked={visible} onCheckedChange={onVisibleChange} />
        </div>
        {visible && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Required</span>
            <Switch checked={required} onCheckedChange={onRequiredChange} />
          </div>
        )}
      </div>
    </div>
    {children}
  </div>
)

export default RSVPConfigSection
