import Frame from "react-frame-component";
import { useMemo } from "react";
import { ExternalLink, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themeRegistry, FallbackTheme } from "@/pages/templates/themes";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";

import {
  useInvitationDraftStore,
  composeEventConfig,
} from "../store/useInvitationDraftStore";
import PortalToApp from "@/components/custom/portal-to-app";

const PHONE_W = 400;
const PHONE_H = 867;
const PREVIEW_SCALE = 1;
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PHONE_H * PREVIEW_SCALE);

const PreviewPanel = () => {
  const { slug } = useAdminStore();

  const serverInvitation = useInvitationDraftStore((s) => s.serverInvitation);
  const serverPages = useInvitationDraftStore((s) => s.serverPages);
  const selectedPageId = useInvitationDraftStore((s) => s.selectedPageId);
  const setSelectedPageId = useInvitationDraftStore((s) => s.setSelectedPageId);
  const detailsDraft = useInvitationDraftStore((s) => s.detailsDraft);
  const appearanceDraft = useInvitationDraftStore((s) => s.appearanceDraft);
  const rsvpDraft = useInvitationDraftStore((s) => s.rsvpDraft);
  const pageDraft = useInvitationDraftStore((s) => s.pageDraft);

  const selectedPage = useMemo(
    () => serverPages.find((p) => p.id === selectedPageId) ?? null,
    [serverPages, selectedPageId],
  );

  const composed = useMemo(
    () =>
      composeEventConfig({
        invitation: serverInvitation,
        page: selectedPage,
        details: detailsDraft,
        appearance: appearanceDraft,
        rsvp: rsvpDraft,
        pageDraft,
      }),
    [
      serverInvitation,
      selectedPage,
      detailsDraft,
      appearanceDraft,
      rsvpDraft,
      pageDraft,
    ],
  );

  const themeSlug = composed?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug] : null) ?? FallbackTheme;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Theme Preview
        </p>
      </div>

      {serverPages.length > 0 && (
        <Select
          value={selectedPageId ?? ""}
          onValueChange={(v) => setSelectedPageId(v)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent>
            {serverPages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                <span className="inline-flex items-center gap-2">
                  {page.name}
                  {page.is_published && (
                    <Badge
                      variant="default"
                      className="text-2xs gap-1 h-4 px-1.5"
                    >
                      <Globe className="h-2.5 w-2.5" />
                      Published
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div
        className="relative overflow-hidden rounded-2xl border bg-background shadow-sm mx-auto"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        {!composed ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : !selectedPage ? (
          <div className="flex items-center justify-center h-full px-6 text-center">
            <p className="text-xs text-muted-foreground">
              Create a page in the Theme tab to see a preview.
            </p>
          </div>
        ) : (
          // ... inside your component
          <Frame
            style={{
              width: PHONE_W,
              height: PREVIEW_H / PREVIEW_SCALE,
              border: "none",
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
            }}
            head={
              <>
                <link rel="stylesheet" href="/src/index.css" />
              </>
            }
          >
            <ThemeComponent
              eventConfig={composed}
              pageConfig={composed.published_page?.config ?? {}}
            />

            {/* Bottom mobile swiping thing */}
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
  );
};

export default PreviewPanel;
