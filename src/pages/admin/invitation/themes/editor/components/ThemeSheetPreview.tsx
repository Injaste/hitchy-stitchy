import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import { useDeferredValue, useMemo, useState, useEffect } from "react";
import { themeRegistry, FallbackTheme } from "@/pages/wedding/templates";
import { useInvitationQuery } from "../../../queries";
import { composeEventConfig } from "../../../utils";
import { useThemeSheetStore } from "../store";
import type { Theme } from "../../../types";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const PHONE_W = 400;
const PHONE_H = 867;
const PREVIEW_SCALE = 0.9;
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PHONE_H * PREVIEW_SCALE);

interface ThemeSheetPreviewProps {
  theme: Theme;
}

const ThemeSheetPreview = ({ theme }: ThemeSheetPreviewProps) => {
  const draft = useThemeSheetStore((s) => s.draft);
  const deferredDraft = useDeferredValue(draft);
  const { data: invitation } = useInvitationQuery();

  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimationFinished(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const composed = useMemo(() => {
    if (!invitation) return null;
    return composeEventConfig(invitation, theme, deferredDraft);
  }, [invitation, theme, deferredDraft]);

  const themeSlug = composed?.published_page?.theme_slug ?? null;
  const ThemeComponent =
    (themeSlug ? themeRegistry[themeSlug]?.component : null) ?? FallbackTheme;

  if (!composed) return null;

  const renderPreviewContent = () => {
    if (!isAnimationFinished) {
      return (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full flex items-center justify-center bg-muted/20"
        >
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground/60" />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="preview-frame"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full"
      >
        <Frame
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            transformOrigin: "top left",
          }}
          head={<style dangerouslySetInnerHTML={{ __html: cssText }} />}
        >
          <ThemeComponent
            eventConfig={composed}
            pageConfig={composed.published_page?.config ?? { slug: null }}
          />
        </Frame>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div
        className="relative overflow-hidden rounded-2xl border bg-background shadow-sm"
        style={{
          width: PREVIEW_W,
          height: "calc(100vh - 72px - 24px - 24px - 1px)",
          maxHeight: PREVIEW_H,
        }}
      >
        <AnimatePresence mode="wait">{renderPreviewContent()}</AnimatePresence>
      </div>
    </div>
  );
};

export default ThemeSheetPreview;
