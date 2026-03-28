import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeUp } from "@/pages/admin/animations";
import { EventSettingsSection } from "./sections/EventSettingsSection";
import { RSVPFormConfigSection } from "./sections/RSVPFormConfigSection";
import { GuestPoolSection } from "./sections/GuestPoolSection";
import { NotificationsSection } from "./sections/NotificationsSection";

export function SettingsTab() {
  const [activeTab, setActiveTab] = useState("event");

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp(0)}
      className="space-y-6 max-w-3xl"
    >
      <div>
        <h2 className="text-2xl font-serif font-semibold text-primary mb-1">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your event configuration, RSVP form, and guest pool.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="event">Event</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP</TabsTrigger>
          <TabsTrigger value="guest-pool">Guest Pool</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="event">
            <EventSettingsSection />
          </TabsContent>
          <TabsContent value="rsvp">
            <RSVPFormConfigSection />
          </TabsContent>
          <TabsContent value="guest-pool">
            <GuestPoolSection />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsSection />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
