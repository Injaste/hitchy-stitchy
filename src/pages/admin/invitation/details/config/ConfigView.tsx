import { type FC } from "react";
import type { ThemeFieldGroup } from "@/pages/wedding/templates/types";
import type { ThemeDraftValues } from "../../store/useInvitationStore";
import ConfigGroupCard from "./ConfigGroupCard";

interface ConfigViewProps {
  schema: ThemeFieldGroup[];
  config: ThemeDraftValues;
  onUpdate: (patch: ThemeDraftValues) => void;
}

const ConfigView: FC<ConfigViewProps> = ({ schema, config, onUpdate }) => (
  <div className="space-y-3 bg-secondary/20 rounded-lg p-3">
    {schema.map((group) => (
      <ConfigGroupCard
        key={group.title}
        group={group}
        config={config}
        onUpdate={onUpdate}
      />
    ))}
  </div>
);

export default ConfigView;
