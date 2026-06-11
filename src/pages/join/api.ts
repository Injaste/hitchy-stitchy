import { supabase } from "@/lib/supabase";

/** Claims a pending member invite by its token. Returns the event slug to land on. */
export async function claimMemberInviteByToken(token: string): Promise<string> {
  const { data, error } = await supabase.rpc("claim_member_invite", {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
