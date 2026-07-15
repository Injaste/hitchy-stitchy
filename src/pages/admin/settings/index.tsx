import { ListChecks, CalendarDays, UserRound, Bell, CreditCard, Keyboard, MessageSquare } from "lucide-react";

import SettingsDialog, {
  type SettingsGroup,
} from "@/components/custom/settings-dialog";
import DaysManager from "@/pages/admin/days/components/DaysManager";
import GettingStartedSection from "../setup-guide/components/GettingStartedSection";
import Profile from "./profile";
import { NotificationsSection } from "./notifications";
import InviteMessageSection from "./invite-message";
import TipsSection from "./tips";
import Billing from "./billing";
import { useAccess } from "../hooks/useAccess";
import { useEventSettingsStore } from "./useEventSettingsStore";

// Event-scoped sections only. Account-global settings (global name, avatar,
// password, danger) live in the reusable AccountSettingsModal — opened from the
// sidebar's separate "Account" entry. Billing is super-admin-only (plan/payment
// is their concern); the rest every member can see.
const EventSettingsModal = () => {
  const { isSuperAdmin, canManageMembers } = useAccess();
  const { isOpen, section, setSection, close } = useEventSettingsStore();

  const groups: SettingsGroup[] = [
    { label: "Event", sections: [{ id: "days", label: "Event Dates", icon: CalendarDays, render: () => <DaysManager /> }] },
    {
      label: "You",
      sections: [
        { id: "profile", label: "Display name", icon: UserRound, render: () => <Profile /> },
        { id: "notifications", label: "Notifications", icon: Bell, render: () => <NotificationsSection /> },
      ],
    },
    // Team-invite share text — only whoever manages invites can edit it.
    {
      label: "Outreach",
      sections: canManageMembers
        ? [{ id: "invite-message", label: "Invite message", icon: MessageSquare, render: () => <InviteMessageSection /> }]
        : [],
    },
    {
      label: "Plan",
      sections: isSuperAdmin
        ? [{ id: "billing", label: "Billing", icon: CreditCard, render: () => <Billing /> }]
        : [],
    },
    {
      label: "Help",
      sections: [
        { id: "tips", label: "Tips & shortcuts", icon: Keyboard, render: () => <TipsSection /> },
        // Onboarding home — done steps are revisitable here.
        ...(isSuperAdmin
          ? [{ id: "getting-started", label: "Getting started", icon: ListChecks, render: () => <GettingStartedSection /> }]
          : []),
      ],
    },
  ];

  const active = groups
    .flatMap((g) => g.sections)
    .some((s) => s.id === section)
    ? section
    : undefined;

  return (
    <SettingsDialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close();
      }}
      title="Event settings"
      groups={groups}
      value={active}
      onValueChange={setSection}
    />
  );
};

export default EventSettingsModal;
