import type { FC, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import ComponentFade from "@/components/animations/animate-component-fade";
import useRefetch from "@/hooks/use-refetch";
import { useHasScrolled } from "@/hooks/use-has-scrolled";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface BaseHeaderProps {
  isLoading?: boolean;
  isError?: boolean;
  isRefetching?: boolean;
  refetch?: () => void;
}

export const ActionLabel: FC<{
  children: ReactNode;
  lockOpen?: boolean;
  side?: "left" | "right";
}> = ({ children, lockOpen = false, side = "left" }) => {
  const hasScrolled = useHasScrolled(lockOpen);
  return (
    <motion.span
      initial={false}
      animate={{
        width: hasScrolled ? 0 : "auto",
        opacity: hasScrolled ? 0 : 1,
        paddingLeft: hasScrolled ? 0 : side === "left" ? 6 : 0,
        paddingRight: hasScrolled ? 0 : side === "right" ? 6 : 0,
      }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden whitespace-nowrap"
    >
      {children}
    </motion.span>
  );
};

interface HeaderActionsProps extends BaseHeaderProps {
  action?: ReactNode;
}

export const HeaderActions: FC<HeaderActionsProps> = ({
  refetch,
  action,
  isLoading = false,
  isError = false,
  isRefetching = false,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch ?? (() => {}));
  const showActions = !isLoading && !isError;

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
};
