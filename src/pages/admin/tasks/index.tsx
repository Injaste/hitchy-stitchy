import { useTasksQuery } from "./queries"
import TasksHeader from "./components/TasksHeader"
import TasksView from "./components/TasksView"
import TaskModals from "./modals"

const Tasks = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useTasksQuery()

  return (
    <div className="space-y-8 pb-24">
      <TasksHeader
        isLoading={isLoading}
        isError={isError}
        isRefetching={isRefetching}
        refetch={refetch}
        data={data}
      />
      <TasksView
        data={data}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        isRefetching={isRefetching}
      />
      <TaskModals />
    </div>
  )
}

export default Tasks
