import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/custom/admin-page-header";
import Container from "@/components/custom/container";
import Profile from "./profile";
import ChangePassword from "./change-password";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <AdminPageHeader title="Settings" description="Manage your account." />
      <Container pageSpacing>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
          <TabsList
            activeValue={activeTab}
            className="w-full max-w-sm"
            aria-label="Settings sections"
          >
            <TabsTrigger value="profile" className="flex-1 text-xs">Profile</TabsTrigger>
            <TabsTrigger value="change-password" className="flex-1 text-xs">Password</TabsTrigger>
            <TabsTrigger value="preferences" disabled className="flex-1 text-xs">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile"><Profile /></TabsContent>
          <TabsContent value="change-password"><ChangePassword /></TabsContent>
        </Tabs>
      </Container>
    </>
  );
};

export default Settings;
