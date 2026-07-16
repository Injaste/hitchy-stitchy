import type { FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdminPageHeader } from "@/components/custom/admin-page-header"
import {
  ActionLabel,
  type BaseHeaderProps,
} from "@/components/custom/page-header-base"

import { useAccess } from "../../hooks/useAccess"
import { useVendorModalStore } from "../hooks/useVendorModalStore"

const VendorsHeader: FC<BaseHeaderProps> = ({
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { isSuperAdmin } = useAccess()
  const openCreate = useVendorModalStore((s) => s.openCreate)

  return (
    <AdminPageHeader
      containerSize="md"
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      title="Vendors"
      description="Keep every vendor you've hired in one place — who they are, what they do, and how to reach them."
      action={
        isSuperAdmin && (
          <Button
            size="sm"
            variant="default"
            data-tour-action
            onClick={openCreate}
            className="gap-0"
          >
            <Plus className="w-4 h-4" /> <ActionLabel>Vendor</ActionLabel>
          </Button>
        )
      }
    />
  )
}

export default VendorsHeader
