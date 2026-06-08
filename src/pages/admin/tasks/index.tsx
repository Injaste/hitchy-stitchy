import { useTasksQuery } from "./queries";
import TasksHeader from "./components/TasksHeader";
import TasksView from "./components/TasksView";
import TaskModals from "./modals";
import CardFlyOverlay from "./components/CardFlyOverlay";

/**
 * Tasks page entry. Composition only — all data prep, layout, and
 * state handling lives in TasksView. The outer wrapper claims the
 * AdminView wrapper's remaining flex space on desktop so TasksView can
 * size its own grid; mobile is a normal vertical flow.
 */
const Tasks = () => {
  const tasks = useTasksQuery();

  return (
    <div className="flex flex-col md:h-full md:min-h-0">
      <TasksHeader
        isLoading={tasks.isLoading}
        isError={tasks.isError}
        isRefetching={tasks.isRefetching}
        refetch={tasks.refetch}
        data={tasks.data}
      />
      <TasksView
        data={tasks.data}
        isLoading={tasks.isLoading}
        isError={tasks.isError}
        isRefetching={tasks.isRefetching}
        refetch={tasks.refetch}
      />
      <TaskModals />
      <CardFlyOverlay />
    </div>
  );
};

export default Tasks;
