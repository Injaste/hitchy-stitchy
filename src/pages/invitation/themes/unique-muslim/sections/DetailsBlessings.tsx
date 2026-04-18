import { motion } from "framer-motion"
import { fadeUp, fadeIn, divider } from "../animations"

interface DetailsBlessingsProps {
  blessingsName: string | null
  blessingsLabel: string | null
}

const dividerV = divider()

const DetailsBlessings = ({ blessingsName, blessingsLabel }: DetailsBlessingsProps) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-60px" }}
    className="mb-14 sm:mb-20"
  >
    <motion.p
      variants={fadeIn(0)}
      className="text-muted-foreground mb-3 sm:mb-4 uppercase tracking-[0.4em] text-2xs sm:text-xs font-bold"
    >
      With the blessings of
    </motion.p>
    {blessingsName && (
      <motion.h3
        variants={fadeUp(0.1, 20, 0.8)}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2"
      >
        {blessingsName}
      </motion.h3>
    )}
    {blessingsLabel && (
      <motion.p
        variants={fadeUp(0.2, 12, 0.7)}
        className="text-foreground/70 italic text-sm sm:text-base"
      >
        {blessingsLabel}
      </motion.p>
    )}
    <motion.div
      variants={dividerV}
      style={{ originX: "50%" }}
      className="w-12 sm:w-16 h-px bg-primary/30 mx-auto mt-5 sm:mt-6"
    />
  </motion.div>
)

export default DetailsBlessings
