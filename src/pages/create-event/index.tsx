import AuthGate from "@/auth/AuthGate"
import CreateEventShell from "./components/CreateEventShell"

const CreateEvent = () => (
  <AuthGate>
    <CreateEventShell />
  </AuthGate>
)

export default CreateEvent
