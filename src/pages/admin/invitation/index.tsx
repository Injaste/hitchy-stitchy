import { AnimatePresence } from "framer-motion"
import { ComponentFade } from "@/components/animations/animate-component-fade"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/custom/error-state"

import { useInvitationQuery } from "./queries"
import InvitationDetailsForm from "./components/InvitationDetailsForm"
import RSVPConfigSection from "./components/RSVPConfigSection"

const InvitationView = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useInvitationQuery()

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <ComponentFade key="skeleton">
          <div className="space-y-6 max-w-2xl">
            <Skeleton className="h-[360px] rounded-xl" />
            <Skeleton className="h-[440px] rounded-xl" />
          </div>
        </ComponentFade>
      ) : isError ? (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your invitation details. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      ) : data ? (
        <ComponentFade key="content">
          <div className="space-y-6 max-w-2xl">
            <InvitationDetailsForm invitation={data} />
            <RSVPConfigSection invitation={data} />
          </div>
        </ComponentFade>
      ) : null}
    </AnimatePresence>
  )
}

export default InvitationView
