import type { FC } from "react"
import type { LucideIcon } from "lucide-react"
import { CalendarCheck } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { fadeUp, scaleIn } from "../animations"

export interface DetailsCardItem {
  icon: LucideIcon
  title: string
  detail: string
  sub: string
}

interface DetailsCardsProps {
  detailsList: DetailsCardItem[]
  googleCalendarUrl: string | null
}

const DetailsCards: FC<DetailsCardsProps> = ({ detailsList, googleCalendarUrl }) => (
  <>
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 md:gap-12 mb-14 sm:mb-16"
    >
      {detailsList.map((item, idx) => (
        <motion.div key={idx} variants={fadeUp(idx * 0.15, 28, 0.7)} className="group flex flex-col items-center">
          <motion.div
            variants={scaleIn(idx * 0.15 + 0.05)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/20"
          >
            <item.icon size={28} />
          </motion.div>
          <h4 className="font-bold text-base sm:text-xl mb-1 sm:mb-2 text-foreground">{item.title}</h4>
          <p className="font-display text-primary font-bold text-base sm:text-lg">{item.detail}</p>
          <p className="text-muted-foreground text-xs sm:text-sm italic">{item.sub}</p>
        </motion.div>
      ))}
    </motion.div>

    {googleCalendarUrl && (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-12 sm:mb-16"
      >
        <motion.div variants={fadeUp(0, 12, 0.7)}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs sm:text-sm tracking-wide uppercase h-10 sm:h-11 px-5 sm:px-6"
            >
              <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarCheck size={16} className="text-primary" />
                Add to Google Calendar
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </>
)

export default DetailsCards
