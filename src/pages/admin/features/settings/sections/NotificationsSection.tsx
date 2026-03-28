import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { fadeUp } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

const PREF_ROWS = [
  { key: "eventStarted" as const, label: "Active cue changed" },
  { key: "taskAssigned" as const, label: "Task assigned to you" },
  { key: "pinged" as const, label: "Someone pinged you" },
  { key: "upcomingEvent" as const, label: "Upcoming event (15 min)" },
  { key: "bridesmaidsCheckin" as const, label: "Bridesmaid check-in" },
];

export function NotificationsSection() {
  const { notificationPrefs, setNotificationPref } = useAdminStore();

  const handleRequestPermission = () => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        toast.success("Notifications enabled");
      } else {
        toast.info("Enable notifications in your browser settings to receive push alerts");
      }
    });
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0.3)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">Push Notifications</CardTitle>
          </div>
          <CardDescription>
            Choose what you'd like to be notified about. Push delivery requires app
            installation — coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" size="sm" onClick={handleRequestPermission}>
            Enable Notifications
          </Button>

          <Separator />

          <div className="space-y-3">
            {PREF_ROWS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{label}</span>
                <Switch
                  checked={notificationPrefs[key]}
                  onCheckedChange={(value) => setNotificationPref(key, value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
