import { useMemo, type FC } from "react"
import { AnimatePresence } from "framer-motion"

import { ComponentFade } from "@/components/animations/animate-component-fade"
import ErrorState from "@/components/custom/error-state"

import { useAccess } from "../../hooks/useAccess"
import { useTaskModalStore } from "../hooks/useTaskModalStore"
import { STATUS_LABELS, STATUS_ORDER, type Task } from "../types"
import TasksSkeleton from "../states/TasksSkeleton"
import TasksEmpty from "../states/TasksEmpty"
import TasksSection from "./TasksSection"

interface TasksViewProps {
  data: Task[] | undefined
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  refetch: () => void
}

const TasksView: FC<TasksViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openCreate = useTaskModalStore((s) => s.openCreate)
  const { canCreate } = useAccess()

  const grouped = useMemo(() => {
    if (!data) return []
    return STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      tasks: data.filter((t) => t.status === status),
    }))
  }, [data])

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <TasksSkeleton />
        </ComponentFade>
      )

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your tasks. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      )

    if (!data?.length)
      return (
        <ComponentFade key="empty">
          <TasksEmpty onAdd={openCreate} canCreate={canCreate("tasks")} />
        </ComponentFade>
      )

    return (
      <ComponentFade key="content">
        <div className="space-y-10">
          {grouped.map(({ status, label, tasks }) => (
            <TasksSection key={status} label={label} tasks={tasks} />
          ))}
        </div>
      </ComponentFade>
    )
  }

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
}

export default TasksView
