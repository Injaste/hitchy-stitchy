import { useEffect } from "react";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationQuery } from "../queries";
import type { DetailsDraft } from "../types";
import DetailsView from "./components/DetailsView";

const Details = () => {
  const { data: invitation } = useInvitationQuery();
  const draft = useInvitationStore((s) => s.detailsDraft);
  const setDetails = useInvitationStore((s) => s.setDetails);

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

  if (!draft) return null;

  const upd = (patch: Partial<DetailsDraft>) =>
    setDetails({ ...draft, ...patch });

  return <DetailsView draft={draft} onUpdate={upd} />;
};

export default Details;
