import type { ReactNode } from "react";

import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import SubmitButton from "./SubmitButton";

interface FormCardFooterProps {
  submitLabel: ReactNode;
}

/** Mirrors FormDialogFooter — Separator + right-aligned SubmitButton. */
const FormCardFooter = ({ submitLabel }: FormCardFooterProps) => {
  return (
    <>
      <DialogFooter>
        <SubmitButton>{submitLabel}</SubmitButton>
      </DialogFooter>
    </>
  );
};

export default FormCardFooter;
