import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TemplateSection from "../themes";
import ContentSection from "./sections/ContentSection";
import DetailsSection from "./sections/DetailsSection";
import RSVPSection from "./sections/RSVPSection";
import { useInvitationSave } from "../hooks/useInvitationSave";

const EDITOR_TABS = [
  { id: "theme", label: "Themes", element: TemplateSection },
  {
    id: "details",
    label: "Details",
    element: () => (
      <>
        <ContentSection />
        <div className="h-px bg-border mx-4 my-1" />
        <DetailsSection />
      </>
    ),
  },
  { id: "rsvp", label: "RSVP", element: RSVPSection },
] as const;

type EditorTabId = (typeof EDITOR_TABS)[number]["id"];

const EditorPanel = () => {
  const [activeTab, setActiveTab] = useState<EditorTabId>("theme");
  const { isDirty, isSaving, save } = useInvitationSave();

  const activeTabConfig = EDITOR_TABS.find((t) => t.id === activeTab)!;
  const ActiveElement = activeTabConfig.element;

  return (
    <div className="">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EditorTabId)}
        tabOrder={EDITOR_TABS.map((t) => t.id)}
        className="flex-1 min-h-0 gap-0"
      >
        <TabsList activeValue={activeTab} className="w-full">
          {EDITOR_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex-1 text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="min-h-0 overflow-y-auto pt-4">
          <ActiveElement />
        </TabsContent>
      </Tabs>

      {activeTab !== "theme" && (
        <div className="shrink-0 px-4 py-3 border-t border-border bg-background">
          <button
            type="button"
            onClick={save}
            disabled={!isDirty || isSaving}
            className="w-full h-8 rounded-full text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {isSaving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
