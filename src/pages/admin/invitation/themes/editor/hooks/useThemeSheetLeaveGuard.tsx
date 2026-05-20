import { useEffect, useState } from "react";
import UnsavedChangesModal from "../../../components/modals/UnsavedChangesModal";

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
      setModalOpen(false);
      onClose();
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
    <UnsavedChangesModal
      open={modalOpen}
      isSaving={isSaving}
      onContinue={() => setModalOpen(false)}
      onDiscard={discard}
      onSave={save}
    />
  );

  return { attemptClose, modal, isSaving };
}
