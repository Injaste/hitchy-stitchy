import { EventModal } from "@/pages/admin/features/timeline/modals/EventModal";
import { ConfirmStartEventModal } from "@/pages/admin/features/timeline/modals/ConfirmStartEventModal";
import { ConfirmDeleteEventModal } from "@/pages/admin/features/timeline/modals/ConfirmDeleteEventModal";
import { ConfirmUpdateActiveEventModal } from "@/pages/admin/features/timeline/modals/ConfirmUpdateActiveEventModal";
import { TaskModal } from "@/pages/admin/features/operations/checklist/modals/TaskModal";
import { ConfirmDeleteTaskModal } from "@/pages/admin/features/operations/checklist/modals/ConfirmDeleteTaskModal";
import { RoleModal } from "@/pages/admin/features/operations/team/modals/RoleModal";
import { ConfirmDeleteRoleModal } from "@/pages/admin/features/operations/team/modals/ConfirmDeleteRoleModal";
import { PingModal } from "@/pages/admin/features/ping/PingModal";
import { ActiveCueModal } from "./ActiveCueModal";

export function AdminModals() {
  return (
    <>
      <EventModal />
      <ConfirmStartEventModal />
      <ConfirmDeleteEventModal />
      <ConfirmUpdateActiveEventModal />
      <TaskModal />
      <ConfirmDeleteTaskModal />
      <RoleModal />
      <ConfirmDeleteRoleModal />
      <PingModal />
      <ActiveCueModal />
    </>
  );
}
