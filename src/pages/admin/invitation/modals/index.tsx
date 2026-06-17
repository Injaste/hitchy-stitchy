import type { InvitationEditController } from "../hooks/useInvitationEditForm";
import PublishModal from "./PublishModal";
import UnpublishModal from "./UnpublishModal";
import DeleteModal from "./DeleteModal";
import ResetModal from "./ResetModal";
import DiscardModal from "./DiscardModal";

interface InvitationModalsProps {
  edit: InvitationEditController;
  onSheetClose: () => void;
}

// The editor's confirm dialogs (mirrors tasks/modals, gifts/modals, …). Open-state
// lives in useInvitationModalStore; the form-coupled actions come from `edit`.
const InvitationModals = ({ edit, onSheetClose }: InvitationModalsProps) => (
  <>
    <PublishModal edit={edit} />
    <UnpublishModal edit={edit} />
    <DeleteModal edit={edit} onSheetClose={onSheetClose} />
    <ResetModal edit={edit} />
    <DiscardModal edit={edit} />
  </>
);

export default InvitationModals;
