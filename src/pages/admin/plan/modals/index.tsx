import UpgradeModal from "./UpgradeModal";
import ActivationModal from "./ActivationModal";
import { useAccess } from "../../hooks/useAccess";

/** The entire plan surface (upgrade + activation) is super-admin-only — only
 *  they can pay, so members never see any of it. Single gate for both modals. */
const PlanModals = () => {
  const { isSuperAdmin } = useAccess();
  if (!isSuperAdmin) return null;

  return (
    <>
      <UpgradeModal />
      <ActivationModal />
    </>
  );
};

export default PlanModals;
