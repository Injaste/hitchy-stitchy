import { useState, useEffect, useCallback, useRef } from "react";

export function useQuery<T>(
  fetcher: () => Promise<T>,
  options?: { key?: string }
): { data: T | null; isLoading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFocusTime = useRef<number>(0);
  const isMounted = useRef(true);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (isMounted.current) setData(result);
    } catch (err) {
      if (isMounted.current)
        setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.key]);

  useEffect(() => {
    isMounted.current = true;
    run();
    return () => { isMounted.current = false; };
  }, [run]);

  // Re-fetch on window focus (debounced 500ms)
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusTime.current > 500) {
        lastFocusTime.current = now;
        run();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [run]);

  // Re-fetch on network reconnect
  useEffect(() => {
    const handleOnline = () => run();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [run]);

  return { data, isLoading, error, refetch: run };
}
