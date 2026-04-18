import { Plus, LayoutTemplate } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { ComponentFade } from "@/components/animations/animate-component-fade"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ErrorState from "@/components/custom/error-state"

import { usePagesQuery } from "./queries"
import { usePagesModalStore } from "./hooks/usePagesModalStore"
import PageCard from "./components/PageCard"
import PageEditor from "./components/PageEditor"
import PagesModals from "./modals"

const PagesView = () => {
  const { data: pages, isLoading, isError, refetch, isRefetching } = usePagesQuery()
  const { openThemePicker, editingPage, closeEditor } = usePagesModalStore()

  if (editingPage) {
    return <PageEditor page={editingPage} onBack={closeEditor} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-semibold">Invitation Pages</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your invitation pages.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openThemePicker}>
          <Plus className="h-4 w-4" />
          Create Page
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <ComponentFade key="skeleton">
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-[72px] rounded-xl" />
              ))}
            </div>
          </ComponentFade>
        ) : isError ? (
          <ComponentFade key="error">
            <ErrorState
              message="We couldn't load your pages. Please try again."
              onRetry={refetch}
              isRetrying={isRefetching}
            />
          </ComponentFade>
        ) : !pages?.length ? (
          <ComponentFade key="empty">
            <div className="rounded-xl border-2 border-dashed border-border py-16 text-center space-y-3">
              <LayoutTemplate className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No invitation pages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first page by picking a theme.
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-2" onClick={openThemePicker}>
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </div>
          </ComponentFade>
        ) : (
          <ComponentFade key="content">
            <div className="space-y-3">
              {pages.map((page) => (
                <PageCard key={page.id} page={page} />
              ))}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>

      <PagesModals />
    </div>
  )
}

export default PagesView
