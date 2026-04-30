import type { Task, TaskOrder } from "./types";

export function applyOrder(
  tasks: Task[],
  order: TaskOrder | null | undefined,
): Task[] {
  if (!order) return tasks;
  const indexMap = new Map<string, number>();
  for (const ids of [order.todo, order.in_progress, order.done]) {
    ids.forEach((id, i) => indexMap.set(id, i));
  }
  return [...tasks].sort(
    (a, b) => (indexMap.get(a.id) ?? Infinity) - (indexMap.get(b.id) ?? Infinity),
  );
}

export function buildOrder(tasks: Task[], eventId: string): TaskOrder {
  const order: TaskOrder = { event_id: eventId, todo: [], in_progress: [], done: [] };
  for (const t of tasks) order[t.status].push(t.id);
  return order;
}

export function ordersEqual(a: TaskOrder, b: TaskOrder): boolean {
  return (
    a.todo.length === b.todo.length &&
    a.in_progress.length === b.in_progress.length &&
    a.done.length === b.done.length &&
    a.todo.every((id, i) => id === b.todo[i]) &&
    a.in_progress.every((id, i) => id === b.in_progress[i]) &&
    a.done.every((id, i) => id === b.done[i])
  );
}
