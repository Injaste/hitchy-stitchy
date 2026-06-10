import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MutationOptions } from "./types";

// Error toasts linger longer than success — long enough to read a server
// message, short enough not to stack in the corner. Success keeps sonner's
// default (~4s).
const ERROR_TOAST_DURATION = 8000;

export function useMutation<TArgs, TResult, TContext = unknown>(
  fn: (args: TArgs) => Promise<TResult>,
  options: MutationOptions<TResult, TArgs, TContext>,
) {
  const {
    mutateAsync: _mutateAsync,
    isPending,
    isSuccess: _isSuccess,
    error,
    isError,
    data,
    reset,
  } = useTanstackMutation<TResult, Error, TArgs, TContext>({
    mutationFn: fn,
    onMutate: options.onMutate,

    onSuccess(result, args) {
      options.onSuccess?.(result, args);

      if ("toast" in options && options.toast) return;

      if (!("silent" in options)) {
        const msg =
          typeof options.successMessage === "function"
            ? options.successMessage(result, args)
            : options.successMessage;
        toast.success(msg);
      }
    },

    onError(err, args, context) {
      const error = err instanceof Error ? err : new Error(String(err));
      options.onError?.(error, args, context);
      if (!("toast" in options) && !("silent" in options)) {
        const msg =
          typeof options.errorMessage === "function"
            ? options.errorMessage(error, args)
            : options.errorMessage;
        toast.error(msg, { duration: ERROR_TOAST_DURATION });
      }
    },
  });

  async function mutate(
    args: TArgs,
    callbacks?: { onSuccess?: () => void; onError?: () => void },
  ): Promise<void> {
    if ("toast" in options && options.toast) {
      const promise = _mutateAsync(args);
      const errorMsg = options.toast.error;
      toast.promise(promise, {
        loading: options.toast.loading,
        success: options.toast.success as string,
        // Only the error state gets the longer duration; success stays default.
        error:
          typeof errorMsg === "function"
            ? (e: Error) => ({
                message: errorMsg(e),
                duration: ERROR_TOAST_DURATION,
              })
            : { message: errorMsg, duration: ERROR_TOAST_DURATION },
      });
      await promise
        .then(() => callbacks?.onSuccess?.())
        .catch(() => callbacks?.onError?.());
      return;
    }
    await _mutateAsync(args)
      .then(() => callbacks?.onSuccess?.())
      .catch(() => callbacks?.onError?.());
  }

  async function mutateAsync(args: TArgs): Promise<TResult> {
    return _mutateAsync(args);
  }

  return {
    mutate,
    mutateAsync,
    isPending,
    isSuccess: _isSuccess,
    error,
    isError,
    data,
    reset,
  };
}
