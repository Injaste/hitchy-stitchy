import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Themes from "../themes";
import Config from "../config";

const TABS = [
  { id: "themes", label: "Themes", element: Themes },
  { id: "config", label: "Configs", element: Config },
] as const;

type TabId = (typeof TABS)[number]["id"];

const InvitationTabs = () => {
  const [activeTab, setActiveTab] = useState<TabId>("themes");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as TabId)}
      tabOrder={TABS.map((t) => t.id)}
      className="gap-6"
    >
      <TabsList activeValue={activeTab} className="w-full max-w-sm">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex-1 text-xs"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const Element = tab.element;
        return (
          <TabsContent key={tab.id} value={tab.id}>
            <Element />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default InvitationTabs;
