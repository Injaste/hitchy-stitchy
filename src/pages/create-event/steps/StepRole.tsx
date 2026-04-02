import { useState } from "react"
import { Heart, CalendarCheck, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/utils"
import type { RoleData } from "../types"

interface Props {
  defaultValues?: Partial<RoleData>
  onSubmit: (data: RoleData) => void
  onBack: () => void
  isSubmitting?: boolean
  error?: string | null
}

interface RoleOption {
  role: string
  shortRole: string
  icon: React.ComponentType<{ className?: string }>
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: "Bride", shortRole: "Bride", icon: Heart },
  { role: "Groom", shortRole: "Groom", icon: Heart },
  { role: "Coordinator", shortRole: "Coord", icon: CalendarCheck },
  { role: "Other", shortRole: "Other", icon: User },
]

export function StepRole({ defaultValues, onSubmit, onBack, isSubmitting, error }: Props) {
  const [selected, setSelected] = useState<string>(defaultValues?.role ?? "")
  const [customRole, setCustomRole] = useState(
    defaultValues?.role && !ROLE_OPTIONS.find((o) => o.role === defaultValues.role)
      ? defaultValues.role
      : "",
  )
  const [validationError, setValidationError] = useState("")

  const handleSubmit = () => {
    if (!selected) {
      setValidationError("Please select a role to continue.")
      return
    }
    if (selected === "Other" && customRole.trim().length === 0) {
      setValidationError("Please enter your role.")
      return
    }
    setValidationError("")
    if (selected === "Other") {
      const trimmed = customRole.trim()
      onSubmit({ role: trimmed, shortRole: trimmed.slice(0, 10) })
    } else {
      const option = ROLE_OPTIONS.find((o) => o.role === selected)!
      onSubmit({ role: option.role, shortRole: option.shortRole })
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">What's your role?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You can add more team members after setup.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = selected === option.role
          return (
            <button
              key={option.role}
              type="button"
              onClick={() => {
                setSelected(option.role)
                setValidationError("")
              }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                isSelected
                  ? "bg-primary/10 border-primary border-2 text-primary"
                  : "bg-card border-border hover:bg-muted/50 text-foreground",
              )}
            >
              <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
              {option.role}
            </button>
          )
        })}
      </div>

      {selected === "Other" && (
        <div className="space-y-1.5">
          <Input
            type="text"
            value={customRole}
            onChange={(e) => {
              setCustomRole(e.target.value)
              setValidationError("")
            }}
            placeholder="Your role e.g. Floor Manager"
            autoFocus
          />
        </div>
      )}

      {(validationError || error) && (
        <p className="text-xs text-destructive">{validationError || error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="w-full">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating your event…" : "Create Event"}
        </Button>
      </div>
    </div>
  )
}
