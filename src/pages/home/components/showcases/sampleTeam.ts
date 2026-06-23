import type { Member, AccessGroup } from "../../features/types";

// Sample casts for the showcases. The home page balances Singapore's communities
// across features (see docs/product-context.md): the team roster (Members + Tasks)
// is a Chinese couple's diverse party, while the Timeline runs a Malay wedding
// with its own cast. "You" = a couple member (random per load), so your avatar
// renders green wherever you're assigned; your member card stays pink (couple).

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

// ── Team roster (Members + Tasks): a Chinese couple + a diverse SG party ──
const BRIDE_ID = "m-bride";
const GROOM_ID = "m-groom";
// "You" are the bride or groom (50/50) — whoever's logged in viewing the app.
export const SELF_ID = Math.random() < 0.5 ? BRIDE_ID : GROOM_ID;

export const HUI_LING = mk({ id: BRIDE_ID, display_name: "Hui Ling", is_bride: true, role: "Bride" });
export const WEI_JIE = mk({ id: GROOM_ID, display_name: "Wei Jie", is_groom: true, role: "Groom" });
export const SERENE = mk({ id: "m-serene", display_name: "Serene Koh", role: "Wedding Coordinator", accessGroup: ag("Admin"), notes: "Main contact on the day — reach me first for any timing changes." });
export const PRIYA = mk({ id: "m-priya", display_name: "Priya Nair", role: "Jie Mei", accessGroup: ag("Team"), notes: "Leading the jie mei (姐妹) and the gate games." });
export const FAIZ = mk({ id: "m-faiz", display_name: "Faiz Rahman", role: "Heng Dai", accessGroup: ag("Team"), notes: "On gate games and ang bao logistics." });
export const JOEY = mk({ id: "m-joey", display_name: "Joey Tan", role: "Makeup Artist", accessGroup: ag("Team"), joined_at: null, invite_expires_at: "2099-01-01T00:00:00Z" });

// ── Timeline cast: a Malay wedding (akad nikah & bersanding) ──
const M_BRIDE_ID = "m-nurul";
const M_GROOM_ID = "m-hafiz";
export const TIMELINE_SELF = Math.random() < 0.5 ? M_BRIDE_ID : M_GROOM_ID;
export const NURUL = mk({ id: M_BRIDE_ID, display_name: "Nurul Huda", is_bride: true, role: "Bride" });
export const HAFIZ = mk({ id: M_GROOM_ID, display_name: "Hafiz Iskandar", is_groom: true, role: "Groom" });
export const SITI = mk({ id: "m-siti", display_name: "Siti Aminah", role: "Coordinator", accessGroup: ag("Admin") });
