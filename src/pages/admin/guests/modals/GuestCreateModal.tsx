import { User } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestTargetPages } from "../hooks/useGuestTargetPages";
import { useGuestMutations } from "../queries";
import type { GuestPageOption } from "../pageOptions";

import GuestForm, { useGuestForm } from "./GuestForm";

// Inner form, keyed by the focused page so it re-seeds with the right target
// each time the modal opens. The in-form page picker drives the selection
// afterwards (reactive bounds, no remount).
interface CreateGuestFormProps {
  pages: GuestPageOption[];
  pageId: string;
  open: boolean;
}

const CreateGuestForm = ({ pages, pageId, open }: CreateGuestFormProps) => {
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const isCreateMore = useGuestModalStore((s) => s.isCreateMore);
  const setIsCreateMore = useGuestModalStore((s) => s.setIsCreateMore);
  const { create } = useGuestMutations();

  const form = useGuestForm({
    pages,
    pageId,
    multiPage: true,
    onSubmit: (values, pageIds) => {
      create.mutate({
        invitationIds: pageIds,
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        status: values.status,
        message: values.message,
      });
    },
  });

  return (
    <FormDialog
      form={form}
      open={open}
      onOpenChange={closeAll}
      isPending={create.isPending}
      isSuccess={create.isSuccess}
      isError={create.isError}
      closeDelay={isCreateMore ? false : 300}
      resetOnSuccess={isCreateMore}
    >
      <FormHeader icon={<User className="size-4" />} title="Add guest" />
      <GuestForm pages={pages} multiPage />
      <FormFooter
        onCancel={closeAll}
        submitLabel="Add"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen);

  // Guests attach to invitation pages, which may not live on the globally-active
  // day (e.g. a multi-day event whose first/active day has no page) — the hook
  // mirrors the list's effective-day pick, so the modal always has a target when
  // any invitation exists. Pre-target the focused segment, else the first page.
  const { pages, focusedPageId } = useGuestTargetPages();
  const defaultPageId = focusedPageId ?? pages[0]?.id ?? null;

  if (!defaultPageId) return null;

  return (
    <CreateGuestForm
      key={defaultPageId}
      pages={pages}
      pageId={defaultPageId}
      open={isCreateOpen}
    />
  );
};

export default GuestCreateModal;
