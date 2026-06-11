import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import IconSwap from "@/components/animations/animate-icon-swap";

interface ShareLinkProps {
  /** The URL to copy / share. */
  url: string;
  /** Lead-in text for the share message; the URL is appended for WhatsApp. */
  message?: string;
  className?: string;
}

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.581 0 11.94-5.359 11.943-11.945a11.88 11.88 0 00-3.495-8.4z" />
  </svg>
);

/** Telegram / WhatsApp / Copy controls for an invite link. Icon-only — the
 *  surrounding copy already explains it's a share-to-invite link. */
const ShareLink = ({ url, message, className }: ShareLinkProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true); // IconSwap reverts to the copy icon after autoReturnMs
    } catch {
      // clipboard unavailable — nothing to recover
    }
  };

  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message ?? "")}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(message ? `${message} ${url}` : url)}`;

  const btn =
    "group inline-flex size-9 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-foreground/20 cursor-pointer";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href={tgHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share invite link via Telegram"
        title="Telegram"
        className={btn}
      >
        <TelegramIcon className="size-4 transition-colors group-hover:text-primary" />
      </a>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share invite link via WhatsApp"
        title="WhatsApp"
        className={btn}
      >
        <WhatsAppIcon className="size-4 transition-colors group-hover:text-primary" />
      </a>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy invite link"
        title="Copy link"
        className={btn}
      >
        <IconSwap
          active={copied}
          autoReturnMs={2000}
          onAutoReturn={() => setCopied(false)}
          defaultIcon={
            <Copy className="size-4 transition-colors group-hover:text-primary" />
          }
          activeIcon={<Check className="size-4 text-success" />}
        />
      </button>
    </div>
  );
};

export default ShareLink;
