import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

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
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return canNativeShare ? (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <Share2 className="w-4 h-4" />
      Share Hitchy Stitchy
    </button>
  ) : (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Link copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Share Hitchy Stitchy
        </>
      )}
    </button>
  );
};

export default ShareRow;
