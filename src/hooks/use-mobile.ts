import * as React from "react"
import { BREAKPOINTS } from "@/lib/breakpoints"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsAboveLg() {
  const [isAboveLg, setIsAboveLg] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    const onChange = () => {
      setIsAboveLg(window.innerWidth >= BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsAboveLg(window.innerWidth >= BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isAboveLg
}
