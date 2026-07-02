import { ListChecks, CalendarDays, UserRound, Bell, CreditCard } from "lucide-react";

import SettingsDialog, {
  type SettingsSection,
} from "@/components/custom/settings-dialog";
import DaysManager from "@/pages/admin/days/components/DaysManager";
import GettingStartedSection from "../setup-guide/components/GettingStartedSection";
import Profile from "./profile";
import { NotificationsSection } from "./notifications";
import Billing from "./billing";
import { useAccess } from "../hooks/useAccess";
import { useEventSettingsStore } from "./useEventSettingsStore";

// Event-scoped sections only. Account-global settings (global name, avatar,
// password, danger) live in the reusable AccountSettingsModal — opened from the
// sidebar's separate "Account" entry. Billing is super-admin-only (plan/payment
// is their concern); the rest every member can see.
const EventSettingsModal = () => {
  const { isSuperAdmin } = useAccess();
  const { isOpen, section, setSection, close } = useEventSettingsStore();

  const sections: SettingsSection[] = [
    { id: "days", label: "Event Dates", icon: CalendarDays, render: () => <DaysManager /> },
    { id: "profile", label: "Display name", icon: UserRound, render: () => <Profile /> },
    { id: "notifications", label: "Notifications", icon: Bell, render: () => <NotificationsSection /> },
    ...(isSuperAdmin
      ? [
          { id: "billing", label: "Billing", icon: CreditCard, render: () => <Billing /> },
          // Onboarding home — last, below Billing. Done steps are revisitable here.
          { id: "getting-started", label: "Getting started", icon: ListChecks, render: () => <GettingStartedSection /> },
        ]
      : []),
  ];

  const active = sections.some((s) => s.id === section) ? section : undefined;

  return (
    <SettingsDialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close();
      }}
      title="Event settings"
      sections={sections}
      value={active}
      onValueChange={setSection}
    />
  );
};

export default EventSettingsModal;
