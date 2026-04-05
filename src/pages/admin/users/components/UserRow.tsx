import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { isAdminMember } from '../../types'
import { useAdminStore } from '../../store/useAdminStore'
import { useToggleMemberActiveMutation } from '../../team/queries'
import type { TeamMember } from '../../team/types'

interface UserRowProps {
  member: TeamMember
}

export function UserRow({ member }: UserRowProps) {
  const { memberRoleCategory } = useAdminStore()
  const isAdmin = isAdminMember(memberRoleCategory)
  const { mutate: toggleActive } = useToggleMemberActiveMutation()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {member.role.shortName.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{member.displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        {member.role.name}
      </Badge>
      {isAdmin && (
        <Switch
          checked={member.isActive}
          onCheckedChange={(checked) =>
            toggleActive({ memberId: member.id, isActive: checked })
          }
        />
      )}
    </div>
  )
}
