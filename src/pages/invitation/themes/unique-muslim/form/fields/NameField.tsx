import { motion } from "framer-motion"
import { User } from "lucide-react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { fieldFadeUp } from "../../animations"

type FieldApi = {
  name: string
  state: { value: string; meta: { isTouched: boolean; isValid: boolean; errors: ({ message?: string } | undefined)[] } }
  handleChange: (value: string) => void
  handleBlur: () => void
}

interface NameFieldProps {
  field: FieldApi
  delay: number
}

const NameField = ({ field, delay }: NameFieldProps) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <motion.div variants={fieldFadeUp} custom={delay}>
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name} className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">
          Full Name <span className="text-destructive ml-0.5">*</span>
        </FieldLabel>
        <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
          <InputGroupInput
            id={field.name}
            name={field.name}
            type="text"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            aria-invalid={isInvalid}
            placeholder="e.g. Ahmad Bin Ali"
            autoComplete="off"
            className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0"
          />
          <InputGroupAddon className="mt-0.5">
            <User size={15} className="text-primary/40" />
          </InputGroupAddon>
        </InputGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} className="text-2xs font-bold uppercase tracking-wide" />}
      </Field>
    </motion.div>
  )
}

export default NameField
