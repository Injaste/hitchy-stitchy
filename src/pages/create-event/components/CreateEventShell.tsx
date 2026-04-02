import { motion } from "framer-motion"
import { CalendarHeart } from "lucide-react"
import { scaleIn, fadeUp } from "../animations"
import CreateEventWizard from "./CreateEventWizard"

export default function CreateEventShell() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="show"
          variants={scaleIn(0.1)}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">Cozynosy</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Wedding Admin
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp(0.15)}
          className="bg-card rounded-2xl border border-border shadow-sm p-8"
        >
          <CreateEventWizard />
        </motion.div>
      </div>
    </div>
  )
}
