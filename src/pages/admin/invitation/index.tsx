import { useEffect } from "react";

import { useInvitationQuery } from "./queries";
import ThemesModals from "./themes/modals";
import { useInvitationDraftStore } from "./store/useInvitationDraftStore";
import InvitationHeader from "./components/InvitationHeader";
import InvitationView from "./components/InvitationView";
import { useThemesQuery } from "./themes/queries";

const Invitation = () => {
  const invitation = useInvitationQuery();
  const pages = useThemesQuery();
  const setServerInvitation = useInvitationDraftStore(
    (s) => s.setServerInvitation,
  );
  const setServerThemes = useInvitationDraftStore((s) => s.setServerThemes);

  useEffect(() => {
    setServerInvitation(invitation.data ?? null);
  }, [invitation.data, setServerInvitation]);

  useEffect(() => {
    setServerThemes(pages.data ?? []);
  }, [pages.data, setServerThemes]);

  const isLoading = invitation.isLoading || pages.isLoading;
  const isError = invitation.isError || pages.isError;
  const refetch = () => {
    invitation.refetch();
    pages.refetch();
  };
  const isRefetching = invitation.isRefetching || pages.isRefetching;

  return (
    <div className="space-y-8">
      <InvitationHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <InvitationView
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <ThemesModals />
    </div>
  );
};

export default Invitation;
