import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import Container from "@/components/custom/container";
import DaysManager from "@/pages/admin/days/components/DaysManager";
import Profile from "./profile";
import ChangePassword from "./change-password";
import { NotificationsSection } from "./notifications";
import Billing from "./billing";
import { useAccess } from "../hooks/useAccess";

const Settings = () => {
  const { isSuperAdmin } = useAccess();

  // Billing is super-admin-only (plan/payment is their concern); the rest are
  // personal/event settings every member can see.
  const tabs = [
    { id: "days", label: "Event Dates", element: DaysManager },
    { id: "profile", label: "Profile", element: Profile },
    { id: "change-password", label: "Password", element: ChangePassword },
    { id: "notifications", label: "Notifications", element: NotificationsSection },
    ...(isSuperAdmin
      ? [{ id: "billing", label: "Billing", element: Billing }]
      : []),
  ];

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Tweak your event and account details."
      />
      <Container pageSpacing>
        <Tabs defaultValue="days" className="gap-6">
          <TabsList className="w-full max-w-xl" aria-label="Settings sections">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!tab.element}
                className="flex-1 text-xs"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => {
            const Element = tab.element;
            if (!Element) return null;
            return (
              <TabsContent key={tab.id} value={tab.id}>
                <Element />
              </TabsContent>
            );
          })}
        </Tabs>
      </Container>
    </>
  );
};

export default Settings;
