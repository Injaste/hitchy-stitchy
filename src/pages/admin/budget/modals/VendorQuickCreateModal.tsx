import { Store } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";

import VendorForm, { useVendorForm } from "../../vendors/modals/VendorForm";
import { useVendorMutations } from "../../vendors/queries";
import { useExpenseModalStore } from "../hooks/useExpenseModalStore";

/** Add a vendor without leaving the expense you're writing. Reuses the vendors
 *  feature's own form wholesale, so a vendor created here is identical to one
 *  created on the Vendors page — no second, thinner definition to drift.
 *
 *  Stacks ON TOP of the expense modal instead of handing off to it: the expense
 *  form holds unsaved input, so stepping out would discard it. The new vendor's
 *  id goes back through the store, where the expense form picks it up and
 *  selects it — the whole point is not having to find it in the list yourself. */
const VendorQuickCreateModal = () => {
  const isOpen = useExpenseModalStore((s) => s.isVendorCreateOpen);
  const close = useExpenseModalStore((s) => s.closeVendorCreate);
  const setPendingVendorId = useExpenseModalStore((s) => s.setPendingVendorId);
  const dayId = useExpenseModalStore((s) => s.vendorCreateDayId);
  const { create } = useVendorMutations();

  const form = useVendorForm({
    // Book them for the day the expense falls on — the same guess the Vendors
    // page makes from its day filter. Editable right here in the dialog.
    defaultValues: dayId ? { day_ids: [dayId] } : undefined,
    // mutateAsync rather than mutate: the id of the vendor just created is the
    // whole payload here, and the wrapper's mutate() callbacks are argument-less.
    // Failures have already surfaced as a toast by the time this rejects, so the
    // catch only stops an unhandled rejection.
    onSubmit: async (values) => {
      try {
        const vendor = await create.mutateAsync(values);
        setPendingVendorId(vendor.id);
      } catch {
        /* handled by the mutation wrapper */
      }
    },
  });

  return (
    <FormDialog
      form={form}
      open={isOpen}
      onOpenChange={close}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      nested
    >
      <FormHeader icon={<Store className="size-4" />} title="Add a vendor" />

      <VendorForm />

      <FormFooter onCancel={close} submitLabel="Save vendor" />
    </FormDialog>
  );
};

export default VendorQuickCreateModal;
