import AuthGate from "../../auth/AuthGate";
import DashboardView from "./components/DashboardView";

const Dashboard = () => {
  return (
    <AuthGate>
      <DashboardView />
    </AuthGate>
  );
};

export default Dashboard;
