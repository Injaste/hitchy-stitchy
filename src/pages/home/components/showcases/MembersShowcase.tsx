import MemberCard from "@/pages/admin/members/components/MemberCard";
import { groupMembers } from "@/pages/admin/members/utils";
import { WEI_JIE, HUI_LING, SERENE, PRIYA, JOEY, SELF_ID } from "./sampleTeam";

// The real MemberCard, ordered by the real groupMembers rule: couple first
// (strong-pink border), then active, then pending/inactive. Serene is "you"
// (green border); the rest are non-couple (light-rose). Stable roster → fixed
// height; no row churn.
const ROSTER = [WEI_JIE, HUI_LING, SERENE, PRIYA, JOEY];

export function MembersShowcase() {
  const { couple, active, inactive } = groupMembers(ROSTER);
  const ordered = [...couple, ...active, ...inactive];

  return (
    <div className="space-y-2.5">
      {ordered.map((m) => (
        <MemberCard key={m.id} member={m} isSelf={m.id === SELF_ID} />
      ))}
    </div>
  );
}
