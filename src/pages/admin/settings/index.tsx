import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import { EventConfigSection } from "./event-config";
import { RSVPConfigSection } from "./rsvp-config";
import { AppearanceSection } from "./appearance";
import { NotificationsSection } from "./notifications";

const tabs = ["Event", "RSVP", "Appearance", "Notifications"] as const;
type SettingsTabId = (typeof tabs)[number];

export function SettingsTab() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("Event");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 text-xs",
              activeTab !== tab && "text-muted-foreground",
            )}
          >
            {tab}
          </Button>
        ))}
      </div>

      <Separator />

      {activeTab === "Event" && <EventConfigSection />}
      {activeTab === "RSVP" && <RSVPConfigSection />}
      {activeTab === "Appearance" && <AppearanceSection />}
      {activeTab === "Notifications" && <NotificationsSection />}
    </div>
  );
}
