import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { ALL_LABEL, type Task } from "../types";

interface TasksFilterStore {
  activeLabel: string;
  memberId: string | null;
  setActiveLabel: (label: string) => void;
  setMemberId: (id: string | null) => void;
  reset: () => void;
}

export const useTasksFilterStore = create<TasksFilterStore>((set) => ({
  activeLabel: ALL_LABEL,
  memberId: null,
  setActiveLabel: (activeLabel) => set({ activeLabel }),
  setMemberId: (memberId) => set({ memberId }),
  reset: () => set({ memberId: null }),
}));

export function useTasksFilter(tasks: Task[]) {
  const activeLabel = useTasksFilterStore((s) => s.activeLabel);
  const setActiveLabel = useTasksFilterStore((s) => s.setActiveLabel);
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
    const memberActive = memberId !== null;

    if (!labelActive && !memberActive) return tasks;

    return tasks.filter((t) => {
      if (labelActive && t.label !== activeLabel) return false;
      if (memberActive && !t.assignees.includes(memberId)) return false;
      return true;
    });
  }, [tasks, activeLabel, memberId]);

  const activeCount = memberId ? 1 : 0;

  return {
    tabs,
    activeLabel,
    setActiveLabel,
    activeCount,
    filteredTasks,
  };
}
