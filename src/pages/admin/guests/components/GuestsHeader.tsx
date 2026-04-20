import type { FC } from "react"
import { Plus, RefreshCw, Upload, Download } from "lucide-react"
import { AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ComponentFade } from "@/components/animations/animate-component-fade"

import { useAccess } from "../../hooks/useAccess"
import { useRefetch } from "../../hooks/useRefetch"
import { useGuestModalStore } from "../hooks/useGuestModalStore"
import { downloadGuestTemplate } from "../utils"
import type { Guest } from "../types"

interface GuestsHeaderProps {
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  refetch: () => void
  data?: Guest[]
}

const GuestsHeader: FC<GuestsHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
  data,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch)
  const { canCreate } = useAccess()
  const openCreate = useGuestModalStore((s) => s.openCreate)
  const openImport = useGuestModalStore((s) => s.openImport)

  const showActions = !isLoading && !isError
  const total = data?.length ?? 0
  const confirmed = data?.filter((g) => g.status === "confirmed").length ?? 0
  const canAdd = canCreate("rsvp")

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs tracking-wide text-muted-foreground/60 font-sans">
        {!isLoading && !isError && total > 0 && (
          <>
            <span>
              {total} {total === 1 ? "guest" : "guests"}
            </span>
            {confirmed > 0 && (
              <>
                <span className="mx-1.5">·</span>
                <span>{confirmed} confirmed</span>
              </>
            )}
          </>
        )}
      </p>

      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key="actions">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground/60 hover:text-muted-foreground"
                onClick={handleRefresh}
                disabled={!canRefresh}
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
              </Button>

              {canAdd && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2 text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                  onClick={downloadGuestTemplate}
                >
                  <Download className="w-4 h-4" />
                  Template
                </Button>
              )}

              {canAdd && (
                <Button size="sm" variant="outline" onClick={openImport} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
              )}

              {canAdd && (
                <Button size="sm" variant="default" onClick={openCreate} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add guest
                </Button>
              )}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GuestsHeader
