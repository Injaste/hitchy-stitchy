import { useEventInvitationsQuery } from "./queries";
import InvitationHeader from "./components/InvitationHeader";
import Hub from "./components/Hub";
import Container from "@/components/custom/container";

const Invitation = () => {
  const query = useEventInvitationsQuery();

  return (
    <>
      <InvitationHeader
        isLoading={query.isLoading}
        isError={query.isError}
        isRefetching={query.isRefetching}
        refetch={query.refetch}
      />
      <Container pageSpacing>
        <Hub />
      </Container>
    </>
  );
};

export default Invitation;
