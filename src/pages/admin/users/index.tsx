import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { ComponentFade } from '@/components/animations/animate-component-fade'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { container, itemFadeUp } from '@/lib/animations'

import { isAdminMember } from '../types'
import { useAdminStore } from '../store/useAdminStore'
import { useTeamMembersQuery } from '../team/queries'

import { UserRow } from './components/UserRow'
import { InviteMemberModal } from './components/modals/InviteMemberModal'

export function UsersTab() {
  const { memberRoleCategory } = useAdminStore()
  const isAdmin = isAdminMember(memberRoleCategory)
  const { data: members, isLoading } = useTeamMembersQuery()

  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Invite Member
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </ComponentFade>
        ) : !members?.length ? (
          <ComponentFade key="empty">
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No members yet.</p>
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <motion.div
              variants={container} initial="hidden" animate="show"
              className="space-y-2"
            >
              {members.map((member) => (
                <motion.div key={member.id} variants={itemFadeUp}>
                  <UserRow member={member} />
                </motion.div>
              ))}
            </motion.div>
          </ComponentFade>
        )}
      </AnimatePresence>

      <InviteMemberModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  )
}
