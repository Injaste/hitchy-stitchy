import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MutationOptions } from "./types";

export function useMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  options: MutationOptions<TResult, TArgs>,
) {
  const { mutateAsync: _mutateAsync, isPending, error, isError, data, reset } = useTanstackMutation({
    mutationFn: fn,

    onSuccess(result, args) {
      options.onSuccess?.(result, args);

      if ("toast" in options && options.toast) return;

      if (!("silent" in options)) {
        const msg = typeof options.successMessage === "function"
          ? options.successMessage(result, args)
          : options.successMessage;
        toast.success(msg);
      }
    },

    onError(err, args) {
      const error = err instanceof Error ? err : new Error(String(err));
      options.onError?.(error, args);
      if (!("toast" in options) && !("silent" in options)) {
        const msg = typeof options.errorMessage === "function"
          ? options.errorMessage(error, args)
          : options.errorMessage;
        toast.error(msg);
      }
    },
  });

  async function mutate(args: TArgs): Promise<void> {
    if ("toast" in options && options.toast) {
      const promise = _mutateAsync(args);
      toast.promise(promise, {
        loading: options.toast.loading,
        success: options.toast.success as string,
        error: options.toast.error as string,
      });
      await promise.catch(() => { });
      return;
    }
    await _mutateAsync(args).catch(() => { });
  }


  async function mutateAsync(args: TArgs): Promise<TResult> {
    return _mutateAsync(args);
  }

  return { mutate, mutateAsync, isPending, error, isError, data, reset };
}