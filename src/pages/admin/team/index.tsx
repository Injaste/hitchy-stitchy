import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { ComponentFade } from '@/components/animations/animate-component-fade'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { container, itemFadeUp } from '@/lib/animations'

import { isAdminMember } from '../types'
import { useAdminStore } from '../store/useAdminStore'
import { useTeamRolesQuery, useTeamMembersQuery } from './queries'
import type { Role } from './types'

import { TeamRoleCard } from './components/TeamRoleCard'
import { RoleModal } from './components/modals/RoleModal'
import { ConfirmDeleteRoleModal } from './components/modals/ConfirmDeleteRoleModal'

export function TeamTab() {
  const { memberRoleCategory } = useAdminStore()
  const isAdmin = isAdminMember(memberRoleCategory)
  const { data: roles, isLoading: rolesLoading } = useTeamRolesQuery()
  const { data: members } = useTeamMembersQuery()

  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleModalOpen(true)
  }

  const handleAddRole = () => {
    setEditingRole(null)
    setRoleModalOpen(true)
  }

  const handleDeleteRole = (role: Role) => {
    setDeleteTarget(role)
    setDeleteModalOpen(true)
  }

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={handleAddRole}>
            <Plus className="h-4 w-4 mr-1" /> Add Role
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {rolesLoading ? (
          <ComponentFade key="skeleton">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </ComponentFade>
        ) : !roles?.length ? (
          <ComponentFade key="empty">
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No roles configured.</p>
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {roles.map((role) => (
                <motion.div key={role.id} variants={itemFadeUp}>
                  <TeamRoleCard
                    role={role}
                    members={(members ?? []).filter((m) => m.roleId === role.id)}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                  />
                </motion.div>
              ))}
            </motion.div>
          </ComponentFade>
        )}
      </AnimatePresence>

      <RoleModal open={roleModalOpen} onOpenChange={setRoleModalOpen} role={editingRole} />
      <ConfirmDeleteRoleModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} role={deleteTarget} />
    </>
  )
}
