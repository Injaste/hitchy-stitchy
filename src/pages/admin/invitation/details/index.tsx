import { useEffect, useMemo } from "react";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationQuery, useThemesQuery } from "../queries";
import { themeRegistry } from "@/pages/wedding/templates";
import type { DetailsDraft } from "../types";
import type { ThemeConfig } from "@/pages/wedding/templates/types";
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

  const slug = selectedTheme?.config?.slug;
  const entry = slug ? (themeRegistry[slug] ?? null) : null;

  console.log(slug);
  console.log(selectedTheme);
  console.log(entry);
  console.log(themeRegistry);

  useEffect(() => {
    if (!entry || themeDraft) return;
    const seed = Object.fromEntries(
      entry.schema.flatMap((g) => g.fields).map((f) => [f.key, null]),
    );
    setTheme({
      ...seed,
      ...(selectedTheme?.config ?? {}),
      slug,
    } as ThemeConfig);
  }, [selectedTheme?.id, themeDraft, setTheme]);

  const updDetails = (patch: Partial<DetailsDraft>) =>
    draft && setDetails({ ...draft, ...patch });

  const updTheme = (patch: Partial<ThemeConfig>) => {
    const base = themeDraft ?? ({ slug } as ThemeConfig);
    setTheme({ ...base, ...patch });
  };

  return (
    <>
      {draft && <MainView draft={draft} onUpdate={updDetails} />}
      {entry && themeDraft && (
        <ConfigView
          schema={entry.schema}
          config={themeDraft}
          onUpdate={updTheme}
        />
      )}
    </>
  );
};

export default Details;
