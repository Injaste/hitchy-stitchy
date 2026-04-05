import { motion } from 'framer-motion'
import { Clock, Play, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cardHover } from '@/lib/animations'
import { isAdminMember } from '../../types'
import { useAdminStore } from '../../store/useAdminStore'
import type { TimelineEvent } from '../types'

interface TimelineEventCardProps {
  event: TimelineEvent
  onEdit: (event: TimelineEvent) => void
  onStartCue: (event: TimelineEvent) => void
}

export function TimelineEventCard({ event, onEdit, onStartCue }: TimelineEventCardProps) {
  const { memberRoleCategory } = useAdminStore()
  const isAdmin = isAdminMember(memberRoleCategory)

  return (
    <motion.div
      whileHover={cardHover}
      onClick={() => onEdit(event)}
      className="group relative flex gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer transition-colors hover:border-primary/30"
    >
      {/* Time column */}
      <div className="flex flex-col items-center shrink-0 w-16">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{event.timeStart}</span>
        </div>
        {event.isMainEvent && (
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {event.description}
          </p>
        )}
        {event.assignees.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.assignees.map((a) => (
              <Badge key={a.roleId} variant="secondary" className="text-[10px] px-1.5 py-0">
                {a.roleShortName}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Start cue button (admin only) */}
      {isAdmin && !event.startedAt && (
        <Button
          variant="ghost" size="icon"
          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onStartCue(event) }}
        >
          <Play className="h-4 w-4 text-primary" />
        </Button>
      )}

      {/* Started indicator */}
      {event.startedAt && (
        <Badge variant="outline" className="shrink-0 text-[10px] border-primary/30 text-primary">
          Started
        </Badge>
      )}
    </motion.div>
  )
}
