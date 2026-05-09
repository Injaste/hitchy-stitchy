import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { adminKeys } from "@/pages/admin/lib/queryKeys"
import { useInvitationStore } from "../store/useInvitationStore"
import { useSelectedTemplateTheme } from "../queries"
import { updateInvitation, updateTheme } from "../api"
import type { ThemeConfig } from "@/pages/wedding/templates/types"

type SavePart = "invitation" | "theme"
type PartResult = { part: SavePart; ok: boolean }

export function useInvitationDraftSave() {
  const { slug, eventId } = useAdminStore()
  const queryClient = useQueryClient()

  const detailsDraft = useInvitationStore((s) => s.detailsDraft)
  const detailsIsDirty = useInvitationStore((s) => s.detailsIsDirty)
  const rsvpDraft = useInvitationStore((s) => s.rsvpDraft)
  const rsvpIsDirty = useInvitationStore((s) => s.rsvpIsDirty)
  const themeDraft = useInvitationStore((s) => s.themeDraft)
  const themeIsDirty = useInvitationStore((s) => s.themeIsDirty)
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId)
  const selected = useSelectedTemplateTheme()

  const setDetailsDirty = useInvitationStore((s) => s.setDetailsDirty)
  const setRSVPDirty = useInvitationStore((s) => s.setRSVPDirty)
  const setThemeDirty = useInvitationStore((s) => s.setThemeDirty)

  const [isSaving, setIsSaving] = useState(false)

  const invitationDirty = detailsIsDirty || rsvpIsDirty
  const isDirty = invitationDirty || themeIsDirty

  const runSave = async () => {
    const tasks: Promise<PartResult>[] = []

    if (invitationDirty) {
      tasks.push(
        updateInvitation({
          event_id: eventId!,
          ...(detailsIsDirty && detailsDraft ? detailsDraft : {}),
          ...(rsvpIsDirty && rsvpDraft
            ? {
              rsvp_mode: rsvpDraft.rsvp_mode,
              rsvp_deadline: rsvpDraft.rsvp_deadline || null,
              config: { rsvp: rsvpDraft.config },
            }
            : {}),
        })
          .then<PartResult>(() => ({ part: "invitation", ok: true }))
          .catch<PartResult>(() => ({ part: "invitation", ok: false })),
      )
    }

    if (themeIsDirty && themeDraft && selected) {
      const config = { slug: selected.template.slug, ...themeDraft } as ThemeConfig
      tasks.push(
        updateTheme({ event_id: eventId!, id: selectedThemeId!, config })
          .then<PartResult>(() => ({ part: "theme", ok: true }))
          .catch<PartResult>(() => ({ part: "theme", ok: false })),
      )
    }

    const results = await Promise.all(tasks)
    const succeeded = results.filter((r) => r.ok).map((r) => r.part)
    const failed = results.filter((r) => !r.ok).map((r) => r.part)

    if (succeeded.includes("invitation")) {
      setDetailsDirty(false)
      setRSVPDirty(false)
      queryClient.invalidateQueries({ queryKey: adminKeys.invitation(slug!) })
    }
    if (succeeded.includes("theme")) {
      setThemeDirty(false)
      queryClient.invalidateQueries({ queryKey: adminKeys.themes(slug!) })
    }

    if (succeeded.length === 0) throw new Error("save failed")

    return { succeeded, failed }
  }

  const save = () => {
    if (!isDirty || isSaving) return
    setIsSaving(true)
    const promise = runSave().finally(() => setIsSaving(false))

    toast.promise(promise, {
      loading: "Saving...",
      success: (r) => {
        if (r.failed.length === 0) return "Saved"
        if (r.failed.includes("theme")) return "Saved details — couldn't save theme"
        return "Saved theme — couldn't save details"
      },
      error: "Failed to save",
    })
  }

  return { isDirty, isSaving, save }
}
