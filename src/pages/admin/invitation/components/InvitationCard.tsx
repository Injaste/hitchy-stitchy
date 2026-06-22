import { Link } from "react-router-dom";
import { LayoutTemplate, Pencil, ExternalLink, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import RelativeTime from "@/components/custom/relative-time";
import { cn } from "@/lib/utils";
import { deepEqual } from "../utils";
import CopyLinksMenu from "./CopyLinksMenu";
import type { Invitation } from "../types";

interface InvitationCardProps {
  invitation: Invitation;
  label: string;
  dateLabel: string | null;
  slug: string;
  onEdit: () => void;
}

// Compact info card (mirrors the dashboard EventCard). Live vs Draft read at a
// glance via the colour scheme: Live is primary-accented + solid; Draft is muted
// with a dashed border. A CloudUpload icon beside the Live badge flags a live page
// whose draft has edits not yet published. Tokens only — no colours.
const InvitationCard = ({
  invitation,
  label,
  dateLabel,
  slug,
  onEdit,
}: InvitationCardProps) => {
  const isLive = !!invitation.published_at;
  const hasUnpublishedChanges =
    isLive && !deepEqual(invitation.draft_config, invitation.published_config);
  const path = invitation.link_slug ? `/${slug}/${invitation.link_slug}` : `/${slug}`;

  // Live + in sync → "Published x ago"; otherwise (draft, or live with pending
  // edits) the meaningful timestamp is the last edit.
  const stampDate =
    isLive && !hasUnpublishedChanges
      ? invitation.published_at!
      : invitation.updated_at;
  const stampPrefix = isLive && !hasUnpublishedChanges ? "Published" : "Edited";

  return (
    <Card
      variant="interactive"
      onClick={onEdit}
      className={cn(
        "group/inv-card cursor-pointer",
        !isLive && "border-dashed bg-muted/30",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-0">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
            isLive
              ? "bg-primary/10 group-hover/inv-card:bg-primary/15"
              : "bg-muted",
          )}
        >
          <LayoutTemplate
            className={cn(
              "w-5 h-5",
              isLive ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {hasUnpublishedChanges && (
            <Tooltip>
              <TooltipTrigger asChild>
                <CloudUpload className="size-4 text-primary" />
              </TooltipTrigger>
              <TooltipContent>Unpublished changes</TooltipContent>
            </Tooltip>
          )}
          <Badge variant={isLive ? "default" : "outline"} className="capitalize">
            {isLive ? "Live" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <h3 className="font-display font-bold text-foreground text-xl leading-snug mb-1 truncate">
          {label}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {dateLabel ? `${dateLabel} · ` : ""}RSVP {invitation.rsvp_mode}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{path}</p>
        <div className="mt-2">
          <RelativeTime date={stampDate} prefix={stampPrefix} />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant={isLive ? "default" : "outline"}
            onClick={onEdit}
            className="flex-1 gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
          {isLive && (
            <>
              <span onClick={(e) => e.stopPropagation()}>
                <CopyLinksMenu
                  compact
                  slug={slug}
                  pages={[
                    {
                      label,
                      linkSlug: invitation.link_slug,
                      mode: invitation.rsvp_mode,
                      code: invitation.private_code,
                    },
                  ]}
                />
              </span>
              <Button
                size="icon"
                variant="outline"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link to={path} target="_blank" aria-label="Open live page">
                  <ExternalLink />
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationCard;
