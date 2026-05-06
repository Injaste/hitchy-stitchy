import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useInvitationStore } from "../store/useInvitationStore"
import { useUpdateInvitationMutation, useThemesMutations } from "../queries"

export function useInvitationDraftSave() {
  const { eventId } = useAdminStore()

  const detailsDraft = useInvitationStore((s) => s.detailsDraft)
  const rsvpDraft = useInvitationStore((s) => s.rsvpDraft)
  const themeDraft = useInvitationStore((s) => s.themeDraft)
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId)

  const clearDetails = useInvitationStore((s) => s.clearDetails)
  const clearRSVP = useInvitationStore((s) => s.clearRSVP)
  const clearTheme = useInvitationStore((s) => s.clearTheme)

  const updateInvitation = useUpdateInvitationMutation()
  const { update: updateTheme } = useThemesMutations()

  const isDirty = !!(detailsDraft || rsvpDraft || themeDraft)
  const isSaving = updateInvitation.isPending || updateTheme.isPending

  const save = () => {
    if (detailsDraft || rsvpDraft) {
      updateInvitation.mutate(
        {
          event_id: eventId,
          ...(detailsDraft ?? {}),
          ...(rsvpDraft
            ? {
              rsvp_mode: rsvpDraft.rsvp_mode,
              rsvp_deadline: rsvpDraft.rsvp_deadline || null,
              config: { rsvp: rsvpDraft.config },
            }
            : {}),
        },
        { onSuccess: () => { clearDetails(); clearRSVP() } },
      )
    }

    if (themeDraft) {
      updateTheme.mutate(
        { event_id: eventId, id: selectedThemeId!, config: themeDraft },
        { onSuccess: () => clearTheme() },
      )
    }
  }

  return { isDirty, isSaving, save }
}