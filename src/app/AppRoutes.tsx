import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ComponentFade from "@/components/animations/animate-component-fade";
import AdminRoutes from "./routes/AdminRoutes";
import LoadingState from "@/components/custom/states/loading-state";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/auth/sign-in"));
const Signup = lazy(() => import("@/auth/sign-up"));
const ResetPassword = lazy(() => import("@/auth/reset-password"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Join = lazy(() => import("@/pages/join"));
const Templates = lazy(() => import("@/pages/wedding"));
const Privacy = lazy(() => import("@/pages/privacy"));

// Adding a top-level route? Reserve its path so no user slug can shadow it.
// See docs/architecture/reserved-slugs.md (append-only migration).
const standaloneRoutes = [
  { path: "/", element: Home, fade: true },
  { path: "/login", element: Login, fade: true },
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
            path="/:slug/join"
            element={
              <ComponentFade>
                <Join />
              </ComponentFade>
            }
          />

          <Route
            path="/:slug"
            element={
              <Suspense fallback={null}>
                <Templates />
              </Suspense>
            }
          />

          {/* Per-page invitation link. Static siblings (/:slug/join, /:slug/admin)
              outrank this dynamic segment, so they're never shadowed. */}
          <Route
            path="/:slug/:link_slug"
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
