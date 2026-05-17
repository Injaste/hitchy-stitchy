import { useTimelineQuery } from "./queries";

import TimelineHeader from "./components/TimelineHeader";
import TimelineView from "./components/TimelineView";
import TimelineModals from "./modals";
import Container from "@/components/custom/container";

const Timeline = () => {
  const { data, isLoading, isError, refetch, isRefetching } =
    useTimelineQuery();

  return (
    <>
      <TimelineHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <Container className="mt-8">
        <TimelineView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <TimelineModals />
      </Container>
    </>
  );
};

export default Timeline;
