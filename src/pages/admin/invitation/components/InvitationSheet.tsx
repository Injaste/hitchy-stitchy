import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { X, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ComponentFade from "@/components/animations/animate-component-fade";
import { useMediaBreakpointUp } from "@/hooks/use-media-query";
import { themeRegistry } from "@/pages/wedding/templates";
import { composeTemplatePreviewConfig } from "../utils";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import { useEventInvitationQuery } from "../queries";
import InvitationPreviewFrame from "./InvitationPreviewFrame";
import EditSheetPreview from "./EditSheetPreview";
import PhonePreview from "./PhonePreview";
import BrowsePanel from "./BrowsePanel";
import EditPanel, { type EditPanelHandle } from "./EditPanel";
import type { EventInvitation } from "../types";

const DOT_BG: React.CSSProperties = {
  backgroundImage: `
    radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0),
    radial-gradient(rgba(0,0,0,0.1) 1px, transparent 0)
  `,
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 4px 4px",
};

// One sheet, two columns. The LEFT morphs (ComponentFade) between the template
// browser and the Design/RSVP editor; the RIGHT preview persists. On <lg the
// inline preview doesn't fit, so a "Preview" button opens a slide-over that
// reuses the same preview and hides (never unmounts) so it loads only once.
const InvitationSheet = () => {
  const {
    isOpen,
    mode,
    close,
    openEdit,
    previewMounted,
    previewVisible,
    openPreview,
    hidePreview,
  } = useInvitationModalStore();
  const { data: invitation } = useEventInvitationQuery();
  const isMd = useMediaBreakpointUp("md");

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [created, setCreated] = useState<EventInvitation | null>(null);
  const [sheetEntered, setSheetEntered] = useState(false);
  // Slide-over enter state. `slideIn` drives the transition; `previewEntered`
  // defers the preview load until that transition finishes (mirrors the desktop
  // pane, which waits for the sheet's enter animation via onAnimationEnd).
  const [slideIn, setSlideIn] = useState(false);
  const [previewEntered, setPreviewEntered] = useState(false);
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

  // Start the slide-over off-screen, then flip it in one frame later so the CSS
  // transition actually plays on first open. Reset on unmount so the next open
  // re-defers the (freshly remounted) preview.
  useEffect(() => {
    if (!previewMounted) {
      setSlideIn(false);
      setPreviewEntered(false);
      return;
    }
    if (previewVisible) {
      const id = requestAnimationFrame(() => setSlideIn(true));
      return () => cancelAnimationFrame(id);
    }
    setSlideIn(false);
  }, [previewMounted, previewVisible]);

  const editInvitation = invitation ?? created;

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

  // Shared preview content — rendered inline (lg) OR in the slide-over (<lg),
  // never both, so a single iframe mounts.
  const renderPreview = (entered: boolean) =>
    mode === "browse" ? (
      <div className="flex h-full flex-col items-center justify-center p-6 max-sm:px-2">
        {templatePreview && (
          <PhonePreview>
            <InvitationPreviewFrame config={templatePreview} />
          </PhonePreview>
        )}
      </div>
    ) : editInvitation ? (
      <EditSheetPreview invitation={editInvitation} entered={entered} />
    ) : null;

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
              : (editInvitation?.name ?? "Invitation")}
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
                      openEdit();
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

          {/* inline preview — lg only (one iframe; the slide-over handles <lg) */}
          {isMd && (
            <div className="overflow-hidden relative" style={DOT_BG}>
              {renderPreview(sheetEntered)}
            </div>
          )}
        </div>

        {/* small-screen preview slide-over — mounts once, hides (never unmounts) */}
        {!isMd && previewMounted && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div
              onClick={hidePreview}
              className={cn(
                "absolute inset-0 bg-black/20 transition-opacity duration-300",
                slideIn ? "opacity-100 pointer-events-auto" : "opacity-0",
              )}
            />
            <div
              onTransitionEnd={(e) => {
                if (e.target === e.currentTarget && slideIn)
                  setPreviewEntered(true);
              }}
              className={cn(
                "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-lg transition-transform duration-300 pointer-events-auto",
                slideIn ? "translate-x-0" : "translate-x-full",
              )}
              style={DOT_BG}
            >
              <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
                <span className="font-display text-base font-medium">
                  Preview
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={hidePreview}
                  aria-label="Hide preview"
                  className="ml-auto shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                {renderPreview(previewEntered)}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InvitationSheet;
