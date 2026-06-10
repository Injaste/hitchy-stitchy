import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useMutation } from "@/lib/query/useMutation";
import { truncate } from "@/lib/utils";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { adminKeys } from "@/pages/admin/lib/queryKeys";

import {
  createExpense,
  deleteExpense,
  fetchBudget,
  updateBudget,
  updateExpense,
  type BudgetData,
} from "./api";
import type {
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
  const queryClient = useQueryClient();

  const setData = (
    fn: (old: BudgetData | undefined) => BudgetData | undefined,
  ) =>
    queryClient.setQueryData<BudgetData>(adminKeys.budget(slug!), fn as never);

  const create = useMutation(
    (payload: CreateExpensePayload) => createExpense(eventId!, payload),
    {
      successMessage: (result: Expense) => `"${truncate(result.item)}" added`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Expense) => {
        setData((old) =>
          old ? { ...old, expenses: [result, ...old.expenses] } : old,
        );
      },
    },
  );

  const update = useMutation(
    (payload: UpdateExpensePayload) => updateExpense(payload),
    {
      successMessage: (result: Expense) => `"${truncate(result.item)}" updated`,
      errorMessage: (err) => err.message,
      onSuccess: (result: Expense) => {
        setData((old) =>
          old
            ? {
                ...old,
                expenses: old.expenses.map((e) =>
                  e.id === result.id ? result : e,
                ),
              }
            : old,
        );
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
  const queryClient = useQueryClient();

  const setData = (
    fn: (old: BudgetData | undefined) => BudgetData | undefined,
  ) =>
    queryClient.setQueryData<BudgetData>(adminKeys.budget(slug!), fn as never);

  const update = useMutation(
    (amount: number | null) => updateBudget(eventId!, amount),
    {
      successMessage: (result: number | null) =>
        result === null ? "Budget removed" : "Budget updated",
      errorMessage: (err) => err.message,
      // Optimistic: flip the figure immediately, roll back if the write fails.
      onMutate: (amount: number | null) => {
        const prev = queryClient.getQueryData<BudgetData>(
          adminKeys.budget(slug!),
        );
        setData((old) => (old ? { ...old, budgetTotal: amount } : old));
        return { prev };
      },
      onError: (_err, _amount, context) => {
        if (context?.prev !== undefined)
          queryClient.setQueryData(adminKeys.budget(slug!), context.prev);
      },
      onSuccess: (result: number | null) => {
        setData((old) => (old ? { ...old, budgetTotal: result } : old));
      },
    },
  );

  return { update };
}
