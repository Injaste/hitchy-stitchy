import type { FC, ReactNode } from "react";

import { useHasScrolled } from "@/hooks/use-has-scrolled";
import { usePageTitle } from "@/hooks/use-page-title";
import Container from "./container";
import { cn } from "@/lib/utils";
import { HeaderActions, type BaseHeaderProps } from "./page-header-base";

interface DashboardPageHeaderProps extends BaseHeaderProps {
  title: string;
  description: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export const DashboardPageHeader: FC<DashboardPageHeaderProps> = ({
  title,
  description,
  meta,
  action,
  isLoading = false,
  isError = false,
  isRefetching = false,
  refetch,
}) => {
  const hasScrolled = useHasScrolled();

  usePageTitle(title);

  return (
    <>
      <div className="sticky top-0 z-30 px-4 md:px-6 pt-4 pb-3 bg-background">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold">{title}</h1>
            <div className="shrink-0">
              <HeaderActions
                refetch={refetch}
                action={action}
                isLoading={isLoading}
                isError={isError}
                isRefetching={isRefetching}
              />
            </div>
          </div>
        </Container>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-full h-8 bg-linear-to-b from-background to-transparent transition-opacity duration-200",
            hasScrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <div className="px-4 md:px-6">
        <Container>
          <p className="text-sm text-muted-foreground/80">{description}</p>
          {meta && (
            <div className="text-sm tracking-wide text-muted-foreground pt-3">
              {meta}
            </div>
          )}
        </Container>
      </div>
    </>
  );
};
