export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface MutationOptions<TResult> {
  successMessage: string;
  errorMessage: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
}
