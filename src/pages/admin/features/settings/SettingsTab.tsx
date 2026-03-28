import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/pages/admin/animations";
import { EventSettingsSection } from "./sections/EventSettingsSection";
import { RSVPFormConfigSection } from "./sections/RSVPFormConfigSection";
import { GuestPoolSection } from "./sections/GuestPoolSection";
import { NotificationsSection } from "./sections/NotificationsSection";

export function SettingsTab() {
  return (
    <AnimatePresence>
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

        <EventSettingsSection />
        <RSVPFormConfigSection />
        <GuestPoolSection />
        <NotificationsSection />
      </motion.div>
    </AnimatePresence>
  );
}
