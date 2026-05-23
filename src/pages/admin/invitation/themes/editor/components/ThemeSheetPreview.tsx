import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import { useDeferredValue, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import Wedding from "@/pages/wedding";

import { useInvitationQuery } from "../../../queries";
import { composeEventConfig } from "../../../utils";
import { useThemeSheetStore } from "../store";
import { themeRegistry } from "@/pages/wedding/templates";
import type { Theme } from "../../../types";

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

  // Incrementing this key forces the Frame (and WeddingPreview inside it) to
  // fully remount — replaying the loading sequence from the very beginning.
  const [frameKey, setFrameKey] = useState(0);

  const composed = useMemo(() => {
    if (!invitation) return null;
    return composeEventConfig(invitation, theme, deferredDraft);
  }, [invitation, theme, deferredDraft]);

  if (!composed) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
      {/* Replay sits above the iframe, never overlapping the preview content */}
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full shadow-sm gap-1.5 text-xs"
        onClick={() => setFrameKey((k) => k + 1)}
      >
        <RotateCcw className="size-3" />
        Replay
      </Button>

      <div
        className="relative overflow-hidden rounded-2xl border bg-background shadow-sm"
        style={{
          width: PREVIEW_W,
          height: "calc(100vh - 72px - 24px - 24px - 1px)",
          maxHeight: PREVIEW_H,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={frameKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Frame
              style={{ width: "100%", height: "100%", border: "none" }}
              head={
                <>
                  <style dangerouslySetInnerHTML={{ __html: cssText }} />
                  {(themeRegistry[theme.template?.slug ?? ""]?.fonts ?? []).map((url) => (
                    <link key={url} rel="stylesheet" href={url} />
                  ))}
                  <style>
                    {`html, body {
                        /* For Firefox */
                        scrollbar-width: none;
                              
                        /* For IE and Edge (older versions) */
                        -ms-overflow-style: none;  
                      }

                      /* For Chrome, Safari, and Opera */
                      ::-webkit-scrollbar {
                        display: none;
                      }`}
                  </style>
                </>
              }
            >
              <Wedding previewConfig={composed} />
            </Frame>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThemeSheetPreview;
