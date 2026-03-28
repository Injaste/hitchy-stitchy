// src/lib/query/useMutation.ts

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { MutationOptions } from "./types";

export function useMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  options: MutationOptions<TResult>,
) {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (args: TArgs) => {
      setIsPending(true);

      try {
        if ("toast" in options && options.toast) {
          // Mode 2 — promise toast, Sonner owns the lifecycle
          const promise = fn(args);
          toast.promise(promise, {
            loading: options.toast.loading,
            success: options.toast.success,
            error: options.toast.error,
          });
          const result = await promise;
          options.onSuccess?.(result);

        } else if ("silent" in options && options.silent) {
          // Mode 3 — silent, no toast
          const result = await fn(args);
          options.onSuccess?.(result);

        } else {
          // Mode 1 — simple toast after resolution
          const result = await fn(args);
          toast.success(options.successMessage);
          options.onSuccess?.(result);
        }

      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (!("toast" in options) && !("silent" in options)) {
          // Mode 1 only — promise mode lets Sonner handle it, silent mode skips it
          toast.error(options.errorMessage);
        }

        options.onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
    [fn, options],
  );

  return { mutate, isPending };
}