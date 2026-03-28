import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { fadeUp } from "@/pages/admin/animations";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { toast } from "sonner";
import type { NotificationPrefs } from "../types";

const PREF_LABELS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: "eventStarted", label: "Active cue changed" },
  { key: "taskAssigned", label: "Task assigned to you" },
  { key: "pinged", label: "Someone pinged you" },
  { key: "upcomingEvent", label: "Upcoming event (15 min warning)" },
  { key: "bridesmaidsCheckin", label: "Bridesmaid check-in update" },
];

export function NotificationsSection() {
  const { notificationPrefs, setNotificationPref } = useAdminStore();

  const handleEnableNotifications = () => {
    if (!("Notification" in window)) {
      toast.info("Push notifications are not supported in this browser.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        toast.success("Notifications enabled");
      } else {
        toast.info("Enable notifications in your browser settings");
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
            Configure push notification preferences for your planning team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button variant="outline" size="sm" onClick={handleEnableNotifications}>
            Enable Notifications
          </Button>

          <Separator />

          <div className="space-y-4">
            {PREF_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm font-normal">{label}</Label>
                <Switch
                  checked={notificationPrefs[key]}
                  onCheckedChange={(v) => setNotificationPref(key, v)}
                />
              </div>
            ))}
          </div>

          <p className="text-xs italic text-muted-foreground">
            Push delivery requires app installation — coming soon.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
