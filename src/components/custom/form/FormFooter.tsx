import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";
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
  /**
   * Full-width submit instead of the right-aligned dialog footer. Used by the
   * public auth cards, whose primary action spans the card.
   */
  fullWidth?: boolean;
  /** Disables the submit — e.g. gating signup on the terms checkbox. */
  submitDisabled?: boolean;
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
  fullWidth = false,
  submitDisabled = false,
}: FormFooterProps) => {
  const switchId = useId();

  return (
    <>
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
        <div
          className={cn(
            "flex flex-col-reverse gap-2 sm:flex-row",
            fullWidth && "w-full",
          )}
        >
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <SubmitButton
            disabled={submitDisabled}
            className={fullWidth ? "w-full" : undefined}
          >
            {submitLabel}
          </SubmitButton>
        </div>
      </DialogFooter>
    </>
  );
};

export default FormFooter;
