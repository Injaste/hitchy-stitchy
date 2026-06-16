import { AnimatePresence, motion } from "framer-motion";
import { Plus, LayoutTemplate } from "lucide-react";
import ComponentFade from "@/components/animations/animate-component-fade";
import { container, itemFadeUp } from "@/lib/animations";
import ErrorState from "@/components/custom/states/error-state";
import EmptyState from "@/components/custom/states/empty-state";
import { Button } from "@/components/ui/button";
import InvitationSkeleton from "../states/InvitationSkeleton";
import { useEventInvitationQuery } from "../queries";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import InvitationSheet from "./InvitationSheet";
import InvitationTile from "./InvitationTile";
import AddInvitationCard from "./AddInvitationCard";

const Hub = () => {
  const { data: invitation, isLoading, isError, isRefetching, refetch } =
    useEventInvitationQuery();
  const { openBrowse, openEdit } = useInvitationModalStore();

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton" useBlur>
          <InvitationSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your invitation. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!invitation)
      return (
        <ComponentFade key="empty" useBlur>
          <EmptyState
            icon={
              <div className="size-14 rounded-2xl bg-gradient-surface border grid place-items-center text-primary">
                <LayoutTemplate className="size-6" />
              </div>
            }
            title="Design your invitation"
            description="Pick a template to start the page your guests will open. You can customise everything after."
            action={
              <Button onClick={openBrowse} className="gap-1.5">
                <Plus className="size-4" />
                Browse templates
              </Button>
            }
          />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content" useBlur>
        <div className="@container space-y-4">
          <div className="px-1 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your invitation
            </h3>
            <p className="text-sm text-muted-foreground">
              Design the page your guests open, set RSVP, then publish.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 gap-4"
          >
            <motion.div variants={itemFadeUp} className="h-full">
              <InvitationTile invitation={invitation} onEdit={openEdit} />
            </motion.div>
            <motion.div variants={itemFadeUp} className="h-full">
              <AddInvitationCard onClick={openBrowse} />
            </motion.div>
          </motion.div>
        </div>
      </ComponentFade>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>
      <InvitationSheet />
    </>
  );
};

export default Hub;
