import { useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import SubmitButton from "@/components/custom/form/SubmitButton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { themeRegistry } from "@/pages/wedding/templates";
import { useTemplatesQuery, useEventInvitationMutations } from "../queries";
import type { EventInvitation, Template } from "../types";

interface BrowsePanelProps {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onUsed: (invitation: EventInvitation) => void;
}

// Left pane of the invitation sheet in "browse" mode: the template list + a
// "Use this template" action. Selection is lifted to the shell so the shared
// preview pane (right) can render it.
const BrowsePanel = ({ selectedSlug, onSelect, onUsed }: BrowsePanelProps) => {
  const { data: templates } = useTemplatesQuery();
  const { create, eventId } = useEventInvitationMutations();

  const usable = useMemo(
    () => (templates ?? []).filter((t) => themeRegistry[t.slug]),
    [templates],
  );

  const selected: Template | null =
    usable.find((t) => t.slug === selectedSlug) ?? usable[0] ?? null;

  // Seed the shell's selection so the preview has something to show.
  useEffect(() => {
    if (!selectedSlug && selected) onSelect(selected.slug);
  }, [selectedSlug, selected, onSelect]);

  const handleUse = () => {
    if (!selected || !eventId) return;
    create
      .mutateAsync({
        event_id: eventId,
        template_key: selected.slug,
        name: selected.name,
      })
      .then((inv) => onUsed(inv))
      .catch(() => {
        // toast handled by the mutation
      });
  };

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {usable.length === 0 && (
          <p className="text-sm text-muted-foreground px-1 py-6">
            No templates available yet.
          </p>
        )}
        {usable.map((t) => {
          const isSel = selected?.slug === t.slug;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.slug)}
              className={cn(
                "w-full text-left flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors",
                isSel
                  ? "border-primary ring-3 ring-primary/20"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div className="size-14 shrink-0 rounded-md bg-linear-to-b from-primary/20 to-secondary/15 grid place-items-center font-display text-sm text-foreground/70">
                {t.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium font-display truncate">
                  {t.name}
                </h4>
                {t.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {t.description}
                  </p>
                )}
              </div>
              {isSel && <Check className="size-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <>
          <Separator />
          <div className="flex items-center gap-3 p-4 bg-background">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium font-display truncate">
                {selected.name}
              </h3>
              {selected.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {selected.description}
                </p>
              )}
            </div>
            <SubmitButton
              type="button"
              size="sm"
              onClick={handleUse}
              disabled={create.isPending}
              isPending={create.isPending}
              isSuccess={create.isSuccess}
              isError={create.isError}
            >
              Use this template
            </SubmitButton>
          </div>
        </>
      )}
    </div>
  );
};

export default BrowsePanel;
