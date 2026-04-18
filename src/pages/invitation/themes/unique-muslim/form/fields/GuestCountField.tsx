import { motion } from "framer-motion"
import { Users } from "lucide-react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { fieldFadeUp } from "../../animations"

type FieldApi = {
  name: string
  state: { value: number | undefined; meta: { isTouched: boolean; isValid: boolean; errors: ({ message?: string } | undefined)[] } }
  handleChange: (value: number) => void
  handleBlur: () => void
}

interface GuestCountFieldProps {
  field: FieldApi
  delay: number
  required: boolean
  min: number
  max: number
}

const GuestCountField = ({ field, delay, required, min, max }: GuestCountFieldProps) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <motion.div variants={fieldFadeUp} custom={delay}>
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name} className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">
          Number of Guests
          {required
            ? <span className="text-destructive ml-0.5">*</span>
            : <span className="ml-1 normal-case tracking-normal font-normal">(Optional)</span>
          }
        </FieldLabel>
        <InputGroup className="gap-1 h-12 rounded-full bg-muted/40 border-border px-1.5">
          <InputGroupInput
            id={field.name}
            name={field.name}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={field.state.value ?? min}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            onBlur={field.handleBlur}
            aria-invalid={isInvalid}
            placeholder={`1 – ${max}`}
            className="rounded-tr-full rounded-br-full text-sm focus-visible:ring-primary focus-visible:border-primary bg-transparent border-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <InputGroupAddon className="mt-0.5">
            <Users size={15} className="text-primary/40" />
          </InputGroupAddon>
        </InputGroup>
        {isInvalid && <FieldError errors={field.state.meta.errors} className="text-2xs font-bold uppercase tracking-wide" />}
      </Field>
    </motion.div>
  )
}

export default GuestCountField
