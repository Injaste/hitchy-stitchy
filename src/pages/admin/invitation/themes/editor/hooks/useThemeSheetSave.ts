import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { updateTheme } from "../../../api"
import { useThemeSheetStore } from "../store"

export function useThemeSheetSave() {
  const { slug, eventId } = useAdminStore()
  const queryClient = useQueryClient()

  const save = useCallback(async () => {
    const { themeId, draft } = useThemeSheetStore.getState()
    if (!themeId || !draft || !eventId || !slug) {
      throw new Error("Theme sheet not initialized")
    }

    const promise = updateTheme({
      event_id: eventId,
      id: themeId,
      config: draft,
    })

    toast.promise(promise, {
      loading: "Saving...",
      success: "Saved",
      error: "Failed to save",
    })

    await promise
    queryClient.invalidateQueries({ queryKey: adminKeys.themes(slug) })
    useThemeSheetStore.setState({ initial: draft, isDirty: false })
  }, [eventId, slug, queryClient])

  return { save }
}
