import { type FC } from "react";
import { Check, Globe, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { useInvitationStore } from "../../store/useInvitationDraftStore";
import type { Template } from "../types";
import { useThemesMutations } from "../queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeCardProp {
  template: Template;
  created: boolean;
}

const ThemeCard: FC<ThemeCardProp> = ({ template, created }) => {
  const { eventId } = useAdminStore();

  const selectedThemeId = useInvitationStore((s) => s.selectedPageId);
  const setSelectedThemeId = useInvitationStore((s) => s.setSelectedPageId);

  const { create, remove, publish } = useThemesMutations();

  if (!created) {
    return (
      <div
        key={template.id}
        className="rounded-xl border border-dashed border-border px-3 py-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground/60 truncate">
              {template.name}
            </p>
            {template.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {template.description}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={create.isPending}
            onClick={() =>
              create.mutate({
                event_id: eventId!,
                template_id: template.id,
              })
            }
            className="shrink-0 flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
          >
            <Plus size={12} />
            Create
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      key={template.id}
      // onClick={() => !selectedThemeId && setSelectedThemeId(matchingPage.id)}
      onClick={() => !selectedThemeId}
      className={[
        "rounded-xl border px-3 py-3 transition-colors",
        selectedThemeId
          ? "border-primary bg-primary/5"
          : "border-border cursor-pointer hover:border-primary/40",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{template.name}</p>
            {selectedThemeId ? (
              <span className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary">
                Active
              </span>
            ) : (
              <Check size={13} className="shrink-0 text-muted-foreground" />
            )}
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {template.description}
            </p>
          )}
        </div>

        {selectedThemeId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="z-50 min-w-[140px] rounded-xl border border-border bg-background shadow-md p-1 text-sm"
            >
              {/* {!matchingPage.is_published && ( */}
              <DropdownMenuItem
              // onClick={() => openPublish(matchingPage)}
              >
                <Globe className="h-3.5 w-3.5" /> Publish
              </DropdownMenuItem>
              {/* )} */}
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  // openDelete(matchingPage);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default ThemeCard;
