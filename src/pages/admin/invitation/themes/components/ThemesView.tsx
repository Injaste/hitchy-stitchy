import { type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";
import type { Template, Theme } from "../types";
import ThemesSkeleton from "../states/ThemesSkeleton";
import ErrorState from "@/components/custom/error-state";
import { container, itemFadeUp } from "@/lib/animations";
import ThemeCard from "./ThemeCard";

interface ThemesViewProps {
  templates: Template[];
  themes: Theme[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const ThemesView: FC<ThemesViewProps> = ({
  templates,
  themes,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <ThemesSkeleton />
        </ComponentFade>
      );

    if (isError || !templates?.length)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your themes. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {templates.map((template) => {
            const themeCreated = (themes ?? []).findIndex(
              (t) => t.template_id === template.id,
            );

            return (
              <motion.div
                key={template.id}
                variants={itemFadeUp}
                className="w-full"
              >
                <ThemeCard template={template} created={themeCreated !== -1} />
              </motion.div>
            );
          })}
        </motion.div>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default ThemesView;
