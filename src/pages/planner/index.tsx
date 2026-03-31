import AuthGate from "../auth/AuthGate";
import AdminPage from "./AdminPage";

const Admin = () => {
  return (
    <AuthGate>
      <AdminPage />
    </AuthGate>
  );
};

export default Admin;
