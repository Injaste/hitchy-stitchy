import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { useAdminStore } from "./store/useAdminStore";
import { useModalStore } from "./store/useModalStore";
import { useCueStore } from "./store/useCueStore";

import { AdminSidebar } from "./components/AdminSidebar";
import { AdminTopbar } from "./components/AdminTopbar";
import { ActiveCueBanner } from "./components/ActiveCueBanner";
import { AdminModals } from "./modals/AdminModals";

import { TimelineTab } from "./features/timeline/TimelineTab";
import { ChecklistTab } from "./features/operations/checklist/ChecklistTab";
import { TeamTab } from "./features/operations/team/TeamTab";
import { LiveTab } from "./features/operations/live/LiveTab";
import { RSVPTab } from "./features/admin-panel/rsvp/RSVPTab";
import { UsersTab } from "./features/admin-panel/users/UsersTab";
import { SettingsTab } from "./features/settings/SettingsTab";

import { tabTransition } from "./animations";

export default function AdminPage() {
  const { activePage, setActivePage, day1Events, day2Events, teamRoles, currentRole } =
    useAdminStore();
  const { openEventModal, openTaskModal } = useModalStore();
  const { activeCueEvent, notifiedEvents, markNotified } = useCueStore();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  // Auto-select day based on current date
  useEffect(() => {
    const now = new Date();
    if (now.getMonth() === 6) {
      if (now.getDate() === 4) setActivePage("day1");
      else if (now.getDate() === 5) setActivePage("day2");
    }
  }, [setActivePage]);

  // Scheduled reminder toast
  useEffect(() => {
    const timer = setTimeout(() => {
      toast("9:30 AM: Reminder – Bunga Rampai distribution should begin now.", {
        icon: "🌸",
        duration: 10000,
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Time-based event notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const timeString = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const check = (events: typeof day1Events) => {
        events.forEach((event) => {
          if (event.time === timeString && !notifiedEvents.has(event.id)) {
            if (isAdmin)
              toast.info(`Scheduled Event Now: ${event.title}`, {
                icon: "⏰",
                duration: 10000,
              });
            markNotified(event.id);
          }
        });
      };
      check(day1Events);
      check(day2Events);
    }, 10000);
    return () => clearInterval(interval);
  }, [day1Events, day2Events, isAdmin, notifiedEvents, markNotified]);

  // FAB: add event / task
  const handleFABClick = () => {
    if (activePage === "checklist") openTaskModal();
    else if (activePage === "day1" || activePage === "day2")
      openEventModal(activePage as "day1" | "day2");
  };
  const showFAB = ["day1", "day2", "checklist"].includes(activePage) && isAdmin;

  // Content router
  const renderContent = () => {
    switch (activePage) {
      case "day1":
      case "day2":
        return <TimelineTab />;
      case "checklist":
        return <ChecklistTab />;
      case "team":
        return <TeamTab />;
      case "live":
        return <LiveTab />;
      case "rsvps":
        return isAdmin ? <RSVPTab /> : null;
      case "users":
        return isAdmin ? <UsersTab /> : null;
      case "settings":
        return isAdmin ? <SettingsTab /> : null;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
        <Toaster position="top-center" />

        {/* Sidebar */}
        <AdminSidebar />

        {/* Main column */}
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Active cue banner — above topbar so it pushes the whole UI down */}
          <ActiveCueBanner />

          <AdminTopbar />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-6 py-6 md:py-8">
              <AnimatePresence mode="wait">
                <motion.div key={activePage === "day2" ? "day1" : activePage} {...tabTransition}>
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="border-t border-border mt-4 py-6 text-center text-xs text-muted-foreground/70">
              Created with ❤️ by Dan &amp; Nad
            </footer>
          </main>
        </SidebarInset>

        {/* FAB */}
        {showFAB && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFABClick}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        )}

        {/* All modals — rendered once */}
        <AdminModals />
      </div>
    </SidebarProvider>
  );
}
