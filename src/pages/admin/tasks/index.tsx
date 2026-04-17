import { useTasksQuery, useTaskOrderQuery } from "./queries";
import TasksHeader from "./components/TasksHeader";
import TasksView from "./components/TasksView";
import TaskModals from "./modals";

const Tasks = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useTasksQuery();
  const { data: taskOrder } = useTaskOrderQuery();

  return (
    <div className="space-y-8">
      <TasksHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <TasksView
        data={data}
        taskOrder={taskOrder}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <TaskModals />
    </div>
  );
};

export default Tasks;
