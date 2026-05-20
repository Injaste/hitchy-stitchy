import { formatDistanceToNow } from "date-fns";
import { Pencil, MoreHorizontal, Globe, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import type { TemplateTheme, Theme } from "../../types";

interface ActiveThemeCardProps {
  template: TemplateTheme;
  onEdit: (themeId: string) => void;
}

const ActiveThemeCard = ({ template, onEdit }: ActiveThemeCardProps) => {
  const { eventId } = useAdminStore();
  const openDelete = useInvitationModalStore((s) => s.openDelete);
  const openPublish = useInvitationModalStore((s) => s.openPublish);

  if (!template.theme_id) return null;

  const theme: Theme = {
    id: template.theme_id,
    event_id: eventId!,
    template_id: template.id,
    name: template.theme_name ?? template.name,
    is_published: template.is_published,
    config: { slug: null },
    created_at: "",
    updated_at: template.theme_updated_at ?? "",
  };

  const lastEdited = template.theme_updated_at
    ? formatDistanceToNow(new Date(template.theme_updated_at), {
        addSuffix: true,
      })
    : null;

  return (
    <Card className="px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium truncate font-display">
              {theme.name}
            </h3>
            {template.is_published && (
              <Badge
                variant="outline"
                className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary border-primary/30"
              >
                Live
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {template.name}
            {lastEdited && (
              <>
                {" · "}
                Last edited {lastEdited}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => onEdit(theme.id)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" sideOffset={4}>
                {!template.is_published && (
                  <DropdownMenuItem onClick={() => openPublish(theme)}>
                    <Globe className="h-3.5 w-3.5" />
                    Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (template.is_published)
                      toast.error("Can't delete a published theme");
                    else openDelete(theme);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default ActiveThemeCard;
