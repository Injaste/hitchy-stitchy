import { useState, useEffect, useRef, useCallback } from "react";
import { checkSlugAvailable } from "../api";

// ─── Constants ─────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
const DEBOUNCE_MS = 600;

// ─── Transforms ────────────────────────────────────────────────────────────

/**
 * Soft transform — applied on EVERY KEYSTROKE.
 *
 * The goal is for the user to feel like the input is helping them, not fighting
 * them. Characters are converted in real time so what they see is always valid
 * slug material — no surprises on blur.
 *
 * Rules applied in order:
 *   1. Lowercase everything
 *   2. Convert any character that isn't [a-z0-9-] to a dash (space → dash, etc.)
 *   3. Collapse consecutive dashes into one — "my  wedding" → "my-wedding", not "my--wedding"
 *   4. Strip any leading dashes — user can't begin a slug with a special char
 *   5. Collapse multiple trailing dashes into one, but KEEP a single trailing dash —
 *      the user just typed "-" and is about to type the next word. Stripping it
 *      would delete a character they intentionally pressed, which feels broken.
 *
 * "My  Wedding 2026!" → "my-wedding-2026"  (spaces collapsed, trailing ! → dash stripped)
 * "dan--nad"          → "dan-nad"           (double dash collapsed)
 * "my-"               → "my-"              (trailing dash preserved, user is mid-word)
 * "--my-wedding"      → "my-wedding"        (leading dashes stripped)
 */
export function toSafeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")  // convert unsafe chars
    .replace(/-{2,}/g, "-")        // collapse consecutive dashes
    .replace(/^-+/, "")            // strip leading dashes
    .replace(/-{2,}$/, "-");       // collapse multiple trailing dashes → one (keep single)
}

/**
 * Full normalize — applied on BLUR, on submit, and on programmatic generation.
 *
 * Everything toSafeSlug does, plus strips the single trailing dash that
 * toSafeSlug intentionally preserved for mid-type comfort.
 *
 * "my-"          → "my"
 * "my---wedding" → "my-wedding"
 * "--dan-nad--"  → "dan-nad"
 */
export function toSlug(input: string): string {
  return toSafeSlug(input).replace(/-+$/, "");
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

interface UseSlugCheckReturn {
  status: SlugStatus;
  /** Debounced — call on every input change with a toSafeSlug-transformed value. */
  scheduleCheck: (slug: string) => void;
  /** Immediate — call on form submit. Returns true if slug is taken. */
  checkNow: (slug: string) => Promise<boolean>;
  /** Reset to idle — call on programmatic slug change (e.g. auto-generate from event name). */
  reset: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSlugCheck(): UseSlugCheckReturn {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Increment before each new request. If the value differs on response, discard (stale).
  const requestIdRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleCheck = useCallback((slug: string) => {
    clearTimer();

    // Not yet a valid complete slug (too short, trailing dash mid-type, etc.)
    // Stay idle — no spinner, no network call. The user is still typing.
    if (!slug || !SLUG_REGEX.test(slug)) {
      setStatus("idle");
      return;
    }

    // Show spinner immediately so the user knows a check is imminent.
    setStatus("checking");
    const id = ++requestIdRef.current;

    timerRef.current = setTimeout(async () => {
      try {
        const exists = await checkSlugAvailable(slug);
        // Discard if a newer check fired while this one was in-flight.
        if (requestIdRef.current !== id) return;
        setStatus(exists ? "taken" : "available");
      } catch {
        if (requestIdRef.current !== id) return;
        setStatus("error");
      }
    }, DEBOUNCE_MS);
  }, []);

  const checkNow = useCallback(async (slug: string): Promise<boolean> => {
    // Cancel any pending debounced check — this takes priority.
    clearTimer();
    requestIdRef.current++;

    if (!slug || !SLUG_REGEX.test(slug)) {
      setStatus("idle");
      // Block submission — schema validation will surface the format error.
      return true;
    }

    setStatus("checking");
    try {
      const exists = await checkSlugAvailable(slug);
      setStatus(exists ? "taken" : "available");
      return exists;
    } catch {
      setStatus("error");
      // Don't hard-block on a network failure — the DB unique constraint is the real guard.
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    requestIdRef.current++;
    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  return { status, scheduleCheck, checkNow, reset };
}