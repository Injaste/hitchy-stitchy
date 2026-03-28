export const AUTH_CHANGE_EVENT = "auth:change" as const;

export type AuthChangeType = "login" | "logout";

export interface AuthChangeDetail {
  type: AuthChangeType;
}

/**
 * Fires a custom DOM event so every listener in the same tab (AuthGate, AdminHeader, etc.)
 * reacts to auth state changes without needing global state.
 */
export function dispatchAuthChange(type: AuthChangeType): void {
  window.dispatchEvent(
    new CustomEvent<AuthChangeDetail>(AUTH_CHANGE_EVENT, { detail: { type } })
  );
}
