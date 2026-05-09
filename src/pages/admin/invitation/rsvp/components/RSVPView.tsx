import { type FC } from "react";
import type { RSVPDraft } from "../../types";
import RSVPSettingsCard from "./RSVPSettingsCard";
import RSVPFormFieldsCard from "./RSVPFormFieldsCard";
import RSVPGuestLimitsCard from "./RSVPGuestLimitsCard";

interface RSVPViewProps {
  draft: RSVPDraft;
  onUpdate: (patch: Partial<RSVPDraft>) => void;
}

const RSVPView: FC<RSVPViewProps> = ({ draft, onUpdate }) => (
  <div className="space-y-3">
    <RSVPSettingsCard draft={draft} onUpdate={onUpdate} />
    <RSVPFormFieldsCard draft={draft} onUpdate={onUpdate} />
    <RSVPGuestLimitsCard draft={draft} onUpdate={onUpdate} />
  </div>
);

export default RSVPView;
