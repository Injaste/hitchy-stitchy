import { EventModal } from "@/pages/admin/features/timeline/modals/EventModal";
import { TaskModal } from "@/pages/admin/features/operations/checklist/modals/TaskModal";
import { RoleModal } from "@/pages/admin/features/operations/team/modals/RoleModal";
import { PingModal } from "@/pages/admin/features/ping/PingModal";
import { InviteModal } from "@/pages/admin/features/admin-panel/users/modals/InviteModal";
import { ManualRSVPModal } from "@/pages/admin/features/admin-panel/rsvp/modals/ManualRSVPModal";
import { ConfirmModals } from "./ConfirmModals";

export function AdminModals() {
  return (
    <>
      <EventModal />
      <TaskModal />
      <RoleModal />
      <PingModal />
      <InviteModal />
      <ManualRSVPModal />
      <ConfirmModals />
    </>
  );
}
