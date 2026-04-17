import { createModalStore } from "../../hooks/useModalStore"
import type { Role } from "../types"

export const useRoleModalStore = createModalStore<Role>()
