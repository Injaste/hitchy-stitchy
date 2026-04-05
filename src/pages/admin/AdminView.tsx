import { Outlet, useOutlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ComponentFade } from "@/components/animations/animate-component-fade";

import { useAdminStore } from "./store/useAdminStore";
import { useBootstrap } from "./hooks/useBootstrap";
import useActivePage from "./hooks/useActivePage";
import { isAdminMember } from "./types";

import AdminSidebar from "./components/sidebar/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { ActiveCueBanner } from "./components/ActiveCueBanner";
import AdminSkeletonLayout from "./components/AdminSkeletonLayout";
import AdminErrorLayout from "./components/AdminErrorLayout";
import { PingModal } from "./modals/PingModal";
import { ActiveCueModal } from "./modals/ActiveCueModal";

const AdminView = () => {
  useBootstrap();
  const currentOutlet = useOutlet();
  const { isBootstrapped, bootstrapError, memberRoleCategory } =
    useAdminStore();
  const activePage = useActivePage();
  const isAdmin = isAdminMember(memberRoleCategory);
  const showFAB =
    (activePage === "timeline" || activePage === "checklist") && isAdmin;

  return (
    <AnimatePresence mode="wait">
      {bootstrapError ? (
        <ComponentFade key="error">
          <AdminErrorLayout errorMessage={bootstrapError} />
        </ComponentFade>
      ) : !isBootstrapped ? (
        <ComponentFade key="loading">
          <AdminSkeletonLayout />
        </ComponentFade>
      ) : (
        <ComponentFade key="app">
          <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <ActiveCueBanner />
              <AdminTopbar />
              <div className="px-4 md:px-6 py-6 md:py-8">
                <AnimatePresence mode="wait">
                  <ComponentFade key={activePage}>
                    {currentOutlet}
                  </ComponentFade>
                </AnimatePresence>
              </div>
            </SidebarInset>
            {showFAB && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                <Plus className="h-6 w-6" />
              </motion.button>
            )}
            <PingModal />
            <ActiveCueModal />
          </SidebarProvider>
        </ComponentFade>
      )}
    </AnimatePresence>
  );
};

export default AdminView;
