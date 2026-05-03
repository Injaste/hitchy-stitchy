import { useEffect } from "react"
import { AnimateItem } from "@/components/animations/forms/field-animate"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useInvitationDraftStore } from "../../store/useInvitationDraftStore"
import type { RSVPDraft } from "../../types"
import type { RSVPMode } from "@/pages/templates/types"

const RSVPSection = () => {
  const invitation = useInvitationDraftStore((s) => s.serverInvitation)
  const draft = useInvitationDraftStore((s) => s.rsvpDraft)
  const setRSVP = useInvitationDraftStore((s) => s.setRSVP)

  useEffect(() => {
    if (!invitation || draft) return
    setRSVP({
      rsvp_mode: invitation.rsvp_mode,
      rsvp_deadline: invitation.rsvp_deadline ?? "",
      config: invitation.config.rsvp,
    })
  }, [invitation, draft, setRSVP])

  if (!draft) return null

  const { rsvp_mode, rsvp_deadline, config } = draft
  const msg = config.fields.message

  const upd = (patch: Partial<RSVPDraft>) => setRSVP({ ...draft, ...patch })
  const setMsgField = (patch: Partial<typeof msg>) =>
    upd({ config: { ...config, fields: { message: { ...msg, ...patch } } } })

  return (
    <div className="p-4">
      <FieldGroup className="block space-y-4">
        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>RSVP Mode</FieldLabel>
            <FieldContent>
              <Select
                value={rsvp_mode}
                onValueChange={(v) => upd({ rsvp_mode: v as RSVPMode })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="public">Public — anyone can RSVP</SelectItem>
                  <SelectItem value="private">Private — pool only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </AnimateItem>

        <AnimateItem hasError={false} attemptCount={0}>
          <Field>
            <FieldLabel>
              RSVP Deadline{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </FieldLabel>
            <FieldContent>
              <Input
                type="date"
                value={rsvp_deadline}
                onChange={(e) => upd({ rsvp_deadline: e.target.value })}
              />
            </FieldContent>
          </Field>
        </AnimateItem>

        <Field orientation="horizontal">
          <FieldLabel>Show message field</FieldLabel>
          <Switch
            checked={msg.visible}
            onCheckedChange={(v) => setMsgField({ visible: v })}
          />
        </Field>

        {msg.visible && (
          <Field orientation="horizontal">
            <FieldLabel>Message required</FieldLabel>
            <Switch
              checked={msg.required}
              onCheckedChange={(v) => setMsgField({ required: v })}
            />
          </Field>
        )}
      </FieldGroup>
    </div>
  )
}

export default RSVPSection
