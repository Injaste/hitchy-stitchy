// Vendor CRM API.
//
// MOCKUP: these delegate to an in-memory mock (./data/mock-vendors) while the
// data shape + UI are being confirmed. The signatures match the real feature
// (fetch = RLS-gated select; writes = create_/update_/delete_vendor RPCs) so
// swapping the bodies for supabase is a drop-in once the migration lands.

import type { CreateVendorPayload, Vendor, UpdateVendorPayload } from "./types";
import {
  mockCreateVendor,
  mockDeleteVendor,
  mockFetchVendors,
  mockUpdateVendor,
} from "./data/mock-vendors";

export interface VendorsData {
  vendors: Vendor[];
}

export async function fetchVendors(_eventId: string): Promise<VendorsData> {
  const vendors = await mockFetchVendors();
  return { vendors };
}

export async function createVendor(
  eventId: string,
  payload: CreateVendorPayload,
): Promise<Vendor> {
  return mockCreateVendor(eventId, payload);
}

export async function updateVendor(payload: UpdateVendorPayload): Promise<Vendor> {
  return mockUpdateVendor(payload);
}

export async function deleteVendor(_eventId: string, id: string): Promise<void> {
  return mockDeleteVendor(id);
}
