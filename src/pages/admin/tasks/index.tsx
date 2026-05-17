import { useTasksQuery, useTaskOrderQuery } from "./queries";
import TasksHeader from "./components/TasksHeader";
import TasksView from "./components/TasksView";
import TaskModals from "./modals";
import Container from "@/components/custom/container";

const Tasks = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useTasksQuery();
  const { data: taskOrder } = useTaskOrderQuery();

  return (
    <>
      <TasksHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <Container className="mt-8">
        <TasksView
          data={data}
          taskOrder={taskOrder}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          isRefetching={isRefetching}
        />
        <TaskModals />
      </Container>
    </>
  );
};

export default Tasks;
