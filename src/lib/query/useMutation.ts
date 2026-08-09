import { useMutation as useTanstackMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MutationOptions } from "./types";

// Error toasts linger longer than success — long enough to read a server
// message, short enough not to stack in the corner. Success keeps sonner's
// default (~4s).
const ERROR_TOAST_DURATION = 8000;

// The undo window IS the toast's lifetime — once it's gone the action stands.
// Long enough to read what happened, decide, and reach the button on a phone;
// the soft-delete underneath is already durable, so this is a UI affordance, not
// a grace period the server honours.
const UNDO_TOAST_DURATION = 10000;

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
        const undo = "onUndo" in options ? options.onUndo?.(result, args) : undefined;
        toast.success(
          msg,
          undo
            ? { duration: UNDO_TOAST_DURATION, action: { label: "Undo", onClick: undo } }
            : undefined,
        );
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
        toast.error(msg, { duration: ERROR_TOAST_DURATION, closeButton: true });
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
        // Only the error state gets the longer duration and a close button;
        // success stays default.
        error:
          typeof errorMsg === "function"
            ? (e: Error) => ({
                message: errorMsg(e),
                duration: ERROR_TOAST_DURATION,
                closeButton: true,
              })
            : {
                message: errorMsg,
                duration: ERROR_TOAST_DURATION,
                closeButton: true,
              },
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
