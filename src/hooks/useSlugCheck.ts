import { useState, useEffect, useRef, useCallback } from "react";
import { reserveSlug } from "@/pages/dashboard/api";
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

interface UseSlugCheckOptions {
  /** Fired with the hold's expiry (ISO) + the slug whenever it's reserved. */
  onReserved?: (expiry: string, slug: string) => void;
}

/**
 * Availability is established by RESERVING: the moment a slug comes back available
 * it's also held for this user (sliding 30-min hold), closing the window where it
 * could be taken between "shows available" and "Continue". `is_slug_taken` lives on
 * only as create_event's server-side guard; the client uses reserve_slug for both.
 */
export function useSlugCheck({
  onReserved,
}: UseSlugCheckOptions = {}): UseSlugCheckReturn {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const onReservedRef = useRef(onReserved);
  onReservedRef.current = onReserved;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reserve = check + hold in one. Returns true if taken. Stale responses (a
  // newer request superseded this one) are ignored.
  const reserve = async (slug: string, id: number): Promise<boolean> => {
    try {
      const expiry = await reserveSlug(slug);
      if (requestIdRef.current !== id) return false;
      setStatus("available");
      onReservedRef.current?.(expiry, slug);
      return false;
    } catch (e) {
      if (requestIdRef.current !== id) return false;
      const taken = e instanceof Error && /already taken/i.test(e.message);
      setStatus(taken ? "taken" : "error");
      return taken;
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
    timerRef.current = setTimeout(() => {
      void reserve(slug, id);
    }, DEBOUNCE_MS);
  }, []);

  const checkNow = useCallback(async (slug: string): Promise<boolean> => {
    clearTimer();
    const id = ++requestIdRef.current;
    if (!slug || !SLUG_REGEX.test(slug)) {
      setStatus("idle");
      return true;
    }
    setStatus("checking");
    return reserve(slug, id);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    requestIdRef.current++;
    setStatus("idle");
  }, []);

  useEffect(() => () => clearTimer(), []);

  return { status, scheduleCheck, checkNow, reset };
}
