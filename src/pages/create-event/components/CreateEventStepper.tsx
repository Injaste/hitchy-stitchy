import { cn } from "@/lib/utils/utils"

const STEP_LABELS = ["Event", "Role"]

interface Props {
  step: 1 | 2
}

export default function CreateEventStepper({ step }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEP_LABELS.map((label, i) => {
        const s = (i + 1) as 1 | 2
        const isActive = step === s
        const isDone = step > s
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? "✓" : s}
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wide",
                  isActive ? "text-primary font-medium" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "w-8 h-px mb-4 transition-colors",
                  isDone ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
