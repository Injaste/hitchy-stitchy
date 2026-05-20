import { useCallback } from "react"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useThemesMutations } from "../../queries"
import { useThemeSheetStore } from "./store"

export function useThemeMutations() {
  const { eventId } = useAdminStore()
  const { update } = useThemesMutations()

  const save = useCallback(async () => {
    const { themeId, draft, name } = useThemeSheetStore.getState()
    if (!themeId || !draft || !eventId) {
      throw new Error("Theme sheet not initialized")
    }

    const trimmedName = name.trim()
    if (!trimmedName) throw new Error("Name can't be empty")

    const result = await update.mutateAsync({
      event_id: eventId,
      id: themeId,
      name: trimmedName,
      config: draft,
    })

    useThemeSheetStore.setState({
      initial: draft,
      name: trimmedName,
      initialName: trimmedName,
      isDirty: false,
    })

    return result
  }, [eventId, update])

  return {
    save,
    isPending: update.isPending,
    isSuccess: update.isSuccess,
    isError: update.isError,
    reset: update.reset,
  }
}
