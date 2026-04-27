import type { FC } from "react";
import { AnimatePresence } from "framer-motion";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import type { CategoryPermissions } from "../types";

import PermissionsTable from "./PermissionsTable";
import PermissionsSkeleton from "../states/PermissionsSkeleton";
import PermissionsError from "../states/PermissionsError";

interface PermissionsViewProps {
  data: CategoryPermissions[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const PermissionsView: FC<PermissionsViewProps> = ({
  data,
  isLoading,
  isError,
}) => {
  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <PermissionsSkeleton />
        </ComponentFade>
      );

    if (isError || !data)
      return (
        <ComponentFade key="error">
          <PermissionsError />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <PermissionsTable data={data} />
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default PermissionsView;
