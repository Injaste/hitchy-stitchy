import { useState } from "react";
import { toast } from "sonner";
import type { MutationOptions } from "./types";

export function useMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  options: MutationOptions<TResult>
): { mutate: (args: TArgs) => Promise<void>; isPending: boolean } {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (args: TArgs): Promise<void> => {
    setIsPending(true);
    try {
      const result = await fn(args);
      toast.success(options.successMessage);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(options.errorMessage);
      options.onError?.(error);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
