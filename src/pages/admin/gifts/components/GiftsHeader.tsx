import type { FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/custom/admin-page-header"
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base"

import { useAccess } from "../../hooks/useAccess"
import { useActiveEventDay } from "../../hooks/useActiveEventDay"
import { dayLabel } from "../../days/utils"
import { useGiftModalStore } from "../hooks/useGiftModalStore"
import type { GiftsData } from "../api"

interface GiftsHeaderProps extends BaseHeaderProps {
  data?: GiftsData
}

const GiftsHeader: FC<GiftsHeaderProps> = ({
  data,
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess()
  const openCreate = useGiftModalStore((s) => s.openCreate)

  // Mirror the gifts rail's effective day in the header (label only). Gifts only
  // rail days that have a gift, so pick the same effective day as GiftsView.
  const { days, activeDayId } = useActiveEventDay()
  const gifts = data?.gifts ?? []
  const giftDays = days.filter((d) =>
    gifts.some((g) => g.day_id === d.id),
  )
  const effectiveDayId = giftDays.some((d) => d.id === activeDayId)
    ? activeDayId
    : (giftDays[0]?.id ?? null)
  const effectiveIndex = days.findIndex((d) => d.id === effectiveDayId)
  const daySuffix =
    giftDays.length > 1 ? dayLabel(days[effectiveIndex]?.label, effectiveIndex) : null

  return (
    <AdminPageHeader
      containerSize="md"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Gifts"
      titleSuffix={
        daySuffix && (
          <div className="flex min-w-0 items-center text-sm font-medium text-muted-foreground sm:text-base">
            <span className="min-w-0 truncate">{daySuffix}</span>
          </div>
        )
      }
      description="Record every ang bao, green packet and shagun — who gave and how much — with a live running tally."
      action={
        canCreate("gifts") && (
          <Button
            size="sm"
            variant="default"
            data-tour-action
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
