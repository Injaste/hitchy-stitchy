import { useId, type ReactNode } from "react";

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

interface FormFooterProps {
  submitLabel: ReactNode;
  /** When provided, renders a left-of-submit Cancel button (dialog forms). */
  onCancel?: () => void;
  cancelLabel?: ReactNode;
  /** When provided, renders the left-aligned "Create more" switch. */
  createMore?: CreateMoreConfig;
}

/**
 * Shared footer for FormDialog and FormCard. A bare submit (no onCancel) gives
 * the inline-card footer; passing onCancel/createMore gives the dialog footer.
 */
const FormFooter = ({
  submitLabel,
  onCancel,
  cancelLabel = "Cancel",
  createMore,
}: FormFooterProps) => {
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
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </DialogFooter>
    </>
  );
};

export default FormFooter;
