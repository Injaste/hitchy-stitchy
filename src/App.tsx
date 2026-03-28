import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Invitation from "./pages/invitation";
import Admin from "./pages/admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:slug" element={<Invitation />} />

        <Route path="/:slug/admin" element={<Admin />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
