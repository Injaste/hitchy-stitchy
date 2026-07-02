import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/custom/logo";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminStore } from "../../store/useAdminStore";
import { usePlan } from "../../hooks/usePlan";
import { useAccess } from "../../hooks/useAccess";
import { useUpgradeModalStore } from "../../plan/hooks/useUpgradeModalStore";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const AdminSidebarHeader = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { eventName, slug } = useAdminStore();
  const { planName } = usePlan();
  const { isSuperAdmin } = useAccess();
  const openUpgrade = useUpgradeModalStore((s) => s.open);

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            className={cn(
              "relative",
              !isMobile && state === "collapsed" && "group/logo",
            )}
          >
            <SidebarMenuButton
              size="lg"
              className={cn(
                "pointer-events-none gap-0",
                !isMobile &&
                  state === "collapsed" &&
                  "group-hover/logo:opacity-0",
              )}
            >
              <Logo
                className="shrink-0 -mb-1"
                imageClassName={
                  !isMobile && state === "collapsed"
                    ? "size-11 -ml-1"
                    : "size-12"
                }
              />
              <AnimatePresence initial={false}>
                {(state === "expanded" || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{
                      opacity: 1,
                      width: "100%",
                      transition: { duration: 0.2, ease: "easeInOut" },
                    }}
                    exit={{
                      opacity: 0,
                      width: 0,
                      transition: { duration: 0.15, ease: "easeInOut" },
                    }}
                    className="grid text-left text-sm leading-tight overflow-hidden"
                  >
                    <span className="font-bold truncate">{eventName}</span>
                    <div className="flex justify-between items-center gap-1.5">
                      <span className="truncate text-xs">{slug}</span>
                      {isSuperAdmin ? (
                        <Badge variant="action" asChild className="pointer-events-auto">
                          <button onClick={() => openUpgrade()}>{planName}</button>
                        </Badge>
                      ) : (
                        <Badge variant="outline">{planName}</Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SidebarMenuButton>

            {!isMobile && state === "collapsed" && (
              <SidebarTrigger className="absolute inset-0 h-full w-full rounded-full opacity-0 transition-opacity group-hover/logo:opacity-100" />
            )}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export default AdminSidebarHeader;
