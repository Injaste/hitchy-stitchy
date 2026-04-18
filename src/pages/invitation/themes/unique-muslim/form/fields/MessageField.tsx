import { motion } from "framer-motion"
import { MessageSquare } from "lucide-react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group"
import { fieldFadeUp } from "../../animations"

type FieldApi = {
  name: string
  state: { value: string | undefined; meta: { isTouched: boolean; isValid: boolean; errors: ({ message?: string } | undefined)[] } }
  handleChange: (value: string) => void
  handleBlur: () => void
}

interface MessageFieldProps {
  field: FieldApi
  delay: number
  required: boolean
}

const MessageField = ({ field, delay, required }: MessageFieldProps) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <motion.div variants={fieldFadeUp} custom={delay}>
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name} className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">
          Message
          {required
            ? <span className="text-destructive ml-0.5">*</span>
            : <span className="ml-1 normal-case tracking-normal font-normal">(Optional)</span>
          }
        </FieldLabel>
        <InputGroup className="gap-1 rounded-2xl bg-muted/40 border-border px-1.5">
          <InputGroupAddon className="self-start mt-2.5">
            <MessageSquare size={15} className="text-primary/40" />
          </InputGroupAddon>
          <InputGroupTextarea
            id={field.name}
            name={field.name}
            rows={2}
            value={field.state.value ?? ""}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            aria-invalid={isInvalid}
            placeholder="Leave us a message"
            className="text-sm focus-visible:ring-primary focus-visible:border-primary rounded-r-2xl"
          />
        </InputGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} className="text-2xs font-bold uppercase tracking-wide" />}
      </Field>
    </motion.div>
  )
}

export default MessageField
