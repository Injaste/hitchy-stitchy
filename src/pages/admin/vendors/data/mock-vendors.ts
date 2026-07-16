// ── MOCK vendor "database" ────────────────────────────────────────────────────
// An in-memory stand-in for `event_vendors` while we lock the data shape + UI
// (see docs/todo/mvp-phase-6-vendor-management.md). It mutates a module-level
// array so create/edit/delete persist for the session. When the migration lands,
// delete this folder and point ../api.ts at supabase — the signatures match.

import type { CreateVendorPayload, UpdateVendorPayload, Vendor } from "../types";

const MOCK_EVENT_ID = "mock-event";

const now = () => new Date().toISOString();
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `v_${Math.floor(performance.now() * 1000)}`;

// Seed roster — a culturally-mixed SG spread (banquet, bridal, MUA, emcee, band,
// florist) so the directory reads realistically in the mockup.
let VENDORS: Vendor[] = (
  [
    {
      name: "Golden Moments Photography",
      category: "photographer",
      contact_phone: "+6591234567",
      contact_email: "hello@goldenmoments.sg",
      notes: "Full-day coverage, 2 shooters. Deposit paid.",
    },
    {
      name: "Regent Ballroom @ Orchard",
      category: "venue",
      contact_phone: "+6567338888",
      contact_email: "events@regentballroom.sg",
      notes: "Banquet, 35 tables confirmed.",
    },
    {
      name: "Aisyah Makeup Artistry",
      category: "makeup",
      contact_phone: "+6582345678",
      contact_email: null,
      notes: "Akad + sanding looks. Trial on 12 Aug.",
    },
    {
      name: "Emcee Daniel Tan",
      category: "emcee",
      contact_phone: "+6593456789",
      contact_email: "daniel@djdaniel.sg",
      notes: null,
    },
    {
      name: "Shaadi Sounds Live Band",
      category: "music",
      contact_phone: "+6584567890",
      contact_email: "bookings@shaadisounds.sg",
      notes: "5-piece, dhol add-on for baraat.",
    },
    {
      name: "Bloom & Petal Florist",
      category: "florist",
      contact_phone: "+6595678901",
      contact_email: "orders@bloomandpetal.sg",
      notes: "Stage backdrop + 35 centerpieces.",
    },
  ] as const
).map((v, i) => {
  const ts = new Date(Date.now() - i * 60_000).toISOString();
  return {
    id: newId(),
    event_id: MOCK_EVENT_ID,
    ...v,
    created_at: ts,
    updated_at: ts,
  } satisfies Vendor;
});

// Simulated network latency so react-query's loading/pending states exercise.
const delay = <T>(value: T, ms = 260): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export function mockFetchVendors(): Promise<Vendor[]> {
  return delay(VENDORS.map((v) => ({ ...v })));
}

export function mockCreateVendor(
  eventId: string,
  payload: CreateVendorPayload,
): Promise<Vendor> {
  const ts = now();
  const vendor: Vendor = {
    id: newId(),
    event_id: eventId,
    ...payload,
    created_at: ts,
    updated_at: ts,
  };
  VENDORS = [vendor, ...VENDORS];
  return delay({ ...vendor });
}

export function mockUpdateVendor(payload: UpdateVendorPayload): Promise<Vendor> {
  let updated: Vendor | undefined;
  VENDORS = VENDORS.map((v) => {
    if (v.id !== payload.id) return v;
    updated = {
      ...v,
      name: payload.name,
      category: payload.category,
      contact_phone: payload.contact_phone,
      contact_email: payload.contact_email,
      notes: payload.notes,
      updated_at: now(),
    };
    return updated;
  });
  if (!updated) return Promise.reject(new Error("Vendor not found"));
  return delay({ ...updated });
}

export function mockDeleteVendor(id: string): Promise<void> {
  VENDORS = VENDORS.filter((v) => v.id !== id);
  return delay(undefined);
}
