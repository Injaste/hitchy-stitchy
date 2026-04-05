import type { Task } from './types'
import { mockTasks } from './data'

// TODO: replace with live Supabase query
export async function fetchTasks(eventId: string): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 200))
  return mockTasks
}

// TODO: replace with live Supabase query
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  await new Promise((r) => setTimeout(r, 200))
  const now = new Date().toISOString()
  return { ...task, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
}

// TODO: replace with live Supabase query
export async function updateTask(task: Task): Promise<Task> {
  await new Promise((r) => setTimeout(r, 200))
  return { ...task, updatedAt: new Date().toISOString() }
}

// TODO: replace with live Supabase query
export async function deleteTask(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
