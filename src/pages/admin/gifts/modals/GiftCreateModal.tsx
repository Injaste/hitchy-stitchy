import { HandCoins } from "lucide-react"

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form"

import { useActiveEventDay } from "../../hooks/useActiveEventDay"
import { useGiftModalStore } from "../hooks/useGiftModalStore"
import { useGiftMutations } from "../queries"

import GiftForm, { useGiftForm } from "./GiftForm"

const GiftCreateModal = () => {
  const isCreateOpen = useGiftModalStore((s) => s.isCreateOpen)
  const closeAll = useGiftModalStore((s) => s.closeAll)
  const isCreateMore = useGiftModalStore((s) => s.isCreateMore)
  const setIsCreateMore = useGiftModalStore((s) => s.setIsCreateMore)
  const { create } = useGiftMutations()
  const { activeDay } = useActiveEventDay()

  // New gifts default to the day in view — resolved to a real day, never null.
  const form = useGiftForm({
    defaultValues: { day_id: activeDay?.id ?? "" },
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
      <FormHeader icon={<HandCoins className="size-4" />} title="Record a gift" />

      <GiftForm />

      <FormFooter
        onCancel={closeAll}
        submitLabel="Save gift"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  )
}

export default GiftCreateModal
