import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { whatsAppHref } from "@/lib/phone";
import IconSwap from "@/components/animations/animate-icon-swap";
import { TelegramIcon, WhatsAppIcon } from "@/components/custom/brand-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareLinkProps {
  /** The URL to copy / share. */
  url: string;
  /** Lead-in text for the share message; the URL is appended for WhatsApp. */
  message?: string;
  className?: string;
}

/** Telegram / WhatsApp / Copy controls for an invite link. Icon-only — the
 *  surrounding copy already explains it's a share-to-invite link. */
const ShareLink = ({ url, message, className }: ShareLinkProps) => {
  const [copied, setCopied] = useState(false);

  // WhatsApp and Copy share one text blob: append the URL unless the message
  // already places it inline (e.g. an invite template with a {link} placeholder),
  // so the link isn't posted twice. With no message it's just the URL. Telegram
  // carries the URL as its own param.
  const waText = !message
    ? url
    : message.includes(url)
      ? message
      : `${message} ${url}`;

  const handleCopy = async () => {
    // Copy the full composed message (link included), matching what the share
    // buttons send. IconSwap reverts after autoReturnMs; only flip on success.
    if (await copyToClipboard(waText)) setCopied(true);
  };

  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message ?? "")}`;
  const waHref = whatsAppHref({ type: "share", text: waText });

  const copyLabel = copied
    ? "Copied!"
    : message
      ? "Copy message"
      : "Copy link";

  return (
    <TooltipProvider delayDuration={500}>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="share" size="icon">
              <a
                href={tgHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share invite link via Telegram"
              >
                <TelegramIcon className="size-4 transition-colors group-hover/button:text-primary" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Telegram</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="share" size="icon">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share invite link via WhatsApp"
              >
                <WhatsAppIcon className="size-4 transition-colors group-hover/button:text-primary" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>WhatsApp</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="share"
              size="icon"
              onClick={handleCopy}
              aria-label={message ? "Copy invite message" : "Copy invite link"}
            >
              <IconSwap
                active={copied}
                autoReturnMs={2000}
                onAutoReturn={() => setCopied(false)}
                defaultIcon={
                  <Copy className="size-4 transition-colors group-hover/button:text-primary" />
                }
                activeIcon={<Check className="size-4 text-success" />}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copyLabel}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ShareLink;
