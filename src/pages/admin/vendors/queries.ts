import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";

import {
  createVendor,
  deleteVendor,
  fetchVendors,
  updateVendor,
  type VendorsData,
} from "./api";
import type {
  CreateVendorPayload,
  UpdateVendorPayload,
  Vendor,
} from "./types";

export function useVendorsQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.vendors(slug!),
    queryFn: () => fetchVendors(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useVendorMutations() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  const setData = (
    fn: (old: VendorsData | undefined) => VendorsData | undefined,
  ) => queryClient.setQueryData<VendorsData>(adminKeys.vendors(slug!), fn as never);

  const create = useMutation(
    (payload: CreateVendorPayload) => createVendor(eventId!, payload),
    {
      successMessage: (result: Vendor) => `"${truncate(result.name)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Vendor) => {
        setData((old) =>
          old ? { ...old, vendors: [result, ...old.vendors] } : old,
        );
      },
    },
  );

  const update = useMutation(
    (payload: UpdateVendorPayload) => updateVendor(payload),
    {
      successMessage: (result: Vendor) => `"${truncate(result.name)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Vendor) => {
        setData((old) =>
          old
            ? {
                ...old,
                vendors: old.vendors.map((entry) =>
                  entry.id === result.id ? result : entry,
                ),
              }
            : old,
        );
      },
    },
  );

  const remove = useMutation(
    ({ id }: { id: string; name: string }) => deleteVendor(eventId!, id),
    {
      successMessage: (_: void, args) => `"${truncate(args.name)}" removed`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args) => {
        setData((old) =>
          old
            ? {
                ...old,
                vendors: old.vendors.filter((entry) => entry.id !== args.id),
              }
            : old,
        );
      },
    },
  );

  return { create, update, remove };
}
