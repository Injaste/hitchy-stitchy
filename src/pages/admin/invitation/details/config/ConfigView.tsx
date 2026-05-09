import { type FC } from "react";
import type { ThemeConfig, ThemeFieldGroup } from "@/pages/wedding/templates/types";
import ConfigGroupCard from "./ConfigGroupCard";

interface ConfigViewProps {
  schema: ThemeFieldGroup[];
  config: ThemeConfig;
  onUpdate: (patch: Partial<ThemeConfig>) => void;
}

const ConfigView: FC<ConfigViewProps> = ({ schema, config, onUpdate }) => (
  <div className="space-y-3">
    {schema.map((group) => (
      <ConfigGroupCard key={group.title} group={group} config={config} onUpdate={onUpdate} />
    ))}
  </div>
);

export default ConfigView;
