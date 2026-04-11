import { useTimeline } from "./queries";

import TimelineHeader from "./components/TimelineHeader";
import TimelineView from "./components/TimelineView";

import TimelineCreateModal from "./modals/TimelineCreateModal";
import TimelineDetailModal from "./modals/TimelineDetailModal";
import TimelineEditModal from "./modals/TimelineEditModal";
import TimelineDeleteModal from "./modals/TimelineDeleteModal";

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
      <TimelineCreateModal />
      <TimelineEditModal />
      <TimelineDeleteModal />
      <TimelineDetailModal />
    </div>
  );
};

export default Timeline;
