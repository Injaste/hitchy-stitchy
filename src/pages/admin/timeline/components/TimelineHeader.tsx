import type { FC } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAccess } from "../../hooks/useAccess";
import { useTimelineModalStore } from "../hooks/useTimelineStore";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { AnimatePresence } from "framer-motion";
import { useRefetch } from "../../hooks/useRefetch";

interface TimelineHeaderProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const TimelineHeader: FC<TimelineHeaderProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch);
  const { canCreate } = useAccess();
  const openCreate = useTimelineModalStore((s) => s.openCreate);

  const showActions = !isLoading && !isError;

  return (
    <div className="flex items-center justify-between">
      <p className="text-xl font-serif font-bold text-muted-foreground">
        Timeline description
      </p>
      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key={showActions.toString()}>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={handleRefresh}
                disabled={!canRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canCreate("timeline") && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={openCreate}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Timeline
                </Button>
              )}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineHeader;
