import type { FC } from "react"
import { MapPinCheck } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { fadeUp, fadeIn } from "../animations"

interface DetailsMapProps {
  embed_url: string
  address: string | null
  map_link: string | null
}

const DetailsMap: FC<DetailsMapProps> = ({ embed_url, address, map_link }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-40px" }}
    className="w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl bg-card/50 border border-primary/10 overflow-hidden shadow-sm p-2 sm:p-4"
  >
    <motion.div variants={fadeIn(0, 0.9)} className="relative w-full aspect-4/3">
      <iframe
        src={embed_url}
        className="absolute inset-0 w-full h-full border-0 rounded-xl sm:rounded-2xl"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </motion.div>
    <motion.div
      variants={fadeUp(0.15, 10, 0.6)}
      className="p-4 sm:p-5 pb-2 sm:pb-0 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      {address && (
        <p className="text-foreground/70 italic text-xs sm:text-sm text-center sm:text-left">{address}</p>
      )}
      {map_link && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-primary/30 hover:border-primary/60 gap-2 font-bold text-xs tracking-wide uppercase shrink-0"
          >
            <a href={map_link} target="_blank" rel="noopener noreferrer">
              <MapPinCheck size={14} className="text-primary" />
              View Map
            </a>
          </Button>
        </motion.div>
      )}
    </motion.div>
  </motion.div>
)

export default DetailsMap
