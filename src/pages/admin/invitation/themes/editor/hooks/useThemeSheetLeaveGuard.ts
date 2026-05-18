import { useCallback, useEffect, useState, type ReactElement } from "react"
import { createElement } from "react"
import UnsavedChangesModal from "../../../components/modals/UnsavedChangesModal"

interface UseSheetLeaveGuardArgs {
  isDirty: boolean
  onSave: () => Promise<void>
  onDiscard: () => void
  onClose: () => void
}

interface UseSheetLeaveGuardResult {
  attemptClose: () => void
  modal: ReactElement
  isSaving: boolean
}

export function useSheetLeaveGuard({
  isDirty,
  onSave,
  onDiscard,
  onClose,
}: UseSheetLeaveGuardArgs): UseSheetLeaveGuardResult {
  const [modalOpen, setModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  const attemptClose = useCallback(() => {
    if (isDirty) setModalOpen(true)
    else onClose()
  }, [isDirty, onClose])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave()
      setModalOpen(false)
      onClose()
    } catch {
      // toast handled in save hook
    } finally {
      setIsSaving(false)
    }
  }, [onSave, onClose])

  const handleDiscard = useCallback(() => {
    onDiscard()
    setModalOpen(false)
    onClose()
  }, [onDiscard, onClose])

  const handleContinue = useCallback(() => setModalOpen(false), [])

  const modal = createElement(UnsavedChangesModal, {
    open: modalOpen,
    isSaving,
    onContinue: handleContinue,
    onDiscard: handleDiscard,
    onSave: handleSave,
  })

  return { attemptClose, modal, isSaving }
}
