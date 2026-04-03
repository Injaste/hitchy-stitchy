import AuthGate from "@/auth/AuthGate";
import CreateEventView from "./components/CreateEventView";

const CreateEvent = () => (
  <AuthGate>
    <CreateEventView />
  </AuthGate>
);

export default CreateEvent;
