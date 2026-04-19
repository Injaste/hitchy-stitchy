import { useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { ComponentFade } from "@/components/animations/animate-component-fade"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/custom/error-state"

import { useInvitationQuery, usePagesQuery } from "./queries"
import { useInvitationDraftStore } from "./store/useInvitationDraftStore"
import InvitationHeader from "./components/InvitationHeader"
import EditorLayout from "./components/EditorLayout"
import InvitationModals from "./modals"

const Invitation = () => {
  const invitation = useInvitationQuery()
  const pages = usePagesQuery()
  const setServerInvitation = useInvitationDraftStore((s) => s.setServerInvitation)
  const setServerPages = useInvitationDraftStore((s) => s.setServerPages)

  useEffect(() => {
    setServerInvitation(invitation.data ?? null)
  }, [invitation.data, setServerInvitation])

  useEffect(() => {
    setServerPages(pages.data ?? [])
  }, [pages.data, setServerPages])

  const isLoading = invitation.isLoading || pages.isLoading
  const isError = invitation.isError || pages.isError
  const refetch = () => {
    invitation.refetch()
    pages.refetch()
  }
  const isRefetching = invitation.isRefetching || pages.isRefetching

  return (
    <div className="space-y-8">
      <InvitationHeader />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-[440px] rounded-xl" />
              </div>
              <Skeleton className="h-[620px] rounded-2xl" />
            </div>
          </ComponentFade>
        ) : isError ? (
          <ComponentFade key="error">
            <ErrorState
              message="We couldn't load your invitation. Please try again."
              onRetry={refetch}
              isRetrying={isRefetching}
            />
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <EditorLayout />
          </ComponentFade>
        )}
      </AnimatePresence>
      <InvitationModals />
    </div>
  )
}

export default Invitation
