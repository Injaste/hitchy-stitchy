import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

// PWA start_url migration shim (disabled — kept for reference).
// We changed the manifest start_url from "/" to "/dashboard", but installed PWAs
// snapshot start_url at install time and keep launching at "/" until the browser
// re-reads the manifest (Android/desktop: lazily; iOS: only on reinstall). This
// block redirects an installed (standalone) launch from "/" to "/dashboard".
// Runs once at boot before React mounts, so in-app navigations to "/" aren't
// affected; standalone-gated, so normal browser tabs still see Home. Re-enable
// if old installs keep landing on the wrong page.
// const launchedStandalone =
//   window.matchMedia("(display-mode: standalone)").matches ||
//   (window.navigator as { standalone?: boolean }).standalone === true;
// if (launchedStandalone && window.location.pathname === "/") {
//   window.history.replaceState(null, "", "/dashboard");
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
