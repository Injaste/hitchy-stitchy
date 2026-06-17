import { useMemo } from "react";
import { User } from "lucide-react";

import { FormDialog, FormFooter, FormHeader } from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import { pageLabel } from "../../invitation/utils";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import {
  useInvitationsQuery,
  useEventSegmentsQuery,
} from "../../invitation/queries";

import GuestForm, { useGuestForm, type GuestPageOption } from "./GuestForm";

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
    onSubmit: (values, invitationId) => {
      create.mutate({
        invitationId,
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
      <GuestForm pages={pages} />
      <FormFooter
        onCancel={closeAll}
        submitLabel="Add guest"
        createMore={{ checked: isCreateMore, onChange: setIsCreateMore }}
      />
    </FormDialog>
  );
};

const GuestCreateModal = () => {
  const isCreateOpen = useGuestModalStore((s) => s.isCreateOpen);
  const activeInvitationId = useGuestModalStore((s) => s.activeInvitationId);

  const { activeDay, days } = useActiveEventDay();
  const { data: invitations } = useInvitationsQuery();
  const { data: segments } = useEventSegmentsQuery();

  // The active day's pages, day-level first — mirrors the list's ordering.
  const activeDayId = activeDay?.id ?? null;
  const pages: GuestPageOption[] = useMemo(() => {
    const list = (invitations ?? []).filter((i) => i.day_id === activeDayId);
    return [...list]
      .sort((a, b) => {
        const rank = (s: string | null) => (s === null ? 0 : 1);
        const byRoot = rank(a.segment_id) - rank(b.segment_id);
        return byRoot !== 0 ? byRoot : a.created_at.localeCompare(b.created_at);
      })
      .map((p) => ({
        id: p.id,
        label: pageLabel(p, days, segments ?? []),
        minGuest: p.guest_count_min,
        maxGuest: p.guest_count_max,
        showMessage: p.rsvp_config.rsvp.fields.message.visible,
      }));
  }, [invitations, activeDayId, days, segments]);

  // Pre-target the focused segment, else this day's first page.
  const defaultPageId =
    (activeInvitationId &&
      pages.some((p) => p.id === activeInvitationId) &&
      activeInvitationId) ||
    pages[0]?.id ||
    null;

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
