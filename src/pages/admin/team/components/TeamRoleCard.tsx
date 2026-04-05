import { motion } from 'framer-motion'
import { Users, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cardHover } from '@/lib/animations'
import { isAdminMember } from '../../types'
import { useAdminStore } from '../../store/useAdminStore'
import type { Role, TeamMember } from '../types'

interface TeamRoleCardProps {
  role: Role
  members: TeamMember[]
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function TeamRoleCard({ role, members, onEdit, onDelete }: TeamRoleCardProps) {
  const { memberRoleCategory } = useAdminStore()
  const isAdmin = isAdminMember(memberRoleCategory)
  const activeMembers = members.filter((m) => m.isActive)

  return (
    <motion.div
      whileHover={cardHover}
      className="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {role.shortName}
          </Badge>
          <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
          <Badge variant="secondary" className="text-[10px]">
            {role.category}
          </Badge>
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(role)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(role)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {role.description && (
        <p className="text-xs text-muted-foreground">{role.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>{activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}</span>
      </div>

      {activeMembers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeMembers.map((m) => (
            <span key={m.id} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {m.displayName}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
