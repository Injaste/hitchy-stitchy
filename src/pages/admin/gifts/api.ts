// Gift Envelopes API. event_gifts is a flat table. Reads are RLS-gated selects
// (super-admin only); writes go through create_gift / update_gift / delete_gift.

import { supabase } from "@/lib/supabase";
import type { CreateGiftPayload, Gift, UpdateGiftPayload } from "./types";

export interface GiftsData {
  gifts: Gift[];
}

const GIFT_FIELDS =
  "id, event_id, given_by, amount, method, notes, day_id, created_at, updated_at";

export async function fetchGifts(eventId: string): Promise<GiftsData> {
  const { data, error } = await supabase
    .from("event_gifts")
    .select(GIFT_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return { gifts: (data ?? []) as Gift[] };
}

export async function createGift(
  eventId: string,
  payload: CreateGiftPayload,
): Promise<Gift> {
  const { data, error } = await supabase.rpc("create_gift", {
    p_event_id: eventId,
    p_given_by: payload.given_by,
    p_amount: payload.amount,
    p_method: payload.method,
    p_notes: payload.notes,
    p_day_id: payload.day_id,
  });

  if (error) throw new Error(error.message);
  return data as Gift;
}

export async function updateGift(payload: UpdateGiftPayload): Promise<Gift> {
  const { data, error } = await supabase.rpc("update_gift", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_given_by: payload.given_by,
    p_amount: payload.amount,
    p_method: payload.method,
    p_notes: payload.notes,
    p_day_id: payload.day_id,
  });

  if (error) throw new Error(error.message);
  return data as Gift;
}

export async function deleteGift(eventId: string, id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_gift", {
    p_event_id: eventId,
    p_id: id,
  });

  if (error) throw new Error(error.message);
}
