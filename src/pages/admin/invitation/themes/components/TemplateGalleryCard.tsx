import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Pencil,
  MoreHorizontal,
  Globe,
  Trash2,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
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
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";
import type { TemplateTheme, Theme } from "../../types";

interface TemplateGalleryCardProps {
  template: TemplateTheme;
  onEdit: (themeId: string) => void;
}

type CardState = "unused" | "draft" | "published";

const getState = (template: TemplateTheme): CardState => {
  if (!template.theme_id) return "unused";
  return template.published_at ? "published" : "draft";
};

const TemplateGalleryCard = ({
  template,
  onEdit,
}: TemplateGalleryCardProps) => {
  const { eventId } = useAdminStore();
  const openCreate = useInvitationModalStore((s) => s.openCreate);
  const openDelete = useInvitationModalStore((s) => s.openDelete);
  const openPublish = useInvitationModalStore((s) => s.openPublish);
  const { create } = useThemesMutations();

  const state = getState(template);
  const isUsed = state !== "unused";

  const theme: Theme | null = isUsed
    ? {
        id: template.theme_id!,
        event_id: eventId!,
        template_id: template.id,
        name: template.theme_name ?? template.name,
        published_at: template.published_at,
        config: { slug: null },
        created_at: "",
        updated_at: template.theme_updated_at ?? "",
      }
    : null;

  const lastEdited =
    isUsed && template.theme_updated_at
      ? formatDistanceToNow(new Date(template.theme_updated_at), {
          addSuffix: true,
        })
      : null;

  return (
    <Card className="relative aspect-9/10 overflow-hidden p-0 group">
      <div className="absolute inset-0 bg-linear-to-b from-primary/20 to-secondary/15 flex items-center justify-center">
        {/* <Sparkles className="h-12 w-12 text-muted-foreground/30" /> */}
        <img src="/dannad.png" className="" />
      </div>

      {state === "published" && (
        <Badge
          variant="outline"
          className="absolute top-3 right-3 z-20 text-2xs font-bold uppercase tracking-wide bg-background/80 backdrop-blur-sm text-primary border-primary/30"
        >
          Live
        </Badge>
      )}

      <div
        className="absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-md pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 40%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 40%, black 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent via-background/40 to-background/90 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="text-sm font-medium font-display truncate">
              {isUsed ? theme!.name : template.name}
            </h4>
            {isUsed ? (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <span className="truncate">{template.name}</span>
                {lastEdited && (
                  <>
                    <span>·</span>
                    <RotateCw className="h-3 w-3 shrink-0" />
                    <span className="truncate">{lastEdited}</span>
                  </>
                )}
              </p>
            ) : (
              template.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {template.description}
                </p>
              )
            )}
          </div>
          {isUsed && theme && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 -mt-1 -mr-1 backdrop-blur-sm bg-background/60"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" sideOffset={4}>
                  <DropdownMenuItem
                    disabled={state === "published"}
                    onClick={() => openPublish(theme)}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Publish
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      if (state === "published")
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
          )}
        </div>

        {state === "unused" && (
          <Button
            size="sm"
            variant="outline"
            disabled={create.isPending}
            onClick={() => openCreate(template.id)}
            className="w-full gap-1 backdrop-blur-sm bg-background/60"
          >
            <Plus className="h-3.5 w-3.5" />
            Start with this
          </Button>
        )}

        {isUsed && theme && (
          <Button size="sm" onClick={() => onEdit(theme.id)} className="w-full">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TemplateGalleryCard;
