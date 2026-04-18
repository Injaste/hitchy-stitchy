import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

import type { ThemeProps } from "@/pages/invitation/themes/types"
import { resolveConfig } from "./config"
import Hero from "./Hero"
import Details from "./Details"
import RSVP from "./RSVP"
import FloatingIcons from "./FloatingIcons"

const UniqueMuslim = ({ eventConfig, pageConfig }: ThemeProps) => {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const { background_image } = resolveConfig(pageConfig)

  return (
    <div ref={containerRef} className="font-medium">
      <motion.div
        className="fixed top-0 bottom-0 right-0 w-1 bg-primary z-50 origin-top"
        style={{ scaleY: scaleProgress }}
      />

      <img
        className="fixed inset-0 w-full h-full aspect-square object-contain opacity-50"
        src={background_image}
        alt=""
      />

      <Hero eventConfig={eventConfig} />
      <Details eventConfig={eventConfig} />
      <RSVP eventConfig={eventConfig} />
      <FloatingIcons />
    </div>
  )
}

export default UniqueMuslim
