import { Store } from "lucide-react"

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form"

import { useVendorModalStore } from "../hooks/useVendorModalStore"
import { useVendorFilterDay } from "../hooks/useVendorDayFilter"
import { useVendorMutations } from "../queries"

import VendorForm, { useVendorForm } from "./VendorForm"

const VendorCreateModal = () => {
  const isCreateOpen = useVendorModalStore((s) => s.isCreateOpen)
  const closeAll = useVendorModalStore((s) => s.closeAll)
  const isCreateMore = useVendorModalStore((s) => s.isCreateMore)
  const setIsCreateMore = useVendorModalStore((s) => s.setIsCreateMore)
  const { create } = useVendorMutations()
  // Adding a vendor while a day is active: book them for it, so the new vendor
  // doesn't land untagged and immediately DISAPPEAR from the view you created it
  // in. Under "All days" this is null — a general (0-day) vendor, correctly.
  const dayFilter = useVendorFilterDay()

  const form = useVendorForm({
    defaultValues: dayFilter ? { day_ids: [dayFilter] } : undefined,
    onSubmit: (values) => create.mutate(values),
  })

  return (
    <FormDialog
      form={form}
      open={isCreateOpen}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader icon={<Store className="size-4" />} title="Add a vendor" />

      <VendorForm />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Save vendor"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  )
}

export default VendorCreateModal
