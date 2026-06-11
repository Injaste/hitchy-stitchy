// Post-auth `redirect` destinations come from a user-controllable query param.
// Without vetting, an attacker could craft /login?redirect=https://evil.com and
// bounce a freshly authenticated user off-site (open redirect → phishing).
// Only ever honor a clean relative path on our own origin — reject absolute
// URLs, //protocol-relative, and backslash tricks the URL parser resolves
// elsewhere.
export function isSafeRedirect(raw: string | null): raw is string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return false;
  try {
    return new URL(raw, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

// The vetted destination: the param when it's safe, otherwise the dashboard.
export function safeRedirect(raw: string | null): string {
  if (!isSafeRedirect(raw)) return "/dashboard";
  const url = new URL(raw, window.location.origin);
  return url.pathname + url.search + url.hash;
}
