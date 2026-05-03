import { useMemo, type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { Check, Globe, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useInvitationDraftStore } from "../../store/useInvitationDraftStore";
import { useThemesModalStore } from "../../store/useThemesModalStore";
import { useThemesMutations } from "../queries";
import type { Templates } from "../types";
import ThemesSkeleton from "../states/ThemesSkeleton";
import ThemesError from "../states/ThemesError";

interface ThemesViewProps {
  templates: Templates[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const ThemesView: FC<ThemesViewProps> = ({
  templates,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const { eventId } = useAdminStore();
  const themes = useInvitationDraftStore((s) => s.serverThemes);
  const selectedThemeId = useInvitationDraftStore((s) => s.selectedPageId);
  const setSelectedThemeId = useInvitationDraftStore(
    (s) => s.setSelectedPageId,
  );

  const selectedPage = useMemo(
    () => themes.find((p) => p.id === selectedThemeId) ?? null,
    [themes, selectedThemeId],
  );

  const { create, remove, publish } = useThemesMutations();
  const { openDelete, openPublish } = useThemesModalStore();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <ComponentFade key="skeleton">
          <ThemesSkeleton />
        </ComponentFade>
      ) : isError ? (
        <ComponentFade key="error">
          <ThemesError onRetry={refetch} isRetrying={isRefetching} />
        </ComponentFade>
      ) : !templates.length ? (
        <ComponentFade key="empty">
          <div className="px-4 py-8 text-xs text-muted-foreground text-center">
            No templates available.
          </div>
        </ComponentFade>
      ) : (
        <ComponentFade key="content">
          <div className="space-y-2">
            {templates.map((template) => {
              const matchingPage = themes.find(
                (p) => p.theme?.slug === template.slug,
              );
              const isCreated = !!matchingPage;
              const isSelected = selectedPage?.theme?.slug === template.slug;

              if (!isCreated) {
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
                  onClick={() =>
                    !isSelected && setSelectedThemeId(matchingPage.id)
                  }
                  className={[
                    "rounded-xl border px-3 py-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border cursor-pointer hover:border-primary/40",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {template.name}
                        </p>
                        {isSelected ? (
                          <span className="shrink-0 text-2xs font-bold uppercase tracking-wide text-primary">
                            Active
                          </span>
                        ) : (
                          <Check
                            size={13}
                            className="shrink-0 text-muted-foreground"
                          />
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {template.description}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={4}
                            className="z-50 min-w-[140px] rounded-xl border border-border bg-background shadow-md p-1 text-sm"
                          >
                            {!matchingPage.is_published && (
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted outline-none"
                                onClick={() => openPublish(matchingPage)}
                              >
                                <Globe className="h-3.5 w-3.5" /> Publish
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Separator className="h-px bg-border my-1" />
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted outline-none text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDelete(matchingPage);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ComponentFade>
      )}
    </AnimatePresence>
  );
};

export default ThemesView;
