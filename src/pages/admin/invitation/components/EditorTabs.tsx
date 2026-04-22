import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DetailsTab from "./DetailsTab";
import AppearanceTab from "./AppearanceTab";
import RSVPTab from "./RSVPTab";
import ThemeTab from "./ThemeTab";

const TABS = [
  { id: "details", label: "Details", element: DetailsTab },
  { id: "appearance", label: "Appearance", element: AppearanceTab },
  { id: "rsvp", label: "RSVP", element: RSVPTab },
  { id: "theme", label: "Theme", element: ThemeTab },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EditorTabs = () => {
  const [active, setActive] = useState<TabId>("details");

  const ActiveElement = TABS.find((tab) => tab.id === active)!.element;

  return (
    <Tabs
      value={active}
      onValueChange={(v) => setActive(v as TabId)}
      tabOrder={TABS.map((t) => t.id)}
      className="gap-6 "
    >
      <TabsList activeValue={active} className="w-full">
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
};

export default EditorTabs;
