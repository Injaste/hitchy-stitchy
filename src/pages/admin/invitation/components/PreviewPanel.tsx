import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import { useMemo } from "react";
import { themeRegistry, FallbackTheme } from "@/pages/templates/themes";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationQuery, useSelectedThemeQuery } from "../queries";
import { useInvitationDraftSave } from "../hooks/useInvitationDraftSave";
import { composeEventConfig } from "../utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "../../store/useAdminStore";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PHONE_W = 400;
const PHONE_H = 867;
const PREVIEW_SCALE = 0.9;
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PHONE_H * PREVIEW_SCALE);

const PreviewPanel = () => {
  const { slug } = useAdminStore();

  const detailsDraft = useInvitationStore((s) => s.detailsDraft);
  const rsvpDraft = useInvitationStore((s) => s.rsvpDraft);
  const themeDraft = useInvitationStore((s) => s.themeDraft);

  const { data: invitation } = useInvitationQuery();
  const { data: selectedTheme } = useSelectedThemeQuery();

  const { isDirty, isSaving, save } = useInvitationDraftSave();

  const composed = useMemo(
    () =>
      composeEventConfig(
        invitation!,
        selectedTheme!,
        detailsDraft,
        rsvpDraft,
        themeDraft,
      ),
    [invitation, selectedTheme, detailsDraft, rsvpDraft, themeDraft],
  );

  const themeSlug = composed.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {selectedTheme?.name}
          </span>
          {selectedTheme?.template?.name && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {selectedTheme.template.name}
              </span>
            </>
          )}
        </div>
        {selectedTheme?.is_published && (
          <Badge
            variant="outline"
            className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary border-primary/30"
          >
            Live
          </Badge>
        )}
      </div>

      <div className="flex-1 flex items-start">
        <div
          className="relative overflow-hidden rounded-2xl border bg-background shadow-sm"
          style={{ width: PREVIEW_W, height: PREVIEW_H }}
        >
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
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <code className="text-xs bg-secondary/60 px-2 py-1 rounded-sm border border-secondary/60 truncate">
          {`${BASE_URL}/${slug}`}
        </code>
        <Button onClick={save} disabled={!isDirty || isSaving}>
          {isSaving ? "Saving..." : isDirty ? "Unsaved changes" : "Saved"}
        </Button>
      </div>
    </div>
  );
};

export default PreviewPanel;
