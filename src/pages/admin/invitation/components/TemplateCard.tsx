import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "../types";

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

// A selectable template option in the browse sheet — a simple white card with a
// left thumbnail, name + description, and a check when picked. Sibling of
// BespokeTemplateCard (same layout, white surface vs gradient).
const TemplateCard = ({ template, isSelected, onSelect }: TemplateCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "w-full text-left flex items-center gap-3 rounded-lg border bg-card p-2.5 cursor-pointer transition-colors",
      isSelected
        ? "border-primary ring-3 ring-primary/20"
        : "border-border hover:border-primary/50",
    )}
  >
    <div className="size-12 shrink-0 rounded-md bg-linear-to-b from-primary/20 to-secondary/15 grid place-items-center font-display text-sm text-foreground/70">
      {template.name.slice(0, 2)}
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="text-sm font-medium font-display truncate">{template.name}</h4>
      {template.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {template.description}
        </p>
      )}
    </div>
    {isSelected && <Check className="size-4 text-primary shrink-0" />}
  </button>
);

export default TemplateCard;
