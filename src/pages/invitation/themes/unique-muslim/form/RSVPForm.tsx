import { useForm } from "@tanstack/react-form"
import { motion } from "framer-motion"
import { FieldGroup } from "@/components/ui/field"
import { buildRsvpSchema, type RSVPFormData, type RSVPConfig } from "@/pages/invitation/types"
import { fieldFadeUp } from "../animations"
import NameField from "./fields/NameField"
import PhoneField from "./fields/PhoneField"
import GuestCountField from "./fields/GuestCountField"
import MessageField from "./fields/MessageField"

interface RSVPFormProps {
  defaultValues?: Partial<RSVPFormData>
  onSubmit: (value: RSVPFormData) => Promise<void>
  onCancel?: () => void
  isEditing: boolean
  rsvpConfig: RSVPConfig
}

const RSVPForm = ({ defaultValues: propsDefaults, onSubmit, onCancel, isEditing, rsvpConfig }: RSVPFormProps) => {
  const schema = buildRsvpSchema(rsvpConfig)

  const builtDefaults: RSVPFormData = {
    name: "",
    ...(rsvpConfig.fields.phone.visible && { phone: "" }),
    ...(rsvpConfig.fields.guestCount.visible && { guestCount: rsvpConfig.fields.guestCount.min }),
    ...(rsvpConfig.fields.message.visible && { message: "" }),
  }

  const form = useForm({
    defaultValues: { ...builtDefaults, ...propsDefaults },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => { await onSubmit(value as RSVPFormData) },
  })

  const visibleFields = [
    "name",
    ...(rsvpConfig.fields.phone.visible ? ["phone"] : []),
    ...(rsvpConfig.fields.guestCount.visible ? ["guestCount"] : []),
    ...(rsvpConfig.fields.message.visible ? ["message"] : []),
  ]
  const delay = (key: string) => visibleFields.indexOf(key) * 0.1

  return (
    <motion.form
      initial="hidden"
      animate="show"
      onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}
    >
      <FieldGroup>
        <form.Field name="name">
          {(f) => <NameField field={f as never} delay={delay("name")} />}
        </form.Field>

        {rsvpConfig.fields.phone.visible && (
          <form.Field name="phone">
            {(f) => <PhoneField field={f as never} delay={delay("phone")} required={rsvpConfig.fields.phone.required} />}
          </form.Field>
        )}

        {rsvpConfig.fields.guestCount.visible && (
          <form.Field name="guestCount">
            {(f) => (
              <GuestCountField
                field={f as never}
                delay={delay("guestCount")}
                required={rsvpConfig.fields.guestCount.required}
                min={rsvpConfig.fields.guestCount.min}
                max={rsvpConfig.fields.guestCount.max}
              />
            )}
          </form.Field>
        )}

        {rsvpConfig.fields.message.visible && (
          <form.Field name="message">
            {(f) => <MessageField field={f as never} delay={delay("message")} required={rsvpConfig.fields.message.required} />}
          </form.Field>
        )}
      </FieldGroup>

      <motion.div variants={fieldFadeUp} custom={visibleFields.length * 0.1} className="flex flex-col gap-2.5 pt-2">
        <form.Subscribe selector={(s) => [s.isSubmitting, s.canSubmit]}>
          {([isSubmitting, canSubmit]) => (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg hover:bg-primary/90 disabled:opacity-60 transition-all mt-8"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Sending Love..." : isEditing ? "Update RSVP" : "Confirm Attendance"}
            </motion.button>
          )}
        </form.Subscribe>

        {isEditing && onCancel && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="h-12 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest hover:bg-primary/10"
          >
            Cancel
          </motion.button>
        )}
      </motion.div>
    </motion.form>
  )
}

export default RSVPForm
