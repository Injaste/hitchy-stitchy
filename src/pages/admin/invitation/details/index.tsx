import { useEffect } from "react";
import {
  useInvitationStore,
  type ThemeDraftValues,
} from "../store/useInvitationStore";
import { useInvitationQuery, useSelectedTemplateTheme } from "../queries";
import type { DetailsDraft } from "../types";
import MainView from "./main/MainView";
import ConfigView from "./config/ConfigView";

const Details = () => {
  const { data: invitation } = useInvitationQuery();
  const selected = useSelectedTemplateTheme();

  const draft = useInvitationStore((s) => s.detailsDraft);
  const setDetails = useInvitationStore((s) => s.setDetails);
  const themeDraft = useInvitationStore((s) => s.themeDraft);
  const setTheme = useInvitationStore((s) => s.setTheme);

  useEffect(() => {
    if (!invitation || draft) return;
    setDetails(
      {
        groom_name: invitation.groom_name,
        bride_name: invitation.bride_name,
        event_date: invitation.event_date,
        event_time_start: invitation.event_time_start,
        event_time_end: invitation.event_time_end,
        venue_name: invitation.venue_name,
        venue_address: invitation.venue_address,
        venue_map_link: invitation.venue_map_link,
        venue_map_embed_url: invitation.venue_map_embed_url,
      },
      false,
    );
  }, [invitation, draft, setDetails]);

  useEffect(() => {
    if (!selected || themeDraft) return;
    const saved = selected.theme.config as Record<
      string,
      string | null | undefined
    >;
    const seed = Object.fromEntries(
      selected.entry.schema
        .flatMap((g) => g.fields)
        .map((f) => [f.key, saved[f.key] ?? null]),
    );
    setTheme(seed, false);
  }, [selected, themeDraft, setTheme]);

  const updDetails = (patch: Partial<DetailsDraft>) =>
    draft && setDetails({ ...draft, ...patch });

  const updTheme = (patch: ThemeDraftValues) =>
    themeDraft && setTheme({ ...themeDraft, ...patch });

  return (
    <div className="space-y-3">
      {draft && <MainView draft={draft} onUpdate={updDetails} />}
      {selected && themeDraft && (
        <ConfigView
          schema={selected.entry.schema}
          config={themeDraft}
          onUpdate={updTheme}
        />
      )}
    </div>
  );
};

export default Details;
