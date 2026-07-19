// Vendor CRM API. event_vendors is a flat table. Reads are RLS-gated selects
// (super-admin only); writes go through create_vendor / update_vendor /
// delete_vendor [20260717000001].

import { supabase } from "@/lib/supabase";
import type { CreateVendorPayload, Vendor, UpdateVendorPayload } from "./types";

export interface VendorsData {
  vendors: Vendor[];
}

const VENDOR_FIELDS =
  "id, event_id, name, category, phone, email, notes, day_ids, created_at, updated_at";

export async function fetchVendors(eventId: string): Promise<VendorsData> {
  const { data, error } = await supabase
    .from("event_vendors")
    .select(VENDOR_FIELDS)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return { vendors: (data ?? []) as Vendor[] };
}

export async function createVendor(
  eventId: string,
  payload: CreateVendorPayload,
): Promise<Vendor> {
  const { data, error } = await supabase.rpc("create_vendor", {
    p_event_id: eventId,
    p_name: payload.name,
    p_category: payload.category,
    p_phone: payload.phone,
    p_email: payload.email,
    p_notes: payload.notes,
    p_day_ids: payload.day_ids,
  });

  if (error) throw new Error(error.message);
  return data as Vendor;
}

export async function updateVendor(payload: UpdateVendorPayload): Promise<Vendor> {
  const { data, error } = await supabase.rpc("update_vendor", {
    p_event_id: payload.event_id,
    p_id: payload.id,
    p_name: payload.name,
    p_category: payload.category,
    p_phone: payload.phone,
    p_email: payload.email,
    p_notes: payload.notes,
    p_day_ids: payload.day_ids,
  });

  if (error) throw new Error(error.message);
  return data as Vendor;
}

export async function deleteVendor(eventId: string, id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_vendor", {
    p_event_id: eventId,
    p_id: id,
  });

  if (error) throw new Error(error.message);
}
