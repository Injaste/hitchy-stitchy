import { useOutlet } from "react-router-dom";
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
import PortalToApp from "@/components/custom/portal-to-app";

const AdminView = () => {
  useBootstrap();
  const currentOutlet = useOutlet();
  const { isBootstrapped, bootstrapError } = useAdminStore();
  const activePage = useActivePage();

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
            <PortalToApp>
              <AdminSidebar />
            </PortalToApp>
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
            <PingModal />
            <ActiveCueModal />
          </SidebarProvider>
        </ComponentFade>
      )}
    </AnimatePresence>
  );
};

export default AdminView;
