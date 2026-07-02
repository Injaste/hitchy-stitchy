import type { ComponentProps, FC, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useHasScrolled } from "@/hooks/use-has-scrolled";
import { useIsMobile } from "@/hooks/use-media-query";
import { usePageTitle } from "@/hooks/use-page-title";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import Container from "./container";
import { cn } from "@/lib/utils";
import { Z } from "@/lib/z-index";
import { HeaderActions, type BaseHeaderProps } from "./page-header-base";

interface AdminPageHeaderProps extends BaseHeaderProps {
  title: string;
  titleSuffix?: ReactNode;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  collapseMeta?: boolean;
  lockOpen?: boolean;
  /** Constrain the header content width to match a narrower page body. */
  containerSize?: ComponentProps<typeof Container>["size"];
}

const SidebarTriggerSection: FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { state } = useSidebar();
  const show = isMobile || state === "expanded";
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="trigger-group"
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: "auto",
            opacity: 1,
            transition: { duration: 0.25, ease: "easeInOut" },
          }}
          exit={{
            width: 0,
            opacity: 0,
            transition: { duration: 0.2, ease: "easeInOut" },
          }}
          className="flex shrink-0 items-center overflow-hidden"
        >
          <SidebarTrigger className="-ml-2 hover:bg-transparent!" />
          <Separator
            orientation="vertical"
            className="ml-1 mr-2 h-5 w-2 my-auto"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const AdminPageHeader: FC<AdminPageHeaderProps> = ({
  title,
  titleSuffix,
  description,
  meta,
  action,
  isLoading = false,
  isError = false,
  isRefetching = false,
  refetch,
  collapseMeta = false,
  lockOpen = false,
  containerSize,
}) => {
  const { eventName } = useAdminStore();
  const isMobile = useIsMobile();
  const hasScrolled = useHasScrolled(lockOpen);
  const collapsed = collapseMeta && hasScrolled;

  usePageTitle(eventName ? `${eventName} | ${title}` : title);

  return (
    <>
      <div
        style={{ zIndex: Z.header }}
        className="-mx-3 md:-mx-6 px-4 md:px-6 sticky top-0 pt-4 pb-3 bg-background"
      >
        <Container size={containerSize}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0">
              <SidebarTriggerSection isMobile={isMobile} />
              <div className="flex min-w-0 items-center gap-1.5">
                <h1 className="shrink-0 text-xl font-semibold">{title}</h1>
                {titleSuffix && (
                  <>
                    <span className="shrink-0 text-base font-normal text-muted-foreground/50">
                      •
                    </span>
                    {titleSuffix}
                  </>
                )}
              </div>
            </div>
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
            "pointer-events-none absolute inset-x-0 top-full h-8 bg-linear-to-b from-background to-transparent transition-opacity",
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
        // Only clip while a page actually collapses its meta — otherwise the
        // hidden overflow slices focus rings on controls living in the meta row.
        style={{ overflow: collapseMeta ? "hidden" : undefined }}
      >
        <Container size={containerSize}>
          {description && (
            <p className="text-sm text-muted-foreground/80">{description}</p>
          )}
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
