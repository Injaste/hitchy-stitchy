import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import { useMemo } from "react";
import { themeRegistry, FallbackTheme } from "@/pages/templates/themes";
import {
  useInvitationStore,
  composeEventConfig,
} from "../store/useInvitationDraftStore";

const PHONE_W = 400;
const PHONE_H = 867;
const PREVIEW_SCALE = 0.9;
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PHONE_H * PREVIEW_SCALE);

const PreviewPanel = () => {
  const serverInvitation = useInvitationStore((s) => s.serverInvitation);
  const serverThemes = useInvitationStore((s) => s.serverThemes);
  const selectedPageId = useInvitationStore((s) => s.selectedPageId);
  const detailsDraft = useInvitationStore((s) => s.detailsDraft);
  const rsvpDraft = useInvitationStore((s) => s.rsvpDraft);
  const pageDraft = useInvitationStore((s) => s.pageDraft);

  const selectedPage = useMemo(
    () => serverThemes.find((p) => p.id === selectedPageId) ?? null,
    [serverThemes, selectedPageId],
  );

  const composed = useMemo(
    () =>
      composeEventConfig({
        invitation: serverInvitation,
        page: selectedPage,
        details: detailsDraft,
        rsvp: rsvpDraft,
        pageDraft,
      }),
    [serverInvitation, selectedPage, detailsDraft, rsvpDraft, pageDraft],
  );

  const themeSlug = composed?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-start">
        <div
          className="relative overflow-hidden rounded-2xl border bg-background shadow-sm"
          style={{ width: PREVIEW_W, height: PREVIEW_H }}
        >
          {!composed ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : !selectedPage ? (
            <div className="flex items-center justify-center h-full px-6 text-center">
              <p className="text-xs text-muted-foreground">
                Select a template above to see a preview.
              </p>
            </div>
          ) : (
            <Frame
              style={{
                width: PHONE_W,
                height: PREVIEW_H / PREVIEW_SCALE,
                border: "none",
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: "top left",
              }}
              head={<style dangerouslySetInnerHTML={{ __html: cssText }} />}
            >
              <ThemeComponent
                eventConfig={composed}
                pageConfig={composed.published_page?.config ?? {}}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: "0",
                  right: "0",
                  width: "100px",
                  height: "2px",
                  marginInline: "auto",
                  backgroundColor: "#aaaaaa",
                  zIndex: "500",
                  borderRadius: "100px",
                }}
              />
            </Frame>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
