import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useInvitationDraftStore } from "../store/useInvitationDraftStore"
import { useUpdateInvitationMutation } from "../queries"
import { useUpdateThemeConfigMutation } from "../themes/queries"

export function useInvitationSave() {
  const { eventId } = useAdminStore()

  const serverInvitation = useInvitationDraftStore((s) => s.serverInvitation)
  const selectedPageId = useInvitationDraftStore((s) => s.selectedPageId)
  const detailsDraft = useInvitationDraftStore((s) => s.detailsDraft)
  const rsvpDraft = useInvitationDraftStore((s) => s.rsvpDraft)
  const pageDraft = useInvitationDraftStore((s) => s.pageDraft)
  const clearDetails = useInvitationDraftStore((s) => s.clearDetails)
  const clearRSVP = useInvitationDraftStore((s) => s.clearRSVP)
  const clearPage = useInvitationDraftStore((s) => s.clearPage)

  const updateInvitation = useUpdateInvitationMutation()
  const updateTheme = useUpdateThemeConfigMutation()

  const isDirty = !!(detailsDraft || rsvpDraft || pageDraft)
  const isSaving = updateInvitation.isPending || updateTheme.isPending

  const save = () => {
    if (!eventId || !serverInvitation) return

    if (detailsDraft || rsvpDraft) {
      updateInvitation.mutate(
        {
          event_id: eventId,
          ...(detailsDraft ?? {}),
          ...(rsvpDraft
            ? {
                rsvp_mode: rsvpDraft.rsvp_mode,
                rsvp_deadline: rsvpDraft.rsvp_deadline || null,
                config: rsvpDraft.config
                  ? { rsvp: rsvpDraft.config }
                  : undefined,
              }
            : {}),
        },
        { onSuccess: () => { clearDetails(); clearRSVP() } },
      )
    }

    if (pageDraft && selectedPageId) {
      updateTheme.mutate(
        { id: selectedPageId, config: pageDraft },
        { onSuccess: () => clearPage() },
      )
    }
  }

  return { isDirty, isSaving, save }
}
