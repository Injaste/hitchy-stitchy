import MemberCard from "@/pages/home/features/members/MemberCard";
import { groupMembers } from "../../features/utils";
import { WEI_JIE, HUI_LING, PRIYA, FAIZ, JOEY, SELF_ID } from "./sampleTeam";

// The real MemberCard, ordered by the real groupMembers rule: couple first
// (strong-pink border), then active, then pending/inactive. A diverse SG party —
// Chinese couple, Indian jie mei, Malay heng dai. "You" are one of the couple, so
// your card keeps the pink accent (green is reserved for a non-couple self); the
// rest are non-couple (light-rose). Stable roster → fixed height.
const ROSTER = [WEI_JIE, HUI_LING, PRIYA, FAIZ, JOEY];

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
