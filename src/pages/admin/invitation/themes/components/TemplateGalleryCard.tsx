import { Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import { useThemesMutations } from "../../queries";
import type { TemplateTheme } from "../../types";

interface TemplateGalleryCardProps {
  template: TemplateTheme;
}

const TemplateGalleryCard = ({ template }: TemplateGalleryCardProps) => {
  const openCreate = useInvitationModalStore((s) => s.openCreate);
  const { create } = useThemesMutations();

  return (
    <Card className="p-5 hover:border-primary/40 transition-colors flex flex-col gap-4">
      <div className="aspect-[3/4] rounded-md bg-muted/40 flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <div className="flex flex-col gap-1 min-h-0 flex-1">
        <h4 className="text-sm font-medium font-display">{template.name}</h4>
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={create.isPending}
        onClick={() => openCreate(template.id)}
        className="w-full gap-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Use this template
      </Button>
    </Card>
  );
};

export default TemplateGalleryCard;
