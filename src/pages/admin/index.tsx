import AuthGate from "../../auth/AuthGate";
import AdminPage from "./AdminPage";

const Admin = () => {
  return (
    <AuthGate>
      <p>Hiii!!</p>
    </AuthGate>
  );
};

export default Admin;
