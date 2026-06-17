import { useEffect, useState } from "react";
import ConfirmAlertModal from "@/components/custom/confirm-alert-modal";
import { useCloseOnSuccess } from "@/components/custom/form/useCloseOnSuccess";

interface UseSheetLeaveGuardArgs {
  isDirty: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onClose: () => void;
}

export function useSheetLeaveGuard({
  isDirty,
  onSave,
  onDiscard,
  onClose,
}: UseSheetLeaveGuardArgs) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Let the Save button's success tick play, then close the sheet.
  useCloseOnSuccess(saveSuccess, () => {
    setSaveSuccess(false);
    setModalOpen(false);
    onClose();
  });

  // Browser-level guard: warn the user before they navigate away with
  // unsaved changes (refresh, tab close, address bar).
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const attemptClose = () => {
    if (isDirty) setModalOpen(true);
    else onClose();
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await onSave();
      setSaveSuccess(true); // success tick → useCloseOnSuccess closes the sheet
    } catch {
      // toast handled upstream
    } finally {
      setIsSaving(false);
    }
  };

  const discard = () => {
    onDiscard();
    setModalOpen(false);
    onClose();
  };

  const modal = (
    <ConfirmAlertModal
      open={modalOpen}
      onOpenChange={(o) => !o && setModalOpen(false)}
      variant="warning"
      title="You have unsaved changes"
      description="Save your edits, discard them, or keep editing."
      cancelLabel="Continue editing"
      secondaryAction={{ label: "Discard", onClick: discard }}
      confirmLabel="Save"
      isPending={isSaving}
      isSuccess={saveSuccess}
      onConfirm={save}
    />
  );

  return { attemptClose, modal, isSaving };
}
