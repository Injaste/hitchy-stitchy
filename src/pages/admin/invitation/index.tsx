import { useEventInvitationQuery } from "./queries";
import InvitationHeader from "./components/InvitationHeader";
import Hub from "./components/Hub";
import Container from "@/components/custom/container";

const Invitation = () => {
  const query = useEventInvitationQuery();

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
