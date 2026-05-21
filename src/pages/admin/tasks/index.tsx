import { useTasksQuery, useTaskOrderQuery } from "./queries";
import TasksHeader from "./components/TasksHeader";
import Board from "./components/Board";
import TaskModals from "./modals";

/**
 * Tasks page entry. Composition only — all data prep, layout, and
 * state handling lives in Board. The outer wrapper claims the
 * AdminView wrapper's remaining flex space on desktop so Board can
 * size its own grid; mobile is a normal vertical flow.
 */
const Tasks = () => {
  const tasks = useTasksQuery();
  const order = useTaskOrderQuery();

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      <TasksHeader
        isLoading={tasks.isLoading}
        isError={tasks.isError}
        isRefetching={tasks.isRefetching}
        refetch={tasks.refetch}
        data={tasks.data}
      />
      <Board
        data={tasks.data}
        taskOrder={order.data}
        isLoading={tasks.isLoading}
        isError={tasks.isError}
        isRefetching={tasks.isRefetching}
        refetch={tasks.refetch}
      />
      <TaskModals />
    </div>
  );
};

export default Tasks;
