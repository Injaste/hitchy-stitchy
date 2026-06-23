import type { FC } from "react";

import { useMembersQuery } from "@/pages/admin/members/queries";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import AssigneeAvatars from "./AssigneeAvatars";

interface AssigneeStackProps {
  ids: string[];
  /** Render side by side up to this count; beyond it, overlap + show +N. */
  max?: number;
  className?: string;
}

/**
 * Avatar row for a set of assignees. Resolves member ids through the shared
 * members cache (ids that don't resolve — e.g. removed members — are skipped)
 * and hands the resolved members to the pure AssigneeAvatars, which renders the
 * group (the logged-in user tinted secondary, "you" pulled out on overflow).
 * The presentational half is shared with the marketing showcase.
 */
const AssigneeStack: FC<AssigneeStackProps> = ({ ids, max = 5, className }) => {
  const { data: members = [] } = useMembersQuery();
  const memberId = useAdminStore((s) => s.memberId);
  if (ids.length === 0) return null;

  const found = ids
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  return (
    <AssigneeAvatars
      members={found}
      selfId={memberId}
      max={max}
      className={className}
    />
  );
};

export default AssigneeStack;
