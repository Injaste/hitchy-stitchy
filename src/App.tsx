import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RSVPPage from "./pages/RSVPPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public: RSVP / invitation */}
        <Route path="/" element={<RSVPPage />} />

        {/* Admin: login gate */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin: planning suite — auth protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
