import { useGuestsQuery, useGuestsRealtime } from "./queries";
import GuestsHeader from "./components/GuestsHeader";
import GuestsView from "./components/GuestsView";
import GuestModals from "./modals";
import Container from "@/components/custom/container";

const Guests = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useGuestsQuery();
  useGuestsRealtime();

  return (
    <div className="flex flex-col md:h-full md:min-h-0">
      <GuestsHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <Container
        pageSpacing
        className="md:flex md:flex-col md:flex-1 md:min-h-0"
      >
        <GuestsView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <GuestModals />
      </Container>
    </div>
  );
};

export default Guests;
