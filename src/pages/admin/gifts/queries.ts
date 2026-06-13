import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";

import {
  createGift,
  deleteGift,
  fetchGifts,
  updateGift,
  type GiftsData,
} from "./api";
import type { CreateGiftPayload, Gift, UpdateGiftPayload } from "./types";

export function useGiftsQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.gifts(slug!),
    queryFn: () => fetchGifts(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useGiftMutations() {
  const { slug, eventId } = useAdminStore();
  const queryClient = useQueryClient();

  const setData = (fn: (old: GiftsData | undefined) => GiftsData | undefined) =>
    queryClient.setQueryData<GiftsData>(adminKeys.gifts(slug!), fn as never);

  const create = useMutation(
    (payload: CreateGiftPayload) => createGift(eventId!, payload),
    {
      successMessage: (result: Gift) => `"${truncate(result.given_by)}" recorded`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Gift) => {
        setData((old) =>
          old ? { ...old, gifts: [result, ...old.gifts] } : old,
        );
      },
    },
  );

  const update = useMutation(
    (payload: UpdateGiftPayload) => updateGift(payload),
    {
      successMessage: (result: Gift) => `"${truncate(result.given_by)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Gift) => {
        setData((old) =>
          old
            ? {
                ...old,
                gifts: old.gifts.map((entry) =>
                  entry.id === result.id ? result : entry,
                ),
              }
            : old,
        );
      },
    },
  );

  const remove = useMutation(
    ({ id }: { id: string; given_by: string }) => deleteGift(eventId!, id),
    {
      successMessage: (_: void, args) => `"${truncate(args.given_by)}" removed`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args) => {
        setData((old) =>
          old
            ? {
                ...old,
                gifts: old.gifts.filter((entry) => entry.id !== args.id),
              }
            : old,
        );
      },
    },
  );

  return { create, update, remove };
}
