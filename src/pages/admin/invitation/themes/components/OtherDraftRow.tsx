import { formatDistanceToNow } from "date-fns";
import { Pencil, MoreHorizontal, Globe, Trash2 } from "lucide-react";
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

interface OtherDraftRowProps {
  template: TemplateTheme;
  onEdit: (themeId: string) => void;
}

const OtherDraftRow = ({ template, onEdit }: OtherDraftRowProps) => {
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
    ? formatDistanceToNow(new Date(template.theme_updated_at), { addSuffix: true })
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{theme.name}</p>
        <p className="text-xs text-muted-foreground">
          {template.name}
          {lastEdited && (
            <>
              {" · "}
              {lastEdited}
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => onEdit(theme.id)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem onClick={() => openPublish(theme)}>
                <Globe className="h-3.5 w-3.5" />
                Publish
              </DropdownMenuItem>
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
  );
};

export default OtherDraftRow;
