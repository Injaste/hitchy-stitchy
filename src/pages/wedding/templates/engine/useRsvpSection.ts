import { useRef, useState } from "react"
import { isAfter, startOfDay } from "date-fns"
import confetti from "canvas-confetti"

import { useGuestRSVP, useRSVPMutations } from "@/pages/wedding/queries"
import type { PublicEventConfig, RSVPFormData } from "@/pages/wedding/types"

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
  const { data: existingRSVP, isLoading } = useGuestRSVP(eventConfig.event_id)
  const { submit, update, remove } = useRSVPMutations(eventConfig.event_id)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const isPrivate = eventConfig.rsvp_mode === "private"
  const isDeadlinePassed =
    eventConfig.rsvp_deadline !== null &&
    isAfter(
      startOfDay(new Date()),
      startOfDay(new Date(eventConfig.rsvp_deadline)),
    )

  const handleSubmit = async (value: RSVPFormData) => {
    if (isEditing) {
      await update.mutate(value)
    } else {
      await submit.mutate(value)
      setSubmitted(true)
    }
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
    isDeadlinePassed,
    sectionRef,
    rsvpConfig: eventConfig.config.rsvp,
    limits: {
      min: eventConfig.guest_count_min,
      max: eventConfig.guest_count_max,
    },
    removePending: remove.isPending,
    handleSubmit,
    handleDeleteConfirm,
  }
}
