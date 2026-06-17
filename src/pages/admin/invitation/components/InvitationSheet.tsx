import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { X, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useMediaBreakpointUp } from "@/hooks/use-media-query";
import { themeRegistry } from "@/pages/wedding/templates";
import { composeTemplatePreviewConfig, pageLabel } from "../utils";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import { useEventInvitationsQuery, useEventSegmentsQuery } from "../queries";
import { useEventDaysQuery } from "../../days/queries";
import BrowsePanel from "./BrowsePanel";
import EditPanel, { type EditPanelHandle } from "./EditPanel";
import InvitationPreviewPane from "./InvitationPreviewPane";
import PreviewSlideOver from "./PreviewSlideOver";
import type { EventInvitation } from "../types";

// One sheet, two columns. The LEFT morphs (ComponentFade) between the template
// browser and the Design/RSVP editor; the RIGHT preview persists. On <md the
// inline preview doesn't fit, so a "Preview" button opens a slide-over that
// reuses the same preview and hides (never unmounts) so it loads only once.
const InvitationSheet = () => {
  const {
    isOpen,
    mode,
    editingId,
    close,
    openEdit,
    previewMounted,
    previewVisible,
    openPreview,
    hidePreview,
  } = useInvitationModalStore();
  const { data: invitations } = useEventInvitationsQuery();
  const { data: days } = useEventDaysQuery();
  const { data: segments } = useEventSegmentsQuery();
  const isMd = useMediaBreakpointUp("md");

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [created, setCreated] = useState<EventInvitation | null>(null);
  const [sheetEntered, setSheetEntered] = useState(false);
  const editRef = useRef<EditPanelHandle>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedSlug(null);
      setCreated(null);
    } else {
      setSheetEntered(false);
    }
  }, [isOpen]);

  // Reset the store when the page unmounts (singleton would otherwise re-open).
  useEffect(() => () => close(), [close]);

  // The page being edited: the live row from the list, or the just-created one
  // (bridges the gap before the list query refetches).
  const editInvitation =
    invitations?.find((i) => i.id === editingId) ?? created;

  const editTitle =
    editInvitation && days && segments
      ? pageLabel(editInvitation, days, segments)
      : "Invitation";

  const requestClose = () => {
    if (mode === "edit" && editRef.current) editRef.current.attemptClose();
    else close();
  };

  const templatePreview = useMemo(() => {
    if (!selectedSlug) return null;
    const entry = themeRegistry[selectedSlug];
    return entry
      ? composeTemplatePreviewConfig(selectedSlug, entry.defaultConfig)
      : null;
  }, [selectedSlug]);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && requestClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="max-w-6xl! w-screen! p-0 flex flex-col bg-background gap-0"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && isOpen) setSheetEntered(true);
        }}
      >
        <SheetTitle className="sr-only">Invitation</SheetTitle>

        <div className="flex items-center gap-3 px-3 md:px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={requestClose}
            aria-label="Close"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-medium truncate font-display">
            {mode === "browse"
              ? "Browse templates"
              : editTitle}
          </h2>
          {/* Small screens can't show the inline preview — pop it in a sheet. */}
          <Button
            variant="outline"
            size="sm"
            onClick={openPreview}
            className="ml-auto shrink-0 gap-1.5 md:hidden"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>

        <Separator />

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(420px,1fr)_minmax(420px,1fr)] overflow-hidden">
          {/* left — morphs browse <-> edit */}
          <div className="min-h-0 overflow-hidden md:border-r">
            <AnimatePresence mode="wait">
              {mode === "browse" ? (
                <ComponentFade key="browse" useBlur className="h-full min-h-0">
                  <BrowsePanel
                    selectedSlug={selectedSlug}
                    onSelect={setSelectedSlug}
                    onUsed={(inv) => {
                      setCreated(inv);
                      openEdit(inv.id);
                    }}
                  />
                </ComponentFade>
              ) : editInvitation ? (
                <ComponentFade key="edit" useBlur className="h-full min-h-0">
                  <EditPanel
                    ref={editRef}
                    invitation={editInvitation}
                    onClose={close}
                  />
                </ComponentFade>
              ) : null}
            </AnimatePresence>
          </div>

          {/* inline preview — md+ only (one iframe; the slide-over handles <md) */}
          {isMd && (
            <InvitationPreviewPane
              mode={mode}
              templatePreview={templatePreview}
              editInvitation={editInvitation}
              entered={sheetEntered}
            />
          )}
        </div>

        {/* small-screen preview drawer — mounts once, hides (never unmounts) */}
        {!isMd && (
          <PreviewSlideOver
            open={previewMounted}
            visible={previewVisible}
            onHide={hidePreview}
          >
            {(entered) => (
              <InvitationPreviewPane
                mode={mode}
                templatePreview={templatePreview}
                editInvitation={editInvitation}
                entered={entered}
              />
            )}
          </PreviewSlideOver>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InvitationSheet;
