import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { AccessLevel } from "../types";
import { ACCESS_CONFIG } from "./access-config";

interface LevelBadgeProps {
  level: AccessLevel;
  showLabel?: boolean;
  className?: string;
}

/** Static, read-only display of a resource's access level. */
const LevelBadge: FC<LevelBadgeProps> = ({ level, showLabel = false, className }) => {
  const { icon: Icon, label, className: levelClass } =
    ACCESS_CONFIG[level] ?? ACCESS_CONFIG.none;
  return (
    <span className={cn("inline-flex items-center gap-1.5", levelClass, className)}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showLabel && (
        <span className="text-xs">{level === "none" ? "No access" : label}</span>
      )}
    </span>
  );
};

export default LevelBadge;
