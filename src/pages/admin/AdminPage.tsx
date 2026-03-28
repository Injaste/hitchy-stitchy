import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "./store/useAdminStore";
import { useModalStore } from "./store/useModalStore";
import { useCueStore } from "./store/useCueStore";
import { AdminHeader } from "./components/AdminHeader";
import { ActiveCueBanner } from "./components/ActiveCueBanner";
import { CategoryNav } from "./components/CategoryNav";
import { AdminModals } from "./modals/AdminModals";
import { TimelineTab } from "./features/timeline/TimelineTab";
import { ChecklistTab } from "./features/operations/checklist/ChecklistTab";
import { TeamTab } from "./features/operations/team/TeamTab";
import { LiveTab } from "./features/operations/live/LiveTab";
import { RSVPTab } from "./features/admin-panel/rsvp/RSVPTab";
import { UsersTab } from "./features/admin-panel/users/UsersTab";
import { tabTransition } from "./animations";

export default function AdminPage() {
  const [activeCategory, setActiveCategory] = useState("timeline");
  const [activeTab, setActiveTab] = useState("day1");

  const { day1Events, day2Events, teamRoles, currentRole } = useAdminStore();
  const { openEventModal, openTaskModal } = useModalStore();
  const { activeCueEvent, notifiedEvents, markNotified } = useCueStore();

  const currentUser = teamRoles.find((r) => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  // Auto-select day based on date
  useEffect(() => {
    const now = new Date();
    if (now.getMonth() === 6) {
      if (now.getDate() === 4) setActiveTab("day1");
      else if (now.getDate() === 5) setActiveTab("day2");
    }
  }, []);

  // Scheduled reminder toast on load
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
            if (isAdmin) toast.info(`Scheduled Event Now: ${event.title}`, { icon: "⏰", duration: 10000 });
            markNotified(event.id);
          }
        });
      };
      check(day1Events);
      check(day2Events);
    }, 10000);
    return () => clearInterval(interval);
  }, [day1Events, day2Events, isAdmin, notifiedEvents, markNotified]);

  const handleCategoryChange = (category: string, defaultTab: string) => {
    setActiveCategory(category);
    setActiveTab(defaultTab);
  };

  const handleFABClick = () => {
    if (activeTab === "checklists") {
      openTaskModal();
    } else if (activeTab === "day1" || activeTab === "day2") {
      openEventModal(activeTab as "day1" | "day2");
    }
  };

  const showFAB = ["day1", "day2", "checklists"].includes(activeTab) && isAdmin;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative pb-20 flex flex-col">
      <Toaster position="top-center" />

      {/* Sticky header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <ActiveCueBanner />
        <AdminHeader />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 w-full">
        <CategoryNav activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...tabTransition}
          >
            {/* Timeline category */}
            {activeCategory === "timeline" && (
              <TimelineTab activeTab={activeTab} onTabChange={setActiveTab} />
            )}

            {/* Operations category */}
            {activeCategory === "ops" && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-6 md:mb-8">
                  <TabsList className="flex w-full max-w-md bg-muted/50 p-1 rounded-lg">
                    <TabsTrigger value="checklists" className="flex-1 whitespace-nowrap text-xs md:text-sm">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex-1 whitespace-nowrap text-xs md:text-sm">
                      Team
                    </TabsTrigger>
                    <TabsTrigger value="live" className="flex-1 whitespace-nowrap text-xs md:text-sm relative">
                      Live
                      {activeCueEvent && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="checklists" className="mt-0 outline-none">
                  <ChecklistTab />
                </TabsContent>
                <TabsContent value="team" className="mt-0 outline-none">
                  <TeamTab />
                </TabsContent>
                <TabsContent value="live" className="mt-0 outline-none">
                  <LiveTab />
                </TabsContent>
              </Tabs>
            )}

            {/* Admin category */}
            {activeCategory === "admin" && isAdmin && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-6 md:mb-8">
                  <TabsList className="flex w-full max-w-md bg-muted/50 p-1 rounded-lg">
                    <TabsTrigger value="rsvps" className="flex-1 whitespace-nowrap text-xs md:text-sm">
                      RSVPs
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex-1 whitespace-nowrap text-xs md:text-sm">
                      Users
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="rsvps" className="mt-0 outline-none">
                  <RSVPTab />
                </TabsContent>
                <TabsContent value="users" className="mt-0 outline-none">
                  <UsersTab />
                </TabsContent>
              </Tabs>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="text-center py-8 text-xs text-muted-foreground opacity-80 mt-auto">
        Created with ❤️ by Dan & Nad
      </footer>

      {/* FAB */}
      {showFAB && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFABClick}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* All modals rendered here – once */}
      <AdminModals />
    </div>
  );
}
