import AuthGate from "../../auth/AuthGate";
import DashboardView from "./layout/DashboardView";

const Dashboard = () => {
  return (
    <AuthGate>
      <DashboardView />
    </AuthGate>
  );
};

export default Dashboard;
