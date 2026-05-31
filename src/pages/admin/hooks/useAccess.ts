import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import type { Resource } from "../roles/types";

type Action = "create" | "read" | "update" | "delete";
export type Permission = `${Resource}:${Action}`;

export function useAccess() {
  const { isTopTier, permissions } = useAdminStore();

  const allow = (...perms: Permission[]): boolean => {
    if (isTopTier) return true;
    return perms.every((p) => {
      const [resource, action] = p.split(":") as [string, string];
      return permissions[resource]?.[action] === true;
    });
  };

  const canRead = (...resources: Resource[]) =>
    allow(...resources.map((r): Permission => `${r}:read`));
  const canCreate = (...resources: Resource[]) =>
    allow(...resources.map((r): Permission => `${r}:create`));
  const canUpdate = (...resources: Resource[]) =>
    allow(...resources.map((r): Permission => `${r}:update`));
  const canDelete = (...resources: Resource[]) =>
    allow(...resources.map((r): Permission => `${r}:delete`));
  const canManage = (...resources: Resource[]) =>
    allow(
      ...resources.flatMap((r): Permission[] => [
        `${r}:create`,
        `${r}:update`,
        `${r}:delete`,
      ]),
    );

  return {
    isRoot: isTopTier,
    isTopTier: useAdminStore.getState().isTopTier,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
  };
}
