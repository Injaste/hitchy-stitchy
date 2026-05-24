import { useState } from "react";
import { Check, Link as LinkIcon, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ShareRow = () => {
  const [copied, setCopied] = useState(false);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch {
      // User dismissed the sheet — not an error worth logging.
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

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Share Hitchy Stitchy
      </span>

      {canNativeShare ? (
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      ) : (
        <Button
          variant={copied ? "default" : "outline"}
          size="sm"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ShareRow;
