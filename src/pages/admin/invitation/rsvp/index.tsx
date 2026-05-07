import { useEffect } from "react";
import { useInvitationStore } from "../store/useInvitationStore";
import { useInvitationQuery } from "../queries";
import type { RSVPDraft } from "../types";
import RSVPView from "./components/RSVPView";

const RSVP = () => {
  const { data: invitation } = useInvitationQuery();
  const draft = useInvitationStore((s) => s.rsvpDraft);
  const setRSVP = useInvitationStore((s) => s.setRSVP);

  useEffect(() => {
    if (!invitation || draft) return;
    setRSVP({
      rsvp_mode: invitation.rsvp_mode,
      rsvp_deadline: invitation.rsvp_deadline ?? "",
      config: invitation.config.rsvp,
      max_guests: invitation.max_guests,
      guest_count_min: invitation.guest_count_min,
      guest_count_max: invitation.guest_count_max,
      confirmation_message: invitation.confirmation_message,
    });
  }, [invitation, draft, setRSVP]);

  if (!draft) return null;

  const upd = (patch: Partial<RSVPDraft>) => setRSVP({ ...draft, ...patch });

  return <RSVPView draft={draft} onUpdate={upd} />;
};

export default RSVP;
