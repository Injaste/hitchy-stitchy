import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssigneeItem {
  id: string;
  label: string;
}

interface AssigneeFieldProps {
  value: string[];
  onChange: (ids: string[]) => void;
  items: AssigneeItem[];
}

const AssigneeField = ({ value, onChange, items }: AssigneeFieldProps) => {
  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground/60 italic">
        No members available
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const checked = value.includes(item.id);
        return (
          <Button
            key={item.id}
            type="button"
            variant="outline"
            size="lg"
            role="checkbox"
            aria-checked={checked}
            onClick={() => toggle(item.id)}
            className={cn(
              "text-muted-foreground hover:border-border",
              checked &&
                "border-foreground/40! bg-foreground/10! text-foreground",
            )}
          >
            <span className="min-w-0 truncate">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default AssigneeField;
