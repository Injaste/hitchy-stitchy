import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useActiveDay } from "@/pages/admin/store/useActiveDay";
import { adminKeys } from "@/pages/admin/lib/queryKeys";

import {
  createExpense,
  deleteExpense,
  fetchBudget,
  updateBudget,
  updateExpense,
  type BudgetData,
} from "./api";
import { upsertBucket } from "./utils";
import type {
  BudgetBucket,
  CreateExpensePayload,
  Expense,
  UpdateExpensePayload,
} from "./types";

export function useBudgetQuery() {
  const { slug, eventId } = useAdminStore();
  return useQuery({
    queryKey: adminKeys.budget(slug!),
    queryFn: () => fetchBudget(eventId!),
    enabled: !!eventId && !!slug,
  });
}

export function useExpenseMutations() {
  const { slug, eventId } = useAdminStore();
  const { activeDayId } = useActiveDay();
  const queryClient = useQueryClient();

  const getData = () =>
    queryClient.getQueryData<BudgetData>(adminKeys.budget(slug!));

  const setData = (
    fn: (old: BudgetData | undefined) => BudgetData | undefined,
  ) =>
    queryClient.setQueryData<BudgetData>(adminKeys.budget(slug!), fn as never);

  // The day comes from the form when it supplied one (opened from a vendor,
  // where there are no day tabs); otherwise from the active day tab.
  const create = useMutation(
    (payload: CreateExpensePayload) =>
      createExpense(eventId!, payload, payload.day_id ?? activeDayId),
    {
      successMessage: (result: Expense) => `"${truncate(result.item)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Expense, args: CreateExpensePayload) => {
        setData((old) => {
          if (!old) return old;
          // The expense may have lazily created its bucket — ensure it's mapped
          // so the new row resolves to the day it was just filed under.
          const buckets = old.buckets.some((b) => b.id === result.budget_id)
            ? old.buckets
            : [
                ...old.buckets,
                {
                  id: result.budget_id,
                  day_id: (args.day_id ?? activeDayId)!,
                  budget_total: null,
                },
              ];
          return { ...old, buckets, expenses: [result, ...old.expenses] };
        });
      },
    },
  );

  const update = useMutation(
    (payload: UpdateExpensePayload) => {
      // The form's day when it supplied one (it can now MOVE an expense between
      // days); otherwise re-file under the expense's own day so an edit never
      // shifts it by accident.
      const data = getData();
      const expense = data?.expenses.find((e) => e.id === payload.id);
      const ownDayId =
        data?.buckets.find((b) => b.id === expense?.budget_id)?.day_id ?? null;
      return updateExpense(payload, payload.day_id ?? ownDayId);
    },
    {
      successMessage: (result: Expense) => `"${truncate(result.item)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Expense, args: UpdateExpensePayload) => {
        setData((old) => {
          if (!old) return old;
          // Moving to a day with no bucket yet mints one server-side — map it,
          // or the row resolves to no day until the next refetch.
          const buckets =
            old.buckets.some((b) => b.id === result.budget_id) || !args.day_id
              ? old.buckets
              : [
                  ...old.buckets,
                  { id: result.budget_id, day_id: args.day_id, budget_total: null },
                ];
          return {
            ...old,
            buckets,
            expenses: old.expenses.map((e) => (e.id === result.id ? result : e)),
          };
        });
      },
    },
  );

  const remove = useMutation(
    ({ id }: { id: string; item: string }) => deleteExpense(eventId!, id),
    {
      successMessage: (_: void, args) => `"${truncate(args.item)}" removed`,
      errorMessage: (err) => err.message,
      onSuccess: (_: void, args) => {
        setData((old) =>
          old
            ? { ...old, expenses: old.expenses.filter((e) => e.id !== args.id) }
            : old,
        );
      },
    },
  );

  return { create, update, remove };
}

export function useBudgetMutations() {
  const { slug, eventId } = useAdminStore();
  const { activeDayId } = useActiveDay();
  const queryClient = useQueryClient();

  const setData = (
    fn: (old: BudgetData | undefined) => BudgetData | undefined,
  ) =>
    queryClient.setQueryData<BudgetData>(adminKeys.budget(slug!), fn as never);

  // Sets (or clears) the active day's budget cap.
  const update = useMutation(
    (amount: number | null) => updateBudget(eventId!, amount, activeDayId),
    {
      successMessage: (result: BudgetBucket) =>
        result.budget_total === null ? "Budget removed" : "Budget updated",
      errorMessage: (err) => err.message,
      // Optimistic: flip the figure immediately, roll back if the write fails.
      onMutate: (amount: number | null) => {
        const prev = queryClient.getQueryData<BudgetData>(
          adminKeys.budget(slug!),
        );
        if (activeDayId)
          setData((old) => {
            if (!old) return old;
            // Keep the real bucket id when one exists (so its expenses still map
            // to this day); fall back to a temp id for a not-yet-created bucket.
            const existing = old.buckets.find((b) => b.day_id === activeDayId);
            return {
              ...old,
              buckets: upsertBucket(old.buckets, {
                id: existing?.id ?? `tmp-${activeDayId}`,
                day_id: activeDayId,
                budget_total: amount,
              }),
            };
          });
        return { prev };
      },
      onError: (_err, _amount, context) => {
        if (context?.prev !== undefined)
          queryClient.setQueryData(adminKeys.budget(slug!), context.prev);
      },
      // Reconcile with the real bucket row (id/day_id authoritative).
      onSuccess: (result: BudgetBucket) => {
        setData((old) =>
          old ? { ...old, buckets: upsertBucket(old.buckets, result) } : old,
        );
      },
    },
  );

  return { update };
}
