import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldRing, fieldSurface } from "@/components/ui/field-styles";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldSurface,
        fieldRing,
        "flex field-sizing-content min-h-16 w-full px-2.5 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm max-h-40 overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
