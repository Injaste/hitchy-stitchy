import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import { useDeferredValue, useMemo } from "react";
import { themeRegistry, FallbackTheme } from "@/pages/wedding/templates";
import { useInvitationQuery } from "../../../queries";
import { composeEventConfig } from "../../../utils";
import { useThemeSheetStore } from "../store";
import type { Theme } from "../../../types";

const PHONE_W = 400;
const PHONE_H = 867;
const PREVIEW_SCALE = 0.85;
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PHONE_H * PREVIEW_SCALE);

interface ThemeSheetPreviewProps {
  theme: Theme;
}

const ThemeSheetPreview = ({ theme }: ThemeSheetPreviewProps) => {
  const draft = useThemeSheetStore((s) => s.draft);
  const deferredDraft = useDeferredValue(draft);
  const { data: invitation } = useInvitationQuery();

  const composed = useMemo(() => {
    if (!invitation) return null;
    return composeEventConfig(invitation, theme, deferredDraft);
  }, [invitation, theme, deferredDraft]);

  const themeSlug = composed?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  if (!composed) return null;

  return (
    <div className="flex h-full items-center justify-center p-6">
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
            pageConfig={composed.published_page?.config ?? { slug: null }}
          />
        </Frame>
      </div>
    </div>
  );
};

export default ThemeSheetPreview;
