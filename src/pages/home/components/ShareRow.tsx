import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";

const ShareRow = () => {
  const [copied, setCopied] = useState(false);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = async () => {
    try {
      await navigator.share({ title: document.title, url: window.location.href });
    } catch {
      // dismissed
    }
  };

  const handleCopy = async () => {
    if (await copyToClipboard(window.location.href)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return canNativeShare ? (
    <button
      onClick={handleShare}
      className="group inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-foreground/20 transition-colors cursor-pointer"
    >
      <Share2 className="w-4 h-4 transition-colors group-hover:text-primary" />
      Share Hitchy Stitchy
    </button>
  ) : (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-muted-foreground ring-1 ring-border hover:text-foreground hover:ring-foreground/20 transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" />
          <span className="text-success">Link copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 transition-colors group-hover:text-primary" />
          Share Hitchy Stitchy
        </>
      )}
    </button>
  );
};

export default ShareRow;
