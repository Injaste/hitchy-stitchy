import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ComponentFade } from "./components/animations/animate-component-fade";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Onboard from "./pages/onboard";
import Dashboard from "./pages/dashboard";
import Invitation from "./pages/invitation";
import Admin from "./pages/planner";
import { AnimatePresence } from "framer-motion";

const routes = [
  { path: "/", element: Home },
  { path: "/signup", element: Signup },
  { path: "/dashboard", element: Dashboard },
  { path: "/:slug", element: Invitation },
  { path: "/:slug/admin", element: Admin },
];

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routes.map((r) => (
          <Route
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
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
