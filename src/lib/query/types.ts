export type MutationCallbacks<TResult, TArgs = unknown> = {
  onSuccess?: (result: TResult, args: TArgs) => void;
  onError?: (error: Error, args: TArgs) => void;
};

// Mode 1 — simple toasts
type SimpleMutationOptions<TResult, TArgs> = MutationCallbacks<TResult, TArgs> & {
  successMessage: string | ((result: TResult, args: TArgs) => string);
  errorMessage: string | ((error: Error, args: TArgs) => string);
  toast?: never;
  silent?: never;
};

// Mode 2 — promise toast
type PromiseMutationOptions<TResult, TArgs> = MutationCallbacks<TResult, TArgs> & {
  toast: {
    loading: string;
    success: string | ((result: TResult) => string);
    error: string | ((error: Error) => string);
  };
  successMessage?: never;
  errorMessage?: never;
  silent?: never;
};

// Mode 3 — silent
type SilentMutationOptions<TResult, TArgs> = MutationCallbacks<TResult, TArgs> & {
  silent: true;
  toast?: never;
  successMessage?: never;
  errorMessage?: never;
};

export type MutationOptions<TResult, TArgs = unknown> =
  | SimpleMutationOptions<TResult, TArgs>
  | PromiseMutationOptions<TResult, TArgs>
  | SilentMutationOptions<TResult, TArgs>;