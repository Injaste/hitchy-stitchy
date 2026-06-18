import type { FC } from "react";
import { Copy, ChevronDown, Globe, Lock, KeyRound, MessageSquareShare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASE_URL } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils/clipboard";
import {
  buildInviteMessage,
  DEFAULT_INVITE_MESSAGE,
  type RSVPMode,
} from "../types";

interface CopyLinksMenuProps {
  slug: string;
  linkSlug: string | null;
  mode: RSVPMode;
  code: string | null;
  /** Saved invite-message lead-in (rsvp_config.messages.invite_message). */
  inviteMessage?: string | null;
  /** Icon-only trigger (e.g. on the invitation card). Defaults to a labelled button. */
  compact?: boolean;
}

// Copy the shareable links for one invitation page: the page URL, plus the invite
// code and a ready-to-send message when the page is private. Reused on the
// invitation card and the guests toolbar. Assumes the page is published (the URL
// 404s otherwise), so callers gate on that.
const CopyLinksMenu: FC<CopyLinksMenuProps> = ({
  slug,
  linkSlug,
  mode,
  code,
  inviteMessage,
  compact = false,
}) => {
  const url = `${BASE_URL}/${slug}${linkSlug ? `/${linkSlug}` : ""}`;
  const gated = mode === "private";

  const copy = async (value: string, label: string) => {
    const ok = await copyToClipboard(value);
    if (ok) toast.success(`${label} copied`);
    else toast.error("Couldn't copy — please copy it manually");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button size="icon" variant="outline" aria-label="Copy links">
            <Copy />
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Copy className="size-3.5" />
            Copy link
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share links</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => copy(url, gated ? "Invitation link" : "Public link")}
        >
          {gated ? <Lock className="size-4" /> : <Globe className="size-4" />}
          {gated ? "Invitation link" : "Public link"}
        </DropdownMenuItem>

        {gated && code && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => copy(code, "Invite code")}>
              <KeyRound className="size-4" />
              Invite code
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {code}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                copy(
                  buildInviteMessage(
                    inviteMessage || DEFAULT_INVITE_MESSAGE,
                    url,
                    code,
                  ),
                  "Invite message",
                )
              }
            >
              <MessageSquareShare className="size-4" />
              Invite message
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CopyLinksMenu;
