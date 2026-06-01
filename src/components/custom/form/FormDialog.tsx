import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormShellContext, type FormShellContextValue } from "./form-context";
import { useCloseOnSuccess } from "./useCloseOnSuccess";

interface FormDialogProps {
  form: FormShellContextValue["form"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Mutation pending state. Pass `mutation.isPending` from the modal — it's
   * surfaced via FormShellContext so <SubmitButton> auto-disables and shows
   * its pending label without per-modal wiring.
   */
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
 * Composite of Dialog + FormShell. Owns the <form>, the FormShellContext,
 * submit-on-Ctrl+Enter, and a dirty guard:
 *
 * - Overlay click and Escape are blocked + trigger a shake when the form
 *   is dirty (matches AlertDialog's blocked-close feedback).
 * - The X close button and the parent Cancel always close — they aren't
 *   "accidental" close paths, they're explicit user intent.
 * - Parent-triggered closes flow through internal-open state synced from
 *   the `open` prop.
 * - On close, attemptCount + form values reset for the next open.
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
  const [attemptCount, setAttemptCount] = useState(0);
  const [internalOpen, setInternalOpen] = useState(open);
  const [animate, setAnimate] = useState<"idle" | "shake">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  // Sync prop -> internal. Parent-triggered closes flow through here.
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  // On close, reset attempts and form so reopens are fresh. Defer the form
  // reset until after the dialog close animation finishes (~200ms) — otherwise
  // the user briefly sees the form values flash back to defaults while the
  // dialog is still visible.
  // If the user reopens before the timeout fires, the cleanup cancels the
  // pending reset so they don't lose in-progress values.
  useEffect(() => {
    if (internalOpen) return;
    setAttemptCount(0);
    const id = setTimeout(() => form.reset(), 250);
    return () => clearTimeout(id);
  }, [internalOpen]);

  useCloseOnSuccess(isSuccess, () => handleOpenChange(false), closeDelay);

  useEffect(() => {
    if (!isSuccess || !resetOnSuccess) return;
    form.reset();
    const id = requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isSuccess, resetOnSuccess]);

  // After every submit attempt, focus + scroll the first errored field into
  // view. FieldShell sets `data-invalid="true"` once attemptCount > 0 and
  // the field has errors, so the DOM order naturally matches display order.
  // requestAnimationFrame waits for React to flush the new data-invalid
  // attributes before we query them.
  useEffect(() => {
    if (attemptCount === 0) return;
    const id = requestAnimationFrame(() => {
      const firstInvalid = formRef.current?.querySelector(
        '[data-invalid="true"]',
      );
      if (!firstInvalid) return;
      const focusable = firstInvalid.querySelector<HTMLElement>(
        'input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
      focusable?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [attemptCount]);

  const submit = () => {
    setAttemptCount((c) => c + 1);
    form.handleSubmit();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  // The X close button and programmatic closes flow through onOpenChange.
  // Both are explicit close intents, so no dirty guard here.
  const handleOpenChange = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange(next);
  };

  // Overlay click — block + shake when dirty.
  const handlePointerDownOutside = (e: Event) => {
    if (form.state.isDirty) {
      e.preventDefault();
      setAnimate("shake");
    }
  };

  // Escape key — block + shake when dirty.
  const handleEscapeKeyDown = (e: KeyboardEvent) => {
    if (form.state.isDirty) {
      e.preventDefault();
      setAnimate("shake");
    }
  };

  // Memoized so context consumers (SubmitButton, fields) don't re-render on
  // every FormDialog state change — only when the values they actually read
  // change. Without this, every setAnimate/setInternalOpen/setAttemptCount
  // triggers a fresh object identity and re-renders every consumer.
  const contextValue = useMemo(
    () => ({ attemptCount, form, isPending, isSuccess, isError }),
    [attemptCount, form, isPending, isSuccess, isError],
  );

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
          {/*
            `display: contents` keeps the <form> semantic (events bubble,
            submit works) but transparent to layout — so DialogHeader /
            DialogBody / DialogFooter remain direct grid children of the
            shaking card inside DialogContent.
          */}
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
