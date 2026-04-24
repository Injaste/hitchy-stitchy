import type { FC, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { useRefetch } from "@/pages/admin/hooks/useRefetch";

export interface BaseHeaderProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

interface PageHeaderProps extends BaseHeaderProps {
  description: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({
  description,
  meta,
  action,
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  const { handleRefresh, canRefresh } = useRefetch(refetch);
  const showActions = !isLoading && !isError;

  return (
    <div className="flex justify-between gap-4">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground/60">{description}</p>
        {meta && (
          <div className="text-sm tracking-wide text-muted-foreground">
            {meta}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key="actions">
            <div className="grid grid-cols-2 items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-fit ml-auto"
                onClick={handleRefresh}
                disabled={!canRefresh}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              {action}
            </div>
          </ComponentFade>
        )}
      </AnimatePresence>
    </div>
  );
};
