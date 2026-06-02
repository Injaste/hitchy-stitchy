import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ComponentFade from "@/components/animations/animate-component-fade";
import AdminRoutes from "./routes/AdminRoutes";
import LoadingState from "@/components/custom/states/loading-state";

const Home = lazy(() => import("@/pages/home"));
const Signup = lazy(() => import("@/pages/signup"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Templates = lazy(() => import("@/pages/wedding"));
const Privacy = lazy(() => import("@/pages/privacy"));

const standaloneRoutes = [
  { path: "/", element: Home, fade: true },
  { path: "/signup", element: Signup, fade: true },
  { path: "/reset-password", element: ResetPassword, fade: true },
  { path: "/dashboard", element: Dashboard, fade: true },
  { path: "/privacy", element: Privacy, fade: true },
];

const AppRoutes = () => {
  const location = useLocation();
  const rootSegment = location.pathname.split("/")[1];
  const animationKey = location.pathname.includes("/admin")
    ? "admin"
    : rootSegment;

  return (
    <Suspense fallback={<LoadingState />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={animationKey}>
          {standaloneRoutes.map(({ path, element: Component, fade }) => (
            <Route
              key={path}
              path={path}
              element={
                fade ? (
                  <ComponentFade>
                    <Component />
                  </ComponentFade>
                ) : (
                  <Component />
                )
              }
            />
          ))}

          <Route
            path="/:slug"
            element={
              <Suspense fallback={null}>
                <Templates />
              </Suspense>
            }
          />

          {AdminRoutes()}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default AppRoutes;
