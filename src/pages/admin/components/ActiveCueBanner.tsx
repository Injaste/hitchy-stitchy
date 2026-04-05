import { AnimatePresence, motion } from 'framer-motion'
import { Play } from 'lucide-react'

import { useCueStore } from '../store/useCueStore'
import { itemRevealIn } from '@/lib/animations'

export function ActiveCueBanner() {
  const { activeCue, openCueModal } = useCueStore()

  return (
    <AnimatePresence>
      {activeCue && (
        <motion.button
          key="cue-banner"
          {...itemRevealIn}
          onClick={openCueModal}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary/10 border-b border-primary/20 text-sm cursor-pointer hover:bg-primary/15 transition-colors"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
            <Play className="h-3 w-3 text-primary fill-primary" />
          </span>
          <span className="font-medium text-primary">Live Now:</span>
          <span className="text-foreground truncate">{activeCue.title}</span>
          <span className="text-muted-foreground ml-auto text-xs shrink-0">
            {activeCue.timeStart}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
