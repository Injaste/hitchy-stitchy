import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldRing, fieldSurface } from "@/components/ui/field-styles";

type InputProps = React.ComponentProps<"input"> & {
  mode?: "edit" | "readonly";
};

function Input({ className, type, mode, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      readOnly={mode === "readonly"}
      className={cn(
        fieldSurface,
        fieldRing,
        "h-9 w-full min-w-0 px-2.5 py-1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
