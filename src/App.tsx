import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ComponentFade } from "./components/animations/component-fade";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Onboard from "./pages/onboard";
import Dashboard from "./pages/dashboard";
import Invitation from "./pages/invitation";
import Admin from "./pages/planner";
import { AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <ComponentFade>
              <Home />
            </ComponentFade>
          }
        />
        <Route
          path="/signup"
          element={
            <ComponentFade>
              <Signup />
            </ComponentFade>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/onboard"
          element={
            <ComponentFade>
              <Onboard />
            </ComponentFade>
          }
        />
        <Route
          path="/:slug"
          element={
            <ComponentFade>
              <Invitation />
            </ComponentFade>
          }
        />
        <Route path="/:slug/admin" element={<Admin />} />
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
