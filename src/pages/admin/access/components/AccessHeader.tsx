import type { FC } from "react";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import type { BaseHeaderProps } from "@/components/custom/page-header-base";

const AccessHeader: FC<BaseHeaderProps> = ({ isLoading, isError, isRefetching, refetch }) => (
  <AdminPageHeader
    title="Access"
    description="Create and manage access groups. Click any cell to adjust what each group can access."
    isLoading={isLoading}
    isError={isError}
    isRefetching={isRefetching}
    refetch={refetch}
  />
);

export default AccessHeader;
