import { useDeferredValue, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeSheetStore } from "../themes/editor/store";
import { usePreviewScale, PHONE_W, PHONE_H } from "../hooks/usePreviewScale";
import { composeInvitationConfig } from "../utils";
import InvitationPreviewFrame from "./InvitationPreviewFrame";
import type { Invitation } from "../types";

interface EditSheetPreviewProps {
  invitation: Invitation;
  entered?: boolean;
}

// Live preview of the design draft (+ hover preview-patch) composed with the
// invitation's own RSVP config. Reads the design store; RSVP edits show after save.
const EditSheetPreview = ({ invitation, entered = false }: EditSheetPreviewProps) => {
  const draft = useThemeSheetStore((s) => s.draft);
  const previewPatch = useThemeSheetStore((s) => s.previewPatch);
  const rsvp = useThemeSheetStore((s) => s.rsvp);
  const effectiveDraft = useMemo(
    () =>
      previewPatch && draft
        ? ({ ...draft, ...previewPatch } as typeof draft)
        : draft,
    [draft, previewPatch],
  );
  const deferredDraft = useDeferredValue(effectiveDraft);
  const [frameKey, setFrameKey] = useState(0);
  const scale = usePreviewScale();

  const composed = useMemo(
    () => composeInvitationConfig(invitation, deferredDraft, rsvp),
    [invitation, deferredDraft, rsvp],
  );

  if (!entered) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 max-sm:justify-start max-sm:px-2">
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
          style={{
            width: Math.round(PHONE_W * scale),
            maxHeight: Math.round(PHONE_H * scale),
          }}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm shrink-0 min-h-0 flex-1"
        >
          <InvitationPreviewFrame config={composed} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EditSheetPreview;
