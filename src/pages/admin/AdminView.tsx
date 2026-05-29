import { useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ComponentFade from "@/components/animations/animate-component-fade";
import { ScrollView } from "@/components/custom/scroll-view";

import { useAdminStore } from "./store/useAdminStore";
import { useBootstrap } from "./bootstrap/hooks/useBootstrap";
import useActivePage from "./hooks/useActivePage";

import AdminSidebar from "./sidebar/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import AdminErrorLayout from "./components/AdminErrorLayout";
import LoadingState from "@/components/custom/states/loading-state";
import { PingModal } from "./modals/PingModal";
import { ActiveCueModal } from "./modals/ActiveCueModal";
import MemberModals from "./members/modals";
import RoleModals from "./roles/modals";

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
          <LoadingState />
        </ComponentFade>
      ) : (
        <ComponentFade key="app">
          <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="flex flex-col flex-1 ">
              <AdminTopbar />
              <AnimatePresence mode="wait">
                <ComponentFade
                  key={activePage}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <ScrollView
                    className="px-3 md:px-6 pb-2 md:pb-5"
                    gradientBottom
                    gradientClass="from-background"
                  >
                    {currentOutlet}
                  </ScrollView>
                </ComponentFade>
              </AnimatePresence>
            </SidebarInset>
            <PingModal />
            <ActiveCueModal />
            <MemberModals />
            <RoleModals />
          </SidebarProvider>
        </ComponentFade>
      )}
    </AnimatePresence>
  );
};

export default AdminView;
