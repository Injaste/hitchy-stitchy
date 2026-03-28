import React from "react";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminPage from "./AdminPage";

const Admin = () => {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
};

export default Admin;
