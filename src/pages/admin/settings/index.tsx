import { useState } from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { EventSettingsSection } from "./event-config";
import { AppearanceSection } from "./appearance";
import { NotificationsSection } from "./notifications";

const TABS = [
  { id: "event", label: "Event", element: EventSettingsSection },
  // { id: "appearance", label: "Appearance", element: AppearanceSection },
  // {
  //   id: "notifications",
  //   label: "Notifications",
  //   element: NotificationsSection,
  // },
] as const;

type SettingsTabId = (typeof TABS)[number]["id"];

export function SettingsTab() {
  const [active, setActive] = useState<SettingsTabId>("event");

  const ActiveElement = TABS.find((tab) => tab.id === active)!.element;

  return (
    <Tabs
      value={active}
      onValueChange={(v) => setActive(v as SettingsTabId)}
      tabOrder={TABS.map((t) => t.id)}
      className="gap-6"
    >
      <TabsList activeValue={active}>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={active}>
        <ActiveElement />
      </TabsContent>
    </Tabs>
  );
}
