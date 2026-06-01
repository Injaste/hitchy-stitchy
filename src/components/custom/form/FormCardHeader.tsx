import type { ReactNode } from "react";

import { DialogHeader } from "@/components/ui/dialog";

interface FormCardHeaderProps {
  title: ReactNode;
}

/**
 * Mirrors FormDialogHeader visually — same DialogHeader shell, but uses a
 * plain div for the title instead of DialogTitle (which requires Dialog context).
 */
const FormCardHeader = ({ title }: FormCardHeaderProps) => {
  return (
    <DialogHeader>
      <div
        data-slot="dialog-title"
        className="cn-font-heading font-display text-base leading-none font-medium"
      >
        {title}
      </div>
    </DialogHeader>
  );
};

export default FormCardHeader;
