import { useOutlet, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ComponentFade from "@/components/animations/animate-component-fade";
import { ScrollView } from "@/components/custom/scroll-view";

import { useAdminStore } from "./store/useAdminStore";
import { useBootstrap } from "./bootstrap/hooks/useBootstrap";
import useActivePage from "./hooks/useActivePage";

import AdminSidebar from "./sidebar/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import SetupGuideWidget from "./setup-guide/SetupGuideWidget";
import AdminErrorLayout from "./components/AdminErrorLayout";
import LoadingState from "@/components/custom/states/loading-state";
import MemberModals from "./members/modals";
import TimelineModals from "./timeline/modals";
import PlanModals from "./plan/modals";
import EventSettingsModal from "./settings";
import AccountSettingsModal from "@/pages/account/modals/AccountSettingsModal";
import { NotificationPermissionModal } from "./components/NotificationPermissionModal";

const AdminView = () => {
  const { data, error } = useBootstrap();
  const { slug } = useParams<{ slug: string }>();
  const currentOutlet = useOutlet();
  const storeSlug = useAdminStore((s) => s.slug);
  const activePage = useActivePage();

  // Gate off the slug-keyed query, never the global store. The store lags a frame
  // behind navigation (its context is written by an effect), so reading it here is
  // what made a previous event's error/shell flash before the new event resolved.
  // `data` plus a storeSlug match guarantees the shell only mounts once the store's
  // context has actually caught up to the event in the URL — no stale-context flash.
  const isReady = !!data && storeSlug === slug;

  return (
    <SidebarProvider>
      <AnimatePresence mode="wait">
        {error ? (
          <ComponentFade key="error" className="w-full">
            <AdminErrorLayout
              errorMessage={(error as Error).message}
              isOffline={!navigator.onLine}
            />
          </ComponentFade>
        ) : !isReady ? (
          <ComponentFade key="loading">
            <LoadingState />
          </ComponentFade>
        ) : (
          <ComponentFade key="app" className="flex w-full min-h-0 flex-1">
            <AdminSidebar />
            <SidebarInset topbar={<AdminTopbar />} className="flex flex-col flex-1">
              <AnimatePresence mode="wait">
                <ComponentFade
                  key={activePage}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <ScrollView
                    size="normal"
                    className="px-3 pb-3 md:px-5 md:pb-5 overflow-x-hidden"
                    gradientBottom
                    gradientClass="from-background"
                  >
                    {currentOutlet}
                  </ScrollView>
                </ComponentFade>
              </AnimatePresence>
            </SidebarInset>
            <SetupGuideWidget />
            <MemberModals />
            <TimelineModals />
            <PlanModals />
            <EventSettingsModal />
            <AccountSettingsModal />
            <NotificationPermissionModal />
          </ComponentFade>
        )}
      </AnimatePresence>
    </SidebarProvider>
  );
};

export default AdminView;
