import { motion } from "framer-motion"
import { fadeUp, fadeIn, divider } from "../animations"

interface FooterProps {
  couple_names?: string | null
}

const dividerV = divider()

const Footer = ({ couple_names }: FooterProps) => {
  const year = new Date().getFullYear()
  const displayName = couple_names ?? "Our Wedding"

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-12 sm:mt-16 text-center relative"
    >
      <motion.div
        variants={dividerV}
        style={{ originX: "50%" }}
        className="w-10 sm:w-12 h-px bg-primary/30 mx-auto mb-6 sm:mb-8"
      />
      <motion.p
        variants={fadeUp(0.1, 12, 0.7)}
        className="mb-3 sm:mb-4 italic text-muted-foreground text-sm sm:text-base"
      >
        With love and prayers,
      </motion.p>
      <motion.h2
        variants={fadeUp(0.2, 16, 0.8)}
        className="font-bold text-primary-foreground [text-shadow:2px_2px_0_#d4af37,-2px_-2px_0_#d4af37,2px_-2px_0_#d4af37,-2px_2px_0_#d4af37] text-2xl sm:text-3xl italic"
      >
        {displayName}
      </motion.h2>
      <motion.div variants={fadeIn(0.35, 1)} className="-mt-8 sm:-mt-10 mb-4">
        <img
          className="w-full max-w-[260px] sm:max-w-sm aspect-square object-contain mx-auto"
          src="/dannad.png"
          alt="dannad"
        />
      </motion.div>
      <motion.p
        variants={fadeIn(0.5, 0.8)}
        className="text-muted-foreground/60 text-2xs uppercase tracking-[0.3em]"
      >
        © {year} {displayName} Wedding
      </motion.p>
    </motion.div>
  )
}

export default Footer
