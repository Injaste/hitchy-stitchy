import { Sparkles } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";
import { formatPrice } from "@/pages/admin/plan/utils";

import { useBespokeModalStore } from "../hooks/useBespokeModalStore";
import { BESPOKE_PRICE } from "../components/bespoke";
import BespokeForm, { useBespokeForm } from "./BespokeForm";

/** Intake form for a bespoke (custom-designed) invitation — a one-off paid service,
 *  not a plan flip. Super-admin-only (gated at the hub card). The form is fully built
 *  (validation + fields), but submission is wired last (backend submit_bespoke_request
 *  RPC → Stripe) — for now the CTA is disabled, honestly marked "coming soon". */
const BespokeRequestModal = () => {
  const { isOpen, close } = useBespokeModalStore();

  // onSubmit is a no-op until the backend RPC lands; the disabled CTA blocks it.
  const form = useBespokeForm({ onSubmit: () => {} });

  return (
    <FormDialog
      form={form}
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close();
      }}
      contentClassName="sm:max-w-md"
    >
      <FormHeader
        icon={<Sparkles className="size-4" />}
        title="Request a bespoke invitation"
      />

      <BespokeForm />

      <FormFooter
        onCancel={close}
        submitLabel={`Request · ${formatPrice(BESPOKE_PRICE)}`}
        submitDisabled
      />
    </FormDialog>
  );
};

export default BespokeRequestModal;
