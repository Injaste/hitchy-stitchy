import { useState, useEffect, useRef, useCallback } from "react";
import { checkSlugAvailable } from "@/pages/dashboard/api";
import { SLUG_REGEX } from "@/pages/dashboard/types";

const DEBOUNCE_MS = 600;

/**
 * Soft transform — applied on EVERY KEYSTROKE.
 * Preserves a single trailing dash so the user feels the input is helping,
 * not fighting them mid-word.
 */
export function toSafeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .replace(/-{2,}$/, "-");
}

/**
 * Full normalize — applied on BLUR, submit, and programmatic generation.
 * Everything toSafeSlug does, plus strips the trailing dash.
 */
export function toSlug(input: string): string {
  return toSafeSlug(input).replace(/-+$/, "");
}

export type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

interface UseSlugCheckReturn {
  status: SlugStatus;
  scheduleCheck: (slug: string) => void;
  checkNow: (slug: string) => Promise<boolean>;
  reset: () => void;
}

export function useSlugCheck(): UseSlugCheckReturn {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleCheck = useCallback((slug: string) => {
    clearTimer();
    if (!slug || !SLUG_REGEX.test(slug)) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const id = ++requestIdRef.current;
    timerRef.current = setTimeout(async () => {
      try {
        const exists = await checkSlugAvailable(slug);
        if (requestIdRef.current !== id) return;
        setStatus(exists ? "taken" : "available");
      } catch {
        if (requestIdRef.current !== id) return;
        setStatus("error");
      }
    }, DEBOUNCE_MS);
  }, []);

  const checkNow = useCallback(async (slug: string): Promise<boolean> => {
    clearTimer();
    requestIdRef.current++;
    if (!slug || !SLUG_REGEX.test(slug)) {
      setStatus("idle");
      return true;
    }
    setStatus("checking");
    try {
      const exists = await checkSlugAvailable(slug);
      setStatus(exists ? "taken" : "available");
      return exists;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    requestIdRef.current++;
    setStatus("idle");
  }, []);

  useEffect(() => () => clearTimer(), []);

  return { status, scheduleCheck, checkNow, reset };
}
