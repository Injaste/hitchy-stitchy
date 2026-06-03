import { useTimelineQuery, useTimelineRealtime } from "./queries";

import TimelineHeader from "./components/TimelineHeader";
import TimelineView from "./components/TimelineView";
import Container from "@/components/custom/container";

const Timeline = () => {
  const { data, isLoading, isError, refetch, isRefetching } =
    useTimelineQuery();
  useTimelineRealtime();

  return (
    <>
      <TimelineHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <Container pageSpacing>
        <TimelineView
          data={data}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
      </Container>
    </>
  );
};

export default Timeline;
