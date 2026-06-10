import type { FC } from "react";
import { AnimatePresence } from "framer-motion";
import ComponentFade from "@/components/animations/animate-component-fade";
import type { AccessGroup } from "../types";

import AccessTable from "./AccessTable";
import AccessSkeleton from "../states/AccessSkeleton";
import AccessError from "../states/AccessError";

interface AccessViewProps {
  data: AccessGroup[] | undefined;
  availableResources: string[];
  isLoading: boolean;
  isError: boolean;
}

const AccessView: FC<AccessViewProps> = ({
  data,
  availableResources,
  isLoading,
  isError,
}) => {
  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton" useBlur>
          <AccessSkeleton />
        </ComponentFade>
      );

    if (isError || !data)
      return (
        <ComponentFade key="error" useBlur>
          <AccessError />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content" useBlur>
        <AccessTable
          accessGroups={data}
          availableResources={availableResources}
        />
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default AccessView;
