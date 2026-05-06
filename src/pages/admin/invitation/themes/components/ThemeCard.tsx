import { type FC } from "react";
import { MoreHorizontal, Plus, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationStore } from "../../store/useInvitationStore";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";
import { cn } from "@/lib/utils";
import type { Template, Theme } from "../../types";

interface ThemeCardProps {
  template: Template;
}

const ThemeCard: FC<ThemeCardProps> = ({ template }) => {
  const { eventId } = useAdminStore();
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId);
  const setSelectedThemeId = useInvitationStore((s) => s.setSelectedThemeId);
  const openCreate = useInvitationModalStore((s) => s.openCreate);
  const openDelete = useInvitationModalStore((s) => s.openDelete);
  const openPublish = useInvitationModalStore((s) => s.openPublish);
  const { create } = useThemesMutations();

  const isCreated = template.themeId !== null;
  const isActive = selectedThemeId === template.themeId;
  const isPublished = template.isPublished;

  const theme: Theme = {
    id: template.themeId!,
    event_id: eventId!,
    template_id: template.id,
    name: template.name,
    is_published: isPublished,
    config: {},
    created_at: "",
    updated_at: "",
  };

  return (
    <Card
      onClick={() =>
        isCreated && !isActive && setSelectedThemeId(template.themeId!)
      }
      className={cn(
        "px-3 py-3 transition-colors",
        !isCreated && "border-dashed opacity-60",
        isCreated && !isActive && "cursor-pointer hover:border-primary/40",
        isActive && "border-primary bg-primary/5 cursor-default",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium truncate",
                !isCreated && "text-foreground/60",
              )}
            >
              {template.name}
            </p>
            {isPublished && (
              <Badge
                variant="outline"
                className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary border-primary/30"
              >
                Live
              </Badge>
            )}
            {isActive && !isPublished && (
              <span className="shrink-0 text-2xs font-bold uppercase tracking-wide text-muted-foreground">
                Editing
              </span>
            )}
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {template.description}
            </p>
          )}
        </div>

        {!isCreated && (
          <Button
            size="sm"
            variant="outline"
            disabled={create.isPending}
            onClick={(e) => {
              e.stopPropagation();
              openCreate(template.id);
            }}
            className="shrink-0 gap-1"
          >
            <Plus size={12} />
            Use
          </Button>
        )}

        {isActive && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" sideOffset={4}>
                {!isPublished && (
                  <DropdownMenuItem onClick={() => openPublish(theme)}>
                    <Globe className="h-3.5 w-3.5" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={isPublished}
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPublished) openDelete(theme);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
};

export default ThemeCard;
