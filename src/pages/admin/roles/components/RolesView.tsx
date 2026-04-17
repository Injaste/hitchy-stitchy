import type { FC } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { ComponentFade } from "@/components/animations/animate-component-fade"
import ErrorState from "@/components/custom/error-state"
import { container, itemFadeUp } from "@/lib/animations"

import { useAccess } from "../../hooks/useAccess"
import { useRoleModalStore } from "../hooks/useRoleModalStore"
import RolesSkeleton from "../states/RolesSkeleton"
import RolesEmpty from "../states/RolesEmpty"
import type { Role } from "../types"
import type { Member } from "../../members/types"
import RoleCard from "./RoleCard"

interface RolesViewProps {
  roles: Role[] | undefined
  members: Member[] | undefined
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  refetch: () => void
}

const RolesView: FC<RolesViewProps> = ({
  roles,
  members,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useRoleModalStore((s) => s.openCreate)
  const { canCreate } = useAccess()

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <RolesSkeleton />
        </ComponentFade>
      )

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your roles. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      )

    if (!roles?.length)
      return (
        <ComponentFade key="empty">
          <RolesEmpty onAdd={openCreate} canCreate={canCreate("roles")} />
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
          {roles.map((role) => {
            const roleMembers = (members ?? []).filter(
              (m) => m.role_id === role.id,
            )
            return (
              <motion.div key={role.id} variants={itemFadeUp}>
                <RoleCard role={role} members={roleMembers} />
              </motion.div>
            )
          })}
        </motion.div>
      </ComponentFade>
    )
  }

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
}

export default RolesView
