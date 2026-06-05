import * as React from "react"
import { BREAKPOINTS, type Breakpoint } from "@/lib/breakpoints"

/** True when the viewport width is at or above the given breakpoint. */
export function useMediaBreakpointUp(breakpoint: Breakpoint) {
  const min = BREAKPOINTS[breakpoint]
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${min}px)`)
    const onChange = () => setMatches(window.innerWidth >= min)
    mql.addEventListener("change", onChange)
    setMatches(window.innerWidth >= min)
    return () => mql.removeEventListener("change", onChange)
  }, [min])

  return !!matches
}

/** True when the viewport width is below the given breakpoint. */
export function useMediaBreakpointDown(breakpoint: Breakpoint) {
  const max = BREAKPOINTS[breakpoint]
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${max - 1}px)`)
    const onChange = () => setMatches(window.innerWidth < max)
    mql.addEventListener("change", onChange)
    setMatches(window.innerWidth < max)
    return () => mql.removeEventListener("change", onChange)
  }, [max])

  return !!matches
}

/** Convenience: below the `md` breakpoint. */
export function useIsMobile() {
  return useMediaBreakpointDown("md")
}
