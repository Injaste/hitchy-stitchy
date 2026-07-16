import { Store } from "lucide-react"

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form"

import { useVendorModalStore } from "../hooks/useVendorModalStore"
import { useVendorMutations } from "../queries"

import VendorForm, { useVendorForm } from "./VendorForm"

const VendorCreateModal = () => {
  const isCreateOpen = useVendorModalStore((s) => s.isCreateOpen)
  const closeAll = useVendorModalStore((s) => s.closeAll)
  const isCreateMore = useVendorModalStore((s) => s.isCreateMore)
  const setIsCreateMore = useVendorModalStore((s) => s.setIsCreateMore)
  const { create } = useVendorMutations()

  const form = useVendorForm({
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
