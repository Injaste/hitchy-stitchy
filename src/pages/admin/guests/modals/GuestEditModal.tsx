import { useMemo } from "react";
import { User } from "lucide-react";

import {
  FormDialog,
  FormFooter,
  FormHeader,
} from "@/components/custom/form";

import { useGuestModalStore } from "../hooks/useGuestModalStore";
import { useGuestMutations } from "../queries";
import {
  useInvitationsQuery,
  useEventSegmentsQuery,
} from "../../invitation/queries";
import { useActiveEventDay } from "../../hooks/useActiveEventDay";
import { pageLabel } from "../../invitation/utils";

import GuestForm, { useGuestForm, type GuestPageOption } from "./GuestForm";

const GuestEditModal = () => {
  const isEditOpen = useGuestModalStore((s) => s.isEditOpen);
  const selectedItem = useGuestModalStore((s) => s.selectedItem);
  const closeAll = useGuestModalStore((s) => s.closeAll);
  const { update } = useGuestMutations();

  // All event pages so a guest can be moved between them; bounds + the message
  // field follow the page selected in-form (validated against it, server too).
  const { days } = useActiveEventDay();
  const { data: invitations } = useInvitationsQuery();
  const { data: segments } = useEventSegmentsQuery();
  const invitation = (invitations ?? []).find(
    (i) => i.id === selectedItem?.invitation_id,
  );

  const pages: GuestPageOption[] = useMemo(() => {
    const dayIdx = (id: string) => days.findIndex((d) => d.id === id);
    return [...(invitations ?? [])]
      .sort((a, b) => {
        const byDay = dayIdx(a.day_id) - dayIdx(b.day_id);
        if (byDay !== 0) return byDay;
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
        mode: p.rsvp_mode,
      }));
  }, [invitations, days, segments]);

  const form = useGuestForm({
    pages: pages.length ? pages : [{ id: "", label: "", minGuest: 1, maxGuest: 1, showMessage: false }],
    pageId: invitation?.id ?? "",
    defaultValues: selectedItem
      ? {
          name: selectedItem.name,
          phone: selectedItem.phone,
          guest_count: selectedItem.guest_count,
          status: selectedItem.status,
          message: selectedItem.message,
        }
      : undefined,
    onSubmit: (values, pageIds) => {
      if (!selectedItem) return;
      const targetPage = pageIds[0];
      update.mutate({
        event_id: selectedItem.event_id,
        id: selectedItem.id,
        name: values.name,
        phone: values.phone,
        guest_count: values.guest_count,
        message: values.message,
        status: values.status,
        // Only on an actual move — keeps normal edits on the pre-migration RPC.
        invitation_id:
          targetPage !== selectedItem.invitation_id ? targetPage : undefined,
      });
    },
  });

  if (!selectedItem || !invitation) return null;

  return (
    <FormDialog
      form={form}
      open={isEditOpen}
      onOpenChange={closeAll}
      isPending={update.isPending}
      isSuccess={update.isSuccess}
      isError={update.isError}
    >
      <FormHeader icon={<User className="size-4" />} title="Edit guest" />
      <GuestForm pages={pages} />
      <FormFooter onCancel={closeAll} submitLabel="Save changes" />
    </FormDialog>
  );
};

export default GuestEditModal;
