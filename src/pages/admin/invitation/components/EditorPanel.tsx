import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationDraftSave } from "../hooks/useInvitationDraftSave";
import { Button } from "@/components/ui/button";

import Themes from "../themes";
import Details from "../details";
import RSVP from "../rsvp";
import { SmoothScroll } from "@/components/custom/smooth-scroll";

const EDITOR_TABS = [
  { id: "themes", label: "Themes", element: Themes },
  { id: "details", label: "Details", element: Details },
  { id: "rsvp", label: "RSVP", element: RSVP },
] as const;

type EditorTabId = (typeof EDITOR_TABS)[number]["id"];

const EditorPanel = () => {
  const [activeTab, setActiveTab] = useState<EditorTabId>("themes");

  const detailsIsDirty = useInvitationStore((s) => s.detailsIsDirty);
  const rsvpIsDirty = useInvitationStore((s) => s.rsvpIsDirty);
  const themeIsDirty = useInvitationStore((s) => s.themeIsDirty);

  const { isDirty, isSaving, save } = useInvitationDraftSave();

  const hasDirtyDot: Record<EditorTabId, boolean> = {
    themes: false,
    details: detailsIsDirty || themeIsDirty,
    rsvp: rsvpIsDirty,
  };

  const activeTabConfig = EDITOR_TABS.find((t) => t.id === activeTab)!;
  const ActiveElement = activeTabConfig.element;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EditorTabId)}
        tabOrder={EDITOR_TABS.map((t) => t.id)}
        className="gap-4"
      >
        <TabsList activeValue={activeTab} className="w-full shrink-0">
          {EDITOR_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 text-xs relative"
            >
              {tab.label}
              {hasDirtyDot[tab.id] && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="pt-4">
            <SmoothScroll className="h-[759px]" gradientTop gradientBottom>
              <ActiveElement />
            </SmoothScroll>
          </div>
        </TabsContent>
      </Tabs>

      {activeTab !== "themes" && (
        <div className="shrink-0 px-4 py-3 bg-background">
          <Button
            className="w-full"
            onClick={save}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditorPanel;
