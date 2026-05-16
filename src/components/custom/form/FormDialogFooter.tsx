import { useId } from "react";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import SubmitButton from "./SubmitButton";

interface CreateMoreConfig {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

interface FormDialogFooterProps {
  onCancel: () => void;
  submitLabel: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** When provided, renders the left-aligned "Create more" switch. */
  createMore?: CreateMoreConfig;
}

const FormDialogFooter = ({
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  createMore,
}: FormDialogFooterProps) => {
  const switchId = useId();

  return (
    <>
      <Separator />
      <DialogFooter className={createMore ? "sm:justify-between" : undefined}>
        {createMore && (
          <div className="flex items-center gap-2">
            <Switch
              id={switchId}
              checked={createMore.checked}
              onCheckedChange={createMore.onChange}
            />
            <Label
              htmlFor={switchId}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {createMore.label ?? "Create more"}
            </Label>
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </DialogFooter>
    </>
  );
};

export default FormDialogFooter;
