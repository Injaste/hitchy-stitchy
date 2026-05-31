import type { FC } from "react";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import type { BaseHeaderProps } from "@/components/custom/page-header-base";

const RolesHeader: FC<BaseHeaderProps> = ({ isLoading, isError, isRefetching, refetch }) => (
  <AdminPageHeader
    title="Role Access"
    description="Create and manage roles. Click any cell to adjust what each role can access."
    isLoading={isLoading}
    isError={isError}
    isRefetching={isRefetching}
    refetch={refetch}
  />
);

export default RolesHeader;
