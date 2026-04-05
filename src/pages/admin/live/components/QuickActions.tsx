import { AlertTriangle, CheckCircle2, Clock, Clipboard, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useAdminStore } from '../../store/useAdminStore'
import { usePingStore } from '../../store/usePingStore'
import { useInsertLogMutation } from '../queries'
import type { LiveLogType } from '../types'

const actions: { type: LiveLogType; label: string; icon: React.ElementType; msg: string }[] = [
  { type: 'help_needed', label: 'Need Help', icon: AlertTriangle, msg: 'Needs help!' },
  { type: 'running_late', label: 'On My Way', icon: Clock, msg: 'On my way!' },
  { type: 'ready', label: 'All Good', icon: CheckCircle2, msg: 'All good here!' },
  { type: 'task_done', label: 'Task Done', icon: Clipboard, msg: 'Task completed!' },
]

export function QuickActions() {
  const { eventId, memberId, memberDisplayName, memberRoleName } = useAdminStore()
  const openPing = usePingStore((s) => s.open)
  const { mutate: insertLog } = useInsertLogMutation()

  const handleAction = (action: typeof actions[number]) => {
    insertLog({
      eventId,
      memberId,
      memberDisplayName,
      role: memberRoleName,
      type: action.type,
      msg: action.msg,
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.type}
            variant="outline"
            className="h-14 flex flex-col gap-1 text-xs"
            onClick={() => handleAction(action)}
          >
            <action.icon className="h-5 w-5" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
      <Button
        variant="secondary"
        className="w-full gap-2"
        onClick={() => openPing()}
      >
        <Send className="h-4 w-4" />
        Nudge Someone
      </Button>
    </div>
  )
}
