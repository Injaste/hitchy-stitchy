import type { Member } from "@/pages/admin/members/types";
import type { AccessGroup } from "@/pages/admin/access/types";

// One SG wedding party, shared across the showcases: it's the Members roster,
// and the same people appear as assignees on Tasks / Timeline cards. Serene (the
// coordinator) is "you" — her avatar/border render green; everyone else pink.

const ag = (name: string): AccessGroup => ({
  id: name.toLowerCase(),
  event_id: "demo",
  name,
  permissions: {},
  created_at: "",
  updated_at: "",
});

const mk = (
  over: Partial<Member> & Pick<Member, "id" | "display_name">,
): Member => ({
  event_id: "demo",
  access_group_id: "ag",
  is_root: false,
  role: null,
  is_bride: false,
  is_groom: false,
  notes: null,
  invited_by: null,
  frozen_at: null,
  invited_at: null,
  joined_at: "2026-06-01T00:00:00Z",
  invite_token: null,
  invite_expires_at: null,
  created_at: "",
  updated_at: "",
  preferences: {},
  accessGroup: null,
  ...over,
});

export const SELF_ID = "m-serene"; // the coordinator viewing the app = "you"

export const HUI_LING = mk({ id: "m-bride", display_name: "Hui Ling", is_bride: true, role: "Bride" });
export const WEI_JIE = mk({ id: "m-groom", display_name: "Wei Jie", is_groom: true, role: "Groom" });
export const SERENE = mk({ id: SELF_ID, display_name: "Serene Koh", role: "Wedding Coordinator", accessGroup: ag("Admin"), notes: "Main contact on the day — reach me first for any timing changes." });
export const PRIYA = mk({ id: "m-priya", display_name: "Priya Nair", role: "Jie Mei", accessGroup: ag("Team"), notes: "Leading the jie mei (姐妹) and the gate games." });
export const FAIZ = mk({ id: "m-faiz", display_name: "Faiz Rahman", role: "Heng Dai", accessGroup: ag("Team") });
export const JOEY = mk({
  id: "m-joey",
  display_name: "Joey Tan",
  role: "Makeup Artist",
  accessGroup: ag("Team"),
  joined_at: null,
  invite_expires_at: "2099-01-01T00:00:00Z", // pending (not yet joined)
});
