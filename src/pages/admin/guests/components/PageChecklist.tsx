import type { FC, ReactNode } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import type { GuestPageOption } from "../pageOptions";

interface PageChecklistProps {
  pages: GuestPageOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  /** Trailing detail per row (e.g. how many guests would be added there). */
  meta?: (page: GuestPageOption) => ReactNode;
}

/**
 * The multi-page picker: boxed selectable rows driven by the checkbox's
 * data-state. Shared by the guest form, the import dialog and the bulk page
 * sheet so "which pages" looks and behaves the same everywhere; each caller
 * owns the selection and wraps this in whatever label/field shell it needs.
 */
const PageChecklist: FC<PageChecklistProps> = ({
  pages,
  selectedIds,
  onToggle,
  meta,
}) => (
  <div className="space-y-2">
    {pages.map((p) => (
      <label
        key={p.id}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2.5 text-sm text-muted-foreground transition-all active:scale-[0.99] has-data-[state=unchecked]:hover:bg-accent has-data-[state=unchecked]:hover:text-accent-foreground has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/10 has-data-[state=checked]:text-foreground"
      >
        <CheckboxPrimitive.Root
          checked={selectedIds.includes(p.id)}
          onCheckedChange={() => onToggle(p.id)}
          className="sr-only"
        />
        <span className="min-w-0 truncate font-medium">{p.label}</span>
        {meta && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {meta(p)}
          </span>
        )}
      </label>
    ))}
  </div>
);

export default PageChecklist;
