import { createModalStore } from "../../hooks/useModalStore"
import type { Task } from "../types"

export const useTaskModalStore = createModalStore<Task>()
