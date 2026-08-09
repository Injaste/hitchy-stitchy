export type MutationCallbacks<TResult, TArgs = unknown, TContext = unknown> = {
  onSuccess?: (result: TResult, args: TArgs) => void;
  onError?: (error: Error, args: TArgs, context: TContext | undefined) => void;
  onMutate?: (args: TArgs) => TContext | Promise<TContext>;
};

// Mode 1 — simple toasts
type SimpleMutationOptions<TResult, TArgs, TContext> = MutationCallbacks<TResult, TArgs, TContext> & {
  successMessage: string | ((result: TResult, args: TArgs) => string);
  errorMessage: string | ((error: Error, args: TArgs) => string);
  /** Hangs an Undo button off the success toast and lengthens it to the undo
   *  window. Called once at success time with (result, args) — return a click
   *  handler to show the button, or nothing to leave the toast plain. That lets
   *  one mutation used in both directions (e.g. archive/restore) offer undo only
   *  on the destructive direction. Presence of a returned handler is what makes
   *  an action "undoable" (see destructive-actions.md); an action that offers
   *  undo must not also confirm. */
  onUndo?: (result: TResult, args: TArgs) => (() => void) | void;
  toast?: never;
  silent?: never;
};

// Mode 2 — promise toast
type PromiseMutationOptions<TResult, TArgs, TContext> = MutationCallbacks<TResult, TArgs, TContext> & {
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
type SilentMutationOptions<TResult, TArgs, TContext> = MutationCallbacks<TResult, TArgs, TContext> & {
  silent: true;
  toast?: never;
  successMessage?: never;
  errorMessage?: never;
};

export type MutationOptions<TResult, TArgs = unknown, TContext = unknown> =
  | SimpleMutationOptions<TResult, TArgs, TContext>
  | PromiseMutationOptions<TResult, TArgs, TContext>
  | SilentMutationOptions<TResult, TArgs, TContext>;