import type { FC, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useRefetch } from "@/pages/admin/hooks/useRefetch";
import { useHasScrolled } from "@/hooks/use-has-scrolled";
import { widthReveal } from "@/lib/animations";
import { SidebarTrigger } from "../ui/sidebar";
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
}

export const ActionLabel: FC<{ children: ReactNode }> = ({ children }) => {
  const hasScrolled = useHasScrolled();
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
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch ?? (() => {}));
  const showActions = !isLoading && !isError;

  const hasScrolled = useHasScrolled();
  const collapsed = collapseMeta && hasScrolled;

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
              <SidebarTrigger className="-ml-2 hover:bg-transparent!" />
              <Separator
                orientation="vertical"
                className="ml-1 mr-2 h-5 w-2 my-auto"
              />
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
