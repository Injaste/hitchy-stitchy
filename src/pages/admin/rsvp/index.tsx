import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ComponentFade } from '@/components/animations/animate-component-fade'
import { Skeleton } from '@/components/ui/skeleton'

import { useRSVPQuery } from './queries'
import type { RSVPEntry } from './types'

import { RSVPStats } from './components/RSVPStats'
import { RSVPTable } from './components/RSVPTable'
import { RSVPDetailModal } from './components/modals/RSVPDetailModal'

export function RSVPTab() {
  const { data: rsvps, isLoading } = useRSVPQuery()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedRSVP, setSelectedRSVP] = useState<RSVPEntry | null>(null)

  const handleViewDetail = (rsvp: RSVPEntry) => {
    setSelectedRSVP(rsvp)
    setDetailModalOpen(true)
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </ComponentFade>
        ) : !rsvps?.length ? (
          <ComponentFade key="empty">
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No RSVPs yet.</p>
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <RSVPStats rsvps={rsvps} />
            <RSVPTable rsvps={rsvps} onViewDetail={handleViewDetail} />
          </ComponentFade>
        )}
      </AnimatePresence>

      <RSVPDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} rsvp={selectedRSVP} />
    </>
  )
}
