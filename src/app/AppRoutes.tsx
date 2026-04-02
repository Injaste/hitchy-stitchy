import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { ComponentFade } from "@/components/animations/animate-component-fade";

import Home from "@/pages/home";
import Signup from "@/pages/signup";
import CreateEvent from "@/pages/create-event";
import Dashboard from "@/pages/dashboard";
import Invitation from "@/pages/invitation";
import Admin from "@/pages/planner";

const routes = [
  { path: "/", element: Home },
  { path: "/signup", element: Signup },
  { path: "/dashboard", element: Dashboard },
  { path: "/create-event", element: CreateEvent },
  { path: "/:slug", element: Invitation },
  { path: "/:slug/admin", element: Admin },
];

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map((r) => (
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
