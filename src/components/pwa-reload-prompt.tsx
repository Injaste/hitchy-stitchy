import { useEffect } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"
import { toast } from "sonner"

/**
 * Headless component: surfaces a sonner toast when a new service-worker build
 * is ready, letting the user reload on demand (registerType "prompt").
 */
const PwaReloadPrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!needRefresh) return

    toast("A new version is available.", {
      duration: Infinity,
      action: {
        label: "Reload",
        onClick: () => void updateServiceWorker(true),
      },
    })
  }, [needRefresh, updateServiceWorker])

  return null
}

export default PwaReloadPrompt
