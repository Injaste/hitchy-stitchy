import { useEffect } from "react";
import { isSameDay, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarHeart, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminStore } from "./store/useAdminStore";
import { useModalStore } from "./store/useModalStore";
import { useCueStore } from "./store/useCueStore";
import { useBootstrap } from "./hooks/useBootstrap";

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
  useBootstrap();

  const {
    activePage,
    setActivePage,
    events,
    teamRoles,
    currentRole,
    eventConfig,
    isBootstrapped,
    bootstrapError,
  } = useAdminStore();
  const { openEventModal, openTaskModal } = useModalStore();
  const { activeCueEvent, notifiedEvents, markNotified } = useCueStore();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  const dayIds = eventConfig.days.map((d) => d.id);
  const isActiveDayPage = dayIds.includes(activePage);

  // Auto-select day after bootstrap
  useEffect(() => {
    if (!isBootstrapped) return;
    const today = startOfDay(new Date());
    const match = eventConfig.days.find((d) => isSameDay(d.date, today));
    setActivePage(match?.id ?? eventConfig.days[0]?.id ?? "day-1");
  }, [isBootstrapped]);

  // Time-based event notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const timeString = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      for (const dayId of Object.keys(events)) {
        (events[dayId] ?? []).forEach((event) => {
          if (event.time === timeString && !notifiedEvents.has(event.id)) {
            if (isAdmin)
              toast.info(`Scheduled Event Now: ${event.title}`, {
                icon: "⏰",
                duration: 10000,
              });
            markNotified(event.id);
          }
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [events, isAdmin, notifiedEvents, markNotified]);

  // FAB: add event / task
  const handleFABClick = () => {
    if (activePage === "checklist") openTaskModal();
    else if (isActiveDayPage) openEventModal(activePage);
  };
  const showFAB = (isActiveDayPage || activePage === "checklist") && isAdmin;

  // Content router
  const renderContent = () => {
    if (isActiveDayPage) return <TimelineTab />;
    switch (activePage) {
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

  // Prevent AnimatePresence from re-animating when switching between day tabs
  const animationKey = isActiveDayPage ? "__days__" : activePage;

  // Bootstrap error state
  if (bootstrapError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <CalendarHeart className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Unable to load event
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{bootstrapError}</p>
          <p className="text-xs text-muted-foreground">
            Please contact support if this issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Bootstrap loading skeleton
  if (!isBootstrapped) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-screen w-full overflow-hidden bg-background"
      >
        {/* Sidebar skeleton */}
        <div className="w-64 border-r border-border p-4 flex flex-col gap-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
          <div className="flex flex-col gap-2 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 flex flex-col p-6 gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl mt-2" />
        </div>
      </motion.div>
    );
  }

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
                <motion.div key={animationKey} {...tabTransition}>
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
