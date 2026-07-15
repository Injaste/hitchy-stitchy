import { CircleUser, KeyRound, ShieldAlert } from "lucide-react";

import SettingsDialog, {
  type SettingsGroup,
} from "@/components/custom/settings-dialog";

import AccountProfileForm from "../components/AccountProfileForm";
import AccountDangerSection from "../components/AccountDangerSection";
import ChangePassword from "../components/change-password";
import { useAccountSettingsStore } from "../useAccountSettingsStore";

// One unlabeled group — account settings aren't grouped, so no headers render.
const GROUPS: readonly SettingsGroup[] = [
  {
    sections: [
      {
        id: "profile",
        label: "Profile",
        icon: CircleUser,
        render: () => <AccountProfileForm />,
      },
      {
        id: "password",
        label: "Password",
        icon: KeyRound,
        render: () => <ChangePassword />,
      },
      {
        id: "account",
        label: "Account",
        icon: ShieldAlert,
        render: () => <AccountDangerSection />,
      },
    ],
  },
];

// Store-driven so it can be opened from any shell (dashboard account menu, admin
// sidebar). Mount once per surface; open via useAccountSettingsStore().open().
const AccountSettingsModal = () => {
  const { isOpen, section, setSection, close } = useAccountSettingsStore();
  const active = GROUPS[0].sections.some((s) => s.id === section)
    ? section
    : undefined;

  return (
    <SettingsDialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close();
      }}
      title="Account settings"
      groups={GROUPS}
      value={active}
      onValueChange={setSection}
    />
  );
};

export default AccountSettingsModal;
