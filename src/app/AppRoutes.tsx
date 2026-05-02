import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ComponentFade } from "@/components/animations/animate-component-fade";
import AdminRoutes from "./routes/AdminRoutes";

const Home = lazy(() => import("@/pages/home"));
const Signup = lazy(() => import("@/pages/signup"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const CreateEvent = lazy(() => import("@/pages/create-event"));
const Templates = lazy(() => import("@/pages/templates"));

const standaloneRoutes = [
  { path: "/", element: Home, fade: true },
  { path: "/signup", element: Signup, fade: true },
  { path: "/dashboard", element: Dashboard, fade: true },
  { path: "/create-event", element: CreateEvent, fade: true },
  { path: "/:slug", element: Templates, fade: false },
];

const AppRoutes = () => {
  const location = useLocation();
  const rootSegment = location.pathname.split("/")[1];
  const animationKey = location.pathname.includes("/admin")
    ? "admin"
    : rootSegment;

  return (
    <Suspense fallback={null}>
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

          {AdminRoutes()}
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default AppRoutes;
