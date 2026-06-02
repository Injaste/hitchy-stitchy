import type { ReactNode } from "react";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFormShell } from "./form-context";

interface FormHeaderProps {
  title: ReactNode;
}

/**
 * Shared header for FormDialog and FormCard. In dialog mode renders a real
 * DialogTitle (required for Radix a11y); inline cards render a matching plain
 * div, since DialogTitle needs Dialog context.
 */
const FormHeader = ({ title }: FormHeaderProps) => {
  const { inDialog } = useFormShell();

  return (
    <DialogHeader>
      {inDialog ? (
        <DialogTitle>{title}</DialogTitle>
      ) : (
        <div
          data-slot="dialog-title"
          className="cn-font-heading font-display text-base leading-none font-medium"
        >
          {title}
        </div>
      )}
    </DialogHeader>
  );
};

export default FormHeader;
