export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

type MutationCallbacks<TResult> = {
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
};

// Mode 1 — simple toasts
type SimpleMutationOptions<TResult> = MutationCallbacks<TResult> & {
  successMessage: string;
  errorMessage: string;
  toast?: never;
};

// Mode 2 — promise toast
type PromiseMutationOptions<TResult> = MutationCallbacks<TResult> & {
  toast: {
    loading: string;
    success: string;
    error: string;
  };
  successMessage?: never;
  errorMessage?: never;
};

type SilentMutationOptions<TResult> = MutationCallbacks<TResult> & {
  silent: true;
  toast?: never;
  successMessage?: never;
  errorMessage?: never;
};

export type MutationOptions<TResult> =
  | SimpleMutationOptions<TResult>
  | PromiseMutationOptions<TResult>
  | SilentMutationOptions<TResult>;