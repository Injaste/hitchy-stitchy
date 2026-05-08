import { useEffect, useMemo } from "react";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationQuery, useThemesQuery } from "../queries";
import type { DetailsDraft } from "../types";
import type { ThemeConfig } from "@/pages/templates/themes/types";
import type { UniqueMuslimPageConfig } from "@/pages/templates/themes/unique-muslim/types";
import MainView from "./main/MainView";
import ConfigView from "./config/ConfigView";

const Details = () => {
  const { data: invitation } = useInvitationQuery();
  const { data: themes } = useThemesQuery();

  const draft = useInvitationStore((s) => s.detailsDraft);
  const setDetails = useInvitationStore((s) => s.setDetails);
  const selectedThemeId = useInvitationStore((s) => s.selectedThemeId);
  const themeDraft = useInvitationStore((s) => s.themeDraft);
  const setTheme = useInvitationStore((s) => s.setTheme);

  useEffect(() => {
    if (!invitation || draft) return;
    setDetails({
      groom_name: invitation.groom_name,
      bride_name: invitation.bride_name,
      event_date: invitation.event_date,
      event_time_start: invitation.event_time_start,
      event_time_end: invitation.event_time_end,
      venue_name: invitation.venue_name,
      venue_address: invitation.venue_address,
      venue_map_link: invitation.venue_map_link,
      venue_map_embed_url: invitation.venue_map_embed_url,
    });
  }, [invitation, draft, setDetails]);

  const selectedTheme = useMemo(
    () => themes?.find((t) => t.id === selectedThemeId) ?? null,
    [themes, selectedThemeId],
  );

  useEffect(() => {
    if (!selectedTheme || themeDraft) return;
    setTheme(selectedTheme.config);
  }, [selectedTheme?.id, themeDraft, setTheme, selectedTheme]);

  const themeSlug = themeDraft?.slug ?? selectedTheme?.config?.slug;
  const cur = (
    themeDraft?.slug === "unique-muslim" ? themeDraft : selectedTheme?.config
  ) as UniqueMuslimPageConfig | undefined;

  const updDetails = (patch: Partial<DetailsDraft>) =>
    draft && setDetails({ ...draft, ...patch });

  const updTheme = (patch: Partial<UniqueMuslimPageConfig>) => {
    const base: ThemeConfig = themeDraft ??
      selectedTheme?.config ?? { slug: "unique-muslim" };
    setTheme({ ...base, ...patch });
  };

  return (
    <>
      {themeSlug === "unique-muslim" && (
        <ConfigView config={cur} onUpdate={updTheme} />
      )}
      {draft && <MainView draft={draft} onUpdate={updDetails} />}
    </>
  );
};

export default Details;
