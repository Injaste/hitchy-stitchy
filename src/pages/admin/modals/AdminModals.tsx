import { EventModal } from "@/pages/admin/features/timeline/modals/EventModal";
import { TaskModal } from "@/pages/admin/features/operations/checklist/modals/TaskModal";
import { RoleModal } from "@/pages/admin/features/operations/team/modals/RoleModal";
import { ConfirmModals } from "./ConfirmModals";

export function AdminModals() {
  return (
    <>
      <EventModal />
      <TaskModal />
      <RoleModal />
      <ConfirmModals />
    </>
  );
}
