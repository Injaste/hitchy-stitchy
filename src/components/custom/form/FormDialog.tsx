import { useEffect, useState, type ReactNode } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormShellContext, type FormShellContextValue } from "./form-context";
import { useCloseOnSuccess } from "./useCloseOnSuccess";
import { useFormCore } from "./useFormCore";

interface FormDialogProps {
  form: FormShellContextValue["form"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  /** Ms to wait after isSuccess before auto-closing. false = opt out. Default 1000. */
  closeDelay?: number | false;
  /**
   * When true, calls form.reset() after isSuccess flips on. Pair with
   * `closeDelay={false}` for "create more" flows where the dialog stays open
   * and the form clears for the next entry.
   */
  resetOnSuccess?: boolean;
  children: ReactNode;
  contentClassName?: string;
}

/**
 * Form inside a modal dialog. Blocks accidental closes when the form is dirty
 * — clicking outside or pressing Escape shakes the dialog instead of closing.
 * Auto-closes after success, and resets cleanly on every open.
 */
const FormDialog = ({
  form,
  open,
  onOpenChange,
  isPending = false,
  isSuccess = false,
  isError = false,
  closeDelay = 300,
  resetOnSuccess = false,
  children,
  contentClassName,
}: FormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(open);
  const [animate, setAnimate] = useState<"idle" | "shake">("idle");

  const { formRef, setAttemptCount, contextValue, handleSubmit, handleKeyDown } = useFormCore({
    form,
    isPending,
    isSuccess,
    isError,
    resetOnSuccess,
  });

  // Keep internal open state in sync with the prop.
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  // On close, reset attempts and form so reopens are fresh.
  useEffect(() => {
    if (internalOpen) return;
    setAttemptCount(0);
    const id = setTimeout(() => form.reset(), 250);
    return () => clearTimeout(id);
  }, [internalOpen]);

  useCloseOnSuccess(isSuccess, () => handleOpenChange(false), closeDelay);

  const handleOpenChange = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange(next);
  };

  // Block + shake on overlay click when the form is dirty.
  const handlePointerDownOutside = (e: Event) => {
    if (form.state.isDirty) {
      e.preventDefault();
      setAnimate("shake");
    }
  };

  // Block + shake on Escape when the form is dirty.
  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (form.state.isDirty) {
      e.preventDefault();
      setAnimate("shake");
    }
  };

  return (
    <FormShellContext.Provider value={contextValue}>
      <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className={contentClassName}
          animate={animate}
          onAnimationComplete={() => setAnimate("idle")}
          onPointerDownOutside={handlePointerDownOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="contents"
          >
            {children}
          </form>
        </DialogContent>
      </Dialog>
    </FormShellContext.Provider>
  );
};

export default FormDialog;
