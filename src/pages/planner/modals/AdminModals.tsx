import { EventModal } from "@/pages/planner/features/timeline/modals/EventModal";
import { ConfirmStartEventModal } from "@/pages/planner/features/timeline/modals/ConfirmStartEventModal";
import { ConfirmDeleteEventModal } from "@/pages/planner/features/timeline/modals/ConfirmDeleteEventModal";
import { ConfirmUpdateActiveEventModal } from "@/pages/planner/features/timeline/modals/ConfirmUpdateActiveEventModal";
import { TaskModal } from "@/pages/planner/features/operations/checklist/modals/TaskModal";
import { ConfirmDeleteTaskModal } from "@/pages/planner/features/operations/checklist/modals/ConfirmDeleteTaskModal";
import { RoleModal } from "@/pages/planner/features/operations/team/modals/RoleModal";
import { ConfirmDeleteRoleModal } from "@/pages/planner/features/operations/team/modals/ConfirmDeleteRoleModal";
import { PingModal } from "@/pages/planner/features/ping/PingModal";
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
