import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@/lib/query/useMutation'
import { useAdminStore } from '../store/useAdminStore'
import { adminKeys } from '../lib/queryKeys'
import { fetchTasks, createTask, updateTask, deleteTask } from './api'
import type { Task } from './types'

export function useChecklistQuery() {
  const { slug, eventId } = useAdminStore()
  return useQuery({
    queryKey: adminKeys.checklist(slug),
    queryFn: () => fetchTasks(eventId),
    enabled: !!eventId,
  })
}

export function useCreateTaskMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, Task>(createTask, {
    successMessage: 'Task created',
    errorMessage: 'Failed to create task',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.checklist(slug) }) },
  })
}

export function useUpdateTaskMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<Task, Task>(updateTask, {
    successMessage: 'Task updated',
    errorMessage: 'Failed to update task',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.checklist(slug) }) },
  })
}

export function useDeleteTaskMutation() {
  const { slug } = useAdminStore()
  const qc = useQueryClient()
  return useMutation<string, void>(deleteTask, {
    successMessage: 'Task deleted',
    errorMessage: 'Failed to delete task',
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.checklist(slug) }) },
  })
}
