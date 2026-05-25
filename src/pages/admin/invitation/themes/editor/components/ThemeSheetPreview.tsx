import Frame from "react-frame-component";
import cssText from "/src/index.css?inline";
import { useDeferredValue, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import Wedding from "@/pages/wedding";

import { useInvitationQuery } from "../../../queries";
import { composeEventConfig } from "../../../utils";
import { useThemeSheetStore } from "../store";
import type { Theme } from "../../../types";

const PHONE_W = 400;
const PHONE_H = 867;
const PREVIEW_SCALE = 0.9;
const PREVIEW_W = Math.round(PHONE_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(PHONE_H * PREVIEW_SCALE);

interface ThemeSheetPreviewProps {
  theme: Theme;
  entered?: boolean;
}

const ThemeSheetPreview = ({
  theme,
  entered = false,
}: ThemeSheetPreviewProps) => {
  const draft = useThemeSheetStore((s) => s.draft);
  const deferredDraft = useDeferredValue(draft);
  const { data: invitation } = useInvitationQuery();
  const [frameKey, setFrameKey] = useState(0);

  const composed = useMemo(() => {
    if (!invitation) return null;
    return composeEventConfig(invitation, theme, deferredDraft);
  }, [invitation, theme, deferredDraft]);

  if (!composed || !entered) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full shadow-sm gap-1.5 text-xs"
        onClick={() => setFrameKey((k) => k + 1)}
      >
        <RotateCcw className="size-3" />
        Refresh Preview
      </Button>

      <AnimatePresence mode="wait">
        <motion.div
          key={frameKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ width: PREVIEW_W, maxHeight: PREVIEW_H }}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm shrink-0 min-h-0 flex-1"
        >
          <Frame
            style={{ width: "100%", height: "100%", border: "none" }}
            head={
              <>
                <style dangerouslySetInnerHTML={{ __html: cssText }} />
                <style>
                  {`html, body {
                      scrollbar-width: none;
                      -ms-overflow-style: none;
                    }
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
  );
};

export default ThemeSheetPreview;
