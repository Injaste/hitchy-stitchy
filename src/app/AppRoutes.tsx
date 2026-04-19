import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import AdminRoutes from "./routes/AdminRoutes";

import Home from "@/pages/home";
import Signup from "@/pages/signup";
import CreateEvent from "@/pages/create-event";
import Dashboard from "@/pages/dashboard";
import Invitation from "@/pages/templates";

const standaloneRoutes = [
  { path: "/", element: Home },
  { path: "/signup", element: Signup },
  { path: "/dashboard", element: Dashboard },
  { path: "/create-event", element: CreateEvent },
  { path: "/:slug", element: Invitation },
];

const AppRoutes = () => {
  const location = useLocation();

  const rootSegment = location.pathname.split("/")[1]; // "", "dashboard", "create-event", "slug"
  // For admin routes, the key is always "admin" regardless of sub-path
  // For standalone routes, the key is the first segment
  const animationKey = location.pathname.includes("/admin")
    ? "admin"
    : rootSegment;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={animationKey}>
        {standaloneRoutes.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={
              <ComponentFade>
                <r.element />
              </ComponentFade>
            }
          />
        ))}

        {AdminRoutes()}
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
