import type { FC } from "react";
import { AnimatePresence } from "framer-motion";
import ComponentFade from "@/components/animations/animate-component-fade";
import type { Role } from "../types";

import RolesTable from "./RolesTable";
import RolesSkeleton from "../states/RolesSkeleton";
import RolesError from "../states/RolesError";

interface RolesViewProps {
  data: Role[] | undefined;
  availableResources: string[];
  isLoading: boolean;
  isError: boolean;
}

const RolesView: FC<RolesViewProps> = ({ data, availableResources, isLoading, isError }) => {
  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <RolesSkeleton />
        </ComponentFade>
      );

    if (isError || !data)
      return (
        <ComponentFade key="error">
          <RolesError />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <RolesTable roles={data} availableResources={availableResources} />
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default RolesView;
