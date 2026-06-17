import type { FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/custom/admin-page-header"
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base"

import { useAccess } from "../../hooks/useAccess"
import { useGiftModalStore } from "../hooks/useGiftModalStore"
import type { GiftsData } from "../api"

interface GiftsHeaderProps extends BaseHeaderProps {
  data?: GiftsData
}

const GiftsHeader: FC<GiftsHeaderProps> = ({
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess()
  const openCreate = useGiftModalStore((s) => s.openCreate)

  return (
    <AdminPageHeader
      containerSize="md"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Gifts"
      description="Record every ang bao, green packet and shagun — who gave and how much — with a live running tally."
      action={
        canCreate("gifts") && (
          <Button
            size="sm"
            variant="default"
            onClick={openCreate}
            className="gap-0"
          >
            <Plus className="w-4 h-4" /> <ActionLabel>Envelope</ActionLabel>
          </Button>
        )
      }
    />
  )
}

export default GiftsHeader
