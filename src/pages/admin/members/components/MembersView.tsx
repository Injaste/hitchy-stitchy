import type { FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ComponentFade from "@/components/animations/animate-component-fade";
import { itemFadeUp } from "@/lib/animations";
import ErrorState from "@/components/custom/states/error-state";

import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import MembersSkeleton from "../states/MembersSkeleton";
import MembersEmpty from "../states/MembersEmpty";
import type { Member } from "../types";
import MemberCard from "./MemberCard";

interface MembersViewProps {
  data: Member[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
}

const MembersView: FC<MembersViewProps> = ({
  data,
  isLoading,
  isError,
  refetch,
  isRefetching,
}) => {
  const openInvite = useMemberModalStore((s) => s.openCreate);
  const { canCreate } = useAccess();

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton">
          <MembersSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error">
          <ErrorState
            message="We couldn't load your members. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!data?.length)
      return (
        <ComponentFade key="empty">
          <MembersEmpty
            onInvite={openInvite}
            canCreate={canCreate("members")}
          />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content">
        <ul className="flex flex-col gap-3 lg:gap-6">
          <AnimatePresence>
            {data.map((member, i) => (
              <motion.li
                key={member.id}
                custom={i}
                variants={itemFadeUp}
                initial="hidden"
                animate="show"
                exit="hidden"
                layout
              >
                <MemberCard member={member} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default MembersView;
