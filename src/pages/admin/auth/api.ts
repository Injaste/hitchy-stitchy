import { login, logout } from "@/lib/auth";
import { dispatchAuthChange } from "./events";
import type { LoginCredentials } from "./types";
import { delay } from "@/lib/utils";

/**
 * Attempts to authenticate with the provided password.
 * Simulates a 400ms async round-trip so the loading state is visible.
 * Throws on incorrect password so useMutation can handle the error path.
 * Dispatches "auth:change" → "login" so AuthGate re-renders immediately.
 */
export async function loginUser({ password }: LoginCredentials): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  const success = login(password);
  if (!success) {
    throw new Error("Incorrect password. Please try again.");
  }
  dispatchAuthChange("login");
}

/**
 * Clears the auth token and dispatches "auth:change" → "logout"
 * so AuthGate switches back to <Login /> without any navigation.
 */
export async function logoutUser(): Promise<void> {
  await delay(500);
  logout();
  dispatchAuthChange("logout");
}
