import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import Container from "@/components/custom/container";
import Profile from "./profile";
import ChangePassword from "./change-password";

const TABS = [
  { id: "profile", label: "Profile", element: Profile },
  { id: "change-password", label: "Password", element: ChangePassword },
  { id: "preferences", label: "Preferences", element: null },
] as const;

const Settings = () => {
  return (
    <>
      <AdminPageHeader title="Settings" description="Manage your account." />
      <Container pageSpacing>
        <Tabs defaultValue="profile" className="gap-6">
          <TabsList className="w-full max-w-sm" aria-label="Settings sections">
            {TABS.map((tab) => (
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

          {TABS.map((tab) => {
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
