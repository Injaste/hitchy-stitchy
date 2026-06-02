import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DialogBody } from "@/components/ui/dialog";
import { useFormShell } from "./form-context";

interface FormBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared form body for FormDialog and FormCard. In dialog mode uses DialogBody
 * (scroll + edge gradients, capped at 50vh); inline cards use a plain padded
 * div so the page scrolls naturally instead of clamping.
 */
const FormBody = ({ children, className }: FormBodyProps) => {
  const { inDialog } = useFormShell();

  return inDialog ? (
    <DialogBody className={className}>{children}</DialogBody>
  ) : (
    <div className={cn("px-4", className)}>{children}</div>
  );
};

export default FormBody;
