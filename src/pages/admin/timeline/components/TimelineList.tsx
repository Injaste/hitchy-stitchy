import { motion } from 'framer-motion'
import { container, itemFadeUp } from '@/lib/animations'
import type { TimelineEvent } from '../types'
import { TimelineEventCard } from './TimelineEventCard'

interface TimelineListProps {
  events: TimelineEvent[]
  onEdit: (event: TimelineEvent) => void
  onStartCue: (event: TimelineEvent) => void
}

export function TimelineList({ events, onEdit, onStartCue }: TimelineListProps) {
  if (!events.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">No events for this day yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Tap the + button to add one.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      {events.map((event) => (
        <motion.div key={event.id} variants={itemFadeUp}>
          <TimelineEventCard
            event={event}
            onEdit={onEdit}
            onStartCue={onStartCue}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
