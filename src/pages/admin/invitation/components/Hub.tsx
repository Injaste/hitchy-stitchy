import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, LayoutTemplate } from "lucide-react";
import { parseISO, format } from "date-fns";
import ComponentFade from "@/components/animations/animate-component-fade";
import { itemFadeUp } from "@/lib/animations";
import ErrorState from "@/components/custom/states/error-state";
import EmptyState from "@/components/custom/states/empty-state";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import InvitationSkeleton from "../states/InvitationSkeleton";
import { useInvitationsQuery, useEventSegmentsQuery } from "../queries";
import { useEventDaysQuery } from "../../days/queries";
import { useInvitationModalStore } from "../hooks/useInvitationModalStore";
import { pageLabel } from "../utils";
import InvitationSheet from "./InvitationSheet";
import InvitationCard from "./InvitationCard";

// Invitation hub: a flat grid of every page (one per day/segment). Invitations are
// light + capped, so they all render at once — no day rail. Each card is
// self-describing (label + date). "Add invitation" lives in the page header.
const Hub = () => {
  const { slug } = useAdminStore();
  const { data: invitations, isLoading, isError, isRefetching, refetch } =
    useInvitationsQuery();
  const { data: days } = useEventDaysQuery();
  const { data: segments } = useEventSegmentsQuery();
  const { openBrowse, openEdit } = useInvitationModalStore();

  // Order: Live before Draft, then root (no link_slug) first, then by day date.
  const ordered = useMemo(() => {
    if (!invitations || !days) return [];
    const dateOf = (dayId: string) =>
      days.find((d) => d.id === dayId)?.date ?? "";
    return [...invitations].sort((a, b) => {
      const liveA = a.published_at ? 0 : 1;
      const liveB = b.published_at ? 0 : 1;
      if (liveA !== liveB) return liveA - liveB;
      const rootA = a.link_slug === null ? 0 : 1;
      const rootB = b.link_slug === null ? 0 : 1;
      if (rootA !== rootB) return rootA - rootB;
      return dateOf(a.day_id).localeCompare(dateOf(b.day_id));
    });
  }, [invitations, days]);

  const renderBody = () => {
    if (isError)
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your invitations. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (isLoading || !days || !segments)
      return (
        <ComponentFade key="skeleton" useBlur>
          <InvitationSkeleton />
        </ComponentFade>
      );

    if (!invitations?.length)
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
              Your invitations
            </h3>
            <p className="text-sm text-muted-foreground">
              One page per day or segment. Design, set RSVP, then publish each.
            </p>
          </div>

          <div className="grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {ordered.map((inv, i) => {
                const day = days.find((d) => d.id === inv.day_id);
                return (
                  <motion.div
                    key={inv.id}
                    custom={i}
                    variants={itemFadeUp}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    layout
                    transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
                  >
                    <InvitationCard
                      invitation={inv}
                      label={pageLabel(inv, days, segments)}
                      dateLabel={
                        day ? format(parseISO(day.date), "d MMM yyyy") : null
                      }
                      slug={slug!}
                      onEdit={() => openEdit(inv.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
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
