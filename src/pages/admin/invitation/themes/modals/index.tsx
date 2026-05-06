import { useInvitationModalStore } from "../../store/useInvitationModalStore";
import CreateThemeModal from "./CreateThemeModal";
import DeleteThemeModal from "./DeleteThemeModal";
import PublishThemeModal from "./PublishThemeModal";

const ThemeModals = () => {
  const isCreateOpen = useInvitationModalStore((s) => s.isCreateOpen);
  const isDeleteOpen = useInvitationModalStore((s) => s.isDeleteOpen);
  const isPublishOpen = useInvitationModalStore((s) => s.isPublishOpen);

  return (
    <>
      {isCreateOpen && <CreateThemeModal />}
      {isDeleteOpen && <DeleteThemeModal />}
      {isPublishOpen && <PublishThemeModal />}
    </>
  );
};

export default ThemeModals;
