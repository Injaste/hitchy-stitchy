import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewSlideOverProps {
  open: boolean; // mounted — render it (load the preview once)
  visible: boolean; // slid in vs hidden (never unmounts while open)
  onHide: () => void;
  // Render-prop so the preview load is deferred until the panel finishes sliding
  // in (`entered` flips true on the enter transition's end).
  children: (entered: boolean) => ReactNode;
}

// Small-screen preview drawer. Mounts once, hides (doesn't unmount) so the iframe
// persists; plays a slide-in transition and only then loads the preview.
const PreviewSlideOver = ({
  open,
  visible,
  onHide,
  children,
}: PreviewSlideOverProps) => {
  const [slideIn, setSlideIn] = useState(false);
  const [entered, setEntered] = useState(false);

  // Start off-screen, flip in one frame later so the CSS transition plays. Reset
  // on unmount so a re-open re-defers the (freshly remounted) preview.
  useEffect(() => {
    if (!open) {
      setSlideIn(false);
      setEntered(false);
      return;
    }
    if (visible) {
      const id = requestAnimationFrame(() => setSlideIn(true));
      return () => cancelAnimationFrame(id);
    }
    setSlideIn(false);
  }, [open, visible]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        onClick={onHide}
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-300",
          slideIn ? "opacity-100 pointer-events-auto" : "opacity-0",
        )}
      />
      <div
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && slideIn) setEntered(true);
        }}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-lg transition-transform duration-300 pointer-events-auto",
          slideIn ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
          <span className="font-display text-base font-medium">Preview</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onHide}
            aria-label="Hide preview"
            className="ml-auto shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1">{children(entered)}</div>
      </div>
    </div>
  );
};

export default PreviewSlideOver;
