const AUTH_KEY = "dannad_admin_auth";

// ⚠️ Change this password before deploying!
const ADMIN_PASSWORD = "dannad2026";

export const login = (password: string): boolean => {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === "true";
};
