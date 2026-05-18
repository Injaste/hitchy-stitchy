import { useInvitationQuery, useThemesQuery } from "./queries";
import InvitationHeader from "./components/InvitationHeader";
import InvitationView from "./components/InvitationView";
import ThemeModals from "./themes/modals";
import Container from "@/components/custom/container";

const Invitation = () => {
  const invitationQuery = useInvitationQuery();
  const themesQuery = useThemesQuery();

  const isLoading = invitationQuery.isLoading || themesQuery.isLoading;
  const isError = invitationQuery.isError || themesQuery.isError;
  const isRefetching = invitationQuery.isRefetching || themesQuery.isRefetching;

  const refetch = () => {
    invitationQuery.refetch();
    themesQuery.refetch();
  };

  return (
    <>
      <InvitationHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container className="mt-8">
        <InvitationView
          isLoading={isLoading}
          isError={isError}
          isRefetching={isRefetching}
          refetch={refetch}
        />
        <ThemeModals />
      </Container>
    </>
  );
};

export default Invitation;
