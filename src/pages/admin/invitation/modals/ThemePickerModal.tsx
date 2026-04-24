import { useState, type FC } from "react"
import { Palette } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { themeRegistry } from "@/pages/templates/themes"
import { useAdminStore } from "@/pages/admin/store/useAdminStore"
import { useThemesQuery, usePagesMutations } from "../queries"
import type { EventTheme } from "../types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ThemePickerModal: FC<Props> = ({ open, onOpenChange }) => {
  const { eventId } = useAdminStore()
  const { data: themes, isLoading } = useThemesQuery()
  const { create } = usePagesMutations()
  const [selectedTheme, setSelectedTheme] = useState<EventTheme | null>(null)

  const handleCreate = () => {
    if (!selectedTheme || !eventId) return
    const entry = themeRegistry[selectedTheme.slug]
    create.mutate({
      event_id: eventId,
      template_id: selectedTheme.id,
      name: "My Invitation",
      config: entry?.defaultConfig ?? { _theme_slug: selectedTheme.slug },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Theme</DialogTitle>
          <DialogDescription>
            Select a design theme for your invitation page.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !themes?.length ? (
          <div className="py-10 text-center">
            <Palette className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No themes available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => {
              const isSelected = selectedTheme?.id === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={[
                    "rounded-xl border-2 p-4 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  ].join(" ")}
                >
                  <p className="font-medium text-sm">{theme.name}</p>
                  {theme.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {theme.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedTheme || create.isPending}
          >
            Create Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ThemePickerModal
