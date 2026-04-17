import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssigneeItem {
  id: string
  label: string
}

interface AssigneeFieldProps {
  value: string[]
  onChange: (ids: string[]) => void
  items: AssigneeItem[]
}

const AssigneeField = ({ value, onChange, items }: AssigneeFieldProps) => {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground/60 italic">No members available</p>
    )
  }

  return (
    <div className="bg-card border border-border rounded-md p-3 max-h-40 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              id={`assignee-${item.id}`}
              checked={value.includes(item.id)}
              onCheckedChange={() => toggle(item.id)}
            />
            <Label
              htmlFor={`assignee-${item.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AssigneeField
