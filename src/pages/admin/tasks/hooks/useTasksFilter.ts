import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { ALL_LABEL, type Task, type TaskPriority } from "../types";

export type PriorityFilter = TaskPriority | "none";

interface TasksFilterStore {
  activeLabel: string;
  priority: PriorityFilter | null;
  memberId: string | null;
  setActiveLabel: (label: string) => void;
  setPriority: (p: PriorityFilter | null) => void;
  setMemberId: (id: string | null) => void;
  reset: () => void;
}

export const useTasksFilterStore = create<TasksFilterStore>((set) => ({
  activeLabel: ALL_LABEL,
  priority: null,
  memberId: null,
  setActiveLabel: (activeLabel) => set({ activeLabel }),
  setPriority: (priority) => set({ priority }),
  setMemberId: (memberId) => set({ memberId }),
  reset: () => set({ priority: null, memberId: null }),
}));

export function useTasksFilter(tasks: Task[]) {
  const activeLabel = useTasksFilterStore((s) => s.activeLabel);
  const setActiveLabel = useTasksFilterStore((s) => s.setActiveLabel);
  const priority = useTasksFilterStore((s) => s.priority);
  const memberId = useTasksFilterStore((s) => s.memberId);

  const tabs = useMemo(() => {
    const unique = Array.from(
      new Set(
        tasks
          .map((t) => t.label)
          .filter((l): l is string => !!l && l.trim().length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
    return [ALL_LABEL, ...unique];
  }, [tasks]);

  useEffect(() => {
    if (!tabs.includes(activeLabel)) setActiveLabel(ALL_LABEL);
  }, [tabs, activeLabel, setActiveLabel]);

  const filteredTasks = useMemo(() => {
    const labelActive = activeLabel !== ALL_LABEL;
    const priorityActive = priority !== null;
    const memberActive = memberId !== null;

    if (!labelActive && !priorityActive && !memberActive) return tasks;

    return tasks.filter((t) => {
      if (labelActive && t.label !== activeLabel) return false;
      if (priorityActive && (t.priority ?? "none") !== priority) return false;
      if (memberActive && !t.assignees.includes(memberId)) return false;
      return true;
    });
  }, [tasks, activeLabel, priority, memberId]);

  const activeCount = (priority ? 1 : 0) + (memberId ? 1 : 0);

  return {
    tabs,
    activeLabel,
    setActiveLabel,
    activeCount,
    filteredTasks,
  };
}
