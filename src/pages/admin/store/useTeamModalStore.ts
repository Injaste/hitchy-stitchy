import { create } from "zustand";
import type { TeamMember } from "@/pages/admin/features/operations/team/types";

interface TeamModalState {
  isRoleModalOpen: boolean;
  editingRole: TeamMember | null;
  isNewRole: boolean;

  isConfirmDeleteRoleModalOpen: boolean;
  roleToDelete: TeamMember | null;

  openAddRoleModal: () => void;
  openEditRoleModal: (member: TeamMember) => void;
  closeRoleModal: () => void;

  openConfirmDeleteRole: (role: TeamMember) => void;
  closeConfirmDeleteRole: () => void;
}

export const useTeamModalStore = create<TeamModalState>((set) => ({
  isRoleModalOpen: false,
  editingRole: null,
  isNewRole: false,

  isConfirmDeleteRoleModalOpen: false,
  roleToDelete: null,

  openAddRoleModal: () =>
    set({ isRoleModalOpen: true, editingRole: null, isNewRole: true }),
  openEditRoleModal: (member) =>
    set({ isRoleModalOpen: true, editingRole: member, isNewRole: false }),
  closeRoleModal: () =>
    set({ isRoleModalOpen: false, editingRole: null }),

  openConfirmDeleteRole: (role) =>
    set({ isConfirmDeleteRoleModalOpen: true, roleToDelete: role }),
  closeConfirmDeleteRole: () =>
    set({ isConfirmDeleteRoleModalOpen: false, roleToDelete: null }),
}));
