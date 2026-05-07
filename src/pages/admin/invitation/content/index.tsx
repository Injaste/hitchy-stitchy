import { useEffect, useMemo } from "react";
import { useInvitationStore } from "../store/useInvitationStore";
import { useThemesQuery } from "../queries";
import type { ThemeConfig } from "@/pages/templates/themes/types";
import type { UniqueMuslimPageConfig } from "@/pages/templates/themes/unique-muslim/types";
import ContentView from "./components/ContentView";

const Content = () => {
  const { data: themes } = useThemesQuery();
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId);
  const themeDraft = useInvitationStore((s) => s.themeDraft);
  const setTheme = useInvitationStore((s) => s.setTheme);

  const selectedTheme = useMemo(
    () => themes?.find((t) => t.id === selectedThemeId) ?? null,
    [themes, selectedThemeId],
  );

  useEffect(() => {
    if (!selectedTheme || themeDraft) return;
    setTheme(selectedTheme.config);
  }, [selectedTheme?.id, themeDraft, setTheme, selectedTheme]);

  const themeSlug = themeDraft?.slug ?? selectedTheme?.config?.slug;

  if (!themeSlug) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground text-center">
        Select a template to configure its content.
      </p>
    );
  }

  if (themeSlug !== "unique-muslim") return null;

  const cur = (
    themeDraft?.slug === "unique-muslim" ? themeDraft : selectedTheme?.config
  ) as UniqueMuslimPageConfig | undefined;

  const upd = (patch: Partial<UniqueMuslimPageConfig>) => {
    const base: ThemeConfig = themeDraft ??
      selectedTheme?.config ?? { slug: "unique-muslim" };
    setTheme({ ...base, ...patch });
  };

  return <ContentView config={cur} onUpdate={upd} />;
};

export default Content;
