import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { useInvitationDraftStore } from "../store/useInvitationDraftStore"
import { useUpdateInvitationMutation } from "../queries"
import type { RSVPMode, RSVPSectionConfig } from "../types"

type DraftShape = {
  rsvp_mode: RSVPMode
  rsvp_deadline: string
  config: RSVPSectionConfig
}

const RSVPTab = () => {
  const { eventId } = useAdminStore()
  const invitation = useInvitationDraftStore((s) => s.serverInvitation)
  const draft = useInvitationDraftStore((s) => s.rsvpDraft)
  const setRSVP = useInvitationDraftStore((s) => s.setRSVP)
  const clearRSVP = useInvitationDraftStore((s) => s.clearRSVP)
  const { mutate, isPending } = useUpdateInvitationMutation()

  useEffect(() => {
    if (!invitation || draft) return
    setRSVP({
      rsvp_mode: invitation.rsvp_mode,
      rsvp_deadline: invitation.rsvp_deadline ?? "",
      config: invitation.config.rsvp,
    })
  }, [invitation, draft, setRSVP])

  if (!draft) return null

  const update = (next: DraftShape) => setRSVP(next)
  const { rsvp_mode, rsvp_deadline, config } = draft
  const f = config.fields

  const setMode = (v: RSVPMode) => update({ ...draft, rsvp_mode: v })
  const setDeadline = (v: string) => update({ ...draft, rsvp_deadline: v })
  const setField = (key: keyof typeof f, patch: Partial<typeof f[typeof key]>) =>
    update({ ...draft, config: { ...config, fields: { ...f, [key]: { ...f[key], ...patch } } } })
  const setConfirmationMessage = (v: string) =>
    update({ ...draft, config: { ...config, confirmation_message: v } })

  const handleSave = () => {
    if (!eventId || !invitation) return
    mutate(
      {
        event_id: eventId,
        rsvp_mode,
        rsvp_deadline: rsvp_deadline || null,
        config: { ...invitation.config, rsvp: config },
      },
      { onSuccess: () => clearRSVP() },
    )
  }

  return (
    <Card>
      <CardContent className="px-5 py-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>RSVP Mode</Label>
            <Select value={rsvp_mode} onValueChange={(v) => setMode(v as RSVPMode)}>
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
              onChange={(e) => setDeadline(e.target.value)}
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
            visible={f.phone.visible}
            required={f.phone.required}
            onVisibleChange={(v) => setField("phone", { visible: v })}
            onRequiredChange={(v) => setField("phone", { required: v })}
          />

          <FieldToggleRow
            label="Guest count"
            visible={f.guestCount.visible}
            required={f.guestCount.required}
            onVisibleChange={(v) => setField("guestCount", { visible: v })}
            onRequiredChange={(v) => setField("guestCount", { required: v })}
          >
            {f.guestCount.visible && (
              <div className="flex items-center gap-3 mt-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    min={1}
                    value={f.guestCount.min}
                    onChange={(e) => setField("guestCount", { min: Number(e.target.value) || 1 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    min={1}
                    value={f.guestCount.max}
                    onChange={(e) => setField("guestCount", { max: Number(e.target.value) || 10 })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </FieldToggleRow>

          <FieldToggleRow
            label="Message"
            visible={f.message.visible}
            required={f.message.required}
            onVisibleChange={(v) => setField("message", { visible: v })}
            onRequiredChange={(v) => setField("message", { required: v })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmation-msg">Confirmation Message</Label>
          <Input
            id="confirmation-msg"
            value={config.confirmation_message}
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

export default RSVPTab
