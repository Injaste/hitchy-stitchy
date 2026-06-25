import { useInvitationsQuery } from "./queries";
import InvitationHeader from "./components/InvitationHeader";
import InvitationView from "./components/InvitationView";
import InvitationSheet from "./components/InvitationSheet";
import BespokeRequestModal from "./modals/BespokeRequestModal";
import Container from "@/components/custom/container";

const Invitation = () => {
  const { data, isLoading, isError, isRefetching, refetch } =
    useInvitationsQuery();

  return (
    <>
      <InvitationHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <Container pageSpacing>
        <InvitationView
          data={data}
          isLoading={isLoading}
          isError={isError}
          isRefetching={isRefetching}
          refetch={refetch}
        />
      </Container>
      <InvitationSheet />
      <BespokeRequestModal />
    </>
  );
};

export default Invitation;
