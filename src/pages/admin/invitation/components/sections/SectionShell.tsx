import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

interface SectionShellProps {
  label: string
  badge?: string
  defaultOpen?: boolean
  children: ReactNode
}

const SectionShell = ({ label, badge, defaultOpen = false, children }: SectionShellProps) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            {label}
          </span>
          {badge && (
            <span className="text-2xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

export default SectionShell
