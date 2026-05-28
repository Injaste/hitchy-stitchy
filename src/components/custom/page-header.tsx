import type { FC, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useRefetch } from "@/pages/admin/hooks/useRefetch";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useHasScrolled } from "@/hooks/use-has-scrolled";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePageTitle } from "@/hooks/use-page-title";
import { widthReveal } from "@/lib/animations";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import Container from "./container";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface BaseHeaderProps {
  isLoading?: boolean;
  isError?: boolean;
  isRefetching?: boolean;
  refetch?: () => void;
}

interface PageHeaderProps extends BaseHeaderProps {
  title: string;
  description: string;
  meta?: ReactNode;
  action?: ReactNode;
  /**
   * When true, the description + meta block animates to height 0 while
   * the nearest scroll source is past 0. Use on pages that don't scroll
   * themselves (e.g. tasks board with per-column scroll) so the focus
   * mode still kicks in. Default false (legacy behavior — block stays
   * in flow and scrolls away naturally).
   */
  collapseMeta?: boolean;
  /**
   * When true, treats the page as un-scrolled regardless of actual scroll
   * position — gradient, ActionLabel, and collapseMeta effects all freeze
   * in their resting state. Use while a drag is active so the header
   * doesn't react to per-column scroll sources.
   */
  lockOpen?: boolean;
  /**
   * Set to false on pages without a SidebarProvider ancestor (e.g. dashboard).
   * SidebarTrigger calls useSidebar() which throws outside a SidebarProvider.
   * Default true.
   */
  showSidebarTrigger?: boolean;
}

export const ActionLabel: FC<{ children: ReactNode; lockOpen?: boolean }> = ({ children, lockOpen = false }) => {
  const hasScrolled = useHasScrolled(lockOpen);
  return (
    <AnimatePresence initial={false}>
      {!hasScrolled && (
        <motion.span
          key="action-label"
          variants={widthReveal}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="overflow-hidden whitespace-nowrap"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

// Must only be rendered inside a SidebarProvider (when showSidebarTrigger=true).
// Shows trigger in page header only when desktop-expanded or mobile.
const SidebarTriggerSection: FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { state } = useSidebar();
  const show = isMobile || state === "expanded";
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="trigger-group"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeInOut" } }}
          exit={{ width: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
          className="flex items-center overflow-hidden"
        >
          <SidebarTrigger className="-ml-2 hover:bg-transparent!" />
          <Separator orientation="vertical" className="ml-1 mr-2 h-5 w-2 my-auto" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  meta,
  action,
  isLoading = false,
  isError = false,
  isRefetching = false,
  refetch,
  collapseMeta = false,
  lockOpen = false,
  showSidebarTrigger = true,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch ?? (() => {}));
  const showActions = !isLoading && !isError;

  const { eventName } = useAdminStore();
  const isMobile = useIsMobile();
  const hasScrolled = useHasScrolled(lockOpen);
  const collapsed = collapseMeta && hasScrolled;

  usePageTitle(showSidebarTrigger && eventName ? `${eventName} | ${title}` : title);

  function renderActions() {
    if (!refetch && !action) return null;
    return (
      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key="actions">
            <div className="flex items-start gap-2">
              {refetch && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRefresh}
                      disabled={!canRefresh}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {action}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-30 -mx-3 md:-mx-6 px-4 md:px-6 pt-4 pb-3 bg-background">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0">
              {showSidebarTrigger && <SidebarTriggerSection isMobile={isMobile} />}
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>

            <div className="shrink-0">{renderActions()}</div>
          </div>
        </Container>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-full h-8 bg-linear-to-b from-background to-transparent transition-opacity duration-200",
            hasScrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <motion.div
        initial={false}
        animate={
          collapsed
            ? { height: 0, opacity: 0, marginTop: 0 }
            : { height: "auto", opacity: 1, marginTop: 0 }
        }
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{ overflow: "hidden" }}
      >
        <Container>
          <p className="text-sm text-muted-foreground/80">{description}</p>
          {meta && (
            <div className="text-sm tracking-wide text-muted-foreground pt-3">
              {meta}
            </div>
          )}
        </Container>
      </motion.div>
    </>
  );
};
