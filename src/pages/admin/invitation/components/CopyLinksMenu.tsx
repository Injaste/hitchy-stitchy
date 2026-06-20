import { Fragment, type FC } from "react";
import { Copy, Globe, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AdaptiveButton from "@/components/custom/adaptive-button";
import { useIsMobile } from "@/hooks/use-media-query";
import { BASE_URL } from "@/lib/config";
import { copyToClipboard } from "@/lib/utils/clipboard";
import type { RSVPMode } from "../types";

// One copyable invitation page: its URL is built from the shared event slug, and
// a private page also exposes a shared invite code.
export interface PageLink {
  /** Display name for the page (heads its section when several are shown). */
  label: string;
  linkSlug: string | null;
  mode: RSVPMode;
  code: string | null;
}

interface CopyLinksMenuProps {
  /** Event slug — shared by every page's URL. */
  slug: string;
  /** Page(s) in scope. One public page → a direct copy; a private page or several
   *  pages → a dropdown. */
  pages: PageLink[];
  /** Icon-only trigger (e.g. on the invitation card). Defaults to a labelled button. */
  compact?: boolean;
}

// Copy the shareable links for the invitation page(s) in scope: each page's URL,
// plus its invite code when the page is private. Reused on the invitation card
// (one page) and the guests toolbar (one focused page, or every page of the day).
// Assumes pages are published (the URL 404s otherwise), so callers gate on that.
const CopyLinksMenu: FC<CopyLinksMenuProps> = ({
  slug,
  pages,
  compact = false,
}) => {
  const isMobile = useIsMobile();
  const urlOf = (p: PageLink) =>
    `${BASE_URL}/${slug}${p.linkSlug ? `/${p.linkSlug}` : ""}`;

  const copy = async (value: string, label: string) => {
    const ok = await copyToClipboard(value);
    if (ok) toast.success(`${label} copied`);
    else toast.error("Couldn't copy — please copy it manually");
  };

  // A lone public page is a one-tap copy; a private page (it has an invite code)
  // or several pages need the dropdown.
  const single = pages.length === 1 ? pages[0] : null;
  const asMenu = !single || single.mode === "private";

  const menu = !asMenu ? null : single ? (
    // Single private page — already identified by context, so no page header.
    <>
      <DropdownMenuLabel>Share links</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => copy(urlOf(single), "Invitation link")}>
        <Lock className="size-4" />
        Invitation link
      </DropdownMenuItem>
      {single.code && (
        <DropdownMenuItem onClick={() => copy(single.code!, "Invite code")}>
          <KeyRound className="size-4" />
          Invite code
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {single.code}
          </span>
        </DropdownMenuItem>
      )}
    </>
  ) : (
    // Several pages — one section each, headed by the page label and split by a
    // separator, listing that page's link (and invite code when private).
    pages.map((page, i) => {
      const isPrivate = page.mode === "private";
      return (
        <Fragment key={page.linkSlug ?? `page-${i}`}>
          {i > 0 && <DropdownMenuSeparator />}
          <DropdownMenuLabel className="truncate">
            {page.label}
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => copy(urlOf(page), "Invitation link")}>
            {isPrivate ? (
              <Lock className="size-4" />
            ) : (
              <Globe className="size-4" />
            )}
            Invitation link
          </DropdownMenuItem>
          {isPrivate && page.code && (
            <DropdownMenuItem onClick={() => copy(page.code!, "Invite code")}>
              <KeyRound className="size-4" />
              Invite code
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {page.code}
              </span>
            </DropdownMenuItem>
          )}
        </Fragment>
      );
    })
  );

  return (
    <AdaptiveButton
      asMenu={asMenu}
      onClick={single ? () => copy(urlOf(single), "Invitation link") : undefined}
      menu={menu}
      hideChevron={compact}
      size={compact ? "icon" : isMobile ? "sm" : "md"}
      className={compact ? undefined : "gap-1.5 text-xs"}
      contentClassName={single ? "w-56" : "w-60"}
      aria-label="Copy invitation link"
    >
      <Copy className={compact ? undefined : "size-3.5"} />
      {!compact && (
        <span className="hidden sm:inline">Copy invitation link</span>
      )}
    </AdaptiveButton>
  );
};

export default CopyLinksMenu;
