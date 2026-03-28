import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fadeUp } from "@/pages/admin/animations";

export function NotificationsSection() {
  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp(0.3)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-serif">Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure push notification preferences for your planning team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Push notification configuration coming soon.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
