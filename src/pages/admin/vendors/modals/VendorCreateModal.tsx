import { Store } from "lucide-react"

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form"

import { useVendorModalStore } from "../hooks/useVendorModalStore"
import { useValidVendorDayFilter } from "../hooks/useVendorDayFilter"
import { useVendorMutations } from "../queries"

import VendorForm, { useVendorForm } from "./VendorForm"

const VendorCreateModal = () => {
  const isCreateOpen = useVendorModalStore((s) => s.isCreateOpen)
  const closeAll = useVendorModalStore((s) => s.closeAll)
  const isCreateMore = useVendorModalStore((s) => s.isCreateMore)
  const setIsCreateMore = useVendorModalStore((s) => s.setIsCreateMore)
  const { create } = useVendorMutations()
  // Adding a vendor while the list is filtered to a day: book them for that day.
  // Without this the new vendor lands untagged and immediately DISAPPEARS from
  // the view you created it in, which reads as the save having failed.
  const dayFilter = useValidVendorDayFilter()

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
