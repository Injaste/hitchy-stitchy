import { type FC, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

import ComponentFade from "@/components/animations/animate-component-fade";
import { itemFadeUp } from "@/lib/animations";
import ErrorState from "@/components/custom/states/error-state";
import NoResults from "@/components/custom/states/no-results";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "../../store/useAdminStore";
import { useAccess } from "../../hooks/useAccess";
import { useMemberModalStore } from "../hooks/useMemberModalStore";
import MembersSkeleton from "../states/MembersSkeleton";
import MembersEmpty from "../states/MembersEmpty";
import type { Member } from "../types";
import { groupMembers, getMemberStatus } from "../utils";
import MemberCard from "./MemberCard";
import MemberStats from "./MemberStats";

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
  const { canManageMembers, isSuperAdmin } = useAccess();
  const memberId = useAdminStore((s) => s.memberId);

  const [search, setSearch] = useState("");

  const { couple, active, inactive } = useMemo(() => {
    if (!data?.length) return { couple: [], active: [], inactive: [] };
    const q = search.trim().toLowerCase();
    let source = data;
    // Inactive (expired/frozen) members are visible to superadmins only.
    if (!isSuperAdmin) {
      source = source.filter((m) => {
        const s = getMemberStatus(m);
        return s !== "frozen" && s !== "expired";
      });
    }
    const filtered = q
      ? source.filter(
          (m) =>
            m.display_name.toLowerCase().includes(q) ||
            m.role?.toLowerCase().includes(q),
        )
      : source;
    return groupMembers(filtered);
  }, [data, search, isSuperAdmin]);

  const totalVisible = couple.length + active.length + inactive.length;

  const renderList = (members: Member[]) => (
    <ul className="flex flex-col gap-3 lg:gap-4">
      <AnimatePresence>
        {members.map((member, i) => (
          <motion.li
            key={member.id}
            custom={i}
            variants={itemFadeUp}
            initial="hidden"
            animate="show"
            exit="hidden"
            layout
          >
            <MemberCard member={member} isSelf={member.id === memberId} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );

  const renderContent = () => {
    // No results after search — blur-swap against the list (mirrors BudgetView).
    if (search.trim() && totalVisible === 0) {
      return (
        <ComponentFade key="no-match" useBlur>
          <NoResults message="No members match your search." />
        </ComponentFade>
      );
    }

    return (
      <ComponentFade key="results" useBlur>
        <div className="space-y-6">
          {/* Couple */}
          {couple.length > 0 && (
            <div>
              <p className="text-2xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-3">
                Couple
              </p>
              {renderList(couple)}
            </div>
          )}

          {/* Active team */}
          {active.length > 0 && (
            <div>
              {couple.length > 0 && (
                <p className="text-2xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-3">
                  Team
                </p>
              )}
              {renderList(active)}
            </div>
          )}

          {/* Inactive — expired + frozen, always shown, dimmed like a muted section */}
          {inactive.length > 0 && (
            <div className="opacity-60">
              <p className="text-2xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-3">
                Inactive
              </p>
              {renderList(inactive)}
            </div>
          )}
        </div>
      </ComponentFade>
    );
  };

  const renderBody = () => {
    if (isLoading)
      return (
        <ComponentFade key="skeleton" useBlur>
          <MembersSkeleton />
        </ComponentFade>
      );

    if (isError)
      return (
        <ComponentFade key="error" useBlur>
          <ErrorState
            message="We couldn't load your members. Please try again."
            onRetry={refetch}
            isRetrying={isRefetching}
          />
        </ComponentFade>
      );

    if (!data?.length)
      return (
        <ComponentFade key="empty" useBlur>
          <MembersEmpty onInvite={openInvite} canCreate={canManageMembers} />
        </ComponentFade>
      );

    return (
      <ComponentFade key="content" useBlur>
        <MemberStats data={data} isLoading={isLoading} isError={isError} />

        {/* Search */}
        <div className="relative mt-5 mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); e.currentTarget.blur(); } }}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {renderContent()}
        </AnimatePresence>
      </ComponentFade>
    );
  };

  return <AnimatePresence mode="wait">{renderBody()}</AnimatePresence>;
};

export default MembersView;
