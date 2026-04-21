import { type FC } from "react";
import { AnimatePresence } from "framer-motion";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import ErrorState from "@/components/custom/error-state";
import InvitationSkeleton from "../states/InvitationSkeleton";
import EditorLayout from "./EditorLayout";

interface InvitationViewProps {
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const InvitationView: FC<InvitationViewProps> = ({
  isLoading,
  isError,
  isRefetching,
  refetch,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <ComponentFade key="skeleton">
          <InvitationSkeleton />
        </ComponentFade>
      ) : isError ? (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your invitation. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      ) : (
        <ComponentFade key="content">
          <EditorLayout />
        </ComponentFade>
      )}
    </AnimatePresence>
  );
};

export default InvitationView;
