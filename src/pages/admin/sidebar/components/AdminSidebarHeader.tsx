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
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const AdminSidebarHeader = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const { eventName, slug } = useAdminStore();

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
                "pointer-events-none",
                !isMobile &&
                  state === "collapsed" &&
                  "group-hover/logo:opacity-0",
              )}
            >
              <Logo className="shrink-0" imageClassName="size-12 -mb-3" />
              <AnimatePresence initial={false}>
                {(state === "expanded" || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{
                      opacity: 1,
                      width: "auto",
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
                    <span className="truncate text-xs">{slug}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </SidebarMenuButton>

            {!isMobile && state === "collapsed" && (
              <SidebarTrigger className="absolute inset-0 h-full w-full rounded-full opacity-0 transition-opacity duration-200 group-hover/logo:opacity-100" />
            )}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export default AdminSidebarHeader;
