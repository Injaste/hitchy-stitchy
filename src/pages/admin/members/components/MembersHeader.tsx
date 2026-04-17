import type { FC } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ComponentFade } from "@/components/animations/animate-component-fade"

import { useAccess } from "../../hooks/useAccess"
import { useRefetch } from "../../hooks/useRefetch"
import { useMemberModalStore } from "../hooks/useMemberModalStore"
import type { Member } from "../types"

interface MembersHeaderProps {
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  refetch: () => void
  data?: Member[]
}

const MembersHeader: FC<MembersHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch)
  const { canCreate } = useAccess()
  const openInvite = useMemberModalStore((s) => s.openInvite)

  const showActions = !isLoading && !isError
  const total = data?.length ?? 0
  const active = data?.filter((m) => !m.is_frozen).length ?? 0

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs tracking-wide text-muted-foreground/60 font-sans">
        {!isLoading && !isError && total > 0 && (
          <>
            <span>
              {total} {total === 1 ? "member" : "members"}
            </span>
            {active !== total && (
              <>
                <span className="mx-1.5">·</span>
                <span>{active} active</span>
              </>
            )}
          </>
        )}
      </p>

      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key="actions">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground/60 hover:text-muted-foreground"
                onClick={handleRefresh}
                disabled={!canRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canCreate("members") && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={openInvite}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Invite member
                </Button>
              )}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MembersHeader
