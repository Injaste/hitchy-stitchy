import { useEffect } from "react";

import { useInvitationQuery, usePagesQuery } from "./queries";
import InvitationModals from "./modals";
import { useInvitationDraftStore } from "./store/useInvitationDraftStore";
import InvitationHeader from "./components/InvitationHeader";
import InvitationView from "./components/InvitationView";

const Invitation = () => {
  const invitation = useInvitationQuery();
  const pages = usePagesQuery();
  const setServerInvitation = useInvitationDraftStore(
    (s) => s.setServerInvitation,
  );
  const setServerPages = useInvitationDraftStore((s) => s.setServerPages);

  useEffect(() => {
    setServerInvitation(invitation.data ?? null);
  }, [invitation.data, setServerInvitation]);

  useEffect(() => {
    setServerPages(pages.data ?? []);
  }, [pages.data, setServerPages]);

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
      <InvitationModals />
    </div>
  );
};

export default Invitation;
