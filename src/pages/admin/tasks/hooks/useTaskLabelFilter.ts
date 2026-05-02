import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { ALL_LABEL, type Task } from "../types";

interface TaskLabelFilterStore {
  activeLabel: string;
  setActiveLabel: (label: string) => void;
}

export const useTaskLabelFilterStore = create<TaskLabelFilterStore>((set) => ({
  activeLabel: ALL_LABEL,
  setActiveLabel: (label) => set({ activeLabel: label }),
}));

export function useTaskLabelFilter(tasks: Task[]) {
  const activeLabel = useTaskLabelFilterStore((s) => s.activeLabel);
  const setActiveLabel = useTaskLabelFilterStore((s) => s.setActiveLabel);

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
    if (activeLabel === ALL_LABEL) return tasks;
    return tasks.filter((t) => t.label === activeLabel);
  }, [tasks, activeLabel]);

  return { tabs, activeLabel, setActiveLabel, filteredTasks };
}
