import { useRef, useState } from "react"
import { Bell } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useAdminStore } from "../store/useAdminStore"
import { subscribeToPush } from "../settings/notifications/api"

const pushSupported = () => "Notification" in window && "PushManager" in window

/**
 * First-run permission prompt. The browser notification grant is the one thing a
 * member must do by hand — it's a hard, one-time, per-device gate (and on iOS it
 * must be triggered by a tap, not fired on load). After the grant, enrollment and
 * feature preferences are automatic/default-on (see useAutoPushSubscribe).
 *
 * We show this only while permission is still "default" (never asked) — the
 * browser's own permission state is the persistent "have we asked yet?" flag, so
 * no extra storage is needed. Once granted or denied it never reappears.
 * "Maybe later" dismisses for the current session; Settings remains the manual
 * fallback. Built as a single-item checklist so future permissions can slot in.
 */
export function NotificationPermissionModal() {
  const { memberId, eventId, slug } = useAdminStore()
  const [dismissed, setDismissed] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)

  const open =
    !dismissed &&
    !!memberId &&
    !!eventId &&
    pushSupported() &&
    Notification.permission === "default"

  const enable = async () => {
    setIsPending(true)
    try {
      const permission = await Notification.requestPermission()
      // Subscribe in the background so the modal closes the instant the user
      // answers the prompt — registration (service worker / pushManager) must
      // never block the close, or a slow/hung subscribe leaves the modal stuck.
      if (permission === "granted") {
        subscribeToPush(memberId, eventId, slug).catch(() => {})
      }
    } finally {
      setIsPending(false)
      setDismissed(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) setDismissed(true) }}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          // We can't just put `autoFocus` on the primary button: Radix wraps the
          // dialog in a FocusScope that, on open, fires this onOpenAutoFocus event
          // and — unless it's prevented — runs its own focusFirst() over the
          // tabbable elements, focusing the FIRST one in DOM order ("Maybe later").
          // That programmatic focus runs a tick after mount and stomps whatever the
          // native autoFocus attribute did, so autoFocus is silently overridden
          // (and "works" only by timing luck). Preventing the default and focusing
          // the ref ourselves is the supported way to steer initial focus to the
          // primary action while keeping it second in DOM/tab order.
          e.preventDefault()
          confirmRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="size-4" />
            Turn on notifications
          </DialogTitle>
          <DialogDescription>
            Get notified the moment timeline items go live — and as more updates
            roll out. You can fine-tune or turn this off anytime in Settings.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDismissed(true)} disabled={isPending}>
            Maybe later
          </Button>
          <Button ref={confirmRef} onClick={enable} disabled={isPending}>
            Turn on notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
