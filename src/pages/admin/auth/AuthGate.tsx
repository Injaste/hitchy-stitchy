import { useAuthGate } from "./gate/hook";
import Login from "./Login";

/**
 * Reactive auth boundary.
 *
 * useAuthGate() subscribes to "auth:change" DOM events dispatched by
 * loginUser() and logoutUser() in api.ts, so this component re-renders
 * the moment auth state flips — no navigation, no polling.
 *
 * cross-tab logout/login via localStorage "storage" events is also handled
 * inside useAuthGate.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthGate();
  return isAuthenticated ? <>{children}</> : <Login />;
}
