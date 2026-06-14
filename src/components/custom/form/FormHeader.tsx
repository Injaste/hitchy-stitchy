import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFormShell } from "./form-context";

interface FormHeaderProps {
  title: ReactNode;
  /** Leading icon rendered before the title. */
  icon?: ReactNode;
}

/**
 * Shared header for FormDialog and FormCard. In dialog mode renders a real
 * DialogTitle (required for Radix a11y); inline cards render a matching plain
 * div, since DialogTitle needs Dialog context.
 */
const FormHeader = ({ title, icon }: FormHeaderProps) => {
  const { inDialog } = useFormShell();

  return (
    <DialogHeader>
      {inDialog ? (
        <DialogTitle
          className={
            icon ? "flex items-center gap-2 text-muted-foreground" : undefined
          }
        >
          {icon}
          {title}
        </DialogTitle>
      ) : (
        <div
          data-slot="dialog-title"
          className={cn(
            "cn-font-heading font-display text-base leading-none font-medium",
            icon && "flex items-center gap-2",
          )}
        >
          {icon}
          {title}
        </div>
      )}
    </DialogHeader>
  );
};

export default FormHeader;
