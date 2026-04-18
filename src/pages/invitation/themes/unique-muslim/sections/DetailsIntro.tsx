import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { fadeUp, fadeIn } from "../animations"

interface DetailsIntroProps {
  sectionTitle: string
  invitationBody: string
}

const DetailsIntro = ({ sectionTitle, invitationBody }: DetailsIntroProps) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    className="mb-16 sm:mb-24"
  >
    <motion.div variants={fadeIn(0)}>
      <Sparkles className="text-primary mx-auto mb-5 sm:mb-6" size={28} />
    </motion.div>
    <motion.h3
      variants={fadeUp(0.1, 20, 0.7)}
      className="text-3xl sm:text-4xl font-bold text-primary mb-4 sm:mb-6 italic"
    >
      {sectionTitle}
    </motion.h3>
    <motion.p
      variants={fadeUp(0.25, 16, 0.8)}
      className="text-sm sm:text-base md:text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto italic"
    >
      "{invitationBody}"
    </motion.p>
  </motion.div>
)

export default DetailsIntro
