import type { FC } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  type BaseHeaderProps,
} from "@/components/custom/page-header";

import { useAccess } from "../../hooks/useAccess";
import { useRoleModalStore } from "../hooks/useRoleModalStore";
import type { Role } from "../types";

interface RolesHeaderProps extends BaseHeaderProps {
  data?: Role[];
}

const RolesHeader: FC<RolesHeaderProps> = ({
  data,
  isError,
  isLoading,
  isRefetching,
  refetch,
}) => {
  const { canCreate } = useAccess();
  const openCreate = useRoleModalStore((s) => s.openCreate);
  const total = data?.length ?? 0;

  return (
    <PageHeader
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      refetch={refetch}
      description="Define the roles that shape your team's structure and permissions. Each member is assigned one role."
      meta={
        total > 0 && (
          <span>
            {total} {total === 1 ? "role" : "roles"}
          </span>
        )
      }
      action={
        canCreate("roles") && (
          <Button
            size="sm"
            variant="default"
            onClick={openCreate}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add role
          </Button>
        )
      }
    />
  );
};

export default RolesHeader;
