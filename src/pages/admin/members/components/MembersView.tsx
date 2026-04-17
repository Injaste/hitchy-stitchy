import type { FC } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { ComponentFade } from "@/components/animations/animate-component-fade"
import ErrorState from "@/components/custom/error-state"
import { container, itemFadeUp } from "@/lib/animations"

import { useAccess } from "../../hooks/useAccess"
import { useMemberModalStore } from "../hooks/useMemberModalStore"
import MembersSkeleton from "../states/MembersSkeleton"
import MembersEmpty from "../states/MembersEmpty"
import type { Member } from "../types"
import MemberCard from "./MemberCard"

interface MembersViewProps {
  data: Member[] | undefined
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  refetch: () => void
}

const MembersView: FC<MembersViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openInvite = useMemberModalStore((s) => s.openInvite)
  const { canCreate } = useAccess()

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <MembersSkeleton />
        </ComponentFade>
      )

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your members. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      )

    if (!data?.length)
      return (
        <ComponentFade key="empty">
          <MembersEmpty onInvite={openInvite} canCreate={canCreate("members")} />
        </ComponentFade>
      )

    return (
      <ComponentFade key="content">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {data.map((member) => (
            <motion.div key={member.id} variants={itemFadeUp}>
              <MemberCard member={member} />
            </motion.div>
          ))}
        </motion.div>
      </ComponentFade>
    )
  }

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
}

export default MembersView
