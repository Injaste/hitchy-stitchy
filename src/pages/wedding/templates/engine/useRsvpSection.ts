import { useRef, useState } from "react"
import { isAfter, isBefore, startOfDay } from "date-fns"
import confetti from "canvas-confetti"

import { useGuestRSVP, useRSVPMutations } from "@/pages/wedding/queries"
import type { PublicEventConfig, RSVPFormData } from "@/pages/wedding/types"
import { DEFAULT_DEADLINE_MESSAGE } from "@/pages/admin/invitation/types"

interface UseRsvpSectionOptions {
  /** Confetti palette fired on a successful submit. A template's own colours. */
  confettiColors?: string[]
}

// The RSVP state machine shared by every template: fetch the guest's existing
// RSVP, run submit/update/delete mutations, track edit/success/delete-dialog
// state, compute closed/deadline state, and fire confetti + scroll-into-view on
// success. Templates render the markup (header, form, success, closed states)
// and drive it from what this returns — the behaviour lives here, once.
export function useRsvpSection(
  eventConfig: PublicEventConfig,
  options: UseRsvpSectionOptions = {},
) {
  // eventConfig.id is the invitation/page id (per-page RSVP + session).
  const { data: existingRSVP, isLoading } = useGuestRSVP(eventConfig.event_id, eventConfig.id)
  const { submit, update, remove } = useRSVPMutations(eventConfig.event_id, eventConfig.id)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const isPrivate = eventConfig.rsvp_mode === "private"
  // Private pages always show the code field (required); public pages never do.
  const showCode = isPrivate
  const isDeadlinePassed =
    eventConfig.rsvp_deadline !== null &&
    isAfter(
      startOfDay(new Date()),
      startOfDay(new Date(eventConfig.rsvp_deadline)),
    )

  const isEventOver =
    eventConfig.event_date !== null &&
    !isBefore(
      startOfDay(new Date()),
      startOfDay(new Date(eventConfig.event_date)),
    )

  const handleSubmit = async (value: RSVPFormData) => {
    // mutate() resolves even on failure (silent mutations swallow the rejection),
    // so gate the celebration on the success callback — otherwise a rejected RPC
    // (wrong code, capacity, duplicate…) would still fire confetti and flip to the
    // confirmed view. On failure the error surfaces via `submitError`, form stays.
    const mutation = isEditing ? update : submit
    let ok = false
    await mutation.mutate(value, { onSuccess: () => { ok = true } })
    if (!ok) return

    if (!isEditing) setSubmitted(true)
    setIsEditing(false)
    confetti({
      particleCount: 200,
      spread: 80,
      origin: { y: 0.6 },
      colors: options.confettiColors,
    })
    if (sectionRef.current) {
      const top =
        sectionRef.current.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false)
    await remove.mutate({})
    setIsEditing(false)
  }

  return {
    existingRSVP,
    isLoading,
    isEditing,
    setIsEditing,
    submitted,
    showDeleteDialog,
    setShowDeleteDialog,
    isPrivate,
    showCode,
    isDeadlinePassed,
    isEventOver,
    deadlineMessage:
      eventConfig.config.rsvp.messages?.deadline_closed || DEFAULT_DEADLINE_MESSAGE,
    sectionRef,
    rsvpConfig: eventConfig.config.rsvp,
    limits: {
      min: eventConfig.guest_count_min,
      max: eventConfig.guest_count_max,
    },
    removePending: remove.isPending,
    // Server-side submit/update failure surfaced inline (mutations are silent —
    // no toast); cleared on the next attempt by react-query.
    submitError: (isEditing ? update.error : submit.error)?.message ?? null,
    handleSubmit,
    handleDeleteConfirm,
  }
}
