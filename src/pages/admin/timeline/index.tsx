import { useTimeline } from "./queries";

import TimelineHeader from "./components/TimelineHeader";
import TimelineView from "./components/TimelineView";
import TimelineModals from "./modals";

const Timeline = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useTimeline();

  return (
    <div className="space-y-8 pb-24">
      <TimelineHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <TimelineView
        data={data}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <TimelineModals />
    </div>
  );
};

export default Timeline;
