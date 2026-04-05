import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle, CheckCircle2, Clock, Clipboard, Send, Play, FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { useLiveLogsQuery } from '../queries'
import type { LiveLogType } from '../types'

const typeIcons: Record<LiveLogType, React.ElementType> = {
  help_needed: AlertTriangle,
  task_done: Clipboard,
  running_late: Clock,
  ready: CheckCircle2,
  ping: Send,
  cue_started: Play,
  note: FileText,
}

export function LiveFeed() {
  const { data: logs } = useLiveLogsQuery()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Live Feed</h3>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {(logs ?? []).map((log) => {
          const Icon = typeIcons[log.type]
          return (
            <div key={log.id} className="flex items-start gap-2 rounded-lg border border-border p-2.5">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {log.role}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-0.5">{log.msg}</p>
              </div>
            </div>
          )
        })}
        {!logs?.length && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No activity yet.
          </p>
        )}
      </div>
    </div>
  )
}
