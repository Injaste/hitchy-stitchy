import { useState, useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";
import { AUTH_CHANGE_EVENT, type AuthChangeDetail } from "./events";

/**
 * Reactive auth gate hook.
 *
 * Listens for:
 *   1. auth:change — dispatched by api.ts after loginUser / logoutUser
 *   2. storage    — handles cross-tab login / logout (same localStorage key)
 *
 * Returns a live `isAuthenticated` boolean that re-renders consumers
 * whenever auth state flips, without any navigation needed.
 */
export function useAuthGate(): { isAuthenticated: boolean } {
  const [authed, setAuthed] = useState<boolean>(() => isAuthenticated());

  useEffect(() => {
    // Fired from within the same tab (loginUser / logoutUser in api.ts)
    const handleAuthChange = (e: Event) => {
      const { type } = (e as CustomEvent<AuthChangeDetail>).detail;
      setAuthed(type === "login");
    };

    // Fired when localStorage changes from another tab
    const handleStorage = () => {
      setAuthed(isAuthenticated());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return { isAuthenticated: authed };
}
