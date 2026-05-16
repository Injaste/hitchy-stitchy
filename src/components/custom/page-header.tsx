import type { FC, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import { useRefetch } from "@/pages/admin/hooks/useRefetch";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";

export interface BaseHeaderProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

interface PageHeaderProps extends BaseHeaderProps {
  title: string;
  description: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
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

  function renderActions() {
    return (
      <AnimatePresence mode="wait">
        {showActions && (
          <ComponentFade key="actions">
            <div className="grid grid-cols-2 gap-2">
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
    );
  }

  return (
    <div className="flex justify-between gap-4">
      <div className="space-y-6 w-full">
        <div className="space-y-1">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-2 hover:bg-transparent!" />
            <Separator
              orientation="vertical"
              className="ml-1 mr-2 h-5 w-2 my-auto"
            />
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground/80">{description}</p>
        </div>
        {meta && (
          <div className="text-sm tracking-wide text-muted-foreground flex justify-between">
            {meta}
            <div className="block lg:hidden">{renderActions()}</div>
          </div>
        )}
      </div>

      <div className="hidden lg:block shrink-0">{renderActions()}</div>
    </div>
  );
};
