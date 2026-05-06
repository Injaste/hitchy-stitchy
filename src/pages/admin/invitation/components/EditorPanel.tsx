import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationDraftSave } from "../hooks/useInvitationDraftSave";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import Themes from "../themes";
import Content from "../content";
import Details from "../details";
import RSVP from "../rsvp";

const EDITOR_TABS = [
  { id: "themes", label: "Themes", element: Themes },
  {
    id: "details",
    label: "Details",
    element: () => (
      <>
        <Content />
        <div className="h-px bg-border mx-4 my-1" />
        <Details />
      </>
    ),
  },
  { id: "rsvp", label: "RSVP", element: RSVP },
] as const;

type EditorTabId = (typeof EDITOR_TABS)[number]["id"];

const EditorPanel = () => {
  const [activeTab, setActiveTab] = useState<EditorTabId>("themes");

  const detailsDraft = useInvitationStore((s) => s.detailsDraft);
  const rsvpDraft = useInvitationStore((s) => s.rsvpDraft);

  const { isDirty, isSaving, save } = useInvitationDraftSave();

  const hasDirtyDot: Record<EditorTabId, boolean> = {
    themes: false,
    details: !!detailsDraft,
    rsvp: !!rsvpDraft,
  };

  const activeTabConfig = EDITOR_TABS.find((t) => t.id === activeTab)!;
  const ActiveElement = activeTabConfig.element;

  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EditorTabId)}
        tabOrder={EDITOR_TABS.map((t) => t.id)}
        className="flex-1 min-h-0 gap-0"
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

        <TabsContent value={activeTab} className="flex-1 min-h-0">
          <ScrollArea
            className="h-full"
            gradient
            gradientFrom="from-background"
          >
            <div className="pt-4">
              <ActiveElement />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {activeTab !== "themes" && (
        <div className="shrink-0 px-4 py-3 border-t border-border bg-background">
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
